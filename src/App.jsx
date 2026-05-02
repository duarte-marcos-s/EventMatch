import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Bienvenida from './pages/Bienvenida'
import Registro from './pages/Registro'
import Bienvenido from './pages/Bienvenido'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import CompletarPerfil from './pages/CompletarPerfil'
import Perfil from './pages/Perfil'
import Buscar from './pages/Buscar'
import Valoracion from './pages/Valoracion'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/bienvenido" element={<Bienvenido />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/valoracion" element={<Valoracion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App