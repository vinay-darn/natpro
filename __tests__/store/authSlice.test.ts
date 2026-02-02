import reducer, { loginSuccess, logout, setLoading, AuthState } from '../../src/store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn(),
}));

describe('authSlice', () => {
  const initialState: AuthState = {
    isLoggedIn: false,
    isLoading: true,
    user: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' } as any)).toEqual(initialState);
  });

  it('should handle loginSuccess', () => {
    const next = reducer(initialState, loginSuccess('user123'));
    expect(next.isLoggedIn).toBe(true);
    expect(next.user).toBe('user123');
    expect(next.isLoading).toBe(false);
  });

  it('should handle logout and call AsyncStorage.removeItem', () => {
    const loggedInState: AuthState = { isLoggedIn: true, isLoading: false, user: 'u' };
    const next = reducer(loggedInState, logout());
    expect(next.isLoggedIn).toBe(false);
    expect(next.user).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_session');
  });

  it('should handle setLoading', () => {
    const next = reducer(initialState, setLoading(false));
    expect(next.isLoading).toBe(false);
  });
});
