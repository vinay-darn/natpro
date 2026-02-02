import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { store } from '../store/store';
import { updateLocation, setLocationError, setBackgroundServiceActive } from '../store/locationSlice';
import { LocationData } from '../store/locationSlice';

// TypeScript interfaces for geolocation
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp?: number;
}

interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

// Use React Native's built-in geolocation
const Geolocation = {
  watchPosition: (
    success: (position: GeolocationPosition) => void,
    error: (error: GeolocationError) => void,
    options?: any
  ): number => {
    // Use React Native's built-in geolocation
    return (require('react-native').Geolocation as any).watchPosition(
      success,
      error,
      options
    );
  },
  
  getCurrentPosition: (
    success: (position: GeolocationPosition) => void,
    error: (error: GeolocationError) => void,
    options?: any
  ): void => {
    // Use React Native's built-in geolocation
    (require('react-native').Geolocation as any).getCurrentPosition(
      success,
      error,
      options
    );
  },
  
  clearWatch: (watchId: number): void => {
    (require('react-native').Geolocation as any).clearWatch(watchId);
  },
};

class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private backgroundInterval: ReturnType<typeof setInterval> | null = null;
  private isTracking = false;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide tracking services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS - For now, return true (in production, you'd use iOS location permissions)
        return true;
      }
    } catch (err) {
      console.error('Location permission error:', err);
      return false;
    }
  }

  // Check if location permission is granted
  async checkLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return hasPermission;
      } else {
        // iOS - For now, return true
        return true;
      }
    } catch (err) {
      console.error('Check location permission error:', err);
      return false;
    }
  }

  // Start location tracking
  async startLocationTracking(): Promise<void> {
    try {
      if (this.isTracking) {
        console.log('Location tracking already started');
        return;
      }

      // Check and request permission
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          store.dispatch(setLocationError('Location permission denied'));
          return;
        }
      }

      this.isTracking = true;
      store.dispatch(setBackgroundServiceActive(true));

      // Configure geolocation options
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 5, // Update every 5 meters
      };

      // Start with getting current position immediately
      this.getCurrentLocation();

      // Start watching position
      this.watchId = Geolocation.watchPosition(
        (position) => {
          this.handleLocationUpdate(position);
        },
        (error) => {
          this.handleLocationError(error);
        },
        options
      );

      // Start background polling (every 30 seconds)
      this.startBackgroundPolling();

      console.log('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      store.dispatch(setLocationError('Failed to start location tracking'));
    }
  }

  // Stop location tracking
  stopLocationTracking(): void {
    try {
      if (this.watchId !== null) {
        Geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }

      if (this.backgroundInterval !== null) {
        clearInterval(this.backgroundInterval);
        this.backgroundInterval = null;
      }

      this.isTracking = false;
      store.dispatch(setBackgroundServiceActive(false));
      // Dispatch stop tracking action
      const { stopLocationTracking } = require('../store/locationSlice');
      store.dispatch(stopLocationTracking());

      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  // Start background polling
  private startBackgroundPolling(): void {
    this.backgroundInterval = setInterval(() => {
      this.getCurrentLocation();
    }, 30000); // Every 30 seconds
  }

  // Get current location
  private getCurrentLocation(): void {
    Geolocation.getCurrentPosition(
      (position) => {
        this.handleLocationUpdate(position);
      },
      (error) => {
        console.error('Location error:', error);
        // For Android emulator, provide a fallback location
        if (Platform.OS === 'android' && error.code === 2) {
          const fallbackLocation: GeolocationPosition = {
            coords: {
              latitude: 37.7749, // San Francisco
              longitude: -122.4194,
              accuracy: 100,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          };
          console.log('Using fallback location for Android emulator');
          this.handleLocationUpdate(fallbackLocation);
        } else {
          this.handleLocationError(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }

  // Handle location update
  private handleLocationUpdate(position: GeolocationPosition): void {
    try {
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp || Date.now(),
      };

      store.dispatch(updateLocation(locationData));
    } catch (error) {
      console.error('Error handling location update:', error);
      store.dispatch(setLocationError('Failed to process location update'));
    }
  }

  // Handle location error
  private handleLocationError(error: GeolocationError): void {
    let errorMessage = 'Unknown location error';
    
    switch (error.code) {
      case 1:
        errorMessage = 'Location permission denied. Please enable location in settings.';
        break;
      case 2:
        errorMessage = 'Location unavailable. Using fallback location.';
        // Provide fallback location for emulator
        const fallbackLocation: GeolocationPosition = {
          coords: {
            latitude: 37.7749, // San Francisco
            longitude: -122.4194,
            accuracy: 100,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        console.log('Using fallback location due to error:', error.message);
        this.handleLocationUpdate(fallbackLocation);
        return; // Don't dispatch error since we're using fallback
      case 3:
        errorMessage = 'Location request timeout. Please try again.';
        break;
      default:
        errorMessage = error.message || 'Unknown location error';
    }

    console.error('Location error:', errorMessage);
    store.dispatch(setLocationError(errorMessage));
  }

  // Get formatted address from coordinates (mock implementation)
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    // In a real implementation, you would use a geocoding service like Google Maps API
    // For now, return a mock address
    return `Address near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }

  // Check if tracking is active
  isLocationTrackingActive(): boolean {
    return this.isTracking;
  }

  // Get current location from store
  getCurrentLocationFromStore(): LocationData | null {
    const state = store.getState() as any;
    return state.location?.currentLocation || null;
  }

  // Simulate location updates for testing (useful for emulator)
  simulateLocationUpdate(): void {
    const simulatedLocation: GeolocationPosition = {
      coords: {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.01, // Small random variation
        longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
        accuracy: 10 + Math.random() * 20,
        altitude: null,
        altitudeAccuracy: null,
        heading: Math.random() * 360,
        speed: Math.random() * 5,
      },
      timestamp: Date.now(),
    };
    
    console.log('Simulating location update:', simulatedLocation.coords);
    this.handleLocationUpdate(simulatedLocation);
  }
}

export default LocationService;
