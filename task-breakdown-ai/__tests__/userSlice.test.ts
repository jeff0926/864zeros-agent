import userReducer, {
  setUser,
  clearUser,
  updatePreferences,
} from '../src/store/slices/userSlice';

describe('userSlice', () => {
  const initialState = {
    id: null,
    email: null,
    preferences: {
      workingHours: { start: '09:00', end: '17:00' },
      notificationSettings: { enabled: true, frequency: 'daily' },
      aiCreativityLevel: 7,
    },
    isAuthenticated: false,
  };

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should set user and mark as authenticated', () => {
      const result = userReducer(
        initialState,
        setUser({ id: 'user-123', email: 'test@example.com' })
      );

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(result.isAuthenticated).toBe(true);
    });

    it('should clear user and mark as unauthenticated', () => {
      const authenticatedState = {
        ...initialState,
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true,
      };

      const result = userReducer(authenticatedState, clearUser());

      expect(result.id).toBeNull();
      expect(result.email).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });

    it('should update preferences partially', () => {
      const result = userReducer(
        initialState,
        updatePreferences({ aiCreativityLevel: 9 })
      );

      expect(result.preferences.aiCreativityLevel).toBe(9);
      expect(result.preferences.workingHours).toEqual({ start: '09:00', end: '17:00' });
      expect(result.preferences.notificationSettings).toEqual({ enabled: true, frequency: 'daily' });
    });

    it('should update multiple preferences at once', () => {
      const result = userReducer(
        initialState,
        updatePreferences({
          aiCreativityLevel: 5,
          notificationSettings: { enabled: false, frequency: 'weekly' },
        })
      );

      expect(result.preferences.aiCreativityLevel).toBe(5);
      expect(result.preferences.notificationSettings).toEqual({ enabled: false, frequency: 'weekly' });
    });
  });
});
