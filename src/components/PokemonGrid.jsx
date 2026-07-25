import { useState, useEffect, useRef } from 'react';
import PokemonCard from './PokemonCard';
import { Loader2 } from 'lucide-react';

export default function PokemonGrid({ pokemonList, loading, onLoadMore, hasMore, onPokemonClick }) {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  if (pokemonList.length === 0 && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-neo-accent mb-4" size={48} />
        <p className="text-gray-500 animate-pulse uppercase tracking-widest text-xs">Scanning Database...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pokemonList.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} onClick={() => onPokemonClick(pokemon)} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-4 min-h-[40px]">
          {loading && <Loader2 className="animate-spin text-neo-accent" size={24} />}
        </div>
      )}

      {pokemonList.length === 0 && !loading && (
        <div className="text-center py-20 glass rounded-3xl">
          <p className="text-gray-600">No Pokémon found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
