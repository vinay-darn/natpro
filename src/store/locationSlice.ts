import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  address?: string | null;
}

export interface LocationState {
  currentLocation: LocationData | null;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  trackingHistory: LocationData[];
  backgroundServiceActive: boolean;
}

const initialState: LocationState = {
  currentLocation: null,
  isTracking: false,
  isLoading: false,
  error: null,
  lastUpdated: null,
  trackingHistory: [],
  backgroundServiceActive: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // Start/stop tracking
    startLocationTracking: (state) => {
      state.isTracking = true;
      state.isLoading = true;
      state.error = null;
    },
    stopLocationTracking: (state) => {
      state.isTracking = false;
      state.backgroundServiceActive = false;
    },
    
    // Update location
    updateLocation: (state, action: PayloadAction<LocationData>) => {
      state.currentLocation = action.payload;
      state.lastUpdated = Date.now();
      state.isLoading = false;
      state.error = null;
      
      // Add to history (keep last 10 locations)
      state.trackingHistory.unshift(action.payload);
      if (state.trackingHistory.length > 10) {
        state.trackingHistory = state.trackingHistory.slice(0, 10);
      }
    },
    
    // Background service
    setBackgroundServiceActive: (state, action: PayloadAction<boolean>) => {
      state.backgroundServiceActive = action.payload;
    },
    
    // Error handling
    setLocationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Clear error
    clearLocationError: (state) => {
      state.error = null;
    },
    
    // Clear location data
    clearLocationData: (state) => {
      state.currentLocation = null;
      state.trackingHistory = [];
      state.lastUpdated = null;
    },
  },
});

export const {
  startLocationTracking,
  stopLocationTracking,
  updateLocation,
  setBackgroundServiceActive,
  setLocationError,
  clearLocationError,
  clearLocationData,
} = locationSlice.actions;

export default locationSlice.reducer;
