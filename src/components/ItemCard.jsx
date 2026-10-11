import { useState, useEffect } from 'react';
import { fetchItemDetails } from '../services/pokeApi';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function ItemCard({ url }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchItemDetails(url).then(data => {
      if (mounted) {
        setItem(data);
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

  if (!item) return null;

  const effectText = item.effect_entries.find(e => e.language.name === 'en')?.short_effect ||
    item.flavor_text_entries.find(e => e.language.name === 'en')?.text ||
    'No description available.';

  return (

    /*move up animation*/
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-black/5 flex flex-col gap-2.5 sm:gap-3 group relative overflow-hidden"
    >
      {/* image bigger */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black/5 rounded-xl sm:rounded-2xl flex items-center justify-center p-1.5 sm:p-2 group-hover:scale-110 transition-transform shrink-0">
          {item.sprites?.default ? (
            <img src={item.sprites.default} alt={item.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md" />
          ) : (
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 capitalize text-sm sm:text-base lg:text-lg leading-tight truncate">
            {(() => {
              if (item.name.includes('laorigin') || item.name === 'legends-arceus-origin-ball' || item.name === 'origin-ball') {
                return 'Origin Ball (Legends Arceus)';
              }
              if (item.name.match(/^la[a-z]+-ball$/)) {
                return `${item.name.replace(/^la/, '').replace(/-/g, ' ')} (Legends Arceus)`;
              }
              return item.name.replace(/-/g, ' ');
            })()}
          </h3>
          {item.category && (
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-neo-accent block truncate">
              {item.category.name.replace(/-/g, ' ')}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mt-0.5 sm:mt-1 leading-relaxed">
        {effectText.replace(/\n/g, ' ')}
      </p>

      <div className="mt-auto pt-2.5 sm:pt-3 flex justify-between items-center border-t border-black/5">
        <span className="text-[11px] sm:text-xs font-bold text-gray-500">Cost: {item.cost > 0 ? `₽${item.cost}` : 'Not for sale'}</span>
      </div>

      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-neo-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}
