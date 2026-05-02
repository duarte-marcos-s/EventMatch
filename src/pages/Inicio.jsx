import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function Inicio() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    async function getUsuario() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        navigate('/login')
      } else {
        setUsuario(data.user)
      }
    }
    getUsuario()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!usuario) return null

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-600">🎯 EventMatch</h1>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-500 transition-colors text-sm"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Contenido */}
      <div className="max-w-md mx-auto px-6 py-10 text-center">
        <span className="text-6xl">👋</span>
        <h2 className="text-2xl font-bold text-gray-700 mt-4 mb-2">
          ¡Hola, {usuario.user_metadata?.nombre || 'bienvenido'}!
        </h2>
        <p className="text-gray-400 mb-8">
          Estás dentro de EventMatch. Pronto vas a poder buscar y matchear con {usuario.user_metadata?.tipo === 'organizador' ? 'proveedores' : 'organizadores'}.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 text-left">
          <p className="text-gray-500 text-sm font-semibold mb-3">TU CUENTA</p>
          <p className="text-gray-700">📧 {usuario.email}</p>
          <p className="text-gray-700 mt-2">
            {usuario.user_metadata?.tipo === 'organizador' ? '🗂️ Organizador' : '🛠️ Proveedor'}
          </p>
        </div>
      </div>

    </div>
  )
}

export default Inicio