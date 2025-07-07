// src/api/pokeApi.js
import axios from 'axios'

// Cliente configurado para la PokeAPI
export const poke = axios.create({
  baseURL: 'https://pokeapi.co/api/v2'
})

// Listados y detalles
export function getPokemons(limit = 20, offset = 0) {
  return poke.get('/pokemon', { params: { limit, offset } })
}

export function getAllPokemons(limit = 1000) {
  return poke.get('/pokemon', { params: { limit, offset: 0 } })
}

export function getPokemonByName(name) {
  return poke.get(`/pokemon/${name}`)
}

// Ahora incluido para detail view
export function getPokemonSpecies(name) {
  return poke.get(`/pokemon-species/${name}`)
}

// Tipos y generaciones
export function getTypeByName(name) {
  return poke.get(`/type/${name}`)
}

export function getTypes() {
  return poke.get('/type')
}

export function getGenerationById(id) {
  return poke.get(`/generation/${id}`)
}

export function getAbilityByName(name) {
  return poke.get(`/ability/${name}`)
}