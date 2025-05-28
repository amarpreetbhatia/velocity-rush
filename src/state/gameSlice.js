import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isRunning: false,
  isPaused: false,
  currentScene: 'menu', // 'menu', 'play', 'garage'
  selectedTrack: 'circuit',
  selectedVehicle: 'sports',
  raceStats: {
    lap: 1,
    totalLaps: 3,
    position: 1,
    totalRacers: 8,
    raceTime: 0,
    bestLapTime: null,
    currentLapTime: 0,
    checkpoints: []
  },
  settings: {
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    aiCount: 7,
    graphics: 'high', // 'low', 'medium', 'high', 'ultra'
    soundVolume: 0.8,
    musicVolume: 0.5,
    controlType: 'keyboard' // 'keyboard', 'gamepad'
  }
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startRace: (state) => {
      state.isRunning = true;
      state.isPaused = false;
      state.currentScene = 'play';
      state.raceStats.lap = 1;
      state.raceStats.raceTime = 0;
      state.raceStats.currentLapTime = 0;
      state.raceStats.checkpoints = [];
    },
    pauseGame: (state) => {
      state.isPaused = true;
    },
    resumeGame: (state) => {
      state.isPaused = false;
    },
    endRace: (state) => {
      state.isRunning = false;
      state.currentScene = 'menu';
    },
    updateRaceStats: (state, action) => {
      state.raceStats = {
        ...state.raceStats,
        ...action.payload
      };
    },
    selectTrack: (state, action) => {
      state.selectedTrack = action.payload;
    },
    selectVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    updateSettings: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload
      };
    },
    changeScene: (state, action) => {
      state.currentScene = action.payload;
    }
  }
});

export const {
  startRace,
  pauseGame,
  resumeGame,
  endRace,
  updateRaceStats,
  selectTrack,
  selectVehicle,
  updateSettings,
  changeScene
} = gameSlice.actions;

export default gameSlice.reducer;
