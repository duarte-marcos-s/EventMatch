import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Bienvenida from './pages/Bienvenida'
import Registro from './pages/Registro'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App