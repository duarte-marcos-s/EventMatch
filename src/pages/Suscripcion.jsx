import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const PLANES = [
  {
    id: 'free',
    nombre: 'Free',
    precio: 0,
    emoji: '🌱',
    color: 'gray',
    descripcion: 'Para empezar a explorar',
    features: [
      '3 matches por mes',
      '1 foto de perfil',
      'Chat básico',
      'Presupuestos',
      'Aparecés en búsquedas',
    ],
    limitaciones: [
      'Sin prioridad en búsquedas',
      'Sin estadísticas',
      'Sin videollamadas',
    ]
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: 4999,
    emoji: '⭐',
    color: 'purple',
    descripcion: 'Para profesionales del rubro',
    popular: true,
    features: [
      'Matches ilimitados',
      'Hasta 10 fotos',
      'Chat + videollamadas',
      'Prioridad en búsquedas',
      'Estadísticas avanzadas',
      'Templates de presupuestos',
      'Respuestas automáticas',
      'Soporte prioritario',
    ],
    limitaciones: []
  },
  {
    id: 'destacado',
    nombre: 'Destacado',
    precio: 9999,
    emoji: '🏆',
    color: 'yellow',
    descripcion: 'Máxima visibilidad garantizada',
    features: [
      'Todo lo de Pro',
      'Aparecés primero siempre',
      'Badge destacado en tarjetas',
      'Publicidad en sugerencias',
      'Contratos digitales',
      'Firma digital',
      'Soporte 24/7',
      'Cuenta verificada ✓',
    ],
    limitaciones: []
  }
]

function Suscripcion() {
  const navigate = useNavigate()
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [periodo, setPeriodo] = useState('mensual')
  const [procesando, setProcesando] = useState(false)

  async function handleSuscribirse(plan) {
    if (plan.id === 'free') {
      navigate('/inicio')
      return
    }

    setProcesando(true)
    setPlanSeleccionado(plan.id)

    const { data: { user } } = await supabase.auth.getUser()

    try {
      const response = await fetch(
        'https://ksdexhedtghphucrjuab.supabase.co/functions/v1/crear-preferencia-mp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            plan: plan.id,
            periodo,
            userId: user.id,
          })
        }
      )

      const data = await response.json()

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        alert('Error al generar el pago. Intentá de nuevo.')
      }

    } catch (error) {
      console.error('Error:', error)
      alert('Hubo un error al procesar el pago. Intentá de nuevo.')
    }

    setProcesando(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/inicio')} className="text-purple-600 font-semibold">← Inicio</button>
        <h1 className="text-xl font-bold text-purple-600">⭐ Planes</h1>
        <div />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Título */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-700">Elegí tu plan</h2>
          <p className="text-gray-400 mt-2">Crecé con EventMatch y conseguí más clientes</p>
        </div>

        {/* Toggle mensual/anual */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setPeriodo('mensual')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              periodo === 'mensual'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setPeriodo('anual')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              periodo === 'anual'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            Anual
            <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">-20%</span>
          </button>
        </div>

        {/* Planes */}
        <div className="flex flex-col gap-4">
          {PLANES.map(plan => {
            const precioFinal = periodo === 'anual' && plan.precio > 0
              ? Math.round(plan.precio * 0.8)
              : plan.precio

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl shadow-lg p-6 relative ${
                  plan.popular ? 'ring-2 ring-purple-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    ⭐ MÁS POPULAR
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-700">
                      {plan.emoji} {plan.nombre}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{plan.descripcion}</p>
                  </div>
                  <div className="text-right">
                    {plan.precio === 0 ? (
                      <p className="text-3xl font-bold text-gray-700">Gratis</p>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-purple-600">
                          ${precioFinal.toLocaleString('es-AR')}
                        </p>
                        <p className="text-gray-400 text-xs">/mes</p>
                        {periodo === 'anual' && (
                          <p className="text-green-500 text-xs font-semibold">
                            Ahorrás ${(plan.precio * 12 * 0.2).toLocaleString('es-AR')}/año
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-col gap-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-green-500 text-sm">✓</span>
                      <p className="text-gray-600 text-sm">{feature}</p>
                    </div>
                  ))}
                  {plan.limitaciones.map((limit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm">✗</span>
                      <p className="text-gray-300 text-sm">{limit}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSuscribirse(plan)}
                  disabled={procesando && planSeleccionado === plan.id}
                  className={`w-full font-semibold py-3 rounded-2xl transition-all text-sm disabled:opacity-50 ${
                    plan.id === 'free'
                      ? 'border-2 border-gray-200 text-gray-500 hover:bg-gray-50'
                      : plan.id === 'destacado'
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                  }`}
                >
                  {procesando && planSeleccionado === plan.id
                    ? 'Procesando...'
                    : plan.id === 'free'
                    ? 'Continuar gratis'
                    : `Suscribirme al ${plan.nombre}`
                  }
                </button>
              </div>
            )
          })}
        </div>

        {/* Garantía */}
        <div className="bg-green-50 rounded-2xl p-4 mt-6 text-center">
          <p className="text-green-600 font-semibold text-sm">🔒 Pago 100% seguro con MercadoPago</p>
          <p className="text-green-500 text-xs mt-1">Podés cancelar tu suscripción en cualquier momento</p>
        </div>

      </div>
    </div>
  )
}

export default Suscripcion