import { useNavigate } from 'react-router-dom'

function Bienvenido() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 text-center">

        <div className="mb-6">
          <span className="text-6xl">🎉</span>
        </div>

        <h2 className="text-3xl font-bold text-purple-600 mb-3">
          ¡Bienvenido a EventMatch!
        </h2>

        <p className="text-gray-500 mb-4">
          Tu cuenta fue creada con éxito.
        </p>

        <p className="text-gray-400 text-sm mb-8">
          Te enviamos un email para confirmar tu cuenta. Revisá tu bandeja de entrada.
        </p>

        <div className="bg-purple-50 rounded-2xl p-4 text-purple-600 text-sm">
          📧 Confirmá tu email para poder iniciar sesión
        </div>

      </div>
    </div>
  )
}

export default Bienvenido