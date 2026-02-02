import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { loginSuccess, setLoading } from './src/store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import UploadPhotoScreen from './src/screens/UploadPhotoScreen';
import ViewAllPhotosScreen from './src/screens/ViewAllPhotosScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import PostsScreen from './src/screens/PostsScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isLoggedIn, isLoading } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkLogin = async () => {
      const session = await AsyncStorage.getItem('user_session');
      if (session) {
        dispatch(loginSuccess(session));
      } else {
        dispatch(setLoading(false));
      }
    };
    checkLogin();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="UploadPhoto" component={UploadPhotoScreen} />
            <Stack.Screen name="AllPhotos" component={ViewAllPhotosScreen} />
            <Stack.Screen name="Contacts" component={ContactsScreen} />
            <Stack.Screen name="Posts" component={PostsScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
