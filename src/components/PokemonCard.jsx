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
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="glass rounded-3xl p-5 group flex flex-col relative overflow-hidden cursor-pointer"
    >
      {/* Background ID */}
      <div className="absolute top-2 right-4 text-4xl font-black text-black/20 pointer-events-none">
        #{id}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div
          style={{ backgroundColor: TYPE_COLORS[type] ? TYPE_COLORS[type] + '1a' : 'rgba(0,0,0,0.06)' }}
          className="w-32 h-32 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
        >
          <img
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-28 h-28 drop-shadow-2xl"
            onError={(e) => {
              if (e.target.src !== pokemon.sprites.front_default) {
                e.target.src = pokemon.sprites.front_default;
              } else {
                e.target.style.display = 'none';
              }
            }}
          />
        </div>

        <h3 className="text-xl font-bold capitalize mb-3 group-hover:text-neo-accent transition-colors">{pokemon.name}</h3>

        <div className="flex gap-2">
          {pokemon.types.map(t => (
            <span
              key={t.type.name}
              style={getTypeStyle(t.type.name)}
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center w-full">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Base Exp</span>
          <span className="text-xs font-bold text-gray-700">{pokemon.base_experience || '---'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Height</span>
          <span className="text-xs font-bold text-gray-700">{(pokemon.height / 10).toFixed(1)}m</span>
        </div>
      </div>

      {/* Neo Accent Bottom bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-neo-accent w-0 group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
}
