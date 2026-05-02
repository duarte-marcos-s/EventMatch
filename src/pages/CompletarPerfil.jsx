import { useState } from 'react'
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

function CompletarPerfil() {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [rubro, setRubro] = useState('')
  const [subrubro, setSubrubro] = useState('')
  const [provincia, setProvincia] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [coberturaKm, setCoberturaKm] = useState(50)
  const [precioTipo, setPrecioTipo] = useState('consultar')
  const [precioDesde, setPrecioDesde] = useState('')
  const [precioHasta, setPrecioHasta] = useState('')
  const [precioFijo, setPrecioFijo] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [instagram, setInstagram] = useState('')
  const [foto, setFoto] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleGuardar() {
    if (!nombre || !rubro || !subrubro || !provincia || !ciudad) {
      setError('Completá los campos obligatorios *')
      return
    }

    setCargando(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    let fotoUrl = null

    if (foto) {
      const fileExt = foto.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('fotos-proveedores')
        .upload(fileName, foto, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage
          .from('fotos-proveedores')
          .getPublicUrl(fileName)
        fotoUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('perfiles').upsert({
      id: user.id,
      tipo: 'proveedor',
      nombre,
      descripcion,
      rubro,
      subrubro,
      zona_provincia: provincia,
      zona_ciudad: ciudad,
      cobertura_km: coberturaKm,
      precio_tipo: precioTipo,
      precio_desde: precioTipo === 'rango' ? parseInt(precioDesde) : null,
      precio_hasta: precioTipo === 'rango' ? parseInt(precioHasta) : null,
      capacidad_max: capacidad ? parseInt(capacidad) : null,
      telefono,
      instagram,
      fotos: fotoUrl ? [fotoUrl] : [],
    })

    if (error) {
      setError(error.message)
      setCargando(false)
    } else {
      navigate('/inicio')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-6">

        <div className="text-center mb-8">
          <span className="text-5xl">🛠️</span>
          <h2 className="text-3xl font-bold text-purple-600 mt-3">Tu perfil de proveedor</h2>
          <p className="text-gray-400 mt-1">Completá tu info para aparecer en búsquedas</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-5">

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Nombre del negocio *</label>
            <input
              type="text"
              placeholder="Ej: Fotógrafo Marcos"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Descripción</label>
            <textarea
              placeholder="Contá brevemente qué hacés y qué te diferencia..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Rubro *</label>
            <select
              value={rubro}
              onChange={(e) => { setRubro(e.target.value); setSubrubro('') }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
            >
              <option value="">Seleccioná un rubro</option>
              {Object.keys(RUBROS).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {rubro && (
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Especialidad *</label>
              <select
                value={subrubro}
                onChange={(e) => setSubrubro(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
              >
                <option value="">Seleccioná una especialidad</option>
                {RUBROS[rubro].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Provincia *</label>
              <select
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
              >
                <option value="">Provincia</option>
                {PROVINCIAS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Ciudad *</label>
              <input
                type="text"
                placeholder="Ej: Neuquén"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Radio de cobertura: <span className="text-purple-600">{coberturaKm} km</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {RADIOS_KM.map(km => (
                <button
                  key={km}
                  onClick={() => setCoberturaKm(km)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    coberturaKm === km
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-gray-100 text-gray-500 hover:bg-purple-50'
                  }`}
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
                { value: 'fijo', label: '💲 Precio fijo' },
                { value: 'rango', label: '📊 Rango' },
              ].map(op => (
                <button
                  key={op.value}
                  onClick={() => setPrecioTipo(op.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    precioTipo === op.value
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-gray-100 text-gray-500 hover:bg-purple-50'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {precioTipo === 'fijo' && (
              <input
                type="number"
                placeholder="Precio en $"
                value={precioFijo}
                onChange={(e) => setPrecioFijo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
              />
            )}

            {precioTipo === 'rango' && (
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Desde $"
                  value={precioDesde}
                  onChange={(e) => setPrecioDesde(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
                />
                <input
                  type="number"
                  placeholder="Hasta $"
                  value={precioHasta}
                  onChange={(e) => setPrecioHasta(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Capacidad máxima de personas</label>
            <input
              type="number"
              placeholder="Ej: 200"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Teléfono</label>
            <input
              type="text"
              placeholder="Ej: 299 4123456"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Instagram</label>
            <input
              type="text"
              placeholder="@tunegocio"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              📸 Foto principal <span className="text-gray-400 font-normal">(plan free: 1 foto)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0])}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-500 text-sm"
            />
          </div>

          <button
            onClick={handleGuardar}
            disabled={cargando}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg disabled:opacity-50"
          >
            {cargando ? 'Guardando...' : 'Guardar perfil'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default CompletarPerfil