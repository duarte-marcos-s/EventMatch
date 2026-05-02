import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const RUBROS = {
  'Gastronomía': ['Catering', 'Food Truck', 'Carrito de café', 'Carrito de helados', 'Barra móvil de bebidas', 'Bartender / Coctelería', 'Tortas y repostería', 'Mesada de quesos y fiambres', 'Máquina de pochoclos / algodón de azúcar', 'Food station temático', 'Servicio de mozos'],
  'Entretenimiento': ['Música en vivo', 'DJ', 'Animación infantil', 'Shows y espectáculos', 'Photobooth / Cabina de fotos', 'Magia', 'Cuentacuentos'],
  'Audiovisual': ['Fotografía', 'Video / Filmación', 'Transmisión en vivo', 'Pantallas y proyección', 'Sonido e iluminación técnica'],
  'Ambientación': ['Decoración', 'Flores y florería', 'Iluminación', 'Mobiliario y livings', 'Carpas y toldos'],
  'Espacios': ['Salones', 'Quintas', 'Espacios no convencionales'],
  'Infantil': ['Inflables y juegos', 'Personajes disfrazados', 'Piñatas y cotillón'],
  'Regalos y Experiencias': ['Souvenirs y regalos', 'Merchandising personalizado', 'Cotillón', 'Cata de vinos', 'Talleres'],
  'Logística': ['Transporte y traslados', 'Estacionamiento', 'Seguridad y personal'],
  'Gestión y Diseño': ['Diseño gráfico', 'Community manager', 'Ceremonia y civil', 'Wedding / Event planner'],
  'Sustentabilidad': ['Catering vegano / vegetariano', 'Vajilla ecológica'],
}

const PROVINCIAS = ['Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán']

const TIPOS_EVENTOS = ['Casamiento', 'Cumpleaños', 'Corporativo', 'Infantil', 'Quinceaños', 'Graduación', 'Festival', 'Otro']

// Sugerencias inteligentes por tipo de evento
const SUGERENCIAS_POR_EVENTO = {
  'Casamiento': ['Fotografía', 'Música en vivo', 'Catering', 'Decoración', 'Tortas y repostería', 'Video / Filmación', 'Flores y florería'],
  'Cumpleaños': ['DJ', 'Catering', 'Decoración', 'Tortas y repostería', 'Photobooth / Cabina de fotos'],
  'Corporativo': ['Catering', 'Sonido e iluminación técnica', 'Fotografía', 'Transmisión en vivo', 'Diseño gráfico'],
  'Infantil': ['Animación infantil', 'Inflables y juegos', 'Tortas y repostería', 'Personajes disfrazados', 'Catering'],
  'Quinceaños': ['DJ', 'Fotografía', 'Decoración', 'Catering', 'Video / Filmación', 'Tortas y repostería'],
  'Graduación': ['DJ', 'Catering', 'Fotografía', 'Decoración', 'Photobooth / Cabina de fotos'],
  'Festival': ['Música en vivo', 'Sonido e iluminación técnica', 'Food Truck', 'Barra móvil de bebidas', 'Seguridad y personal'],
  'Otro': [],
}

