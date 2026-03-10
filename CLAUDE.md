# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

智能钓鱼调漂模拟器 (Intelligent Fishing Float Adjustment Simulator) - A physics-based fishing float simulator that dynamically visualizes how fishing line setups behave underwater as parameters change. Built with React, TypeScript, and Vite.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000, accessible on network)
npm run dev

# Type checking (lint)
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview

# Clean build artifacts
npm run clean
```

## Environment Setup

Create a `.env.local` file with:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Architecture

### Core Physics Engine
- **`src/utils/physics.ts`**: Contains `calculateFishingState()` - the physics simulation engine
  - Calculates float position, lead position, hook position based on weights and buoyancy
  - Determines fishing state: `floating`, `suspended`, `bottom_touch`, `bottom_rest`, `sunk`
  - Computes tension on main line and sub-line
  - Handles complex scenarios like bottom contact and submersion

### State Management
- Uses React hooks (`useState`, `useEffect`) for state management
- Main state objects defined in `src/types.ts`:
  - `FishingParams`: Input parameters (weights, buoyancy, line lengths, water properties)
  - `FishingState`: Calculated output (positions, status, tensions, visible meshes)
  - `Achievement`: Achievement system data structure

### Component Structure
- **`src/App.tsx`**: Main application component
  - Manages global state (params, state, biteEvent)
  - Orchestrates all child components
  - Implements bite simulation triggers

- **`src/components/WaterTank.tsx`**: Visual representation of the water tank and fishing setup
  - Renders float, line, lead, hooks
  - Animates bite events

- **`src/components/ControlPanel.tsx`**: User interface for adjusting fishing parameters
  - Controls for lead weight, float buoyancy, hook weight, bait weight
  - Water properties (density, depth, flow)
  - Line configuration (main line length, sub-line length, hook spacing, thickness)

- **`src/components/DetectionSystem.tsx`**: Displays current fishing state and diagnostics

- **`src/components/AchievementSystem.tsx`**: Tracks and displays achievements

### Key Concepts

**Float Mechanics:**
- Float has 10 meshes, each providing 0.1g buoyancy per mesh
- Visible meshes indicate how much of the float is above water
- Float body provides additional buoyancy beyond meshes

**Physics Calculations:**
- Total downward force = leadWeight + hookWeight + baitWeight
- Total upward force = floatBuoyancy × waterDensity
- Balance determines float position and fishing state

**Bite Simulation:**
- Two hooks: upper (short sub-line) and lower (long sub-line)
- Two bite types: pull (顿口 - downward) and lift (顶漂 - upward)
- Bite sensitivity varies by fishing state (most sensitive when suspended, least when bottom_rest)

## Tech Stack

- **React 19**: UI framework
- **TypeScript 5.8**: Type safety
- **Vite 6.2**: Build tool and dev server
- **Tailwind CSS 4.1**: Styling (using @tailwindcss/vite plugin)
- **Motion 12**: Animation library
- **lucide-react**: Icon library
- **@google/genai**: Gemini AI API integration (currently in dependencies but usage not visible in main code)

## Code Conventions

- Use TypeScript strict mode
- React components use function syntax with hooks
- CSS classes use Tailwind utility classes
- File naming: PascalCase for components, camelCase for utilities
- Path alias `@/` maps to project root (configured in vite.config.ts and tsconfig.json)

## Important Notes

- HMR (Hot Module Replacement) can be disabled via `DISABLE_HMR=true` environment variable
- The app is designed to run in AI Studio with automatic environment variable injection
- Physics calculations happen synchronously on every parameter change via `useEffect`
- All measurements use metric units: grams (g) for weight, centimeters (cm) for distance
