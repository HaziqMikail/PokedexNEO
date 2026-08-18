import { useState } from 'react';
import { Search, ShieldAlert, Swords, Loader2, TrendingUp, ShieldOff, Zap } from 'lucide-react';
import { fetchPokemonDetails, fetchPokemonList, fetchPokemonByRegion, REGIONS } from '../services/pokeApi';
import { calculateWeaknesses, getBestCounterTypes, getWeaknesses, getResistances, getTypeStyle, TYPE_COLORS } from '../utils/typeLogic';
import PokemonCard from './PokemonCard';

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

function multiplierLabel(m) {
  if (m === 4) return '4×';
  if (m === 2) return '2×';
  if (m === 0.5) return '½×';
  if (m === 0.25) return '¼×';
  if (m === 0) return '0×';
  return '1×';
}

function multiplierColor(m) {
  if (m >= 4) return { bg: 'rgba(220,38,38,0.9)', text: '#fff' }; // double weak — bright red
  if (m >= 2) return { bg: 'rgba(34,197,94,0.85)', text: '#fff' }; // super effective — green
  if (m === 0) return { bg: 'rgba(22,22,28,0.88)', text: '#fff' }; // immune — black
  if (m <= 0.25) return { bg: 'rgba(124,58,237,0.85)', text: '#fff' }; // double resist — purple
  if (m < 1) return { bg: 'rgba(185,28,28,0.8)', text: '#fff' }; // resist — dark red
  return null;
}

