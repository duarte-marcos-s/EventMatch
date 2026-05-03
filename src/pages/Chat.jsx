import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'

function Chat() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const matchId = searchParams.get('match')

  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [match, setMatch] = useState(null)
  const [otroPerfil, setOtroPerfil] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mostrarRapidas, setMostrarRapidas] = useState(false)
  const bottomRef = useRef(null)

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

      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()
      setMatch(matchData)

      const otroId = matchData.organizador_id === user.id
        ? matchData.proveedor_id
        : matchData.organizador_id

      const { data: otroPerfilData } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', otroId)
        .single()
      setOtroPerfil(otroPerfilData)

      const { data: mensajesData } = await supabase
        .from('mensajes')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
      setMensajes(mensajesData || [])

      await supabase
        .from('mensajes')
        .update({ leido: true })
        .eq('match_id', matchId)
        .neq('emisor_id', user.id)

      setCargando(false)
    }
    cargar()
  }, [])

  useEffect(() => {
    if (!matchId) return

    const canal = supabase
      .channel(`chat-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        setMensajes(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function handleEnviar(textoCustom = null) {
    const texto = textoCustom || nuevoMensaje
    if (!texto.trim()) return
    setEnviando(true)

    await supabase.from('mensajes').insert({
      match_id: matchId,
      emisor_id: usuario.id,
      contenido: texto.trim(),
    })

    if (!textoCustom) setNuevoMensaje('')
    setMostrarRapidas(false)
    setEnviando(false)
  }

  function formatHora(timestamp) {
    return new Date(timestamp).toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  function formatFecha(timestamp) {
    return new Date(timestamp).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long'
    })
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando chat...</p>
    </div>
  )

  const respuestasRapidas = perfil?.respuestas_rapidas || []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/inicio')} className="text-purple-600 font-semibold">←</button>

        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
          {otroPerfil?.fotos?.[0] ? (
            <img src={otroPerfil.fotos[0]} alt="foto" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">{otroPerfil?.tipo === 'proveedor' ? '🛠️' : '🗂️'}</span>
          )}
        </div>

        <div className="flex-1">
          <h2 className="font-bold text-gray-700">{otroPerfil?.nombre}</h2>
          <p className="text-xs text-purple-500">{otroPerfil?.subrubro || otroPerfil?.rubro || 'Organizador'}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/presupuesto?match=${matchId}`)}
            className="text-purple-500 text-sm font-semibold"
          >
            📋
          </button>
          <button
            onClick={() => navigate(`/valoracion?match=${matchId}&proveedor=${otroPerfil?.id}`)}
            className="text-yellow-500 text-sm font-semibold"
          >
            ⭐
          </button>
        </div>
      </div>

      {match && (
        <div className="bg-purple-50 px-4 py-2 text-center">
          <p className="text-purple-600 text-xs font-semibold">
            {match.tipo_evento}
            {match.fecha_evento && ` · ${new Date(match.fecha_evento).toLocaleDateString('es-AR')}`}
            {match.cantidad_personas && ` · ${match.cantidad_personas} personas`}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

        {mensajes.length === 0 && (
          <div className="text-center py-10">
            <span className="text-5xl">👋</span>
            <p className="text-gray-400 mt-3">¡Es un match! Empezá la conversación.</p>
            <p className="text-gray-300 text-sm mt-1">Presentate y consultá lo que necesitás.</p>
          </div>
        )}

        {mensajes.map((msg, i) => {
          const esMio = msg.emisor_id === usuario?.id
          const mostrarFecha = i === 0 ||
            new Date(msg.created_at).toDateString() !== new Date(mensajes[i-1].created_at).toDateString()

          return (
            <div key={msg.id}>
              {mostrarFecha && (
                <div className="text-center my-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {formatFecha(msg.created_at)}
                  </span>
                </div>
              )}
              <div className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  esMio
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-700 shadow rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.contenido}</p>
                  <p className={`text-xs mt-1 ${esMio ? 'text-purple-200' : 'text-gray-400'}`}>
                    {formatHora(msg.created_at)}
                    {esMio && <span className="ml-1">{msg.leido ? '✓✓' : '✓'}</span>}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Respuestas rápidas (solo proveedor) */}
      {mostrarRapidas && respuestasRapidas.length > 0 && (
        <div className="bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-gray-500">⚡ RESPUESTAS RÁPIDAS</p>
            <button onClick={() => navigate('/perfil')} className="text-xs text-purple-500 font-semibold">
              ✏️ Editar
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {respuestasRapidas.map((respuesta, i) => (
              <button
                key={i}
                onClick={() => handleEnviar(respuesta)}
                className="text-left bg-purple-50 hover:bg-purple-100 text-gray-700 text-sm px-3 py-2 rounded-xl transition-all"
              >
                {respuesta}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2 sticky bottom-0">
        {perfil?.tipo === 'proveedor' && respuestasRapidas.length > 0 && (
          <button
            onClick={() => setMostrarRapidas(!mostrarRapidas)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              mostrarRapidas ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            ⚡
          </button>
        )}
        <input
          type="text"
          placeholder="Escribí un mensaje..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
          className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 text-sm"
        />
        <button
          onClick={() => handleEnviar()}
          disabled={enviando || !nuevoMensaje.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-50 shadow-lg"
        >
          ➤
        </button>
      </div>

    </div>
  )
}

export default Chat