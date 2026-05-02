import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function Inicio() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [seccion, setSeccion] = useState('inicio')

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUsuario(user)

      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setPerfil(data)
      setCargando(false)
    }
    cargar()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  const tipo = perfil?.tipo || usuario?.user_metadata?.tipo
  const esFree = perfil?.plan === 'free' || !perfil?.plan

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-purple-600">🎯 EventMatch</h1>
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-purple-600 text-xl">🔔</button>
          <button
            onClick={() => navigate('/perfil')}
            className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg"
          >
            {perfil?.fotos?.[0]
              ? <img src={perfil.fotos[0]} className="w-full h-full rounded-full object-cover" />
              : tipo === 'proveedor' ? '🛠️' : '🗂️'
            }
          </button>
        </div>
      </div>

      {/* Contenido según sección */}
      <div className="max-w-lg mx-auto px-4 py-6">

        {seccion === 'inicio' && (
          <>
            {/* Saludo */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-700">
                ¡Hola, {perfil?.nombre || usuario?.user_metadata?.nombre}! 👋
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {tipo === 'proveedor' ? 'Aquí está tu resumen de hoy' : 'Encontrá los mejores proveedores'}
              </p>
            </div>

            {/* Banner Premium — solo si es free */}
            {esFree && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-4 mb-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">⭐ Plan Free</p>
                    <p className="text-sm opacity-90 mt-1">
                      {tipo === 'proveedor'
                        ? `Tenés ${perfil?.matches_disponibles ?? 3} matches disponibles este mes`
                        : 'Búsquedas limitadas este mes'
                      }
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      Con Pro: matches ilimitados, más fotos y aparecés primero en búsquedas
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/suscripcion')}
                    className="bg-white text-purple-600 font-bold text-sm px-3 py-2 rounded-xl shrink-0 ml-3"
                  >
                    Ver planes
                  </button>
                </div>
              </div>
            )}

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {tipo === 'proveedor' ? (
                <>
                  <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">0</p>
                    <p className="text-gray-400 text-sm mt-1">👀 Vistas esta semana</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-3xl font-bold text-pink-500">0</p>
                    <p className="text-gray-400 text-sm mt-1">❤️ Matches nuevos</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-3xl font-bold text-blue-500">0</p>
                    <p className="text-gray-400 text-sm mt-1">💬 Mensajes</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-3xl font-bold text-green-500">0</p>
                    <p className="text-gray-400 text-sm mt-1">✅ Confirmados</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">0</p>
                    <p className="text-gray-400 text-sm mt-1">❤️ Matches</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-3xl font-bold text-pink-500">0</p>
                    <p className="text-gray-400 text-sm mt-1">💬 Mensajes</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-3xl font-bold text-blue-500">0</p>
                    <p className="text-gray-400 text-sm mt-1">📋 Presupuestos</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-4 text-center">
                    <p className="text-3xl font-bold text-green-500">0</p>
                    <p className="text-gray-400 text-sm mt-1">✅ Confirmados</p>
                  </div>
                </>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-2xl shadow p-4 mb-6">
              <p className="text-sm font-bold text-gray-500 mb-3">ACCIONES RÁPIDAS</p>
              <div className="flex flex-col gap-2">
                {tipo === 'proveedor' ? (
                  <>
                    <button onClick={() => setSeccion('matches')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                      <span className="text-2xl">❤️</span>
                      <div>
                        <p className="font-semibold text-gray-700">Ver matches</p>
                        <p className="text-xs text-gray-400">Organizadores interesados en vos</p>
                      </div>
                      <span className="ml-auto text-gray-300">→</span>
                    </button>
                    <button onClick={() => setSeccion('presupuestos')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                      <span className="text-2xl">📋</span>
                      <div>
                        <p className="font-semibold text-gray-700">Presupuestos</p>
                        <p className="text-xs text-gray-400">Enviados y pendientes</p>
                      </div>
                      <span className="ml-auto text-gray-300">→</span>
                    </button>
                    <button onClick={() => navigate('/perfil')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                      <span className="text-2xl">✏️</span>
                      <div>
                        <p className="font-semibold text-gray-700">Editar perfil</p>
                        <p className="text-xs text-gray-400">Actualizá tu info y fotos</p>
                      </div>
                      <span className="ml-auto text-gray-300">→</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setSeccion('buscar')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                      <span className="text-2xl">🔍</span>
                      <div>
                        <p className="font-semibold text-gray-700">Buscar proveedores</p>
                        <p className="text-xs text-gray-400">Encontrá lo que necesitás</p>
                      </div>
                      <span className="ml-auto text-gray-300">→</span>
                    </button>
                    <button onClick={() => setSeccion('matches')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                      <span className="text-2xl">❤️</span>
                      <div>
                        <p className="font-semibold text-gray-700">Mis matches</p>
                        <p className="text-xs text-gray-400">Proveedores que aceptaron</p>
                      </div>
                      <span className="ml-auto text-gray-300">→</span>
                    </button>
                    <button onClick={() => setSeccion('presupuestos')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                      <span className="text-2xl">📋</span>
                      <div>
                        <p className="font-semibold text-gray-700">Presupuestos recibidos</p>
                        <p className="text-xs text-gray-400">Revisá las propuestas</p>
                      </div>
                      <span className="ml-auto text-gray-300">→</span>
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-all text-left"
                >
                  <span className="text-2xl">🚪</span>
                  <div>
                    <p className="font-semibold text-red-400">Cerrar sesión</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {seccion === 'matches' && (
          <div>
            <button onClick={() => setSeccion('inicio')} className="text-purple-600 font-semibold mb-4 block">← Volver</button>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">❤️ Matches</h2>
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <span className="text-5xl">🎯</span>
              <p className="text-gray-400 mt-4">Todavía no tenés matches.</p>
              <p className="text-gray-300 text-sm mt-1">Cuando un organizador te elija, aparecerá acá.</p>
            </div>
          </div>
        )}

        {seccion === 'presupuestos' && (
          <div>
            <button onClick={() => setSeccion('inicio')} className="text-purple-600 font-semibold mb-4 block">← Volver</button>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">📋 Presupuestos</h2>
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <span className="text-5xl">📄</span>
              <p className="text-gray-400 mt-4">No hay presupuestos todavía.</p>
              <p className="text-gray-300 text-sm mt-1">Cuando recibas un pedido, aparecerá acá.</p>
            </div>
          </div>
        )}

        {seccion === 'buscar' && (
          <div>
            <button onClick={() => setSeccion('inicio')} className="text-purple-600 font-semibold mb-4 block">← Volver</button>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">🔍 Buscar proveedores</h2>
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <span className="text-5xl">🚀</span>
              <p className="text-gray-400 mt-4">El matching estilo Tinder viene pronto.</p>
              <p className="text-gray-300 text-sm mt-1">Estamos construyendo esta función.</p>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-10">
        <button onClick={() => setSeccion('inicio')} className={`flex flex-col items-center gap-1 ${seccion === 'inicio' ? 'text-purple-600' : 'text-gray-300'}`}>
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-semibold">Inicio</span>
        </button>
        <button onClick={() => setSeccion('matches')} className={`flex flex-col items-center gap-1 ${seccion === 'matches' ? 'text-purple-600' : 'text-gray-300'}`}>
          <span className="text-2xl">❤️</span>
          <span className="text-xs font-semibold">Matches</span>
        </button>
        <button onClick={() => setSeccion(tipo === 'organizador' ? 'buscar' : 'inicio')} className="flex flex-col items-center gap-1 -mt-6">
          <div className="bg-purple-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
            <span className="text-2xl">{tipo === 'organizador' ? '🔍' : '💬'}</span>
          </div>
        </button>
        <button onClick={() => setSeccion('presupuestos')} className={`flex flex-col items-center gap-1 ${seccion === 'presupuestos' ? 'text-purple-600' : 'text-gray-300'}`}>
          <span className="text-2xl">📋</span>
          <span className="text-xs font-semibold">Presupuestos</span>
        </button>
        <button onClick={() => navigate('/perfil')} className={`flex flex-col items-center gap-1 text-gray-300`}>
          <span className="text-2xl">👤</span>
          <span className="text-xs font-semibold">Perfil</span>
        </button>
      </div>

    </div>
  )
}

export default Inicio