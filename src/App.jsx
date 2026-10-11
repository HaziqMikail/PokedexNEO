import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, Search, Grid, Database, Sword, Zap, ShieldHalf, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PokemonGrid from './components/PokemonGrid';
import CounterPicker from './components/CounterPicker';
import PokemonModal from './components/PokemonModal';
import ItemsGrid from './components/ItemsGrid';
import MovesGrid from './components/MovesGrid';
import { fetchPokemonList, fetchPokemonByRegion, fetchTypeDetails } from './services/pokeApi';
import TypeChart from './components/TypeChart';
import { motion, AnimatePresence } from 'framer-motion';
import { TYPE_COLORS, getTypeStyle } from './utils/typeLogic';

function App() {
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeType, setActiveType] = useState(null);
  const [activeMoveType, setActiveMoveType] = useState('normal');
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);

  // Refs to hold latest values without causing callback re-creation
  const loadingRef = useRef(false);
  const offsetRef = useRef(0);
  const activeRegionRef = useRef(activeRegion);
  const activeTypeRef = useRef(activeType);

  // Keep refs in sync with state
  useEffect(() => { activeRegionRef.current = activeRegion; }, [activeRegion]);
  useEffect(() => { activeTypeRef.current = activeType; }, [activeType]);

  const loadPokemon = useCallback(async (isInitial = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const region = activeRegionRef.current;
    const type = activeTypeRef.current;

    try {
      let data = [];
      if (region === 'Items' || region === 'Moves') {
        return; // Handled internally by their respective grids
      }

      if (region === 'All' || region === 'CounterPicker') {
        if (type) {
          const typeData = await fetchTypeDetails(type);
          const detailedPokemon = await Promise.all(
            typeData.pokemon.map(async p => {
              const res = await fetch(p.pokemon.url);
              return res.json();
            })
          );
          setPokemonList(detailedPokemon);
          setHasMore(false);
        } else {
          const currentOffset = isInitial ? 0 : offsetRef.current;
          data = await fetchPokemonList(20, currentOffset);
          const nextOffset = isInitial ? 20 : currentOffset + 20;
          offsetRef.current = nextOffset;
          setPokemonList(prev => isInitial ? data : [...prev, ...data]);
          setHasMore(data.length === 20);
        }
      } else {
        // Fetch all in region for filtering
        data = await fetchPokemonByRegion(region);
        setPokemonList(data);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load pokemon:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []); // stable — reads from refs

  useEffect(() => {
    offsetRef.current = 0;
    setPokemonList([]);
    setHasMore(true);
    loadPokemon(true);
  }, [activeRegion, activeType]);

  const filteredPokemon = pokemonList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString() === searchTerm;
    const matchesType = !activeType || p.types.some(t => t.type.name === activeType);
    return matchesSearch && matchesType;
  });

  const currentBgColor = activeRegion === 'Moves' ? activeMoveType : activeType;
  const bgStyle = currentBgColor && activeRegion !== 'Items'
    ? { backgroundColor: TYPE_COLORS[currentBgColor] + '1a' }
    : {};

  const handleNavClick = (region) => {
    setActiveRegion(region);
    if (['Items', 'Moves', 'CounterPicker', 'TypeChart'].includes(region)) {
      setActiveType(null);
    }
  };

  return (
    <div
      style={bgStyle}
      className={`min-h-screen flex flex-col lg:flex-row text-gray-800 transition-colors duration-700 ${!currentBgColor || activeRegion === 'Items' ? 'bg-neo-bg' : ''}`}
    >
      <Sidebar
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        activeType={activeType}
        setActiveType={setActiveType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Top App Bar (visible on < lg screens) */}
      <div className="lg:hidden sticky top-0 z-30 glass border-b border-black/5 px-4 py-3 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-xl hover:bg-black/5 active:scale-95 transition-all text-gray-700"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2" onClick={() => handleNavClick('All')}>
              <div className="w-8 h-8 bg-neo-accent rounded-lg flex items-center justify-center neo-glow shadow-sm shadow-neo-accent/30">
                <img src="/pokeball.svg" alt="PokéBase" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900">PokéBase</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeType && (
              <span
                style={getTypeStyle(activeType)}
                onClick={() => setActiveType(null)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-1"
                title="Click to clear filter"
              >
                {activeType} <X size={11} />
              </span>
            )}
            <button
              onClick={() => setMobileSearchExpanded(!mobileSearchExpanded)}
              className={`p-2 rounded-xl transition-all ${
                mobileSearchExpanded || searchTerm
                  ? 'bg-neo-accent text-white shadow-md shadow-neo-accent/30'
                  : 'bg-black/5 text-gray-700 hover:bg-black/10'
              }`}
              aria-label="Toggle search"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Expandable Mobile Search Bar */}
        <AnimatePresence>
          {(mobileSearchExpanded || (searchTerm && !mobileSearchExpanded)) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-2.5"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search Pokémon or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus={mobileSearchExpanded}
                  className="w-full bg-black/5 border border-black/10 rounded-xl py-2 pl-9 pr-8 text-sm focus:outline-none focus:border-neo-accent text-gray-800"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 overflow-y-auto">
        <header className="mb-6 sm:mb-8 lg:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-gray-900">
              {activeRegion === 'CounterPicker' ? 'Counter' : activeRegion === 'TypeChart' ? 'Type Matrix' : `${activeRegion} Database`}
            </h2>
            <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm font-medium">
              {activeRegion === 'CounterPicker'
                ? 'Identifying counter for the enemy pokemon'
                : activeRegion === 'Items'
                  ? 'Displaying comprehensive registry of registered held items and tools.'
                  : activeRegion === 'Moves'
                    ? 'Displaying pokemon movesets'
                    : activeRegion === 'TypeChart'
                      ? 'Displays the strengths and weaknesses of each type'
                      : `Displaying pokemon in ${activeRegion} region.`}
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeRegion === 'CounterPicker' ? (
            <motion.div
              key="counter"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CounterPicker onPokemonClick={setSelectedPokemon} />
            </motion.div>
          ) : activeRegion === 'Items' ? (
            <motion.div
              key="items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ItemsGrid searchTerm={searchTerm} />
            </motion.div>
          ) : activeRegion === 'Moves' ? (
            <motion.div
              key="moves"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MovesGrid
                searchTerm={searchTerm}
                activeType={activeMoveType}
                setActiveType={setActiveMoveType}
              />
            </motion.div>
          ) : activeRegion === 'TypeChart' ? (
            <motion.div
              key="typechart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TypeChart />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PokemonGrid
                pokemonList={filteredPokemon}
                loading={loading}
                onLoadMore={loadPokemon}
                hasMore={hasMore}
                onPokemonClick={setSelectedPokemon}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedPokemon && (
            <PokemonModal
              pokemon={selectedPokemon}
              onClose={() => setSelectedPokemon(null)}
              onSelectPokemon={setSelectedPokemon}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar (fixed on mobile/tablet) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-black/5 bg-white/85 backdrop-blur-2xl px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: 'All', label: 'Pokédex', icon: <Grid size={18} /> },
            { id: 'Items', label: 'Items', icon: <Database size={18} /> },
            { id: 'Moves', label: 'Moves', icon: <Sword size={18} /> },
            { id: 'CounterPicker', label: 'Counter', icon: <Zap size={18} /> },
            { id: 'TypeChart', label: 'Matrix', icon: <ShieldHalf size={18} /> },
          ].map((tab) => {
            const isActive = tab.id === 'All'
              ? !['Items', 'Moves', 'CounterPicker', 'TypeChart'].includes(activeRegion)
              : activeRegion === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-neo-accent font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-900 font-medium'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-neo-accent/10' : ''}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute -top-1 w-1 h-1 rounded-full bg-neo-accent"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
