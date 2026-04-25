function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 text-center">
        
        <div className="mb-6">
          <span className="text-6xl">🎯</span>
        </div>

        <h1 className="text-5xl font-bold text-purple-600 mb-3">
          EventMatch
        </h1>
        
        <p className="text-gray-500 text-lg mb-10">
          Conectamos organizadores de eventos con los mejores proveedores
        </p>

        <div className="flex flex-col gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg">
            🗂️ Soy Organizador
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg">
            🛠️ Soy Proveedor
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-8">
          ¿Ya tenés cuenta? <span className="text-purple-500 cursor-pointer hover:underline">Iniciá sesión</span>
        </p>

      </div>
    </div>
  )
}

export default App