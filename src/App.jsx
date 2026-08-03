import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import PokemonGrid from './components/PokemonGrid';
import CounterPicker from './components/CounterPicker';
import PokemonModal from './components/PokemonModal';
import ItemsGrid from './components/ItemsGrid';
import MovesGrid from './components/MovesGrid';
import { fetchPokemonList, fetchPokemonByRegion, fetchTypeDetails } from './services/pokeApi';
import TypeChart from './components/TypeChart';
import { motion, AnimatePresence } from 'framer-motion';
import { TYPE_COLORS } from './utils/typeLogic';

function App() {
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeType, setActiveType] = useState(null);
  const [activeMoveType, setActiveMoveType] = useState('normal');
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

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

  return (
    <div
      style={bgStyle}
      className={`flex text-gray-800 min-h-screen transition-colors duration-700 ${!currentBgColor || activeRegion === 'Items' ? 'bg-neo-bg' : ''}`}
    >
      <Sidebar
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        activeType={activeType}
        setActiveType={setActiveType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-900">
              {activeRegion === 'CounterPicker' ? 'Counter' : activeRegion === 'TypeChart' ? 'Type Matrix' : `${activeRegion} Database`}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              {activeRegion === 'CounterPicker'
                ? 'Identifying counter for the enemy pokemon'
                : activeRegion === 'Items'
                  ? 'Displaying comprehensive registry of registered held items and tools.'
                  : activeRegion === 'Moves'
                    ? 'Displaying pokemon movesets'
                    : activeRegion === 'TypeChart'
                      ? 'Displays the strengths and weaknesses of each type '
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
    </div>
  );
}

export default App;
