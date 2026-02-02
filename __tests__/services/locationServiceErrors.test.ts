describe('LocationService error handling', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('handles permission denied error (code 1) and sets store error via getCurrentLocation', async () => {
    const rn = require('react-native');
    rn.Platform.OS = 'android';

    const errorObj = { code: 1, message: 'Permission denied' };

    rn.Geolocation = {
      getCurrentPosition: jest.fn().mockImplementation((_s, err) => err(errorObj)),
      watchPosition: jest.fn().mockImplementation((_s, _e) => 1),
      clearWatch: jest.fn(),
    };

    const { store } = require('../../src/store/store');
    const { default: LocationService } = require('../../src/services/LocationService');

    const svc = LocationService.getInstance();
    await (svc as any).getCurrentLocation();

    const state = store.getState();
    expect(state.location.error).toContain('permission denied'.toLowerCase().replace(/permission denied/,'permission denied'));
  });

  it('handles timeout error (code 3) and sets appropriate message via getCurrentLocation', async () => {
    const rn = require('react-native');
    rn.Platform.OS = 'android';

    const errorObj = { code: 3, message: 'Timeout' };

    rn.Geolocation = {
      getCurrentPosition: jest.fn().mockImplementation((_s, err) => err(errorObj)),
      watchPosition: jest.fn().mockImplementation((_s, _e) => 1),
      clearWatch: jest.fn(),
    };

    const { store } = require('../../src/store/store');
    const { default: LocationService } = require('../../src/services/LocationService');

    const svc = LocationService.getInstance();
    await (svc as any).getCurrentLocation();

    const state = store.getState();
    expect(state.location.error).toContain('timeout');
  });
});
