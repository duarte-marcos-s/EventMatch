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
import Chat from './pages/Chat'
import Matches from './pages/Matches'
import Presupuesto from './pages/Presupuesto'

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
        <Route path="/chat" element={<Chat />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/presupuesto" element={<Presupuesto />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App