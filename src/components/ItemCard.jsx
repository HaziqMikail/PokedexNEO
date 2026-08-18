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
      className="glass rounded-3xl p-5 border border-black/5 flex flex-col gap-3 group relative overflow-hidden"
    >
      {/* image bigger */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
          {item.sprites?.default ? (
            <img src={item.sprites.default} alt={item.name} className="w-10 h-10 object-contain drop-shadow-md" />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 capitalize text-lg leading-tight">
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
            <span className="text-[10px] uppercase font-bold tracking-widest text-neo-accent">
              {item.category.name.replace(/-/g, ' ')}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-3 mt-1 leading-relaxed">
        {effectText.replace(/\n/g, ' ')}
      </p>

      <div className="mt-auto pt-3 flex justify-between items-center border-t border-black/5">
        <span className="text-xs font-bold text-gray-500">Cost: {item.cost > 0 ? `₽${item.cost}` : 'Not for sale'}</span>
      </div>

      {/* border animationhow */}
      {/* <div className="absolute left-0 bottom-0 h-1 w-0 bg-neo-accent group-hover:w-full transition-all duration-300" /> */}

      <div className="absolute inset-0 rounded-3xl border-2 border-neo-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}
