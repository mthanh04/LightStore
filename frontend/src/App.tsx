import React from 'react'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to LightStore 💡</h1>
        <p className="text-gray-600">Your one-stop shop for modern lighting.</p>
      </header>
      
      <button className="bg-primary text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-amber-600 transition-colors">
        <ShoppingBagIcon className="w-5 h-5" />
        Start Shopping
      </button>
    </div>
  )
}

export default App
