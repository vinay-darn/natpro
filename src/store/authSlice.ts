import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  isLoading: true,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = true;
      state.user = action.payload;
      state.isLoading = false;
    },
    logout: state => {
      state.isLoggedIn = false;
      state.user = null;
      AsyncStorage.removeItem('user_session');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { loginSuccess, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
