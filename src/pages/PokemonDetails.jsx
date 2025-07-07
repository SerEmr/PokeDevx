// src/pages/PokemonDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPokemonByName, getPokemonSpecies, getAbilityByName } from '../api/pokeApi'
import '../assets/styles/PokemonDetails.css'

export default function PokemonDetail() {
  const { name } = useParams()

  const [info, setInfo]           = useState(null)
  const [species, setSpecies]     = useState(null)
  const [evolution, setEvolution] = useState(null)
  const [evoNames, setEvoNames]   = useState([])
  const [evoSprites, setEvoSprites] = useState([])
  const [abilitiesES, setAbilitiesES] = useState([])

  // 1) Fetch /pokemon/{name}, species y cadena de evolución
  useEffect(() => {
    let mounted = true

    getPokemonByName(name)
      .then(res => {
        if (!mounted) return
        const data = res.data
        setInfo(data)
        return fetch(data.species.url)
      })
      .then(r => r.json())
      .then(sp => {
        if (!mounted) return
        setSpecies(sp)
        return fetch(sp.evolution_chain.url)
      })
      .then(r => r.json())
      .then(chainData => {
        if (mounted) setEvolution(chainData.chain)
      })
      .catch(console.error)

    return () => { mounted = false }
  }, [name])

  // 2) Extraer nombres de la cadena evolutiva en orden
  useEffect(() => {
    if (!evolution) return
    const names = []
    const walk = node => {
      names.push(node.species.name)
      if (node.evolves_to[0]) walk(node.evolves_to[0])
    }
    walk(evolution)
    setEvoNames(names)
  }, [evolution])

 // 3) Cargar mini–sprites Gen VIII para cada evolución,
//    resolviendo primero la especie y su variedad por defecto
useEffect(() => {
  if (!evoNames.length) return

  Promise.all(
    evoNames.map(async n => {
      try {
        // 3.1) Fetch species para el nombre de evolución
        const spRes = await getPokemonSpecies(n)
        const defaultVar = spRes.data.varieties.find(v => v.is_default)
        const realName = defaultVar?.pokemon.name || n

        // 3.2) Fetch la info Pokémon de la variedad por defecto
        const pokeRes = await getPokemonByName(realName)
        const spr = 
          pokeRes.data.sprites.versions['generation-viii'].icons.front_default ||
          pokeRes.data.sprites.front_default

        return { name: n, sprite: spr }
      } catch {
        // si falla, lo ignoramos
        return null
      }
    })
  )
    .then(arr => setEvoSprites(arr.filter(Boolean)))
}, [evoNames])


  // 4) Traducir habilidades al español
  useEffect(() => {
    if (!info) return
    Promise.all(
      info.abilities.map(a =>
        getAbilityByName(a.ability.name)
          .then(res => {
            const entry = res.data.names.find(n => n.language.name === 'es')
            return entry?.name ?? a.ability.name
          })
      )
    ).then(names => setAbilitiesES(names))
     .catch(console.error)
  }, [info])

  if (!info || !species) return <p>Cargando…</p>

  // Elegir mejor imagen con fallback
  const imageUrl =
    info.sprites.other.home.front_default ||
    info.sprites.other['official-artwork'].front_default ||
    info.sprites.other.dream_world.front_default ||
    info.sprites.front_default

  // Descripción en español
  const flavorText = species.flavor_text_entries
    .find(e => e.language.name === 'es')
    ?.flavor_text.replace(/\n|\f/g, ' ')
    ?? 'Sin descripción en español.'

  // Etiquetas de stats en español
  const statLabels = {
    hp:               'PS',
    attack:           'Ataque',
    defense:          'Defensa',
    'special-attack': 'Atq. Espec.',
    'special-defense':'Def. Espec.',
    speed:            'Velocidad'
  }

  return (
    <div className="pokemon-detail-container">
     
      <div className="detail-main">
        {/* Imagen + evoluciones */}
        <div className="detail-image-wrapper">
          <div className="detail-image-circle">
            <img
              src={imageUrl}
              alt={info.name}
              className="detail-image-inside"
            />
          </div>
          {evoSprites.length > 1 && (
            <div className="evolution-stages">
              {evoSprites.map(e => (
                <Link
                  key={e.name}
                  to={`/pokemon/${e.name}`}
                  className="evo-stage"
                >
                  <img
                    src={e.sprite}
                    alt={e.name}
                    className="mini-sprite"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div className="detail-info-wrapper">

          <h1 className="detail-title">
            {info.name[0].toUpperCase() + info.name.slice(1)}
          </h1>


          <div className="detail-info">
            <p><strong>N.°:</strong> {info.id}</p>
            <p><strong>Altura:</strong> {info.height / 10} m</p>
            <p><strong>Peso:</strong> {info.weight / 10} kg</p>
            <p>
              <strong>Tipos:</strong>{' '}
              {info.types
                .map(t => t.type.name)
                .map(n => n.charAt(0).toUpperCase() + n.slice(1))
                .join(', ')}
            </p>

            <h2>Estadísticas Base</h2>
            <ul>
              {info.stats.map(s => (
                <li key={s.stat.name}>
                  <strong>{statLabels[s.stat.name] || s.stat.name}:</strong>{' '}
                  {s.base_stat}
                </li>
              ))}
            </ul>

            <h2>Habilidades</h2>
            <ul>
              {abilitiesES.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>

            <h2>Descripción</h2>
            <p>{flavorText}</p>
          </div>

          <div className="poke-menu">
            <Link to="/" className="poke-menu__option">SALIR</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
