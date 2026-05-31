import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import Modal from '../components/common/Modal'
import Paginacion from '../components/common/Paginacion'
import FiltrosMedicamentos from '../components/filtros/FiltrosMedicamentos'
import MedicamentoForm from '../components/medicamentos/MedicamentoForm'
import MedicamentosTable from '../components/medicamentos/MedicamentosTable'
import { useAuth } from '../hooks/useAuth'
import {
  actualizarMedicamento,
  crearMedicamento,
  eliminarMedicamento,
  obtenerMedicamentos,
} from '../services/medicamentosService'
import { normalizarRol } from '../utils/permisos'

function Medicamentos() {
  const { usuario } = useAuth()
  const puedeGestionarMedicamentos = normalizarRol(usuario?.rol) === 'admin'
  const [medicamentos, setMedicamentos] = useState([])
  const [filtros, setFiltros] = useState({
    nombre: '',
    stock: '',
    caducidad: '',
    receta: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [medicamentoEditando, setMedicamentoEditando] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 8
  const abrirDetalleMedicamento = (medicamento) => {
    window.open(`/medicamentos/${medicamento.id}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    obtenerMedicamentos()
      .then((medicamentosDatos) => {
        setMedicamentos(medicamentosDatos)
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const medicamentosFiltrados = useMemo(() => {
    return medicamentos.filter((medicamento) => {
      const coincideNombre =
        !filtros.nombre ||
        [medicamento.nombre, medicamento.presentacion, medicamento.concentracion]
          .join(' ')
          .toLowerCase()
          .includes(filtros.nombre.toLowerCase())

      const coincideReceta =
        !filtros.receta ||
        (filtros.receta === 'si' && medicamento.requiereReceta) ||
        (filtros.receta === 'no' && !medicamento.requiereReceta)
      const coincideStock =
        !filtros.stock ||
        (filtros.stock === 'con-stock' && medicamento.stockDisponible > 0) ||
        (filtros.stock === 'sin-stock' && medicamento.stockDisponible <= 0)
      const coincideCaducidad = !filtros.caducidad || medicamento.estadoLotes === filtros.caducidad

      return coincideNombre && coincideReceta && coincideStock && coincideCaducidad
    })
  }, [filtros, medicamentos])

  const totalPaginas = Math.max(1, Math.ceil(medicamentosFiltrados.length / registrosPorPagina))
  const medicamentosPaginados = medicamentosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina,
  )

  const manejarCrearMedicamento = async (nuevoMedicamento) => {
    if (!puedeGestionarMedicamentos) {
      setError('No tienes permiso para registrar medicamentos.')
      return
    }

    try {
      const medicamentoCreado = await crearMedicamento(nuevoMedicamento)
      setMedicamentos((actuales) => [medicamentoCreado, ...actuales])
      setError('')
      setModalAbierto(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const manejarActualizarMedicamento = async (datos) => {
    if (!puedeGestionarMedicamentos) {
      setError('No tienes permiso para editar medicamentos.')
      return
    }

    try {
      const medicamentoActualizado = await actualizarMedicamento(medicamentoEditando.id, datos)
      setMedicamentos((actuales) =>
        actuales.map((medicamento) =>
          medicamento.id === medicamentoActualizado.id ? medicamentoActualizado : medicamento,
        ),
      )
      setMedicamentoEditando(null)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const manejarEliminarMedicamento = async (id) => {
    if (!puedeGestionarMedicamentos) {
      setError('No tienes permiso para eliminar medicamentos.')
      return
    }

    if (!window.confirm('Estas seguro de que deseas eliminar este medicamento?')) {
      return
    }

    try {
      await eliminarMedicamento(id)
      setMedicamentos((actuales) => actuales.filter((medicamento) => medicamento.id !== id))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="medicamentos-pagina">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Modulo de medicamentos</span>
        <h1>Medicamentos</h1>
        <p>
          Consulta el catalogo, revisa stock disponible y registra nuevos medicamentos.
        </p>
      </div>

      <div className="modulo-resumen">
        <article className="indicador">
          <span>Total</span>
          <strong>{medicamentos.length}</strong>
          <small>Medicamentos cargados</small>
        </article>
        <article className="indicador">
          <span>Con receta</span>
          <strong>{medicamentos.filter((medicamento) => medicamento.requiereReceta).length}</strong>
          <small>Requieren control</small>
        </article>
        <article className="indicador">
          <span>Stock total</span>
          <strong>
            {medicamentos.reduce((total, medicamento) => total + medicamento.stockDisponible, 0)}
          </strong>
          <small>Unidades disponibles</small>
        </article>
      </div>

      <div className="modulo-panel">
        <div className="modulo-panel__encabezado">
          <div>
            <h2>Listado de medicamentos</h2>
            <p>Filtra por nombre, presentación, concentración y requisito de receta.</p>
          </div>
          {puedeGestionarMedicamentos && (
            <AddButton
              onClick={() => setModalAbierto(true)}
              title="Agregar nuevo medicamento"
            />
          )}
        </div>

        <FiltrosMedicamentos
          filtros={filtros}
          onChange={(nuevosFiltros) => {
            setFiltros(nuevosFiltros)
            setPaginaActual(1)
          }}
        />

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando medicamentos...</p>
        ) : (
          <MedicamentosTable
            medicamentos={medicamentosPaginados}
            onEditar={setMedicamentoEditando}
            onEliminar={manejarEliminarMedicamento}
            onVer={abrirDetalleMedicamento}
            puedeGestionar={puedeGestionarMedicamentos}
          />
        )}
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={medicamentosFiltrados.length}
          onChange={setPaginaActual}
        />
      </div>

      <Modal
        isOpen={modalAbierto && puedeGestionarMedicamentos}
        onClose={() => setModalAbierto(false)}
        title="Agregar nuevo medicamento"
      >
        <MedicamentoForm
          onCrearMedicamento={manejarCrearMedicamento}
        />
      </Modal>

      <Modal
        isOpen={Boolean(medicamentoEditando) && puedeGestionarMedicamentos}
        onClose={() => setMedicamentoEditando(null)}
        title="Editar medicamento"
      >
        <MedicamentoForm
          medicamentoInicial={medicamentoEditando}
          onGuardar={manejarActualizarMedicamento}
        />
      </Modal>
    </section>
  )
}

export default Medicamentos
