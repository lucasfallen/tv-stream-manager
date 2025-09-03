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
        // Garantir que campos opcionais tenham valores padrão
        contentType: action.payload.contentType || 'dashboard',
        youtubeVideoId: action.payload.youtubeVideoId || '',
        youtubeStartTime: action.payload.youtubeStartTime,
        youtubeEndTime: action.payload.youtubeEndTime,
        youtubeAutoplay: action.payload.youtubeAutoplay ?? true,
        youtubeMute: action.payload.youtubeMute ?? true
      };
      state.items.push(newDashboard);
    },
    updateDashboard: (state, action: PayloadAction<{ id: string; updates: Partial<Dashboard> }>) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    removeDashboard: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items.splice(index, 1);
        // Ajustar currentIndex se necessário
        if (state.items.length === 0) {
          state.currentIndex = 0;
        } else if (state.currentIndex >= state.items.length) {
          state.currentIndex = state.items.length - 1;
        }
      }
    },
    reorderDashboards: (state, action: PayloadAction<Dashboard[]>) => {
      state.items = action.payload;
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.items.length) {
        state.currentIndex = action.payload;
      }
    },
    nextDashboard: (state) => {
      if (state.items.length > 0) {
        state.currentIndex = (state.currentIndex + 1) % state.items.length;
      }
    },
    previousDashboard: (state) => {
      if (state.items.length > 0) {
        state.currentIndex = state.currentIndex === 0 ? state.items.length - 1 : state.currentIndex - 1;
      }
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    }
  },
});

export const { 
  addDashboard, 
  updateDashboard, 
  removeDashboard, 
  reorderDashboards,
  setCurrentIndex,
  nextDashboard,
  previousDashboard,
  setIsPlaying
} = dashboardSlice.actions;

export default dashboardSlice.reducer;