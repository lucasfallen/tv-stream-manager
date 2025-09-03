import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import tvReducer from './slices/tvSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    tv: tvReducer,
    ui: uiReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;