function TypeMultiplierRow({ type, multiplier }) {
  const mc = multiplierColor(multiplier);
  if (!mc) return null; // skip neutral
  return (
    <div className="flex items-center gap-2.5">
      <span
        style={getTypeStyle(type)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider min-w-[68px]"
      >
        <img
          src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`}
          alt={type}
          className="w-3 h-3 opacity-90"
          onError={e => { e.target.style.display = 'none'; }}
        />
        {type}
      </span>
      <div
        className="px-2.5 py-0.5 rounded-md text-[11px] font-black min-w-[36px] text-center"
        style={{ backgroundColor: mc.bg, color: mc.text }}
      >
        {multiplierLabel(multiplier)}
      </div>
    </div>
  );
}

// Shows per-type effectiveness in a compact grid grouped by category
function TypeEffectivenessBreakdown({ enemyTypes }) {
  const multipliers = calculateWeaknesses(enemyTypes);

  const groups = {
    'Double Weakness (4×)': [],
    'Super Effective (2×)': [],
    'Resisted (½×)': [],
    'Double Resist (¼×)': [],
    'Immune (0×)': [],
  };

  ALL_TYPES.forEach(type => {
    const m = multipliers[type];
    if (m === 4) groups['Double Weakness (4×)'].push(type);
    else if (m === 2) groups['Super Effective (2×)'].push(type);
    else if (m === 0.5) groups['Resisted (½×)'].push(type);
    else if (m === 0.25) groups['Double Resist (¼×)'].push(type);
    else if (m === 0) groups['Immune (0×)'].push(type);
  });

  const groupConfig = {
    'Double Weakness (4×)': { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.3)', lbl: 'rgba(220,38,38,1)', badge: 'rgba(220,38,38,0.9)' },
    'Super Effective (2×)': { bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.3)', lbl: 'rgba(34,197,94,1)', badge: 'rgba(34,197,94,0.85)' },
    'Resisted (½×)': { bg: 'rgba(185,28,28,0.10)', border: 'rgba(185,28,28,0.25)', lbl: 'rgba(185,28,28,1)', badge: 'rgba(185,28,28,0.85)' },
    'Double Resist (¼×)': { bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.25)', lbl: 'rgba(124,58,237,1)', badge: 'rgba(124,58,237,0.85)' },
    'Immune (0×)': { bg: 'rgba(22,22,28,0.08)', border: 'rgba(22,22,28,0.2)', lbl: '#374151', badge: 'rgba(22,22,28,0.88)' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(groups).map(([label, types]) => {
        if (types.length === 0) return null;
        const cfg = groupConfig[label];
        return (
          <div
            key={label}
            className="rounded-2xl p-4"
            style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ color: cfg.lbl }}
            >
              {label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {types.map(type => (
                <span
                  key={type}
                  style={getTypeStyle(type)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                >
                  <img
                    src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`}
                    alt={type}
                    className="w-2.5 h-2.5 opacity-90"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {type}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Show the type effectiveness badges on each counter card
function CounterStrategyBadge({ counter, enemyTypes }) {
  const enemyMultipliers = calculateWeaknesses(enemyTypes);
  // What does this counter's move types do to the enemy?
  const counterTypes = counter.types.map(t => t.type.name);
  const attackAdvantages = counterTypes
    .map(type => ({ type, multiplier: enemyMultipliers[type] ?? 1 }))
    .filter(({ multiplier }) => multiplier >= 2)
    .sort((a, b) => b.multiplier - a.multiplier);

  // Is the counter itself resistant to the enemy's attack types?
  const { calculateWeaknesses: calc } = { calculateWeaknesses };
  // We reuse calculateWeaknesses: counter's defence vs enemy attack
  const counterDefense = calculateWeaknesses(counterTypes);
  const resistsEnemyTypes = enemyTypes
    .map(type => ({ type, multiplier: counterDefense[type] ?? 1 }))
    .filter(({ multiplier }) => multiplier < 1);

  if (attackAdvantages.length === 0 && resistsEnemyTypes.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {attackAdvantages.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Attacks deal</p>
          <div className="flex flex-wrap gap-1">
            {attackAdvantages.map(({ type, multiplier }) => {
              const mc = multiplierColor(multiplier);
              return (
                <div key={type} className="flex items-center gap-1">
                  <span
                    style={getTypeStyle(type)}
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                  >{type}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-black"
                    style={{ backgroundColor: mc?.bg, color: mc?.text }}
                  >{multiplierLabel(multiplier)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {resistsEnemyTypes.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Takes from enemy</p>
          <div className="flex flex-wrap gap-1">
            {resistsEnemyTypes.map(({ type, multiplier }) => {
              const mc = multiplierColor(multiplier);
              return (
                <div key={type} className="flex items-center gap-1">
                  <span
                    style={getTypeStyle(type)}
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                  >{type}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-black"
                    style={{ backgroundColor: mc?.bg, color: mc?.text }}
                  >{multiplierLabel(multiplier)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Extended counter card with strategy overlay
function CounterCard({ pokemon, enemyTypes, onClick }) {
  const [hovered, setHovered] = useState(false);
  const type = pokemon.types[0].type.name;
  const id = pokemon.id.toString().padStart(3, '0');

  return (
    <div
      className="glass rounded-3xl p-5 flex flex-col relative overflow-hidden cursor-pointer group transition-all duration-200"
      style={{ transform: hovered ? 'translateY(-6px)' : 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Background ID */}
      <div className="absolute top-2 right-4 text-4xl font-black text-black/20 pointer-events-none">
        #{id}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div
          style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '1a' : 'rgba(0,0,0,0.06)' }}
          className="w-28 h-28 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
        >
          <img
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-24 h-24 drop-shadow-2xl"
            onError={e => {
              if (e.target.src !== pokemon.sprites.front_default) {
                e.target.src = pokemon.sprites.front_default;
              } else {
                e.target.style.display = 'none';
              }
            }}
          />
        </div>

        <h3 className="text-base font-bold capitalize mb-2 group-hover:text-neo-accent transition-colors">{pokemon.name}</h3>

        <div className="flex gap-1.5 mb-3">
          {pokemon.types.map(t => (
            <span
              key={t.type.name}
              style={getTypeStyle(t.type.name)}
              className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      {/* Strategy section */}
      <div className="border-t border-black/5 pt-3 mt-auto">
        <CounterStrategyBadge counter={pokemon} enemyTypes={enemyTypes} />
      </div>

      {/* Accent bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-neo-accent w-0 group-hover:w-full transition-all duration-500" />
    </div>
  );
}

export default function CounterPicker({ onPokemonClick }) {
  const [enemySearch, setEnemySearch] = useState('');
  const [enemy, setEnemy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('counters'); // 'counters' | 'effectiveness'

  const handleSearch = async e => {
    e.preventDefault();
    if (!enemySearch) return;
    setSearching(true);
    setError(null);
    try {
      const data = await fetchPokemonDetails(enemySearch.toLowerCase().trim());
      setEnemy(data);
      setActiveTab('counters');
      findCounters(data);
    } catch (err) {
      setError('Pokémon not found. Check the name or ID.');
      setEnemy(null);
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const findCounters = async target => {
    setLoading(true);
    try {
      const targetTypes = target.types.map(t => t.type.name);
      const counterTypes = getBestCounterTypes(targetTypes);

      let targetRegion = 'Kanto';
      for (const [region, bounds] of Object.entries(REGIONS)) {
        if (target.id >= bounds.start && target.id <= bounds.end) {
          targetRegion = region;
          break;
        }
      }

      const genPool = await fetchPokemonByRegion(targetRegion);
      const genCounters = genPool.filter(p =>
        p.id !== target.id && p.types.some(t => counterTypes.includes(t.type.name))
      );
      const selectedGenCounters = genCounters.slice(0, 2);

      const genericPool = await fetchPokemonList(151, 0);
      const additionalCounters = genericPool
        .filter(p =>
          p.id !== target.id &&
          !selectedGenCounters.some(sgc => sgc.id === p.id) &&
          p.types.some(t => counterTypes.includes(t.type.name))
        )
        .slice(0, 6 - selectedGenCounters.length);

      setSuggestions([...selectedGenCounters, ...additionalCounters]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enemyTypes = enemy?.types.map(t => t.type.name) ?? [];

  const tabs = [
    { id: 'counters', label: 'Counter Picks', icon: <Swords size={14} /> },
    { id: 'effectiveness', label: 'Type Effectiveness', icon: <Zap size={14} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Search card */}
      <div className="glass rounded-3xl p-8 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="text-red-500" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Counter-Picker</h2>
            <p className="text-gray-600 text-sm">Analyze type effectiveness and find optimal counter Pokémon</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Enter enemy Pokémon name or ID..."
              value={enemySearch}
              onChange={e => setEnemySearch(e.target.value)}
              className="w-full bg-black/5 border border-black/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-red-400 transition-colors text-gray-800 placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? <Loader2 className="animate-spin" size={18} /> : <><Search size={16} />Find</>}
          </button>
        </form>

        {error && <p className="text-red-500 text-xs mt-3 font-medium uppercase tracking-wider">{error}</p>}
      </div>

      {enemy && (
        <div className="space-y-8">
          {/* Enemy profile */}
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ background: `radial-gradient(circle at 80% 50%, ${TYPE_COLORS[enemyTypes[0]]} 0%, transparent 70%)` }}
            />
            <div className="flex flex-col md:flex-row gap-8 items-center relative">
              {/* Sprite */}
              <div
                className="w-44 h-44 rounded-full flex items-center justify-center border border-black/10 flex-shrink-0"
                style={{ backgroundColor: TYPE_COLORS[enemyTypes[0]] + '15' }}
              >
                <img
                  src={enemy.sprites.other['official-artwork'].front_default || enemy.sprites.front_default}
                  alt={enemy.name}
                  className="w-36 h-36 drop-shadow-2xl brightness-75 grayscale sepia hue-rotate-180"
                  onError={e => { e.target.src = enemy.sprites.front_default; }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <label className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 block">Enemy Pokémon</label>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-3 capitalize">{enemy.name}</h3>

                <div className="flex gap-2 justify-center md:justify-start mb-5">
                  {enemy.types.map(t => (
                    <span
                      key={t.type.name}
                      style={getTypeStyle(t.type.name)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <img
                        src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${t.type.name}.svg`}
                        alt={t.type.name}
                        className="w-4 h-4 opacity-90"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {t.type.name}
                    </span>
                  ))}
                </div>

                {/* Quick stats row */}
                <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center md:justify-start">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-red-500 mb-1.5">
                      <TrendingUp size={9} className="inline mr-1" />Weaknesses
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                      {getWeaknesses(enemyTypes).map(type => (
                        <span key={type} style={getTypeStyle(type)} className="px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
                          <img src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`} alt="" className="w-2.5 h-2.5 opacity-90" onError={e => { e.target.style.display = 'none'; }} />
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500 mb-1.5">
                      <ShieldOff size={9} className="inline mr-1" />Resists
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                      {getResistances(enemyTypes).map(type => (
                        <span key={type} style={getTypeStyle(type)} className="px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
                          <img src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`} alt="" className="w-2.5 h-2.5 opacity-90" onError={e => { e.target.style.display = 'none'; }} />
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: activeTab === tab.id ? '#f43f5e' : 'rgba(0,0,0,0.05)',
                  color: activeTab === tab.id ? '#fff' : '#374151',
                  boxShadow: activeTab === tab.id ? '0 4px 14px rgba(244,63,94,0.3)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Counter Picks */}
          {activeTab === 'counters' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Swords className="text-neo-accent" size={22} />
                <h3 className="text-xl font-bold uppercase tracking-tight">Recommended Counters</h3>
                <span className="text-xs text-gray-500 font-medium">Strategy badges show attack & defense matchups</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-neo-accent" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map(p => (
                    <CounterCard
                      key={p.id}
                      pokemon={p}
                      enemyTypes={enemyTypes}
                      onClick={() => onPokemonClick(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Type Effectiveness */}
          {activeTab === 'effectiveness' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Zap className="text-neo-accent" size={22} />
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Full Type Effectiveness vs{' '}
                  <span className="capitalize">{enemy.name}</span>
                </h3>
              </div>
              <TypeEffectivenessBreakdown enemyTypes={enemyTypes} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
