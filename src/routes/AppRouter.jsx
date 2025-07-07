import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PokemonList from '../components/PokemonList'
import PokemonDetail from '../pages/PokemonDetails'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz: lista de Pokémon */}
        <Route path="/" element={<PokemonList />} />

        {/* Ruta detalle: información del Pokémon */}
        <Route path="/pokemon/:name" element={<PokemonDetail />} />

        {/* Cualquier otra ruta redirige a la lista */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
