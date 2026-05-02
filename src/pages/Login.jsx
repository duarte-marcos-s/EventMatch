import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError('Email o contraseña incorrectos')
      setCargando(false)
    } else {
      navigate('/inicio')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4">

        <div className="text-center mb-8">
          <span className="text-5xl">🎯</span>
          <h2 className="text-3xl font-bold text-purple-600 mt-3">
            EventMatch
          </h2>
          <p className="text-gray-400 mt-1">Iniciá sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-gray-700"
          />

          <button
            onClick={handleLogin}
            disabled={cargando}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg mt-2 disabled:opacity-50"
          >
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-6 text-center">
          ¿No tenés cuenta? 
          <span 
            onClick={() => navigate('/')}
            className="text-purple-500 cursor-pointer hover:underline ml-1"
          >
            Registrate gratis
          </span>
        </p>

      </div>
    </div>
  )
}

export default Login