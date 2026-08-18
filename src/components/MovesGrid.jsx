import { useState, useEffect } from 'react';
import { fetchTypeDetails } from '../services/pokeApi';
import { Loader2 } from 'lucide-react';
import { getTypeStyle } from '../utils/typeLogic';

const TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground',
  'rock', 'bug', 'ghost', 'steel', 'fire', 'water',
  'grass', 'electric', 'psychic', 'ice', 'dragon',
  'dark', 'fairy'
];

export default function MovesGrid({ searchTerm, activeType, setActiveType }) {
  const [movesData, setMovesData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchMoves = async () => {
      setLoading(true);
      try {
        const typeData = await fetchTypeDetails(activeType);
        const detailedMoves = await Promise.all(
          typeData.moves.map(async m => {
            const res = await fetch(m.url);
            return res.json();
          })
        );
        detailedMoves.sort((a, b) => a.name.localeCompare(b.name));

        if (mounted) {
          setMovesData(detailedMoves);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };
    fetchMoves();
    return () => { mounted = false };
  }, [activeType]);

  const filteredMoves = movesData.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  /*MOVE TYPE */
  return (
    <div className="flex flex-col gap-6 pb-12 mt-2">
      <div className="glass p-6 rounded-[2rem] border border-black/5 bg-white/40">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Select move type</h3>
        <div className="grid grid-cols-9 gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              style={activeType === t ? getTypeStyle(t) : {}}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeType === t
                ? 'shadow-md scale-105'
                : 'bg-white/50 text-gray-700 hover:bg-black/5 hover:text-gray-900 border border-black/5'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* MOVE DISPLAY */}
      {loading ? (
        <div className="flex justify-center items-center py-32 flex-col gap-4">
          <Loader2 className="animate-spin text-neo-accent" size={40} />
          <p className="text-gray-500 font-bold tracking-widest uppercase text-sm animate-pulse">Compiling moveset data</p>
        </div>
      ) : (
        <div className="glass rounded-[2rem] overflow-hidden border border-black/5 bg-white/60 shadow-sm mt-4">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-black/5 bg-black/5/50">
                  <th className="p-5 text-xs font-bold text-gray-800 uppercase tracking-widest pl-8 w-48">Name</th>
                  <th className="p-5 text-xs font-bold text-gray-800 uppercase tracking-widest w-24">Type</th>
                  <th className="p-5 text-xs font-bold text-gray-800 uppercase tracking-widest w-32">Category</th>
                  <th className="p-5 text-xs font-bold text-gray-800 uppercase tracking-widest w-20">Power</th>
                  <th className="p-5 text-xs font-bold text-gray-800 uppercase tracking-widest w-20">Acc.</th>
                  <th className="p-5 text-xs font-bold text-gray-800 uppercase tracking-widest w-16">PP</th>
                  <th className="p-5 text-xs rem font-bold text-gray-800 uppercase tracking-widest max-w-sm">Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredMoves.map(move => {
                  const effectText = move.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text ||
                    move.effect_entries[0]?.short_effect ||
                    '---';
                  return (
                    <tr key={move.name} className="hover:bg-white/50 transition-colors group">
                      <td className="p-5 pl-8 font-bold text-gray-900 capitalize whitespace-nowrap">
                        {move.name.replace(/-/g, ' ')}
                      </td>
                      <td className="p-5">
                        <span
                          style={getTypeStyle(move.type.name)}
                          className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border border-black/10"
                        >
                          {move.type.name}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-bold capitalize text-gray-600 bg-black/5 px-3 py-1.5 rounded-lg border border-black/5">
                          {move.damage_class.name}
                        </span>
                      </td>
                      <td className="p-5 font-black text-gray-700">{move.power || '—'}</td>
                      <td className="p-5 font-black text-gray-700">{move.accuracy || '—'}</td>
                      <td className="p-5 font-black text-gray-700">{move.pp}</td>
                      <td className="p-5 text-xs text-gray-800 max-w-sm leading-relaxed pr-8">
                        {effectText.replace(/\n|\f/g, ' ')}
                      </td>
                    </tr>
                  )
                })}
                {filteredMoves.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
                      No moves found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
