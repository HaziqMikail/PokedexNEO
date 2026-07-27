# PokéBase: Web Application

A modern, responsive, and beautiful Pokémon Web Application built with React, Vite, and Tailwind CSS. The app features a stunning light pastel aesthetic with frosted glass elements (glassmorphism) and smooth animations powered by Framer Motion. 

## Features

### 1. Comprehensive Database
Browse through Pokémon from every region up to **Paldea** (Generations 1 through 9, IDs 1 - 1025). The app supports real-time filtering, active search bars, and pagination to handle hundreds of entries efficiently.

### 2. Detailed Pokémon Stats Modal
Clicking on any Pokémon card brings up an immersive, color-matched frosted glass modal containing:
* Official artwork
* Dynamically colored Type badges
* Accurate Base Stats (with interactive animated progress bars)
* Height and Weight metrics
* Abilities (including clearly marked Hidden Abilities)

### 3. "CounterPicker" Engine
The app includes a dedicated "Tactical Ops" CounterPicker module, designed to calculate the best counter-picks against a specific Pokémon.
* **Smart Typing Engine**: Determines the target's weaknesses and resistances based on Pokémon type mechanics.
* **Visual Type Analysis**: Displays type icons for instant readability of what the enemy is "Weak To" (>1x DMG) and "Resists" (<1x DMG).
* **Generation-Aware Recommendations**: Suggests counters that primarily belong to the exact same Region/Generation as the target enemy before falling back to classic Kanto Pokémon.

### 4. Premium Aesthetic
* Light pastel "Slate/Rose" overarching theme.
* Playful UI utilizing `lucide-react` icons and a custom Pokéball SVG branding.
* Animated components and satisfying hover interactions.

## Technical Stack

- **Framework**: React 18+ (Vite tooling)
- **Styling**: Tailwind CSS V4 + Vanilla CSS Variables
- **Animations**: Framer Motion
- **Icons**: Lucide React & `pokemon-type-svg-icons`
- **Data Source**: [PokeAPI](https://pokeapi.co/)

## Roadmap
- [x] Integrate PokeAPI
- [x] Complete Kanto-Paldea Regions
- [x] CounterPicker implementation
- [x] Light Pastel UI Update
