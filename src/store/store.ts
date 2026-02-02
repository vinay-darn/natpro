import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './authSlice';
import postsReducer from './postsSlice';
import locationReducer from './locationSlice';
import { postsSaga } from './postsSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    location: locationReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
});

// Run the posts saga
sagaMiddleware.run(postsSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
