import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'

function Matches() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [matches, setMatches] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState(searchParams.get('tab') || 'pendientes')

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

      const tipo = perfilData?.tipo || user?.user_metadata?.tipo
      const campo = tipo === 'proveedor' ? 'proveedor_id' : 'organizador_id'

      const { data } = await supabase
        .from('matches')
        .select('*')
        .eq(campo, user.id)
        .order('created_at', { ascending: false })

      if (!data) { setCargando(false); return }

      const matchesConPerfil = await Promise.all(data.map(async (match) => {
        const otroId = tipo === 'proveedor' ? match.organizador_id : match.proveedor_id
        const { data: otroPerfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', otroId)
          .single()

        // Contar mensajes sin leer
        const { data: mensajesSinLeer } = await supabase
          .from('mensajes')
          .select('id')
          .eq('match_id', match.id)
          .eq('leido', false)
          .neq('emisor_id', user.id)

        // Obtener último mensaje
        const { data: ultimoMensaje } = await supabase
          .from('mensajes')
          .select('contenido, created_at, emisor_id')
          .eq('match_id', match.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...match,
          otroPerfil,
          mensajesSinLeer: mensajesSinLeer?.length || 0,
          ultimoMensaje: ultimoMensaje || null,
        }
      }))

      // Marcar matches como vistos
      await supabase
        .from('matches')
        .update({ visto_por_proveedor: true })
        .eq(campo, user.id)
        .eq('estado', 'aceptado')
        .eq('visto_por_proveedor', false)

      setMatches(matchesConPerfil)
      setCargando(false)
    }
    cargar()
  }, [])

  async function handleAceptar(matchId) {
    await supabase
      .from('matches')
      .update({ proveedor_acepto: true, estado: 'aceptado' })
      .eq('id', matchId)

    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, proveedor_acepto: true, estado: 'aceptado' } : m
    ))
  }

  async function handleRechazar(matchId) {
    await supabase
      .from('matches')
      .update({ proveedor_acepto: false, estado: 'rechazado' })
      .eq('id', matchId)

    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, proveedor_acepto: false, estado: 'rechazado' } : m
    ))
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando matches...</p>
    </div>
  )

  const tipo = perfil?.tipo || usuario?.user_metadata?.tipo

  const matchesFiltrados = matches.filter(m => {
    if (tab === 'pendientes') return m.estado === 'pendiente' || m.estado === null
    if (tab === 'aceptados') return m.estado === 'aceptado'
    if (tab === 'rechazados') return m.estado === 'rechazado'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => navigate('/inicio')} className="text-purple-600 font-semibold">← Inicio</button>
        <h1 className="text-xl font-bold text-purple-600">❤️ Mis Matches</h1>
        <div />
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-2 sticky top-14 z-10">
        {['pendientes', 'aceptados', 'rechazados'].map(t => (
  <button
    key={t}
    onClick={() => setTab(t)}
    className={`py-3 px-4 text-sm font-semibold capitalize transition-all border-b-2 ${
      tab === t
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-400 hover:text-gray-600'
    }`}
  >
    {t} ({matches.filter(m => {
  if (t === 'pendientes') return m.estado === 'pendiente' || m.estado === null
  if (t === 'aceptados') return m.estado === 'aceptado'
  if (t === 'rechazados') return m.estado === 'rechazado'
  return false
}).length})
  </button>
))}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">

        {matchesFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl shadow p-8 text-center">
            <span className="text-5xl">
              {tab === 'pendientes' ? '⏳' : tab === 'aceptados' ? '🎉' : '😕'}
            </span>
            <p className="text-gray-400 mt-4">
              {tab === 'pendientes' && 'No tenés matches pendientes'}
              {tab === 'aceptados' && 'No tenés matches aceptados todavía'}
              {tab === 'rechazados' && 'No tenés matches rechazados'}
            </p>
          </div>
        ) : (
          matchesFiltrados.map(match => (
            <div key={match.id} className="bg-white rounded-2xl shadow p-4">

              {/* Info del otro usuario */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center overflow-hidden">
                    {match.otroPerfil?.fotos?.[0] ? (
                      <img src={match.otroPerfil.fotos[0]} alt="foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{tipo === 'proveedor' ? '🗂️' : '🛠️'}</span>
                    )}
                  </div>
                  {match.mensajesSinLeer > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                      {match.mensajesSinLeer}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-700">{match.otroPerfil?.nombre || 'Usuario'}</h3>
                  <p className="text-purple-500 text-xs">{match.otroPerfil?.subrubro || match.otroPerfil?.rubro || 'Organizador'}</p>
                  {match.ultimoMensaje && (
                    <p className={`text-xs truncate mt-1 ${
                      match.mensajesSinLeer > 0 ? 'text-gray-700 font-semibold' : 'text-gray-400'
                    }`}>
                      {match.ultimoMensaje.emisor_id !== match.otroPerfil?.id && '✓ '}
                      {match.ultimoMensaje.contenido}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                  match.estado === 'pendiente' ? 'bg-yellow-50 text-yellow-600' :
                  match.estado === 'aceptado' ? 'bg-green-50 text-green-600' :
                  'bg-red-50 text-red-400'
                }`}>
                  {match.estado === 'pendiente' ? '⏳' :
                   match.estado === 'aceptado' ? '✅' : '❌'}
                </span>
              </div>

              {/* Info del evento */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">EVENTO</p>
                <p className="text-gray-700 text-sm font-semibold">{match.tipo_evento}</p>
                <div className="flex gap-3 mt-1">
                  {match.fecha_evento && (
                    <p className="text-gray-400 text-xs">📅 {new Date(match.fecha_evento).toLocaleDateString('es-AR')}</p>
                  )}
                  {match.cantidad_personas && (
                    <p className="text-gray-400 text-xs">👥 {match.cantidad_personas} personas</p>
                  )}
                </div>
                {match.descripcion_evento && (
                  <p className="text-gray-400 text-xs mt-1 italic">"{match.descripcion_evento}"</p>
                )}
              </div>

              {/* Botones según tipo y estado */}
              {tipo === 'proveedor' && match.estado === 'pendiente' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRechazar(match.id)}
                    className="flex-1 border-2 border-red-100 text-red-400 font-semibold py-2 rounded-xl hover:bg-red-50 transition-all text-sm"
                  >
                    ✖️ Rechazar
                  </button>
                  <button
                    onClick={() => handleAceptar(match.id)}
                    className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-xl hover:bg-purple-700 transition-all text-sm"
                  >
                    ✅ Aceptar
                  </button>
                </div>
              )}

              {match.estado === 'aceptado' && (
                <button
                  onClick={() => navigate(`/chat?match=${match.id}`)}
                  className="w-full bg-purple-600 text-white font-semibold py-2 rounded-xl hover:bg-purple-700 transition-all text-sm"
                >
                  💬 Abrir chat
                </button>
              )}

              {tipo === 'organizador' && match.estado === 'pendiente' && (
                <p className="text-center text-gray-400 text-xs">
                  Esperando respuesta del proveedor...
                </p>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Matches