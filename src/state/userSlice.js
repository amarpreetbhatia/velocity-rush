import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: 'Player',
  progress: {
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    currency: 5000,
    unlockedTracks: ['circuit', 'desert'],
    unlockedVehicles: ['sports'],
    achievements: []
  },
  preferences: {
    theme: 'dark',
    controlLayout: 'default',
    showFps: false,
    showTutorials: true
  },
  stats: {
    racesCompleted: 0,
    racesWon: 0,
    totalPlayTime: 0,
    bestLapTimes: {},
    favoriteVehicle: 'sports',
    favoriteTrack: 'circuit'
  }
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    addCurrency: (state, action) => {
      state.progress.currency += action.payload;
    },
    spendCurrency: (state, action) => {
      if (state.progress.currency >= action.payload) {
        state.progress.currency -= action.payload;
        return true;
      }
      return false;
    },
    unlockVehicle: (state, action) => {
      if (!state.progress.unlockedVehicles.includes(action.payload)) {
        state.progress.unlockedVehicles.push(action.payload);
      }
    },
    unlockTrack: (state, action) => {
      if (!state.progress.unlockedTracks.includes(action.payload)) {
        state.progress.unlockedTracks.push(action.payload);
      }
    },
    addXp: (state, action) => {
      state.progress.xp += action.payload;
      
      // Level up if enough XP
      while (state.progress.xp >= state.progress.xpToNextLevel) {
        state.progress.xp -= state.progress.xpToNextLevel;
        state.progress.level += 1;
        state.progress.xpToNextLevel = Math.floor(state.progress.xpToNextLevel * 1.2);
      }
    },
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    },
    updateStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload
      };
    },
    recordRaceCompleted: (state, action) => {
      state.stats.racesCompleted += 1;
      if (action.payload.position === 1) {
        state.stats.racesWon += 1;
      }
      
      // Update best lap time if better than previous
      const { trackId, lapTime } = action.payload;
      if (!state.stats.bestLapTimes[trackId] || lapTime < state.stats.bestLapTimes[trackId]) {
        state.stats.bestLapTimes[trackId] = lapTime;
      }
      
      // Add play time
      state.stats.totalPlayTime += action.payload.raceTime || 0;
    },
    unlockAchievement: (state, action) => {
      if (!state.progress.achievements.includes(action.payload)) {
        state.progress.achievements.push(action.payload);
      }
    }
  }
});

export const {
  setUsername,
  addCurrency,
  spendCurrency,
  unlockVehicle,
  unlockTrack,
  addXp,
  updatePreferences,
  updateStats,
  recordRaceCompleted,
  unlockAchievement
} = userSlice.actions;

export default userSlice.reducer;
