import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  email: string | null;
  preferences: {
    workingHours: { start: string; end: string };
    notificationSettings: { enabled: boolean; frequency: string };
    aiCreativityLevel: number;
  };
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: null,
  email: null,
  preferences: {
    workingHours: { start: '09:00', end: '17:00' },
    notificationSettings: { enabled: true, frequency: 'daily' },
    aiCreativityLevel: 7,
  },
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; email: string }>) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.id = null;
      state.email = null;
      state.isAuthenticated = false;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const { setUser, clearUser, updatePreferences } = userSlice.actions;
export default userSlice.reducer;
