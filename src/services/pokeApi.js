const BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  
  // Fetch details for each pokemon to get types and sprites
  const detailedPokemon = await Promise.all(
    data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      return await res.json();
    })
  );
  
  return detailedPokemon;
};

export const fetchPokemonDetails = async (nameOrId) => {
  const response = await fetch(`${BASE_URL}/pokemon/${nameOrId.toString().toLowerCase()}`);
  if (!response.ok) throw new Error('Pokemon not found');
  return await response.json();
};

export const fetchTypeDetails = async (type) => {
  const response = await fetch(`${BASE_URL}/type/${type}`);
  return await response.json();
};

export const REGIONS = {
  Kanto: { start: 1, end: 151 },
  Johto: { start: 152, end: 251 },
  Hoenn: { start: 252, end: 386 },
  Sinnoh: { start: 387, end: 493 },
  Unova: { start: 494, end: 649 },
  Kalos: { start: 650, end: 721 },
  Alola: { start: 722, end: 809 },
  Galar: { start: 810, end: 898 },
  Paldea: { start: 899, end: 1025 },
};

export const fetchPokemonByRegion = async (regionName) => {
  const region = REGIONS[regionName];
  if (!region) return [];
  
  const limit = region.end - region.start + 1;
  const offset = region.start - 1;
  
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  
  const detailedPokemon = await Promise.all(
    data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      return await res.json();
    })
  );
  
  return detailedPokemon;
};

export const fetchPokemonSpecies = async (idOrName) => {
  const response = await fetch(`${BASE_URL}/pokemon-species/${idOrName}`);
  return await response.json();
};

export const fetchEvolutionChain = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

export const fetchItemsList = async (limit = 20, offset = 0) => {
  const response = await fetch(`${BASE_URL}/item?limit=${limit}&offset=${offset}`);
  return await response.json();
};

export const fetchItemDetails = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

export const fetchItemCategory = async (name) => {
  const response = await fetch(`${BASE_URL}/item-category/${name}`);
  return await response.json();
};

export const fetchMovesList = async (limit = 20, offset = 0) => {
  const response = await fetch(`${BASE_URL}/move?limit=${limit}&offset=${offset}`);
  return await response.json();
};

export const fetchMoveDetails = async (url) => {
  const response = await fetch(url);
  return await response.json();
};
