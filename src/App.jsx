import './App.css'
import Encabezado from './components/Encabezado'
import BannerEstado from './components/BannerEstado'
import TarjetaMedicamento from './components/TarjetaMedicamento'
import TarjetaFechas from './components/TarjetaFechas'
import TarjetaVenta from './components/TarjetaVenta'
import SeccionAudio from './components/SeccionAudio'

function App() {
  return (
    <>
      <Encabezado />
      <BannerEstado />
      <main className="principal">
        <TarjetaMedicamento />
        <TarjetaFechas />
        <TarjetaVenta />
        <SeccionAudio />
      </main>
      <footer className="pie-pagina">
        <p>Esta información fue generada por <strong>Farmacia Inclusiva</strong></p>
        <p className="pie-pagina__nota">Tekuan 184, Villa Izcalli Caxitlan, Villa de Álvarez, Col.</p>
      </footer>
    </>
  )
}

export default App