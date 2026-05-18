import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import Modal from '../components/common/Modal'
import FiltrosMedicamentos from '../components/filtros/FiltrosMedicamentos'
import MedicamentoForm from '../components/medicamentos/MedicamentoForm'
import MedicamentosTable from '../components/medicamentos/MedicamentosTable'
import { crearMedicamento, obtenerMedicamentos } from '../services/medicamentosService'

function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState([])
  const [filtros, setFiltros] = useState({
    nombre: '',
    receta: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    obtenerMedicamentos()
      .then(setMedicamentos)
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

      return coincideNombre && coincideReceta
    })
  }, [filtros, medicamentos])

  const manejarCrearMedicamento = async (nuevoMedicamento) => {
    try {
      const medicamentoCreado = await crearMedicamento(nuevoMedicamento)
      setMedicamentos((actuales) => [medicamentoCreado, ...actuales])
      setError('')
      setModalAbierto(false)
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
          <AddButton
            onClick={() => setModalAbierto(true)}
            title="Agregar nuevo medicamento"
          />
        </div>

        <FiltrosMedicamentos filtros={filtros} onChange={setFiltros} />

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando medicamentos...</p>
        ) : (
          <MedicamentosTable medicamentos={medicamentosFiltrados} />
        )}
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Agregar nuevo medicamento"
      >
        <MedicamentoForm onCrearMedicamento={manejarCrearMedicamento} />
      </Modal>
    </section>
  )
}

export default Medicamentos
