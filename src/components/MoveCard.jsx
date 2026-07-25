import { useState, useEffect } from 'react';
import { fetchMoveDetails } from '../services/pokeApi';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getTypeStyle, TYPE_COLORS } from '../utils/typeLogic';

export default function MoveCard({ url }) {
  const [move, setMove] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMoveDetails(url).then(data => {
      if (mounted) {
        setMove(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [url]);

  if (loading) return (
    <div className="glass rounded-3xl p-5 h-40 flex items-center justify-center border border-black/5">
      <Loader2 className="animate-spin text-neo-accent" size={24} />
    </div>
  );

  if (!move) return null;

  const effectText = move.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || 
                     move.effect_entries[0]?.short_effect || 
                     'No description available.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-3xl p-5 border border-black/5 flex flex-col gap-3 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-gray-900 capitalize text-lg leading-tight mb-1">{move.name.replace(/-/g, ' ')}</h3>
          <span
            style={getTypeStyle(move.type.name)}
            className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest"
          >
            {move.type.name}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Class</span>
          <span className="text-xs font-bold capitalize text-gray-700">{move.damage_class.name}</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-3 mt-1 leading-relaxed flex-1">
        {effectText.replace(/\n|\f/g, ' ')}
      </p>
      
      <div className="mt-4 pt-3 flex justify-between items-center border-t border-black/5">
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Power</span>
          <span className="text-sm font-black text-gray-800">{move.power || '---'}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Accuracy</span>
          <span className="text-sm font-black text-gray-800">{move.accuracy ? `${move.accuracy}%` : '---'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">PP</span>
          <span className="text-sm font-black text-gray-800">{move.pp}</span>
        </div>
      </div>
      
      <div
        style={{ backgroundColor: TYPE_COLORS[move.type.name] }}
        className="absolute left-0 bottom-0 h-1 w-0 group-hover:w-full transition-all duration-300"
      />
    </motion.div>
  );
}