function Buscar() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [paso, setPaso] = useState('formulario')
  const [cargando, setCargando] = useState(false)
  const [proveedores, setProveedores] = useState([])
  const [indiceActual, setIndiceActual] = useState(0)
  const [animacion, setAnimacion] = useState(null)
  const [matchesDados, setMatchesDados] = useState([])

  // Formulario
  const [tipoEvento, setTipoEvento] = useState('')
  const [cantidadPersonas, setCantidadPersonas] = useState('')
  const [fechaEvento, setFechaEvento] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [provincia, setProvincia] = useState('')

  // Multi-rubro
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState([])
  const [rubroActual, setRubroActual] = useState('')
  const [subrubroActual, setSubrubroActual] = useState('')

  // Sugerencias premium
  const [sugerenciaMostrada, setSugerenciaMostrada] = useState(false)
  const [sugerenciaProveedor, setSugerenciaProveedor] = useState(null)

  useEffect(() => {
    async function getUsuario() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUsuario(user)
    }
    getUsuario()
  }, [])

  function agregarRubro() {
    if (!rubroActual) return
    const yaExiste = rubrosSeleccionados.find(r => r.rubro === rubroActual && r.subrubro === subrubroActual)
    if (yaExiste) return
    setRubrosSeleccionados(prev => [...prev, { rubro: rubroActual, subrubro: subrubroActual }])
    setRubroActual('')
    setSubrubroActual('')
  }

  function quitarRubro(index) {
    setRubrosSeleccionados(prev => prev.filter((_, i) => i !== index))
  }

  async function buscarProveedores() {
    if (!tipoEvento || !provincia || rubrosSeleccionados.length === 0) {
      alert('Completá el tipo de evento, la provincia y al menos un rubro')
      return
    }

    setCargando(true)

    // Buscar proveedores para cada rubro seleccionado
    let todosLosProveedores = []

    for (const item of rubrosSeleccionados) {
      let query = supabase
        .from('perfiles')
        .select('*')
        .eq('tipo', 'proveedor')
        .eq('zona_provincia', provincia)
        .eq('rubro', item.rubro)

      if (item.subrubro) query = query.eq('subrubro', item.subrubro)

      const { data } = await query
      if (data) todosLosProveedores = [...todosLosProveedores, ...data]
    }

    // Buscar sugerencia premium — proveedor destacado de un rubro NO seleccionado
    const rubrosYaBuscados = rubrosSeleccionados.map(r => r.rubro)
    const sugerenciasParaEvento = SUGERENCIAS_POR_EVENTO[tipoEvento] || []
    const rubrosSugeridos = sugerenciasParaEvento.filter(s => !rubrosYaBuscados.includes(s))

    if (rubrosSugeridos.length > 0) {
      const { data: provDestacados } = await supabase
        .from('perfiles')
        .select('*')
        .eq('tipo', 'proveedor')
        .eq('zona_provincia', provincia)
        .eq('destacado', true)
        .in('subrubro', rubrosSugeridos)
        .limit(1)

      if (provDestacados && provDestacados.length > 0) {
        setSugerenciaProveedor(provDestacados[0])
      }
    }

    // Ordenar: destacados primero, después por nombre
    const ordenados = todosLosProveedores.sort((a, b) => {
      if (a.destacado && !b.destacado) return -1
      if (!a.destacado && b.destacado) return 1
      return 0
    })

    // Eliminar duplicados
    const sinDuplicados = ordenados.filter((p, index, self) =>
      index === self.findIndex(t => t.id === p.id)
    )

    setProveedores(sinDuplicados)
    setIndiceActual(0)
    setMatchesDados([])
    setSugerenciaMostrada(false)
    setPaso(sinDuplicados.length > 0 ? 'tarjetas' : 'sinResultados')
    setCargando(false)
  }

  async function handleLike() {
    setAnimacion('like')
    const proveedor = proveedores[indiceActual]
    setMatchesDados(prev => [...prev, proveedor.nombre])

    await supabase.from('matches').insert({
      organizador_id: usuario.id,
      proveedor_id: proveedor.id,
      estado: 'pendiente',
      tipo_evento: tipoEvento,
      cantidad_personas: cantidadPersonas ? parseInt(cantidadPersonas) : null,
      fecha_evento: fechaEvento || null,
      descripcion_evento: descripcion,
    })

    setTimeout(() => {
      setAnimacion(null)
      siguiente()
    }, 400)
  }

  function handleNope() {
    setAnimacion('nope')
    setTimeout(() => {
      setAnimacion(null)
      siguiente()
    }, 400)
  }

  function siguiente() {
    const proximoIndice = indiceActual + 1

    // Mostrar sugerencia premium a mitad del stack
    if (!sugerenciaMostrada && sugerenciaProveedor && proximoIndice === Math.floor(proveedores.length / 2)) {
      setSugerenciaMostrada(true)
      setPaso('sugerencia')
      return
    }

    if (proximoIndice >= proveedores.length) {
      setPaso('fin')
    } else {
      setIndiceActual(proximoIndice)
    }
  }

  async function aceptarSugerencia() {
    await supabase.from('matches').insert({
      organizador_id: usuario.id,
      proveedor_id: sugerenciaProveedor.id,
      estado: 'pendiente',
      tipo_evento: tipoEvento,
      cantidad_personas: cantidadPersonas ? parseInt(cantidadPersonas) : null,
      fecha_evento: fechaEvento || null,
      descripcion_evento: descripcion,
    })
    setMatchesDados(prev => [...prev, sugerenciaProveedor.nombre])
    setPaso('tarjetas')
  }

  const proveedor = proveedores[indiceActual]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => navigate('/inicio')} className="text-purple-600 font-semibold">← Inicio</button>
        <h1 className="text-xl font-bold text-purple-600">🔍 Buscar proveedores</h1>
        <div />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* FORMULARIO */}
        {paso === 'formulario' && (
          <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-4">

            <div className="text-center mb-2">
              <span className="text-4xl">🎪</span>
              <h2 className="text-xl font-bold text-gray-700 mt-2">¿Qué necesitás para tu evento?</h2>
              <p className="text-gray-400 text-sm">Completá los datos y te mostramos los mejores proveedores</p>
            </div>

            {/* Tipo de evento */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Tipo de evento *</label>
              <div className="flex flex-wrap gap-2">
                {TIPOS_EVENTOS.map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setTipoEvento(tipo)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      tipoEvento === tipo
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-gray-100 text-gray-500 hover:bg-purple-50'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            {/* Provincia */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Provincia *</label>
              <select
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
              >
                <option value="">Seleccioná provincia</option>
                {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Multi-rubro */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">¿Qué rubros necesitás? *</label>

              {/* Rubros agregados */}
              {rubrosSeleccionados.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {rubrosSeleccionados.map((item, i) => (
                    <div key={i} className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-2">
                      {item.subrubro || item.rubro}
                      <button onClick={() => quitarRubro(i)} className="text-purple-400 hover:text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar rubro */}
              <div className="flex flex-col gap-2">
                <select
                  value={rubroActual}
                  onChange={(e) => { setRubroActual(e.target.value); setSubrubroActual('') }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
                >
                  <option value="">Seleccioná un rubro</option>
                  {Object.keys(RUBROS).map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                {rubroActual && (
                  <select
                    value={subrubroActual}
                    onChange={(e) => setSubrubroActual(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
                  >
                    <option value="">Cualquier especialidad</option>
                    {RUBROS[rubroActual].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}

                <button
                  onClick={agregarRubro}
                  disabled={!rubroActual}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 rounded-xl transition-all disabled:opacity-40"
                >
                  + Agregar rubro
                </button>
              </div>
            </div>

            {/* Cantidad y fecha */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Personas</label>
                <input
                  type="number"
                  placeholder="Ej: 150"
                  value={cantidadPersonas}
                  onChange={(e) => setCantidadPersonas(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Fecha</label>
                <input
                  type="date"
                  value={fechaEvento}
                  onChange={(e) => setFechaEvento(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Descripción del evento</label>
              <textarea
                placeholder="Contanos más sobre tu evento..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 resize-none"
              />
            </div>

            <button
              onClick={buscarProveedores}
              disabled={cargando}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 text-lg disabled:opacity-50"
            >
              {cargando ? 'Buscando...' : '🔍 Buscar proveedores'}
            </button>
          </div>
        )}

        {/* TARJETAS TINDER */}
        {paso === 'tarjetas' && proveedor && (
          <div className="flex flex-col items-center">

            <p className="text-gray-400 text-sm mb-4">
              {indiceActual + 1} de {proveedores.length} proveedores
            </p>

            <div className={`bg-white rounded-3xl shadow-2xl w-full overflow-hidden transition-all duration-300 ${
              animacion === 'like' ? 'translate-x-20 rotate-6 opacity-0' :
              animacion === 'nope' ? '-translate-x-20 -rotate-6 opacity-0' : ''
            }`}>

              <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative">
                {proveedor.fotos?.[0] ? (
                  <img src={proveedor.fotos[0]} alt="foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-8xl">🛠️</span>
                )}
                {proveedor.destacado && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ DESTACADO
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {proveedor.subrubro || proveedor.rubro}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-700">{proveedor.nombre}</h3>
                <p className="text-gray-400 text-sm mt-1">📍 {proveedor.zona_ciudad}, {proveedor.zona_provincia}</p>

                {proveedor.descripcion && (
                  <p className="text-gray-500 text-sm mt-3 leading-relaxed">{proveedor.descripcion}</p>
                )}

                <div className="flex gap-2 mt-4 flex-wrap">
                  {proveedor.precio_tipo === 'consultar' && (
                    <span className="bg-blue-50 text-blue-500 text-xs font-semibold px-3 py-1 rounded-full">💬 A consultar</span>
                  )}
                  {proveedor.precio_tipo === 'fijo' && (
                    <span className="bg-green-50 text-green-500 text-xs font-semibold px-3 py-1 rounded-full">💲 ${proveedor.precio_desde}</span>
                  )}
                  {proveedor.precio_tipo === 'rango' && (
                    <span className="bg-green-50 text-green-500 text-xs font-semibold px-3 py-1 rounded-full">📊 ${proveedor.precio_desde} - ${proveedor.precio_hasta}</span>
                  )}
                  {proveedor.capacidad_max && (
                    <span className="bg-purple-50 text-purple-500 text-xs font-semibold px-3 py-1 rounded-full">👥 Hasta {proveedor.capacidad_max} personas</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-6 mt-6">
              <button
                onClick={handleNope}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-all border-2 border-red-100 hover:border-red-300"
              >
                ✖️
              </button>
              <button
                onClick={handleLike}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-all border-2 border-green-100 hover:border-green-300"
              >
                ❤️
              </button>
            </div>

            <button onClick={() => setPaso('formulario')} className="text-gray-400 text-sm mt-4 hover:text-purple-500">
              ← Nueva búsqueda
            </button>
          </div>
        )}

        {/* SUGERENCIA PREMIUM */}
        {paso === 'sugerencia' && sugerenciaProveedor && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 text-center">
            <div className="bg-yellow-50 rounded-2xl p-4 mb-4">
              <p className="text-yellow-600 font-bold text-lg">⭐ ¿No te olvidás de algo?</p>
              <p className="text-gray-500 text-sm mt-1">
                Para un <strong>{tipoEvento}</strong>, muchos organizadores también contratan <strong>{sugerenciaProveedor.subrubro || sugerenciaProveedor.rubro}</strong>
              </p>
            </div>

            <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
              {sugerenciaProveedor.fotos?.[0] ? (
                <img src={sugerenciaProveedor.fotos[0]} alt="foto" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-6xl">🛠️</span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-700">{sugerenciaProveedor.nombre}</h3>
            <p className="text-purple-500 text-sm font-semibold">{sugerenciaProveedor.subrubro || sugerenciaProveedor.rubro}</p>
            <p className="text-gray-400 text-sm">📍 {sugerenciaProveedor.zona_ciudad}, {sugerenciaProveedor.zona_provincia}</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPaso('tarjetas')}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-all"
              >
                No, gracias
              </button>
              <button
                onClick={aceptarSugerencia}
                className="flex-1 bg-purple-600 text-white font-semibold py-3 rounded-2xl hover:bg-purple-700 transition-all"
              >
                ❤️ Me interesa
              </button>
            </div>
          </div>
        )}

        {/* FIN */}
        {paso === 'fin' && (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <span className="text-6xl">🎉</span>
            <h2 className="text-xl font-bold text-gray-700 mt-4">¡Viste todos los proveedores!</h2>

            {matchesDados.length > 0 && (
              <div className="bg-purple-50 rounded-2xl p-4 mt-4 text-left">
                <p className="text-purple-600 font-bold text-sm mb-2">❤️ Tus matches ({matchesDados.length})</p>
                {matchesDados.map((nombre, i) => (
                  <p key={i} className="text-gray-600 text-sm">• {nombre}</p>
                ))}
              </div>
            )}

            <p className="text-gray-400 text-sm mt-4">
              Los proveedores van a recibir tu solicitud y podrán aceptar o rechazar el match.
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => navigate('/inicio')}
                className="bg-purple-600 text-white font-semibold py-3 rounded-2xl hover:bg-purple-700 transition-all"
              >
                Ver mis matches
              </button>
              <button
                onClick={() => setPaso('formulario')}
                className="border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-all"
              >
                🔍 Nueva búsqueda
              </button>
            </div>
          </div>
        )}

        {/* SIN RESULTADOS */}
        {paso === 'sinResultados' && (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <span className="text-6xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-700 mt-4">No encontramos proveedores</h2>
            <p className="text-gray-400 text-sm mt-2">
              No hay proveedores registrados con esos filtros todavía. Probá con otros criterios o una provincia diferente.
            </p>
            <button
              onClick={() => setPaso('formulario')}
              className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-2xl mt-6 hover:bg-purple-700 transition-all"
            >
              🔍 Nueva búsqueda
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Buscar