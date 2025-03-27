import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TvClient } from '../../services/SocketService';

interface TvState {
  list: TvClient[];
  selectedId: string | null;
  clientName: string;
  socketConnected: boolean;
}

const initialState: TvState = {
  list: [],
  selectedId: null,
  clientName: localStorage.getItem('adminName') || localStorage.getItem('tvName') || '',
  socketConnected: false,
};

export const tvSlice = createSlice({
  name: 'tv',
  initialState,
  reducers: {
    setTvsList: (state, action: PayloadAction<TvClient[]>) => {
      state.list = action.payload;
    },
  },
});

export const { setTvsList } = tvSlice.actions;

export default tvSlice.reducer;