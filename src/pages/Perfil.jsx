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

const RADIOS_KM = [10, 25, 50, 100, 200, 500]

const TIPOS_EVENTOS = ['Casamiento', 'Cumpleaños', 'Corporativo', 'Infantil', 'Social', 'Quinceaños', 'Graduación', 'Festival', 'Otro']

function Perfil() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [editando, setEditando] = useState(false)

  // Campos comunes
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [provincia, setProvincia] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [instagram, setInstagram] = useState('')
  const [foto, setFoto] = useState(null)

  // Campos proveedor
  const [rubro, setRubro] = useState('')
  const [subrubro, setSubrubro] = useState('')
  const [coberturaKm, setCoberturaKm] = useState(50)
  const [precioTipo, setPrecioTipo] = useState('consultar')
  const [precioDesde, setPrecioDesde] = useState('')
  const [precioHasta, setPrecioHasta] = useState('')
  const [precioFijo, setPrecioFijo] = useState('')
  const [capacidad, setCapacidad] = useState('')

  // Campos organizador
  const [nombreOrg, setNombreOrg] = useState('')
  const [tiposEventos, setTiposEventos] = useState([])

  // Respuestas Rapidas
  const [respuestasRapidas, setRespuestasRapidas] = useState([])
  const [nuevaRespuesta, setNuevaRespuesta] = useState('')

  // Mensaje de Bienvenida
  const [mensajeBienvenida, setMensajeBienvenida] = useState('')

  useEffect(() => {
    async function cargarPerfil() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUsuario(user)

      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setPerfil(data)
        setNombre(data.nombre || '')
        setDescripcion(data.descripcion || '')
        setProvincia(data.zona_provincia || '')
        setCiudad(data.zona_ciudad || '')
        setTelefono(data.telefono || '')
        setInstagram(data.instagram || '')
        setRubro(data.rubro || '')
        setSubrubro(data.subrubro || '')
        setCoberturaKm(data.cobertura_km || 50)
        setPrecioTipo(data.precio_tipo || 'consultar')
        setPrecioDesde(data.precio_desde || '')
        setPrecioHasta(data.precio_hasta || '')
        setNombreOrg(data.nombre_organizacion || '')
        setTiposEventos(data.tipo_eventos || [])
        setRespuestasRapidas(data.respuestas_rapidas || [])
        setMensajeBienvenida(data.mensaje_bienvenida || '')
      }
      setCargando(false)
    }
    cargarPerfil()
  }, [])

  function toggleTipoEvento(tipo) {
    setTiposEventos(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    )
  }

  function agregarRespuesta() {
  if (!nuevaRespuesta.trim()) return
  setRespuestasRapidas(prev => [...prev, nuevaRespuesta.trim()])
  setNuevaRespuesta('')
}

