import { useEffect, useMemo, useState } from 'react'
import MedicamentoForm from '../components/medicamentos/MedicamentoForm'
import MedicamentosTable from '../components/medicamentos/MedicamentosTable'
import { crearMedicamento, obtenerMedicamentos } from '../services/medicamentosService'

function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerMedicamentos()
      .then(setMedicamentos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const medicamentosFiltrados = useMemo(() => {
    const valor = busqueda.trim().toLowerCase()

    if (!valor) {
      return medicamentos
    }

    return medicamentos.filter((medicamento) =>
      [
        medicamento.nombre,
        medicamento.presentacion,
        medicamento.concentracion,
        medicamento.contenido,
      ]
        .join(' ')
        .toLowerCase()
        .includes(valor),
    )
  }, [busqueda, medicamentos])

  const manejarCrearMedicamento = async (nuevoMedicamento) => {
    try {
      const medicamentoCreado = await crearMedicamento(nuevoMedicamento)
      setMedicamentos((actuales) => [medicamentoCreado, ...actuales])
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
            <p>Busca por nombre, presentacion, concentracion o contenido.</p>
          </div>
          <input
            aria-label="Buscar medicamento"
            className="buscador"
            placeholder="Buscar medicamento"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando medicamentos...</p>
        ) : (
          <MedicamentosTable medicamentos={medicamentosFiltrados} />
        )}
      </div>

      <div className="modulo-panel">
        <div className="modulo-panel__encabezado">
          <div>
            <h2>Registrar medicamento</h2>
            <p>El registro se mantiene en frontend hasta conectar la API real.</p>
          </div>
        </div>
        <MedicamentoForm onCrearMedicamento={manejarCrearMedicamento} />
      </div>
    </section>
  )
}

export default Medicamentos
