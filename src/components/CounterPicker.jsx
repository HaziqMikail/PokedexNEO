import { useState, useEffect } from 'react';
import { Search, ShieldAlert, Swords, Zap, Loader2 } from 'lucide-react';
import { fetchPokemonDetails, fetchPokemonList, fetchPokemonByRegion, REGIONS } from '../services/pokeApi';
import { getBestCounterTypes, getWeaknesses, getResistances, getTypeStyle } from '../utils/typeLogic';
import PokemonCard from './PokemonCard';

export default function CounterPicker({ onPokemonClick }) {
  const [enemySearch, setEnemySearch] = useState('');
  const [enemy, setEnemy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!enemySearch) return;

    setSearching(true);
    setError(null);
    try {
      const data = await fetchPokemonDetails(enemySearch);
      setEnemy(data);
      findCounters(data);
    } catch (err) {
      setError('Target identification failed. Check identifier.');
      setEnemy(null);
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const findCounters = async (target) => {
    setLoading(true);
    try {
      const targetTypes = target.types.map(t => t.type.name);
      const counterTypes = getBestCounterTypes(targetTypes);
      
      // Determine the target's generation 
      let targetRegion = 'Kanto'; // Default fallback
      for (const [region, bounds] of Object.entries(REGIONS)) {
        if (target.id >= bounds.start && target.id <= bounds.end) {
          targetRegion = region;
          break;
        }
      }

      // Fetch the pool for that generation
      const genPool = await fetchPokemonByRegion(targetRegion);
      
      // Find counters in generation
      const genCounters = genPool.filter(p => 
        p.id !== target.id && p.types.some(t => counterTypes.includes(t.type.name))
      );
      
      const selectedGenCounters = genCounters.slice(0, 2);

      // If we don't have 6 counters total yet, get more from a generic pool (e.g. first 151)
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

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="glass rounded-3xl p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="text-red-500" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Counter-PICKER Engine</h2>
            <p className="text-gray-600 text-sm">Analyze enemy weaknesses and generate tactical recommendations</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Enter Enemy Pokemon..."
              value={enemySearch}
              onChange={(e) => setEnemySearch(e.target.value)}
              className="w-full bg-black/5 border border-black/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 transition-colors text-gray-800 placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
          >
            {searching ? <Loader2 className="animate-spin" size={20} /> : 'SCAN'}
          </button>
        </form>

        {error && <p className="text-red-500 text-xs mt-3 font-medium uppercase tracking-wider">{error}</p>}
      </div>

      {enemy && (
        <div className="space-y-12">
          {/* Enemy Analysis */}
          <div className="flex flex-col md:flex-row gap-8 items-center glass rounded-3xl p-8 border-red-500/20">
            <div className="w-48 h-48 bg-black/5 rounded-full flex items-center justify-center border border-black/10">
              <img
                src={enemy.sprites.other['official-artwork'].front_default}
                alt={enemy.name}
                className="w-40 h-40 drop-shadow-2xl brightness-75 grayscale sepia hue-rotate-180"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <label className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 block">Threat Detected</label>
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">{enemy.name}</h3>
              <div className="flex gap-2 justify-center md:justify-start mb-6">
                {enemy.types.map(t => (
                  <span
                    key={t.type.name}
                    style={getTypeStyle(t.type.name)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <img src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${t.type.name}.svg`} alt={t.type.name} className="w-4 h-4 opacity-80" />
                    {t.type.name}
                  </span>
                ))}
              </div>

              {/* Weaknesses and Resistances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Weak To {`{>1x DMG}`}</label>
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {getWeaknesses(enemy.types.map(t => t.type.name)).map(type => (
                      <span
                        key={type}
                        style={getTypeStyle(type)}
                        className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
                      >
                        <img src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`} alt={type} className="w-3 h-3 opacity-80" />
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Resists {`{<1x DMG}`}</label>
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {getResistances(enemy.types.map(t => t.type.name)).map(type => (
                      <span
                        key={type}
                        style={getTypeStyle(type)}
                        className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
                      >
                        <img src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`} alt={type} className="w-3 h-3 opacity-80" />
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Recommendations */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Swords className="text-neo-accent" size={24} />
              <h3 className="text-xl font-bold uppercase tracking-tight">Tactical Recommendations</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-neo-accent" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map(p => (
                  <PokemonCard key={p.id} pokemon={p} onClick={() => onPokemonClick(p)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
