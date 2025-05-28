# Velocity Rush

A high-octane 3D racing game built with React, Three.js, and DaisyUI. Experience the thrill of speed in your browser!

## Features

- Immersive 3D racing experience powered by Three.js
- Responsive and intuitive controls
- Beautiful UI with DaisyUI components
- Multiple racing tracks and vehicles
- Performance optimization for smooth gameplay
- Cross-platform compatibility

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/velocity-rush.git
   cd velocity-rush
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
velocity-rush/
├── public/                  # Static assets and favicon
├── src/
│   ├── engine/              # Game engine core functionality
│   │   ├── physics/         # Physics simulation and collision detection
│   │   ├── renderer/        # Three.js rendering setup and optimization
│   │   ├── controls/        # Vehicle and camera controls
│   │   └── loop.js          # Game loop and timing management
│   │
│   ├── components/          # React components
│   │   ├── ui/              # User interface components
│   │   │   ├── HUD/         # Heads-up display elements
│   │   │   ├── Menu/        # Game menus and navigation
│   │   │   └── Overlays/    # Notifications and modal overlays
│   │   │
│   │   └── game/            # Game-specific components
│   │       ├── vehicles/    # Vehicle models and behaviors
│   │       ├── tracks/      # Race track components
│   │       ├── environment/ # Skybox, terrain, and environment effects
│   │       └── effects/     # Visual effects like particles and post-processing
│   │
│   ├── assets/              # Game assets
│   │   ├── models/          # 3D models for vehicles and objects
│   │   ├── textures/        # Texture maps for 3D models
│   │   ├── audio/           # Sound effects and music
│   │   └── fonts/           # Custom fonts for UI
│   │
│   ├── utils/               # Utility functions and helpers
│   │   ├── math.js          # Math utilities for 3D operations
│   │   ├── loaders.js       # Asset loading utilities
│   │   └── helpers.js       # General helper functions
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useGameLoop.js   # Hook for managing the game loop
│   │   ├── useControls.js   # Hook for handling user input
│   │   └── useAudio.js      # Hook for audio management
│   │
│   ├── config/              # Game configuration
│   │   ├── vehicles.js      # Vehicle specifications
│   │   ├── tracks.js        # Track definitions
│   │   └── settings.js      # Game settings and defaults
│   │
│   ├── scenes/              # Game scenes
│   │   ├── MainMenu.jsx     # Main menu scene
│   │   ├── RaceScene.jsx    # Racing gameplay scene
│   │   └── GarageScene.jsx  # Vehicle customization scene
│   │
│   ├── state/               # Game state management
│   │   ├── store.js         # Central state store
│   │   ├── gameSlice.js     # Game state reducers
│   │   └── userSlice.js     # User preferences and progress
│   │
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles with Tailwind
│
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Project dependencies and scripts
```

## Folder Structure Explanation

### Engine
The `engine` directory contains the core game functionality that powers the racing experience:
- **physics/**: Handles collision detection, vehicle physics, and realistic movement
- **renderer/**: Manages Three.js rendering setup, optimization, and camera systems
- **controls/**: Implements vehicle control systems and input handling
- **loop.js**: Manages the game loop, timing, and frame rate

### Components
The `components` directory is split into UI and game-specific components:
- **ui/**: Contains all user interface elements
  - **HUD/**: In-game heads-up display showing speed, lap times, position
  - **Menu/**: Game menus for navigation, settings, and player options
  - **Overlays/**: Notification systems, modal dialogs, and overlays
- **game/**: Contains 3D game elements
  - **vehicles/**: Vehicle models, behaviors, and customization
  - **tracks/**: Race track components and track generation
  - **environment/**: Environmental elements like skyboxes and terrain
  - **effects/**: Visual effects including particles and post-processing

### Assets
The `assets` directory stores all game resources:
- **models/**: 3D models in formats compatible with Three.js
- **textures/**: Image files for texturing 3D models
- **audio/**: Sound effects and music tracks
- **fonts/**: Custom font files for UI elements

### Utils
The `utils` directory contains helper functions:
- **math.js**: Mathematical utilities for 3D operations and physics
- **loaders.js**: Asset loading and management utilities
- **helpers.js**: General helper functions used throughout the application

### Hooks
The `hooks` directory contains custom React hooks:
- **useGameLoop.js**: Hook for managing the game loop and timing
- **useControls.js**: Hook for handling user input from keyboard, mouse, or gamepad
- **useAudio.js**: Hook for managing audio playback and effects

### Config
The `config` directory contains game configuration files:
- **vehicles.js**: Specifications for different vehicles
- **tracks.js**: Definitions for race tracks and environments
- **settings.js**: Game settings and default configurations

### Scenes
The `scenes` directory contains different game scenes:
- **MainMenu.jsx**: The main menu interface
- **RaceScene.jsx**: The actual racing gameplay scene
- **GarageScene.jsx**: Vehicle selection and customization scene

### State
The `state` directory manages game state:
- **store.js**: Central state management store
- **gameSlice.js**: Game state reducers and actions
- **userSlice.js**: User preferences, progress, and settings

## Deployment to GitHub Pages

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

3. Configure GitHub Pages in your repository settings to use the `gh-pages` branch.

4. Your game will be available at `https://yourusername.github.io/velocity-rush/`

## Additional Resources

- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/)
- [DaisyUI Documentation](https://daisyui.com/)

## License

MIT
