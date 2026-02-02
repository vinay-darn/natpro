describe('LocationService permission flows', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('sets error when permission denied on Android', async () => {
    const rn = require('react-native');
    rn.Platform.OS = 'android';
    rn.PermissionsAndroid = {
      PERMISSIONS: { ACCESS_FINE_LOCATION: 'ACCESS_FINE_LOCATION' },
      RESULTS: { GRANTED: 'granted' },
      check: jest.fn().mockResolvedValue(false),
      request: jest.fn().mockResolvedValue('denied'),
    };

    rn.Geolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    };

    const { store } = require('../../src/store/store');
    const { default: LocationService } = require('../../src/services/LocationService');

    const svc = LocationService.getInstance();
    await svc.startLocationTracking();

    const state = store.getState();
    expect(state.location.error).toBe('Location permission denied');
  });
});
