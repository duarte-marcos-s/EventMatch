import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'

function Estrella({ llena, onClick }) {
  return (
    <button onClick={onClick} className="text-4xl transition-all hover:scale-110">
      {llena ? '⭐' : '☆'}
    </button>
  )
}

function Valoracion() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const matchId = searchParams.get('match')
  const proveedorId = searchParams.get('proveedor')

  const [usuario, setUsuario] = useState(null)
  const [proveedor, setProveedor] = useState(null)
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [yaValorado, setYaValorado] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUsuario(user)

      // Cargar perfil del proveedor
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', proveedorId)
        .single()
      setProveedor(perfil)

      // Verificar si ya valoró
      const { data: valExistente } = await supabase
        .from('valoraciones')
        .select('id')
        .eq('match_id', matchId)
        .eq('organizador_id', user.id)
        .single()

      if (valExistente) setYaValorado(true)
      setCargando(false)
    }
    cargar()
  }, [])

  async function handleGuardar() {
    if (puntuacion === 0) {
      alert('Seleccioná una puntuación')
      return
    }

    setGuardando(true)

    // Guardar valoración
    await supabase.from('valoraciones').insert({
      organizador_id: usuario.id,
      proveedor_id: proveedorId,
      match_id: matchId,
      puntuacion,
      comentario,
    })

    // Actualizar promedio en el perfil del proveedor
    const { data: todasLasVal } = await supabase
      .from('valoraciones')
      .select('puntuacion')
      .eq('proveedor_id', proveedorId)

    if (todasLasVal) {
      const promedio = todasLasVal.reduce((acc, v) => acc + v.puntuacion, 0) / todasLasVal.length
      await supabase.from('perfiles').update({
        valoracion_promedio: Math.round(promedio * 100) / 100,
        total_valoraciones: todasLasVal.length,
      }).eq('id', proveedorId)
    }

    setGuardando(false)
    setExito(true)
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/inicio')} className="text-purple-600 font-semibold">← Inicio</button>
        <h1 className="text-xl font-bold text-purple-600">⭐ Valorar proveedor</h1>
        <div />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">

        {exito ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <span className="text-6xl">🎉</span>
            <h2 className="text-2xl font-bold text-gray-700 mt-4">¡Gracias por tu valoración!</h2>
            <p className="text-gray-400 mt-2">Tu opinión ayuda a otros organizadores a elegir mejor.</p>
            <button
              onClick={() => navigate('/inicio')}
              className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-2xl mt-6 hover:bg-purple-700 transition-all"
            >
              Volver al inicio
            </button>
          </div>

        ) : yaValorado ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <span className="text-5xl">✅</span>
            <h2 className="text-xl font-bold text-gray-700 mt-4">Ya valoraste este proveedor</h2>
            <p className="text-gray-400 mt-2">Solo se puede valorar una vez por trabajo realizado.</p>
            <button
              onClick={() => navigate('/inicio')}
              className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-2xl mt-6 hover:bg-purple-700 transition-all"
            >
              Volver al inicio
            </button>
          </div>

        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-5">

            {/* Info proveedor */}
            {proveedor && (
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center overflow-hidden">
                  {proveedor.fotos?.[0] ? (
                    <img src={proveedor.fotos[0]} alt="foto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🛠️</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-700 text-lg">{proveedor.nombre}</h3>
                  <p className="text-purple-500 text-sm">{proveedor.subrubro || proveedor.rubro}</p>
                  <p className="text-gray-400 text-sm">📍 {proveedor.zona_ciudad}, {proveedor.zona_provincia}</p>
                </div>
              </div>
            )}

            {/* Puntuación */}
            <div className="text-center">
              <label className="text-sm font-semibold text-gray-600 block mb-3">¿Cómo fue tu experiencia?</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Estrella
                    key={i}
                    llena={i <= puntuacion}
                    onClick={() => setPuntuacion(i)}
                  />
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {puntuacion === 0 && 'Seleccioná una puntuación'}
                {puntuacion === 1 && 'Muy malo 😞'}
                {puntuacion === 2 && 'Malo 😕'}
                {puntuacion === 3 && 'Regular 😐'}
                {puntuacion === 4 && 'Bueno 😊'}
                {puntuacion === 5 && '¡Excelente! 🤩'}
              </p>
            </div>

            {/* Comentario */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Comentario <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <textarea
                placeholder="Contá tu experiencia para ayudar a otros organizadores..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 resize-none"
              />
            </div>

            {/* Info verificación */}
            <div className="bg-green-50 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-green-500">✅</span>
              <p className="text-green-600 text-xs">
                <strong>Reseña verificada</strong> — Solo podés valorar proveedores con los que trabajaste a través de EventMatch.
              </p>
            </div>

            <button
              onClick={handleGuardar}
              disabled={guardando || puntuacion === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 text-lg disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : '⭐ Publicar valoración'}
            </button>

          </div>
        )}
      </div>
    </div>
  )
}

export default Valoracion