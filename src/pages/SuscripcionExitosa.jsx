import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'

function SuscripcionExitosa() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan')
  const [actualizado, setActualizado] = useState(false)

  useEffect(() => {
    async function actualizarPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('perfiles').update({
        plan: plan,
        destacado: plan === 'destacado',
        matches_disponibles: plan === 'pro' || plan === 'destacado' ? 9999 : 3,
      }).eq('id', user.id)

      setActualizado(true)
    }
    actualizarPlan()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 text-center">

        <div className="text-6xl mb-4">
          {plan === 'destacado' ? '🏆' : '⭐'}
        </div>

        <h2 className="text-3xl font-bold text-purple-600 mb-3">
          ¡Bienvenido al plan {plan === 'pro' ? 'Pro' : 'Destacado'}!
        </h2>

        <p className="text-gray-400 mb-6">
          Tu suscripción fue activada con éxito. Ahora tenés acceso a todas las funcionalidades {plan === 'destacado' ? 'premium' : 'Pro'} de EventMatch.
        </p>

        <div className="bg-purple-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-purple-600 font-bold text-sm mb-2">
            {plan === 'destacado' ? '🏆 Tu plan incluye:' : '⭐ Tu plan incluye:'}
          </p>
          {plan === 'pro' ? (
            <>
              <p className="text-gray-600 text-sm">✓ Matches ilimitados</p>
              <p className="text-gray-600 text-sm">✓ Hasta 10 fotos</p>
              <p className="text-gray-600 text-sm">✓ Prioridad en búsquedas</p>
              <p className="text-gray-600 text-sm">✓ Estadísticas avanzadas</p>
              <p className="text-gray-600 text-sm">✓ Videollamadas</p>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-sm">✓ Todo lo de Pro</p>
              <p className="text-gray-600 text-sm">✓ Aparecés primero siempre</p>
              <p className="text-gray-600 text-sm">✓ Badge destacado</p>
              <p className="text-gray-600 text-sm">✓ Contratos digitales</p>
              <p className="text-gray-600 text-sm">✓ Soporte 24/7</p>
            </>
          )}
        </div>

        <button
          onClick={() => navigate('/inicio')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 text-lg"
        >
          🚀 Ir al inicio
        </button>

      </div>
    </div>
  )
}

export default SuscripcionExitosa