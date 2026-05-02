import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Bienvenida from './pages/Bienvenida'
import Registro from './pages/Registro'
import Bienvenido from './pages/Bienvenido'
import Login from './pages/Login'
import Inicio from './pages/Inicio'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/bienvenido" element={<Bienvenido />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App