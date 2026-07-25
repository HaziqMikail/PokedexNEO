# Pokémon Web App - Implementation Plan

## Role
Senior React Developer & Pokémon Expert

## Task
Build a stateless Pokémon Web App using Vite, React, and Tailwind CSS.

## 1. Data Integration
- **API**: [PokeAPI](https://pokeapi.co/api/v2/)
- **Search**: Interactive search bar.
- **Filter by Type**: (Fire, Water, Grass, etc.)
- **Filter by Region**:
  - Kanto (1-151)
  - Johto (152-251)
  - Hoenn (252-386)
  - Sinnoh (387-493)
  - Unova (494-649)
  - Kalos (650-721)
  - Alola (722-809)
  - Galar (810-898)
- **Performance**: Paginated list or "Load More" functionality.

## 2. Team Suggestion Engine (Counter-Picker)
- **Enemy Selection**: Search to pick an "Enemy Pokémon".
- **Logic**:
  1. Fetch enemy types.
  2. Calculate weaknesses based on type effectiveness.
  3. Recommend 3-6 Pokémon with type advantages (STAB moves).
- **Output**: Visual list of recommended counters.

## 3. UI/Design (Stitch Context)
- **Style**: Match the "Pokémon Project" from Stitch exactly.
- **CSS**: Tailwind CSS for component styling.
- **Icons**: `lucide-react`.
- **Theme**: Dark Mode / Neo-Futuristic aesthetic from design.

## 4. Technical Requirements
- Stateless architecture.
- Modular component structure.
- Responsive layout.
