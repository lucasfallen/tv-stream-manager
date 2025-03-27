import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dashboard } from '../../types/Dashboard';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface DashboardState {
  items: Dashboard[];
  currentIndex: number;
  isPlaying: boolean;
}

const initialState: DashboardState = {
  items: [],
  currentIndex: 0,
  isPlaying: true,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addDashboard: (state, action: PayloadAction<Omit<Dashboard, 'id'>>) => {
      const newDashboard = {
        ...action.payload,
        id: generateId(),
      };
      state.items.push(newDashboard);
    },
  },
});

export const { addDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;