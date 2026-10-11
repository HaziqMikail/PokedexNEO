import { Search, Map, Zap, Grid, Database, Sword, X, ShieldHalf } from 'lucide-react';
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
  searchTerm, setSearchTerm,
  isOpen = false,
  onClose = () => {}
}) {
  const handleNavClick = (region) => {
    setActiveRegion(region);
    if (['Items', 'Moves', 'CounterPicker', 'TypeChart'].includes(region)) {
      setActiveType(null);
    }
    onClose();
  };

  const handleTypeClick = (type) => {
    const nextType = activeType === type ? null : type;
    setActiveType(nextType);
    if (['Items', 'Moves', 'CounterPicker', 'TypeChart'].includes(activeRegion)) {
      setActiveRegion('All');
    }
    onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full p-5 sm:p-6 overflow-y-auto">
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neo-accent rounded-xl flex items-center justify-center neo-glow shadow-md shadow-neo-accent/30">
            <img src="/pokeball.svg" alt="PokéBase Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none">PokéBase</h1>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dex NEO</span>
          </div>
        </div>
        {/* Close button for mobile drawer */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl bg-black/5 hover:bg-black/10 text-gray-600 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-6 sm:mb-8">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2.5 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/5 border border-black/10 rounded-xl py-2.5 pl-10 pr-8 text-sm focus:outline-none focus:border-neo-accent transition-colors text-gray-800 placeholder-gray-400"
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

      <nav className="space-y-6 flex-1 pb-6">
        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-3 block">Navigation</label>
          <div className="space-y-1">
            <NavItem icon={<Grid size={18} />} label="All Pokémon" active={activeRegion === 'All'} onClick={() => handleNavClick('All')} />
            <NavItem icon={<Database size={18} />} label="Items" active={activeRegion === 'Items'} onClick={() => handleNavClick('Items')} />
            <NavItem icon={<Sword size={18} />} label="Moves" active={activeRegion === 'Moves'} onClick={() => handleNavClick('Moves')} />
            <NavItem icon={<Zap size={18} />} label="Counter Pick" active={activeRegion === 'CounterPicker'} onClick={() => handleNavClick('CounterPicker')} />
            <NavItem icon={<ShieldHalf size={18} />} label="Type Chart" active={activeRegion === 'TypeChart'} onClick={() => handleNavClick('TypeChart')} />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2.5 block text-neo-accent flex items-center gap-1.5">
            <Map size={14} /> Regions
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
            {REGIONS.slice(1).map(region => (
              <button
                key={region}
                onClick={() => handleNavClick(activeRegion === region ? 'All' : region)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeRegion === region
                  ? 'bg-neo-accent text-white scale-105 shadow-md shadow-neo-accent/30 font-bold'
                  : 'bg-black/5 text-gray-800 hover:bg-black/10 hover:text-gray-900'
                  }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2.5 block">Types</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
            {TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                style={activeType === type ? getTypeStyle(type) : {}}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${activeType === type
                  ? 'border-transparent shadow-md scale-105'
                  : 'border-transparent bg-black/5 text-gray-800 hover:bg-black/10 hover:text-gray-900'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 lg:w-72 glass h-screen sticky top-0 flex-col z-20 text-gray-800 border-r border-black/5 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[85%] max-w-xs glass z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out border-r border-white/20 bg-white/90 backdrop-blur-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
        ? 'bg-neo-accent text-white shadow-md shadow-neo-accent/25'
        : 'text-gray-700 hover:bg-black/5 hover:text-gray-900'
        }`}
    >
      <span className={active ? 'text-white' : 'text-gray-500'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
