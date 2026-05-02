import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'

function Presupuesto() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const matchId = searchParams.get('match')

  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [match, setMatch] = useState(null)
  const [otroPerfil, setOtroPerfil] = useState(null)
  const [presupuestoExistente, setPresupuestoExistente] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  // Formulario
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [condiciones, setCondiciones] = useState('')
  const [validezDias, setValidezDias] = useState(7)

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

      // Cargar match
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()
      setMatch(matchData)

      // Cargar perfil del otro usuario
      const otroId = matchData.organizador_id === user.id
        ? matchData.proveedor_id
        : matchData.organizador_id
      const { data: otroPerfilData } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', otroId)
        .single()
      setOtroPerfil(otroPerfilData)

      // Ver si ya hay presupuesto
      const { data: presData } = await supabase
        .from('presupuestos')
        .select('*')
        .eq('match_id', matchId)
        .single()

      if (presData) {
        setPresupuestoExistente(presData)
        setPrecio(presData.precio?.toString() || '')
        setDescripcion(presData.descripcion || '')
        setCondiciones(presData.condiciones || '')
        setValidezDias(presData.validez_dias || 7)
      }

      setCargando(false)
    }
    cargar()
  }, [])

  async function handleGuardar() {
    if (!precio || !descripcion) {
      setError('El precio y la descripción son obligatorios')
      return
    }

    setGuardando(true)
    setError('')

    if (presupuestoExistente) {
      // Actualizar presupuesto existente
      await supabase
        .from('presupuestos')
        .update({
          precio: parseFloat(precio),
          descripcion,
          condiciones,
          validez_dias: validezDias,
          estado: 'pendiente',
        })
        .eq('id', presupuestoExistente.id)
    } else {
      // Crear nuevo presupuesto
      await supabase.from('presupuestos').insert({
        match_id: matchId,
        proveedor_id: usuario.id,
        organizador_id: match.organizador_id,
        precio: parseFloat(precio),
        descripcion,
        condiciones,
        validez_dias: validezDias,
        estado: 'pendiente',
      })
    }

    setGuardando(false)
    setExito(true)
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  const tipo = perfil?.tipo || usuario?.user_metadata?.tipo

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate(`/chat?match=${matchId}`)} className="text-purple-600 font-semibold">← Chat</button>
        <h1 className="text-xl font-bold text-purple-600">📋 Presupuesto</h1>
        <div />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Info del otro usuario */}
        {otroPerfil && (
          <div className="bg-white rounded-2xl shadow p-4 mb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center overflow-hidden">
              {otroPerfil.fotos?.[0] ? (
                <img src={otroPerfil.fotos[0]} alt="foto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{tipo === 'proveedor' ? '🗂️' : '🛠️'}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-700">{otroPerfil.nombre}</h3>
              <p className="text-purple-500 text-xs">{otroPerfil.subrubro || otroPerfil.rubro || 'Organizador'}</p>
            </div>
          </div>
        )}

        {/* Info del evento */}
        {match && (
          <div className="bg-purple-50 rounded-2xl p-4 mb-4">
            <p className="text-purple-600 font-bold text-sm">🎪 {match.tipo_evento}</p>
            <div className="flex gap-4 mt-1">
              {match.fecha_evento && (
                <p className="text-purple-400 text-xs">📅 {new Date(match.fecha_evento).toLocaleDateString('es-AR')}</p>
              )}
              {match.cantidad_personas && (
                <p className="text-purple-400 text-xs">👥 {match.cantidad_personas} personas</p>
              )}
            </div>
            {match.descripcion_evento && (
              <p className="text-purple-400 text-xs mt-1 italic">"{match.descripcion_evento}"</p>
            )}
          </div>
        )}

        {exito ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <span className="text-6xl">🎉</span>
            <h2 className="text-2xl font-bold text-gray-700 mt-4">
              {presupuestoExistente ? '¡Presupuesto actualizado!' : '¡Presupuesto enviado!'}
            </h2>
            <p className="text-gray-400 mt-2">
              El organizador va a recibir tu propuesta y podrá aceptarla o rechazarla.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => navigate(`/chat?match=${matchId}`)}
                className="bg-purple-600 text-white font-semibold py-3 rounded-2xl hover:bg-purple-700 transition-all"
              >
                💬 Volver al chat
              </button>
            </div>
          </div>

        ) : tipo === 'organizador' && presupuestoExistente ? (
          // Vista del organizador — ver presupuesto recibido
          <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-4">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-500">PRESUPUESTO RECIBIDO</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                ${parseFloat(presupuestoExistente.precio).toLocaleString('es-AR')}
              </p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full mt-2 inline-block ${
                presupuestoExistente.estado === 'pendiente' ? 'bg-yellow-50 text-yellow-600' :
                presupuestoExistente.estado === 'aceptado' ? 'bg-green-50 text-green-600' :
                'bg-red-50 text-red-400'
              }`}>
                {presupuestoExistente.estado === 'pendiente' ? '⏳ Pendiente' :
                 presupuestoExistente.estado === 'aceptado' ? '✅ Aceptado' : '❌ Rechazado'}
              </span>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-600 mb-1">Descripción</p>
              <p className="text-gray-500 text-sm bg-gray-50 rounded-xl p-3">{presupuestoExistente.descripcion}</p>
            </div>

            {presupuestoExistente.condiciones && (
              <div>
                <p className="text-sm font-bold text-gray-600 mb-1">Condiciones</p>
                <p className="text-gray-500 text-sm bg-gray-50 rounded-xl p-3">{presupuestoExistente.condiciones}</p>
              </div>
            )}

            <p className="text-gray-400 text-xs text-center">
              Válido por {presupuestoExistente.validez_dias} días
            </p>

            {presupuestoExistente.estado === 'pendiente' && (
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await supabase.from('presupuestos').update({ estado: 'rechazado' }).eq('id', presupuestoExistente.id)
                    setPresupuestoExistente(prev => ({ ...prev, estado: 'rechazado' }))
                  }}
                  className="flex-1 border-2 border-red-100 text-red-400 font-semibold py-3 rounded-2xl hover:bg-red-50 transition-all"
                >
                  ❌ Rechazar
                </button>
                <button
                  onClick={async () => {
                    await supabase.from('presupuestos').update({ estado: 'aceptado' }).eq('id', presupuestoExistente.id)
                    setPresupuestoExistente(prev => ({ ...prev, estado: 'aceptado' }))
                  }}
                  className="flex-1 bg-purple-600 text-white font-semibold py-3 rounded-2xl hover:bg-purple-700 transition-all"
                >
                  ✅ Aceptar
                </button>
              </div>
            )}
          </div>

        ) : tipo === 'proveedor' ? (
          // Vista del proveedor — crear/editar presupuesto
          <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-4">

            <div className="text-center mb-2">
              <span className="text-4xl">📋</span>
              <h2 className="text-xl font-bold text-gray-700 mt-2">
                {presupuestoExistente ? 'Editar presupuesto' : 'Crear presupuesto'}
              </h2>
              <p className="text-gray-400 text-sm">Enviá una propuesta formal al organizador</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Precio total *</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 font-semibold">$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Descripción del servicio *</label>
              <textarea
                placeholder="Describí en detalle qué incluye tu servicio..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Condiciones <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <textarea
                placeholder="Ej: Seña del 30% para reservar fecha, cancelación con 15 días de anticipación..."
                value={condiciones}
                onChange={(e) => setCondiciones(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Validez del presupuesto: <span className="text-purple-600">{validezDias} días</span>
              </label>
              <div className="flex gap-2">
                {[3, 7, 15, 30].map(dias => (
                  <button
                    key={dias}
                    onClick={() => setValidezDias(dias)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                      validezDias === dias
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-gray-100 text-gray-500 hover:bg-purple-50'
                    }`}
                  >
                    {dias}d
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 text-lg disabled:opacity-50"
            >
              {guardando ? 'Enviando...' : presupuestoExistente ? '💾 Actualizar presupuesto' : '📤 Enviar presupuesto'}
            </button>

          </div>

        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <span className="text-5xl">📋</span>
            <p className="text-gray-400 mt-4">Todavía no hay presupuesto para este match.</p>
            <p className="text-gray-300 text-sm mt-1">El proveedor puede enviarte una propuesta desde el chat.</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Presupuesto