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

// Generate a stable local user ID (stored in memory for this session)
const LOCAL_USER_ID = 'local-user-' + Math.random().toString(36).substring(2, 11);

const initialState: UserState = {
  id: LOCAL_USER_ID,
  email: 'local@taskbreakdown.app',
  preferences: {
    workingHours: { start: '09:00', end: '17:00' },
    notificationSettings: { enabled: true, frequency: 'daily' },
    aiCreativityLevel: 7,
  },
  isAuthenticated: true, // Auto-authenticate for local-only version
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
