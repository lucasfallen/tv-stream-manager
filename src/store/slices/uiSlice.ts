import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isEditMode: boolean;
  isAdmin: boolean;
  feedback: {
    show: boolean;
    message: string;
    type: 'success' | 'warning' | 'error' | '';
  };
}

const initialState: UiState = {
  isEditMode: false,
  isAdmin: window.location.pathname.includes('/admin'),
  feedback: {
    show: false,
    message: '',
    type: '',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleEditMode: (state) => {
      state.isEditMode = !state.isEditMode;
    },
  },
});

export const { toggleEditMode } = uiSlice.actions;

export default uiSlice.reducer;