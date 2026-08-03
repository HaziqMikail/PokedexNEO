import { Search, Map, Zap, Grid, Star, Heart, Database, Sword, X, ShieldHalf } from 'lucide-react';
import { getTypeStyle, TYPE_COLORS } from '../utils/typeLogic';

const REGIONS = ['All', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'];
const TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting',
  'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost',
  'dragon', 'dark', 'steel', 'fairy'
];

export default function Sidebar({
  activeRegion, setActiveRegion,
  activeType, setActiveType,
  searchTerm, setSearchTerm
}) {
  const handleNavClick = (region) => {
    setActiveRegion(region);
    if (['Items', 'Moves', 'CounterPicker', 'TypeChart'].includes(region)) {
      setActiveType(null);
    }
  };

  const handleTypeClick = (type) => {
    const nextType = activeType === type ? null : type;
    setActiveType(nextType);
    if (['Items', 'Moves', 'CounterPicker', 'TypeChart'].includes(activeRegion)) {
      setActiveRegion('All');
    }
  };

  return (
    <aside className="w-64 glass h-screen sticky top-0 flex flex-col p-6 overflow-y-auto z-10 text-gray-800 border-r border-black/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-neo-accent rounded-xl flex items-center justify-center neo-glow">
          <img src="/pokeball.svg" alt="PokéBase Logo" className="w-6 h-6 object-contain" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">PokéBase</h1>
      </div>

      <div className="mb-8">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-3 block">Search </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/5 border border-black/10 rounded-xl py-2 pl-10 pr-8 text-sm focus:outline-none focus:border-neo-accent transition-colors text-gray-800 placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <nav className="space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-3 block">Navigation</label>
          <div className="space-y-1">
            <NavItem icon={<Grid size={18} />} label="All Pokémon" active={activeRegion === 'All'} onClick={() => handleNavClick('All')} />
            <NavItem icon={<Database size={18} />} label="Items " active={activeRegion === 'Items'} onClick={() => handleNavClick('Items')} />
            <NavItem icon={<Sword size={18} />} label="Moves" active={activeRegion === 'Moves'} onClick={() => handleNavClick('Moves')} />
            <NavItem icon={<Zap size={18} />} label="Counter Pick" onClick={() => handleNavClick('CounterPicker')} active={activeRegion === 'CounterPicker'} />
            <NavItem icon={<ShieldHalf size={18} />} label="Type Chart" onClick={() => handleNavClick('TypeChart')} active={activeRegion === 'TypeChart'} />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-3 block text-neo-accent flex items-center gap-2">
            <Map size={14} /> Regions
          </label>
          <div className="flex flex-wrap gap-2 mt-3">
            {REGIONS.slice(1).map(region => (
              <button
                key={region}
                onClick={() => handleNavClick(activeRegion === region ? 'All' : region)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeRegion === region
                  ? 'bg-neo-accent text-white scale-105 shadow-md shadow-neo-accent/30'
                  : 'bg-black/5 text-gray-800 hover:bg-black/10 hover:text-gray-800'
                  }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-3 block">Types</label>
          <div className="flex flex-wrap gap-2 mt-3">
            {TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                style={activeType === type ? getTypeStyle(type) : {}}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${activeType === type
                  ? 'border-transparent shadow-md scale-105'
                  : 'border-transparent bg-black/5 text-gray-800 hover:bg-black/10 hover:text-gray-800'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
        ? 'bg-neo-accent/10 text-neo-accent border-l-4 border-neo-accent'
        : 'text-gray-800 hover:bg-black/5 hover:text-gray-900'
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
