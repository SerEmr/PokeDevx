import React from 'react'
import './assets/styles/global.css'
import titulo from './assets/images/Titulo_Pokedevx.png'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <div className="app_container">
      {/* Logo */}
      <img
        src={titulo}
        alt="Mi Pokédex"
        className="titulo_pokedevx"
      />

      {/* Router determina si muestra lista o detalle */}
      <AppRouter />
      </div>
  )
}

export default App
