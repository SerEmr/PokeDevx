// src/components/PokemonCard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPokemonByName, getTypeByName } from '../api/pokeApi'
import { typeColors } from '../utils/typeColors'

export default function PokemonCard({ name }) {
  const [info, setInfo]                  = useState(null)
  const [spanishTypeNames, setTypeNames] = useState([])

  // 1) Datos básicos
  useEffect(() => {
    let mounted = true
    getPokemonByName(name)
      .then(res => mounted && setInfo(res.data))
      .catch(console.error)
    return () => { mounted = false }
  }, [name])

  // 2) Traducción de tipos
  useEffect(() => {
    if (!info) return
    let mounted = true

    Promise.all(
      info.types.map(({ type }) =>
        getTypeByName(type.name)
          .then(res => {
            const entry = res.data.names.find(n => n.language.name === 'es')
            return entry?.name ?? type.name
          })
      )
    )
      .then(names => mounted && setTypeNames(names))
      .catch(console.error)

    return () => { mounted = false }
  }, [info])

  if (!info) return <div>Cargando {name}…</div>

  // 4) URL del sprite animado y fallback
  const animatedUrl = info.sprites.other.dream_world.front_default  
  const fallbackUrl = info.sprites.other['official-artwork'].front_default

  return (
    <Link to={`/pokemon/${name}`} className="pokemon_card_link">
      <div className="pokemon_card">
        <img
          className="image_pokemon"
          src={animatedUrl || fallbackUrl}
          alt={spanishTypeNames.join(', ')}
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackUrl }}
        />

        <div className="pokemon_info">
          <div className='numero_pokemon'>
            <p>N.°{info.id}</p>
          </div>
          <h3>{name.charAt(0).toUpperCase() + name.slice(1)}</h3>
          <div className="pokemon-types">
            {info.types.map(({ type }, i) => {
              // color correspondiente
              const key = type.name
              const color = typeColors[key] ?? '#777'
              return (
                <span
                  key={i}
                  className="pokemon-type-badge"
                  style={{
                    backgroundColor: color,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    color: '#fff',
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    marginRight: '0.5rem',
                    display: 'inline-block',
                  }}
                >
                  {spanishTypeNames[i]}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </Link>
  )
}
