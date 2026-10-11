import { useState, useEffect } from 'react';
import { fetchTypeDetails } from '../services/pokeApi';
import { Loader2, Swords, Sparkles, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { getTypeStyle } from '../utils/typeLogic';

const TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground',
  'rock', 'bug', 'ghost', 'steel', 'fire', 'water',
  'grass', 'electric', 'psychic', 'ice', 'dragon',
  'dark', 'fairy'
];

function CategoryBadge({ category }) {
  const isPhysical = category === 'physical';
  const isSpecial = category === 'special';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${isPhysical
        ? 'bg-amber-500/15 text-amber-700 border border-amber-500/25'
        : isSpecial
          ? 'bg-blue-500/15 text-blue-700 border border-blue-500/25'
          : 'bg-slate-500/15 text-slate-700 border border-slate-500/25'
        }`}
    >
      {isPhysical ? <Swords size={11} /> : isSpecial ? <Sparkles size={11} /> : <Shield size={11} />}
      {category}
    </span>
  );
}

function MoveCard({ move }) {
  const [expanded, setExpanded] = useState(false);
  const effectText = move.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text ||
    move.effect_entries[0]?.short_effect ||
    'No detailed description available.';
  const cleanEffect = effectText.replace(/\n|\f/g, ' ');
  const isLong = cleanEffect.length > 90;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-black/5 flex flex-col gap-3 group hover:border-neo-accent/30 transition-all shadow-sm">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-extrabold text-base sm:text-lg text-gray-900 capitalize leading-tight group-hover:text-neo-accent transition-colors">
            {move.name.replace(/-/g, ' ')}
          </h4>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            ID #{move.id}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <CategoryBadge category={move.damage_class.name} />
        </div>
      </div>

      {/* Key Stats Chips */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-black/5 rounded-xl border border-black/5">
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Power</span>
          <span className={`text-sm font-black ${move.power ? 'text-gray-900' : 'text-gray-400'}`}>
            {move.power || '—'}
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-black/10">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Accuracy</span>
          <span className={`text-sm font-black ${move.accuracy ? 'text-gray-900' : 'text-gray-400'}`}>
            {move.accuracy ? `${move.accuracy}%` : '—'}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">PP</span>
          <span className="text-sm font-black text-gray-900">{move.pp}</span>
        </div>
      </div>

      {/* Effect Text */}
      <div className="mt-auto pt-1">
        <p className={`text-xs text-gray-700 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {cleanEffect}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-[11px] font-bold text-neo-accent hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            {expanded ? <>Show less <ChevronUp size={12} /></> : <>Read more <ChevronDown size={12} /></>}
          </button>
        )}
      </div>
    </div>
  );
}

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
      } catch {
        if (mounted) setLoading(false);
      }
    };
    fetchMoves();
    return () => { mounted = false };
  }, [activeType]);

  const filteredMoves = movesData.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-12 mt-1 sm:mt-2">
      {/* Move Type Selector */}
      <div className="glass p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-black/5 bg-white/40">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-widest mb-3 sm:mb-4">Select move type</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1.5 sm:gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              style={activeType === t ? getTypeStyle(t) : {}}
              className={`px-2 py-2 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all truncate text-center ${activeType === t
                ? 'shadow-md scale-105'
                : 'bg-white/50 text-gray-700 hover:bg-black/5 hover:text-gray-900 border border-black/5'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Header Info Bar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800">
            Registered Moves
          </span>
          <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md bg-black/5 text-gray-500 font-bold border border-black/5">
            {filteredMoves.length}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
          Showing all {activeType} category moves
        </span>
      </div>

      {/* Move Display Content - Card Grid for Both Mobile and Web */}
      {loading ? (
        <div className="flex justify-center items-center py-24 sm:py-32 flex-col gap-4">
          <Loader2 className="animate-spin text-neo-accent" size={36} />
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs sm:text-sm animate-pulse">Compiling moveset data</p>
        </div>
      ) : filteredMoves.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs sm:text-sm">
          No moves found matching your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredMoves.map(move => (
            <MoveCard key={move.name} move={move} />
          ))}
        </div>
      )}
    </div>
  );
}