function quitarRespuesta(index) {
  setRespuestasRapidas(prev => prev.filter((_, i) => i !== index))
}

  async function handleGuardar() {
    setGuardando(true)
    setError('')
    setExito('')

    let fotoUrl = perfil?.fotos?.[0] || null

    if (foto) {
      const fileExt = foto.name.split('.').pop()
      const fileName = `${usuario.id}.${fileExt}`
      await supabase.storage.from('fotos-proveedores').upload(fileName, foto, { upsert: true })
      const { data } = supabase.storage.from('fotos-proveedores').getPublicUrl(fileName)
      fotoUrl = data.publicUrl
    }

    const { error } = await supabase.from('perfiles').upsert({
      id: usuario.id,
      tipo: perfil?.tipo || usuario.user_metadata?.tipo,
      nombre,
      descripcion,
      zona_provincia: provincia,
      zona_ciudad: ciudad,
      telefono,
      instagram,
      fotos: fotoUrl ? [fotoUrl] : [],
      rubro,
      subrubro,
      cobertura_km: coberturaKm,
      precio_tipo: precioTipo,
      precio_desde: precioTipo === 'rango' ? parseInt(precioDesde) : null,
      precio_hasta: precioTipo === 'rango' ? parseInt(precioHasta) : null,
      nombre_organizacion: nombreOrg,
      tipo_eventos: tiposEventos,
      respuestas_rapidas: respuestasRapidas,
      mensaje_bienvenida: mensajeBienvenida,
    })

    if (error) {
      setError(error.message)
    } else {
      setExito('¡Perfil actualizado correctamente!')
      setEditando(false)
    }
    setGuardando(false)
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando perfil...</p>
    </div>
  )

  const tipo = perfil?.tipo || usuario?.user_metadata?.tipo

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/inicio')} className="text-purple-600 font-semibold">← Inicio</button>
        <h1 className="text-xl font-bold text-purple-600">Mi Perfil</h1>
        <button
          onClick={() => setEditando(!editando)}
          className="text-sm font-semibold text-purple-600 hover:text-purple-700"
        >
          {editando ? 'Cancelar' : '✏️ Editar'}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Foto y nombre */}
        <div className="bg-white rounded-3xl shadow p-6 mb-4 text-center">
          <div className="w-24 h-24 rounded-full bg-purple-100 mx-auto mb-3 overflow-hidden flex items-center justify-center">
            {perfil?.fotos?.[0] ? (
              <img src={perfil.fotos[0]} alt="foto" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">{tipo === 'proveedor' ? '🛠️' : '🗂️'}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-700">{nombre || 'Sin nombre'}</h2>
          <p className="text-purple-500 text-sm font-semibold mt-1">
            {tipo === 'proveedor' ? '🛠️ Proveedor' : '🗂️ Organizador'}
            {subrubro && ` · ${subrubro}`}
          </p>
          {ciudad && provincia && (
            <p className="text-gray-400 text-sm mt-1">📍 {ciudad}, {provincia}</p>
          )}
        </div>

        {exito && (
          <div className="bg-green-50 text-green-600 rounded-xl px-4 py-3 mb-4 text-sm">
            ✅ {exito}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow p-6 flex flex-col gap-4">

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={!editando}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={!editando}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Provincia</label>
              <select
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                disabled={!editando}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50"
              >
                <option value="">Provincia</option>
                {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Ciudad</label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                disabled={!editando}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={!editando}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Instagram</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              disabled={!editando}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50"
            />
          </div>

          {/* Campos específicos proveedor */}
          {tipo === 'proveedor' && (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Rubro</label>
                <select
                  value={rubro}
                  onChange={(e) => { setRubro(e.target.value); setSubrubro('') }}
                  disabled={!editando}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50"
                >
                  <option value="">Seleccioná un rubro</option>
                  {Object.keys(RUBROS).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {rubro && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Especialidad</label>
                  <select
                    value={subrubro}
                    onChange={(e) => setSubrubro(e.target.value)}
                    disabled={!editando}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50"
                  >
                    <option value="">Seleccioná especialidad</option>
                    {RUBROS[rubro].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Radio de cobertura: <span className="text-purple-600">{coberturaKm} km</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {RADIOS_KM.map(km => (
                    <button
                      key={km}
                      onClick={() => editando && setCoberturaKm(km)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        coberturaKm === km
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-gray-100 text-gray-500'
                      } ${!editando && 'opacity-60 cursor-default'}`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Precio</label>
                <div className="flex gap-2 mb-3">
                  {[
                    { value: 'consultar', label: '💬 A consultar' },
                    { value: 'fijo', label: '💲 Fijo' },
                    { value: 'rango', label: '📊 Rango' },
                  ].map(op => (
                    <button
                      key={op.value}
                      onClick={() => editando && setPrecioTipo(op.value)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                        precioTipo === op.value
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-gray-100 text-gray-500'
                      } ${!editando && 'opacity-60 cursor-default'}`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
                {precioTipo === 'rango' && (
                  <div className="flex gap-3">
                    <input type="number" placeholder="Desde $" value={precioDesde} onChange={(e) => setPrecioDesde(e.target.value)} disabled={!editando} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50" />
                    <input type="number" placeholder="Hasta $" value={precioHasta} onChange={(e) => setPrecioHasta(e.target.value)} disabled={!editando} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  💬 Mensaje automático de bienvenida <span className="font-normal text-gray-400">(se envía al recibir un match)</span>
                </label>
                <textarea
                  value={mensajeBienvenida}
                  onChange={(e) => setMensajeBienvenida(e.target.value)}
                  disabled={!editando}
                  placeholder="Ej: ¡Hola! Gracias por tu interés. Soy [nombre] y ofrezco [servicio]. ¿Cuándo podemos hablar?"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 resize-none text-sm"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Si está vacío, no se enviará ningún mensaje automático.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  ⚡ Respuestas rápidas <span className="font-normal text-gray-400">(para usar en el chat)</span>
                </label>

                <div className="flex flex-col gap-2 mb-3">
                  {respuestasRapidas.map((respuesta, i) => (
                    <div key={i} className="bg-purple-50 rounded-xl p-3 flex items-start gap-2">
                      <p className="text-gray-700 text-sm flex-1">{respuesta}</p>
                      {editando && (
                        <button
                          onClick={() => quitarRespuesta(i)}
                          className="text-red-400 hover:text-red-600 text-sm font-bold shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {editando && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nueva respuesta rápida..."
                      value={nuevaRespuesta}
                      onChange={(e) => setNuevaRespuesta(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && agregarRespuesta()}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 text-sm"
                    />
                    <button
                      onClick={agregarRespuesta}
                      disabled={!nuevaRespuesta.trim()}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-4 rounded-xl transition-all disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                )}

                {respuestasRapidas.length === 0 && !editando && (
                  <p className="text-gray-400 text-sm italic">No tenés respuestas rápidas configuradas</p>
                )}
              </div>
            </>
          )}

          {/* Campos específicos organizador */}
          {tipo === 'organizador' && (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Nombre de la organización</label>
                <input
                  type="text"
                  value={nombreOrg}
                  onChange={(e) => setNombreOrg(e.target.value)}
                  disabled={!editando}
                  placeholder="Ej: Eventos del Sur"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Tipos de eventos que organizás</label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_EVENTOS.map(tipo => (
                    <button
                      key={tipo}
                      onClick={() => editando && toggleTipoEvento(tipo)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                        tiposEventos.includes(tipo)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      } ${!editando && 'opacity-60 cursor-default'}`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {editando && (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">📸 Cambiar foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFoto(e.target.files[0])}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-500 text-sm"
                />
              </div>

              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 text-lg disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Perfil