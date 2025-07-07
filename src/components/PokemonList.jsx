// src/components/PokemonList.jsx
import React, { useState, useEffect } from 'react'
import {
  getAllPokemons,
  getTypeByName,
  getTypes,
  getGenerationById
} from '../api/pokeApi'
import PokemonCard from './PokemonCard'
import '../assets/styles/PokemonList.css'     // tu grid, cards, etc.
import '../assets/styles/filters.css'     // estilos para filtros

export default function PokemonList() {
  const [allPokemons, setAllPokemons]       = useState([])
  const [filtered, setFiltered]             = useState([])
  const [typesList, setTypesList]           = useState([])
  const [generationList, setGenerationList] = useState([])

  // estados de UI
  const [sortOrder, setSortOrder]           = useState('number-asc') // 'number-asc' | 'number-desc' | 'az' | 'za'
  const [selectedType, setSelectedType]     = useState('')
  const [selectedGen, setSelectedGen]       = useState('')
  const [searchTerm, setSearchTerm]         = useState('')

  // Paginación
  const limit = 15
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(filtered.length / limit)

  // Carga inicial de datos
  useEffect(() => {
    getAllPokemons(905)
      .then(res => setAllPokemons(res.data.results))
      .catch(console.error)

    getTypes()
      .then(res => setTypesList(res.data.results.map(t => t.name)))
      .catch(() => {})

    setGenerationList([
      { id: '1', name: 'I' }, { id: '2', name: 'II' },
      { id: '3', name: 'III' }, { id: '4', name: 'IV' },
      { id: '5', name: 'V' },  { id: '6', name: 'VI' },
      { id: '7', name: 'VII' },{ id: '8', name: 'VIII' }
    ])
  }, [])

  // Aplica filtros y orden cada vez que cambie alguno
  useEffect(() => {
    let list = [...allPokemons]

    // filtrar por búsqueda
    if (searchTerm) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // filtrar por tipo
    if (selectedType) {
      getTypeByName(selectedType)
        .then(res => {
          const names = res.data.pokemon.map(x => x.pokemon.name)
          setFiltered(list.filter(p => names.includes(p.name)))
          setPage(0)
        })
        .catch(() => setFiltered(list))
      return
    }

    // filtrar por generación
    if (selectedGen) {
      getGenerationById(selectedGen)
        .then(res => {
          const names = res.data.pokemon_species.map(x => x.name)
          setFiltered(list.filter(p => names.includes(p.name)))
          setPage(0)
        })
        .catch(() => setFiltered(list))
      return
    }

    // ordenar según sortOrder
    switch (sortOrder) {
      case 'number-asc':
        list.sort((a, b) => {
          const idA = parseInt(a.url.split('/').slice(-2, -1)[0], 10)
          const idB = parseInt(b.url.split('/').slice(-2, -1)[0], 10)
          return idA - idB
        })
        break
      case 'number-desc':
        list.sort((a, b) => {
          const idA = parseInt(a.url.split('/').slice(-2, -1)[0], 10)
          const idB = parseInt(b.url.split('/').slice(-2, -1)[0], 10)
          return idB - idA
        })
        break
      case 'az':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'za':
        list.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        break
    }

    setFiltered(list)
    setPage(0)
  }, [allPokemons, searchTerm, selectedType, selectedGen, sortOrder])

  if (!allPokemons.length) return <p>Cargando pokémons…</p>

  // página actual
  const start = page * limit
  const pageItems = filtered.slice(start, start + limit)

  return (
    <>
      {/* UI de filtros */}
      <div className="filters">
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
        >
          <option value="" disabled selected>Orden Por Numero o Letra</option>
          <option value="number-asc">Número inferior</option>
          <option value="number-desc">Número superior</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
        </select>

        <select
          value={selectedType}
          onChange={e => { setSelectedType(e.target.value); setSelectedGen(''); setSearchTerm('') }}
        >
          <option value="" disabled selected>Ordenar Por Tipos</option>
          <option value="">Todos los tipos</option>
          {typesList.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={selectedGen}
          onChange={e => { setSelectedGen(e.target.value); setSelectedType(''); setSearchTerm('') }}
        >
          <option value="" disabled selected>Ordenar Por Generacion</option>
          <option value="">Todas las generaciones</option>
          {generationList.map(g => (
            <option key={g.id} value={g.id}>Generación {g.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar pokémon..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setSelectedType(''); setSelectedGen('') }}
        />
      </div>

      {/* Grid de resultados */}
      <div className="pokemons_container">
        {pageItems.map(p => (
          <PokemonCard key={p.name} name={p.name} />
        ))}
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>
          ← Anterior
        </button>
        <span>Página {page + 1} de {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page + 1 >= totalPages}>
          Siguiente →
        </button>
      </div>
    </>
  )
}
