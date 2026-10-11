import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { fetchPokemonSpecies, fetchEvolutionChain, fetchPokemonDetails } from '../services/pokeApi';
import { getTypeStyle, TYPE_COLORS } from '../utils/typeLogic';

export default function PokemonModal({ pokemon: initialPokemon, onClose, onSelectPokemon }) {
  const [pokemon, setPokemon] = useState(initialPokemon);
  const [evoChain, setEvoChain] = useState([]);
  const [loadingEvoId, setLoadingEvoId] = useState(null);

  useEffect(() => {
    setPokemon(initialPokemon);
  }, [initialPokemon]);

  useEffect(() => {
    if (!pokemon) return;
    let mounted = true;
    (async () => {
      try {
        const species = await fetchPokemonSpecies(pokemon.id);
        const chainData = await fetchEvolutionChain(species.evolution_chain.url);

        const arr = [];
        function traverse(node) {
          if (!node) return;
          const idParts = node.species.url.split('/').filter(Boolean);
          const pId = idParts[idParts.length - 1];
          arr.push({ name: node.species.name, id: pId });
          if (node.evolves_to && node.evolves_to.length > 0) {
            node.evolves_to.forEach(child => traverse(child));
          }
        }
        traverse(chainData.chain);
        if (mounted) setEvoChain(arr);
      } catch (e) {
        console.error("Evolution fetch failed", e);
      }
    })();
    return () => { mounted = false; };
  }, [pokemon?.id]);

  const handleEvoClick = async (evoId) => {
    if (!evoId || evoId.toString() === pokemon.id.toString()) return;
    setLoadingEvoId(evoId);
    try {
      const data = await fetchPokemonDetails(evoId);
      setPokemon(data);
      if (onSelectPokemon) {
        onSelectPokemon(data);
      }
    } catch (err) {
      console.error("Failed to load evolution details", err);
    } finally {
      setLoadingEvoId(null);
    }
  };

  if (!pokemon) return null;
  const type = pokemon.types[0].type.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl glass rounded-2xl sm:rounded-3xl overflow-hidden relative border border-white/20 flex flex-col max-h-[92vh] sm:max-h-[90vh] shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors z-20 backdrop-blur-md"
          aria-label="Close modal"
        >
          <X size={20} className="text-gray-700 hover:text-gray-900" />
        </button>

        <div style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '33' : 'rgba(0,0,0,0.05)' }} className="p-4 sm:p-6 md:p-8 relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center">
            <div
              style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '4d' : 'rgba(0,0,0,0.08)' }}
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center shrink-0 shadow-lg"
            >
              <img
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 drop-shadow-2xl"
              />
            </div>
            <div className="flex-1 text-center md:text-left text-gray-900 min-w-0">
              <div className="text-sm sm:text-base font-black text-black/40 mb-0.5">#{pokemon.id.toString().padStart(3, '0')}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black capitalize tracking-tighter mb-2.5 sm:mb-3 truncate">{pokemon.name}</h2>
              <div className="flex gap-1.5 sm:gap-2 justify-center md:justify-start">
                {pokemon.types.map(t => (
                  <span
                    key={t.type.name}
                    style={getTypeStyle(t.type.name)}
                    className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest"
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>

            {evoChain.length > 1 && (
              <div className="w-full md:w-auto flex flex-col items-center min-w-0 max-w-full">
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 sm:mb-2 text-center">Evolution Line</h3>
                <div className="w-full overflow-x-auto custom-scrollbar pb-1">
                  <div className="flex items-center justify-start md:justify-center gap-1.5 sm:gap-2.5 flex-nowrap min-w-max mx-auto px-2">
                    {evoChain.map((evo, index) => {
                      const isCurrent = evo.id.toString() === pokemon.id.toString();
                      const isLoading = loadingEvoId === evo.id;

                      return (
                        <div key={evo.name} className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEvoClick(evo.id)}
                            disabled={isCurrent || isLoading}
                            className={`flex flex-col items-center group transition-all p-1.5 sm:p-2 rounded-xl sm:rounded-2xl ${
                              isCurrent
                                ? 'bg-black/10 ring-2 ring-neo-accent scale-105'
                                : 'hover:bg-black/10 hover:scale-105 active:scale-95 cursor-pointer'
                            }`}
                            title={isCurrent ? `${evo.name} (Current)` : `Click to view ${evo.name}`}
                          >
                            <div
                              style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '1a' : 'rgba(0,0,0,0.06)' }}
                              className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center mb-1 relative"
                            >
                              {isLoading ? (
                                <Loader2 className="animate-spin text-neo-accent" size={20} />
                              ) : (
                                <img
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                                  alt={evo.name}
                                  className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md group-hover:scale-110 transition-transform"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              )}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold capitalize text-center whitespace-nowrap ${isCurrent ? 'text-neo-accent font-black' : 'text-gray-900'}`}>
                              {evo.name}
                            </span>
                          </button>
                          {index < evoChain.length - 1 && <ArrowRight className="text-gray-700 shrink-0" size={14} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 relative bg-white/60">
          <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-gray-800">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-widest mb-3 sm:mb-4">Base Stats</h3>
              <div className="space-y-2.5 sm:space-y-3">
                {pokemon.stats.map(s => {
                  const statName = s.stat.name.replace('-', ' ');
                  const percentage = Math.min((s.base_stat / 255) * 100, 100);
                  return (
                    <div key={s.stat.name}>
                      <div className="flex justify-between text-xs mb-1 font-bold">
                        <span className="uppercase text-gray-500">{statName}</span>
                        <span className="text-gray-900">{s.base_stat}</span>
                      </div>
                      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          style={{ backgroundColor: TYPE_COLORS[type] }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total Stat Row */}
                <div className="pt-2 mt-2 border-t border-black/10 flex justify-between text-xs font-bold">
                  <span className="uppercase text-gray-800">Total</span>
                  <span className="text-gray-900 font-extrabold">
                    {pokemon.stats.reduce((acc, cur) => acc + cur.base_stat, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-widest mb-3 sm:mb-4">Data</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="glass p-3 rounded-xl border-black/5">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Height</span>
                    <span className="text-sm font-black text-gray-800">{(pokemon.height / 10).toFixed(1)}m</span>
                  </div>
                  <div className="glass p-3 rounded-xl border-black/5">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Weight</span>
                    <span className="text-sm font-black text-gray-800">{(pokemon.weight / 10).toFixed(1)}kg</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-widest mb-3 sm:mb-4">Abilities</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {pokemon.abilities.map(a => (
                    <span key={a.ability.name} className="px-3 py-1.5 glass bg-white/50 rounded-lg text-xs font-bold capitalize border-black/5 hover:border-neo-accent transition-colors text-gray-700">
                      {a.ability.name.replace('-', ' ')}
                      {a.is_hidden && <span className="text-neo-accent ml-1 text-[10px] uppercase">(Hidden)</span>}
                    </span>
                  ))}
                </div>
              </div>

              {pokemon.held_items.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-widest mb-3 sm:mb-4">Held Items</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {pokemon.held_items.map(h => (
                      <span key={h.item.name} className="px-3 py-1.5 glass bg-white/50 rounded-lg text-xs font-bold capitalize border-black/5 text-gray-700">
                        {h.item.name.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-widest mb-3 sm:mb-4">Moveset Data</h3>
                <div className="flex flex-wrap gap-1.5 max-h-48 sm:max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {pokemon.moves.map(m => (
                    <span key={m.move.name} className="px-2 py-1 glass bg-white/50 rounded text-[10px] font-bold capitalize border-black/5 text-gray-700 hover:text-neo-accent transition-colors cursor-default">
                      {m.move.name.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
