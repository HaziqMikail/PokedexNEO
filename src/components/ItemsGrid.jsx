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
            } catch(e) {}
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
      } catch (e) {
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
    <div className="flex flex-col gap-12 pb-12">
      {Object.entries(itemsByGroup).map(([groupName, items]) => {
        const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (filteredItems.length === 0) return null;

        return (
          <div key={groupName} className="glass p-8 rounded-[2.5rem] border border-black/5 bg-white/40">
            <h3 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3 border-b border-black/5 pb-4">
              <span className="text-neo-accent/50 mr-2 text-3xl leading-none">•</span>
              {groupName}
              <span className="text-xs px-2.5 py-1 bg-black/5 rounded-md text-gray-500 font-bold ml-2 border border-black/5">{filteredItems.length}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
