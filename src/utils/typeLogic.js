// Type effectiveness mapping
// [Attacker][Defender] = Multiplier
export const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/**
 * Calculates the total weakness multiplier for a list of types.
 * @param {string[]} defenderTypes - Types of the defending Pokemon.
 * @returns {Record<string, number>} - Multipliers for each attacking type.
 */
export const calculateWeaknesses = (defenderTypes) => {
  const multipliers = {};
  const allTypes = Object.keys(TYPE_CHART);

  allTypes.forEach((attackerType) => {
    let multiplier = 1;
    defenderTypes.forEach((defenderType) => {
      const mod = TYPE_CHART[attackerType]?.[defenderType] ?? 1;
      multiplier *= mod;
    });
    multipliers[attackerType] = multiplier;
  });

  return multipliers;
};

/**
 * Suggests counters based on weaknesses.
 * Focuses on types that deal 2x or 4x damage.
 */
export const getBestCounterTypes = (defenderTypes) => {
  const weaknesses = calculateWeaknesses(defenderTypes);
  return Object.entries(weaknesses)
    .filter(([_, multiplier]) => multiplier > 1)
    .sort((a, b) => b[1] - a[1]) // highest multiplier first
    .map(([type]) => type);
};

export const getWeaknesses = (defenderTypes) => {
  const weaknesses = calculateWeaknesses(defenderTypes);
  return Object.entries(weaknesses)
    .filter(([_, multiplier]) => multiplier > 1)
    .sort((a, b) => b[1] - a[1]) 
    .map(([type]) => type);
};

export const getResistances = (defenderTypes) => {
  const weaknesses = calculateWeaknesses(defenderTypes);
  return Object.entries(weaknesses)
    .filter(([_, multiplier]) => multiplier < 1)
    .sort((a, b) => a[1] - b[1]) 
    .map(([type]) => type);
};

/** Canonical Pokémon type colors */
export const TYPE_COLORS = {
  normal:   '#9FA18F',
  fighting: '#C10000',
  flying:   '#A890F0',
  poison:   '#A040A0',
  ground:   '#E0C068',
  rock:     '#C0A000',
  bug:      '#A8B820',
  ghost:    '#705898',
  steel:    '#B8B8D0',
  fire:     '#F08030',
  water:    '#6890F0',
  grass:    '#78C850',
  electric: '#F8D030',
  psychic:  '#F85888',
  ice:      '#98D8D8',
  dragon:   '#7038F8',
  dark:     '#705848',
  fairy:    '#EE99AC',
};

/** Types whose background color is dark enough to need white text */
const NEEDS_WHITE_TEXT = new Set([
  'fighting', 'poison', 'ghost', 'dragon', 'dark',
  'water', 'flying', 'rock',
]);

/**
 * Returns an inline style object { backgroundColor, color } for a type badge.
 * Eliminates the need for dynamic Tailwind class names that cannot be scanned.
 */
export const getTypeStyle = (type) => ({
  backgroundColor: TYPE_COLORS[type] ?? '#9FA18F',
  color: NEEDS_WHITE_TEXT.has(type) ? '#ffffff' : '#1a1a1a',
});
