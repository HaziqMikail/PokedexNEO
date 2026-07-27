import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { fetchPokemonSpecies, fetchEvolutionChain } from '../services/pokeApi';
import { getTypeStyle, TYPE_COLORS } from '../utils/typeLogic';

export default function PokemonModal({ pokemon, onClose }) {
  const [evoChain, setEvoChain] = useState([]);

  useEffect(() => {
    if (!pokemon) return;
    let mounted = true;
    (async () => {
      try {
        const species = await fetchPokemonSpecies(pokemon.id);
        const chainData = await fetchEvolutionChain(species.evolution_chain.url);

        let current = chainData.chain;
        const arr = [];
        while (current) {
          const idParts = current.species.url.split('/').filter(Boolean);
          const pId = idParts[idParts.length - 1];
          arr.push({ name: current.species.name, id: pId });
          current = current.evolves_to[0];
        }
        if (mounted) setEvoChain(arr);
      } catch (e) {
        console.error("Evolution fetch failed", e);
      }
    })();
    return () => { mounted = false; };
  }, [pokemon]);

  if (!pokemon) return null;
  const type = pokemon.types[0].type.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl glass rounded-3xl overflow-hidden relative border border-white/10 flex flex-col max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors z-10"
        >
          <X size={20} className="text-gray-600 hover:text-gray-900" />
        </button>

        <div style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '33' : 'rgba(0,0,0,0.05)' }} className="p-8 relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div
              style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '4d' : 'rgba(0,0,0,0.08)' }}
              className="w-48 h-48 rounded-full flex items-center justify-center"
            >
              <img
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-40 h-40 drop-shadow-2xl"
              />
            </div>
            <div className="flex-1 text-center md:text-left text-gray-900">
              <div className="text-xl font-black text-black/40 mb-1">#{pokemon.id.toString().padStart(3, '0')}</div>
              <h2 className="text-4xl font-black capitalize tracking-tighter mb-4">{pokemon.name}</h2>
              <div className="flex gap-2 justify-center md:justify-start">
                {pokemon.types.map(t => (
                  <span
                    key={t.type.name}
                    style={getTypeStyle(t.type.name)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>

            {evoChain.length > 1 && (
              <div className="flex flex-col items-center min-w-0">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-3 text-center">Evolution Line</h3>
                <div className="flex items-center justify-center gap-3 flex-nowrap">
                  {evoChain.map((evo, index) => (
                    <div key={evo.name} className="flex items-center gap-2">
                      <div className="flex flex-col items-center group">
                        <div
                          style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '1a' : 'rgba(0,0,0,0.06)' }}
                          className="w-28 h-28 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                        >
                          <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`} alt={evo.name} className="w-14 h-14 drop-shadow-md" />
                        </div>
                        <span className="text-sm font-bold capitalize text-gray-900 text-center whitespace-nowrap">{evo.name}</span>
                      </div>
                      {index < evoChain.length - 1 && <ArrowRight className="text-gray-800 shrink-0" size={16} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 relative bg-white/50">
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Base Stats</h3>
              <div className="space-y-3">
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

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Data</h3>
                <div className="grid grid-cols-2 gap-4">
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
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Abilities</h3>
                <div className="flex flex-wrap gap-2">
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
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Held Items</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.held_items.map(h => (
                      <span key={h.item.name} className="px-3 py-1.5 glass bg-white/50 rounded-lg text-xs font-bold capitalize border-black/5 text-gray-700">
                        {h.item.name.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Moveset Data</h3>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
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
