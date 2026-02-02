import LocationService from '../../src/services/LocationService';
import { store } from '../../src/store/store';

describe('LocationService', () => {
  it('getInstance returns a singleton', () => {
    const a = LocationService.getInstance();
    const b = LocationService.getInstance();
    expect(a).toBe(b);
  });

  it('simulateLocationUpdate dispatches location into store', () => {
    const inst = LocationService.getInstance();
    inst.simulateLocationUpdate();
    const current = store.getState().location.currentLocation;
    expect(current).not.toBeNull();
    if (current) {
      expect(typeof current.latitude).toBe('number');
      expect(typeof current.longitude).toBe('number');
    }
  });

  it('getAddressFromCoordinates returns formatted string', async () => {
    const inst = LocationService.getInstance();
    const addr = await inst.getAddressFromCoordinates(1.2345, 6.7890);
    expect(typeof addr).toBe('string');
    expect(addr).toContain('1.2345');
  });

  it('isLocationTrackingActive defaults to false', () => {
    const inst = LocationService.getInstance();
    expect(inst.isLocationTrackingActive()).toBe(false);
  });
});
