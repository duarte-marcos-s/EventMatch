import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function Inicio() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [stats, setStats] = useState({
    matchesPendientes: 0,
    matchesAceptados: 0,
    matchesNuevos: 0,
    mensajesSinLeer: 0,
  })

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUsuario(user)

      const { data: perfilData } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setPerfil(perfilData)

      await cargarStats(user, perfilData)
      setCargando(false)
    }
    cargar()
  }, [])

  async function cargarStats(user, perfilData) {
    const tipo = perfilData?.tipo || user?.user_metadata?.tipo
    const campo = tipo === 'proveedor' ? 'proveedor_id' : 'organizador_id'

    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .eq(campo, user.id)

    if (matchesData) {
      const pendientes = matchesData.filter(m => m.estado === 'pendiente' || m.estado === null).length
      const aceptados = matchesData.filter(m => m.estado === 'aceptado').length
      const nuevos = matchesData.filter(m => m.estado === 'aceptado' && !m.visto_por_proveedor).length

      // Mensajes sin leer
      const matchesAceptadosIds = matchesData
        .filter(m => m.estado === 'aceptado')
        .map(m => m.id)

      let sinLeer = 0
      if (matchesAceptadosIds.length > 0) {
        const { data: mensajes } = await supabase
          .from('mensajes')
          .select('id')
          .in('match_id', matchesAceptadosIds)
          .eq('leido', false)
          .neq('emisor_id', user.id)
        sinLeer = mensajes?.length || 0
      }

      setStats({
        matchesPendientes: pendientes,
        matchesAceptados: aceptados,
        matchesNuevos: nuevos,
        mensajesSinLeer: sinLeer,
      })
    }
  }

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
          <button className="text-gray-400 hover:text-purple-600 text-xl relative">
            🔔
            {(stats.matchesNuevos > 0 || stats.mensajesSinLeer > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {stats.matchesNuevos + stats.mensajesSinLeer}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/perfil')}
            className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg overflow-hidden"
          >
            {perfil?.fotos?.[0]
              ? <img src={perfil.fotos[0]} className="w-full h-full rounded-full object-cover" />
              : tipo === 'proveedor' ? '🛠️' : '🗂️'
            }
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Saludo */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            ¡Hola, {perfil?.nombre || usuario?.user_metadata?.nombre}! 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {tipo === 'proveedor' ? 'Aquí está tu resumen de hoy' : 'Encontrá los mejores proveedores'}
          </p>
        </div>

        {/* Banner Premium */}
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
                  Con Pro: matches ilimitados, más fotos y aparecés primero
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

        {/* Tarjetas de stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            onClick={() => navigate('/matches?tab=aceptados')}
            className="bg-white rounded-2xl shadow p-4 text-center cursor-pointer hover:shadow-md transition-all"
          >
            <p className="text-3xl font-bold text-yellow-500">{stats.matchesPendientes}</p>
            <p className="text-gray-400 text-sm mt-1">⏳ Pendientes</p>
          </div>
          <div
            onClick={() => navigate('/matches?tab=aceptados')}
            className="bg-white rounded-2xl shadow p-4 text-center cursor-pointer hover:shadow-md transition-all"
          >
            <p className="text-3xl font-bold text-green-500">{stats.matchesAceptados}</p>
            <p className="text-gray-400 text-sm mt-1">✅ Aceptados</p>
          </div>
          <div
            onClick={() => navigate('/matches?tab=aceptados')}
            className="bg-white rounded-2xl shadow p-4 text-center cursor-pointer hover:shadow-md transition-all relative"
          >
            <p className="text-3xl font-bold text-pink-500">{stats.matchesNuevos}</p>
            <p className="text-gray-400 text-sm mt-1">🔔 Nuevos</p>
            {stats.matchesNuevos > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
          <div
            onClick={() => navigate('/matches?tab=aceptados')}
            className="bg-white rounded-2xl shadow p-4 text-center cursor-pointer hover:shadow-md transition-all relative"
          >
            <p className="text-3xl font-bold text-blue-500">{stats.mensajesSinLeer}</p>
            <p className="text-gray-400 text-sm mt-1">💬 Sin leer</p>
            {stats.mensajesSinLeer > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <p className="text-sm font-bold text-gray-500 mb-3">ACCIONES RÁPIDAS</p>
          <div className="flex flex-col gap-2">
            {tipo === 'proveedor' ? (
              <>
                <button onClick={() => navigate('/matches?tab=aceptados')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                  <span className="text-2xl">❤️</span>
                  <div>
                    <p className="font-semibold text-gray-700">Ver matches</p>
                    <p className="text-xs text-gray-400">
                      {stats.matchesPendientes > 0
                        ? `Tenés ${stats.matchesPendientes} match${stats.matchesPendientes > 1 ? 'es' : ''} esperando respuesta`
                        : 'Organizadores interesados en vos'
                      }
                    </p>
                  </div>
                  {stats.matchesPendientes > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {stats.matchesPendientes}
                    </span>
                  )}
                </button>
                <button onClick={() => navigate('/matches?tab=aceptados')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-semibold text-gray-700">Mensajes</p>
                    <p className="text-xs text-gray-400">
                      {stats.mensajesSinLeer > 0
                        ? `${stats.mensajesSinLeer} mensaje${stats.mensajesSinLeer > 1 ? 's' : ''} sin leer`
                        : 'Sin mensajes nuevos'
                      }
                    </p>
                  </div>
                  {stats.mensajesSinLeer > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {stats.mensajesSinLeer}
                    </span>
                  )}
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
                <button onClick={() => navigate('/buscar')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className="font-semibold text-gray-700">Buscar proveedores</p>
                    <p className="text-xs text-gray-400">Encontrá lo que necesitás</p>
                  </div>
                  <span className="ml-auto text-gray-300">→</span>
                </button>
                <button onClick={() => navigate('/matches?tab=aceptados')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                  <span className="text-2xl">❤️</span>
                  <div>
                    <p className="font-semibold text-gray-700">Mis matches</p>
                    <p className="text-xs text-gray-400">
                      {stats.matchesPendientes > 0
                        ? `${stats.matchesPendientes} esperando respuesta`
                        : 'Ver todos tus matches'
                      }
                    </p>
                  </div>
                  {stats.matchesPendientes > 0 && (
                    <span className="ml-auto bg-yellow-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {stats.matchesPendientes}
                    </span>
                  )}
                </button>
                <button onClick={() => navigate('/matches?tab=aceptados')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all text-left">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-semibold text-gray-700">Mensajes</p>
                    <p className="text-xs text-gray-400">
                      {stats.mensajesSinLeer > 0
                        ? `${stats.mensajesSinLeer} mensaje${stats.mensajesSinLeer > 1 ? 's' : ''} sin leer`
                        : 'Sin mensajes nuevos'
                      }
                    </p>
                  </div>
                  {stats.mensajesSinLeer > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {stats.mensajesSinLeer}
                    </span>
                  )}
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
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-10">
        <button onClick={() => navigate('/inicio')} className="flex flex-col items-center gap-1 text-purple-600">
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-semibold">Inicio</span>
        </button>
        <button onClick={() => navigate('/matches?tab=aceptados')} className="flex flex-col items-center gap-1 text-gray-300 relative">
          <span className="text-2xl">❤️</span>
          <span className="text-xs font-semibold">Matches</span>
          {stats.matchesPendientes > 0 && (
            <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {stats.matchesPendientes}
            </span>
          )}
        </button>
        <button
          onClick={() => tipo === 'organizador' ? navigate('/buscar') : navigate('/matches')}
          className="flex flex-col items-center gap-1 -mt-6"
        >
          <div className="bg-purple-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
            <span className="text-2xl">{tipo === 'organizador' ? '🔍' : '💬'}</span>
          </div>
        </button>
        <button onClick={() => navigate('/matches?tab=aceptados')} className="flex flex-col items-center gap-1 text-gray-300 relative">
          <span className="text-2xl">💬</span>
          <span className="text-xs font-semibold">Mensajes</span>
          {stats.mensajesSinLeer > 0 && (
            <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {stats.mensajesSinLeer}
            </span>
          )}
        </button>
        <button onClick={() => navigate('/perfil')} className="flex flex-col items-center gap-1 text-gray-300">
          <span className="text-2xl">👤</span>
          <span className="text-xs font-semibold">Perfil</span>
        </button>
      </div>

    </div>
  )
}

export default Inicio