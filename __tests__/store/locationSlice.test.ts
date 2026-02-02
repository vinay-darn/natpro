import reducer, {
  startLocationTracking,
  updateLocation,
  setBackgroundServiceActive,
  setLocationError,
  clearLocationError,
  clearLocationData,
  LocationState,
  LocationData,
} from '../../src/store/locationSlice';

describe('locationSlice', () => {
  const initialState: LocationState = {
    currentLocation: null,
    isTracking: false,
    isLoading: false,
    error: null,
    lastUpdated: null,
    trackingHistory: [],
    backgroundServiceActive: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' } as any)).toEqual(initialState);
  });

  it('should handle startLocationTracking', () => {
    const next = reducer(initialState, startLocationTracking());
    expect(next.isTracking).toBe(true);
    expect(next.isLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('should handle updateLocation and keep history capped at 10', () => {
    let state = initialState;
    for (let i = 0; i < 12; i++) {
      const loc: LocationData = {
        latitude: 10 + i,
        longitude: 20 + i,
        timestamp: 1000 + i,
      } as LocationData;
      state = reducer(state, updateLocation(loc));
    }

    expect(state.currentLocation).not.toBeNull();
    expect(state.trackingHistory.length).toBeLessThanOrEqual(10);
    expect(state.lastUpdated).not.toBeNull();
  });

  it('should handle setBackgroundServiceActive and errors', () => {
    const a = reducer(initialState, setBackgroundServiceActive(true));
    expect(a.backgroundServiceActive).toBe(true);

    const b = reducer(a, setLocationError('err'));
    expect(b.error).toBe('err');
    expect(b.isLoading).toBe(false);

    const c = reducer(b, clearLocationError());
    expect(c.error).toBeNull();
  });

  it('should clear location data', () => {
    const withData = {
      ...initialState,
      currentLocation: { latitude: 1, longitude: 2, timestamp: 1 } as LocationData,
      trackingHistory: [{ latitude: 1, longitude: 2, timestamp: 1 } as LocationData],
      lastUpdated: Date.now(),
    };

    const cleared = reducer(withData, clearLocationData());
    expect(cleared.currentLocation).toBeNull();
    expect(cleared.trackingHistory).toHaveLength(0);
    expect(cleared.lastUpdated).toBeNull();
  });
});
