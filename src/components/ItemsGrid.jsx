import { useState, useEffect } from 'react';
import { fetchItemCategory } from '../services/pokeApi';
import ItemCard from './ItemCard';
import { Loader2 } from 'lucide-react';

const CATEGORIES = {
  'Pokéballs': ['standard-balls', 'special-balls', 'apricorn-balls'],
  'Evolution Items': ['evolution'],
  'Medicine': ['healing', 'revival', 'status-cures'],
  'Battle & Held Items': ['stat-boosts', 'held-items', 'choice', 'effort-training', 'bad-held-items', 'training', 'plates', 'species-specific', 'type-enhancement']
};

export default function ItemsGrid({ searchTerm }) {
  const [itemsByGroup, setItemsByGroup] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = {};
        for (const [groupName, catNames] of Object.entries(CATEGORIES)) {
          let groupItems = [];
          for (const catName of catNames) {
            try {
              const data = await fetchItemCategory(catName);
              groupItems = [...groupItems, ...data.items];
            } catch {
              // Ignore single category fetch failure
            }
          }
          // Only add groups that have items
          if (groupItems.length > 0) {
            results[groupName] = groupItems;
          }
        }
        if (mounted) {
          setItemsByGroup(results);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] justify-center items-center py-20 flex-col gap-4">
        <Loader2 className="animate-spin text-neo-accent" size={40} />
        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm animate-pulse">Scanning Tool Registries...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-10 pb-12">
      {Object.entries(itemsByGroup).map(([groupName, items]) => {
        const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (filteredItems.length === 0) return null;

        return (
          <div key={groupName} className="glass p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] border border-black/5 bg-white/40">
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 border-b border-black/5 pb-3 sm:pb-4">
              <span className="text-neo-accent/50 mr-1 sm:mr-2 text-2xl sm:text-3xl leading-none">•</span>
              <span>{groupName}</span>
              <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black/5 rounded-md text-gray-500 font-bold ml-auto sm:ml-2 border border-black/5">{filteredItems.length}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.name} url={item.url} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
