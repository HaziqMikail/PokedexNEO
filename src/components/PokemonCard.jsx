import { motion } from 'framer-motion';
import { getTypeStyle, TYPE_COLORS } from '../utils/typeLogic';

export default function PokemonCard({ pokemon, onClick }) {
  const type = pokemon.types[0].type.name;
  const id = pokemon.id.toString().padStart(3, '0');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 group flex flex-col relative overflow-hidden cursor-pointer"
    >
      {/* Background ID */}
      <div className="absolute top-2 right-3 text-2xl sm:text-4xl font-black text-black/15 pointer-events-none select-none">
        #{id}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div
          style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '1a' : 'rgba(0,0,0,0.06)' }}
          className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center mb-2.5 sm:mb-4 group-hover:scale-105 transition-transform duration-300"
        >
          <img
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 drop-shadow-xl"
            onError={(e) => {
              if (e.target.src !== pokemon.sprites.front_default) {
                e.target.src = pokemon.sprites.front_default;
              } else {
                e.target.style.display = 'none';
              }
            }}
          />
        </div>

        <h3 className="text-sm sm:text-lg lg:text-xl font-bold capitalize mb-1.5 sm:mb-3 group-hover:text-neo-accent transition-colors text-center truncate max-w-full">
          {pokemon.name}
        </h3>

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
          {pokemon.types.map(t => (
            <span
              key={t.type.name}
              style={getTypeStyle(t.type.name)}
              className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider"
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 sm:mt-6 pt-2 border-t border-black/5 flex justify-between items-center w-full">
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Base Exp</span>
          <span className="text-[10px] sm:text-xs font-bold text-gray-700">{pokemon.base_experience || '---'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Height</span>
          <span className="text-[10px] sm:text-xs font-bold text-gray-700">{(pokemon.height / 10).toFixed(1)}m</span>
        </div>
      </div>

      {/* Neo Accent Bottom bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-neo-accent w-0 group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
}
