import { DurationPreferencesStorage, DEFAULT_DURATION_PREFERENCES } from '../durationPreferences';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn() as jest.MockedFunction<(key: string) => string | null>,
  setItem: jest.fn() as jest.MockedFunction<(key: string, value: string) => void>,
  removeItem: jest.fn() as jest.MockedFunction<(key: string) => void>,
  clear: jest.fn() as jest.MockedFunction<() => void>,
  key: jest.fn() as jest.MockedFunction<(index: number) => string | null>,
  length: 0
};

// Set up mock implementations
mockLocalStorage.getItem.mockImplementation((key: string) => mockLocalStorage.store[key] || null);
mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
  mockLocalStorage.store[key] = value;
});
mockLocalStorage.removeItem.mockImplementation((key: string) => {
  delete mockLocalStorage.store[key];
});
mockLocalStorage.clear.mockImplementation(() => {
  mockLocalStorage.store = {};
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('DurationPreferencesStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('getPreferences', () => {
    it('returns default preferences when localStorage is empty', () => {
      const preferences = DurationPreferencesStorage.getPreferences();

      expect(preferences).toEqual(expect.objectContaining({
        warmupDuration: 20,
        cooldownDuration: 20
      }));
      expect(preferences.lastUpdated).toBeDefined();
    });

    it('returns stored preferences when available', () => {
      const storedPrefs = {
        warmupDuration: 30,
        cooldownDuration: 45,
        lastUpdated: '2024-01-01T00:00:00Z'
      };

      mockLocalStorage.setItem('hiit_duration_preferences', JSON.stringify(storedPrefs));

      const preferences = DurationPreferencesStorage.getPreferences();

      expect(preferences).toEqual(storedPrefs);
    });

    it('returns defaults when localStorage contains invalid data', () => {
      mockLocalStorage.setItem('hiit_duration_preferences', 'invalid json');

      const preferences = DurationPreferencesStorage.getPreferences();

      expect(preferences).toEqual(DEFAULT_DURATION_PREFERENCES);
    });

    it('returns defaults when stored preferences have invalid structure', () => {
      const invalidPrefs = {
        warmupDuration: 'not a number',
        cooldownDuration: null
      };

      mockLocalStorage.setItem('hiit_duration_preferences', JSON.stringify(invalidPrefs));

      const preferences = DurationPreferencesStorage.getPreferences();

      expect(preferences).toEqual(DEFAULT_DURATION_PREFERENCES);
    });

    it('merges defaults with partial stored preferences', () => {
      const partialPrefs = {
        warmupDuration: 25
        // cooldownDuration missing
      };

      mockLocalStorage.setItem('hiit_duration_preferences', JSON.stringify(partialPrefs));

      const preferences = DurationPreferencesStorage.getPreferences();

      expect(preferences.warmupDuration).toBe(25);
      expect(preferences.cooldownDuration).toBe(20); // default
    });
  });

  describe('savePreferences', () => {
    it('saves valid preferences to localStorage', () => {
      const newPrefs = {
        warmupDuration: 35,
        cooldownDuration: 50
      };

      DurationPreferencesStorage.savePreferences(newPrefs);

      const storedValue = mockLocalStorage.store['hiit_duration_preferences'];
      const parsed = JSON.parse(storedValue);

      expect(parsed.warmupDuration).toBe(35);
      expect(parsed.cooldownDuration).toBe(50);
      expect(parsed.lastUpdated).toBeDefined();
    });

    it('validates duration bounds and throws error for invalid warmup duration', () => {
      expect(() => {
        DurationPreferencesStorage.savePreferences({ warmupDuration: 5 }); // Too low
      }).toThrow('Warmup duration must be between 10-300 seconds');

      expect(() => {
        DurationPreferencesStorage.savePreferences({ warmupDuration: 350 }); // Too high
      }).toThrow('Warmup duration must be between 10-300 seconds');
    });

    it('validates duration bounds and throws error for invalid cooldown duration', () => {
      expect(() => {
        DurationPreferencesStorage.savePreferences({ cooldownDuration: 8 }); // Too low
      }).toThrow('Cooldown duration must be between 10-300 seconds');

      expect(() => {
        DurationPreferencesStorage.savePreferences({ cooldownDuration: 400 }); // Too high
      }).toThrow('Cooldown duration must be between 10-300 seconds');
    });

    it('merges with existing preferences when saving partial updates', () => {
      // First, save initial preferences
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 30,
        cooldownDuration: 40
      });

      // Then update only warmup duration
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 25
      });

      const preferences = DurationPreferencesStorage.getPreferences();

      expect(preferences.warmupDuration).toBe(25);
      expect(preferences.cooldownDuration).toBe(40); // Should remain unchanged
    });

    it('updates lastUpdated timestamp when saving', () => {
      const beforeSave = new Date();

      DurationPreferencesStorage.savePreferences({
        warmupDuration: 20
      });

      const preferences = DurationPreferencesStorage.getPreferences();
      const afterSave = new Date(preferences.lastUpdated);

      expect(afterSave.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
    });
  });

  describe('resetToDefaults', () => {
    it('removes preferences from localStorage', () => {
      // First save some preferences
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 60,
        cooldownDuration: 90
      });

      // Then reset
      DurationPreferencesStorage.resetToDefaults();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hiit_duration_preferences');

      // Should return defaults after reset
      const preferences = DurationPreferencesStorage.getPreferences();
      expect(preferences).toEqual(DEFAULT_DURATION_PREFERENCES);
    });
  });

  describe('convenience methods', () => {
    it('setWarmupDuration saves only warmup duration', () => {
      // Set initial values
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 30,
        cooldownDuration: 45
      });

      // Update just warmup
      DurationPreferencesStorage.setWarmupDuration(40);

      const preferences = DurationPreferencesStorage.getPreferences();
      expect(preferences.warmupDuration).toBe(40);
      expect(preferences.cooldownDuration).toBe(45); // unchanged
    });

    it('setCooldownDuration saves only cooldown duration', () => {
      // Set initial values
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 30,
        cooldownDuration: 45
      });

      // Update just cooldown
      DurationPreferencesStorage.setCooldownDuration(60);

      const preferences = DurationPreferencesStorage.getPreferences();
      expect(preferences.warmupDuration).toBe(30); // unchanged
      expect(preferences.cooldownDuration).toBe(60);
    });
  });

  describe('getDurationOptions', () => {
    it('returns array of duration options from 10s to 120s in 5s increments', () => {
      const options = DurationPreferencesStorage.getDurationOptions();

      expect(options).toEqual([
        10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120
      ]);
      expect(options.length).toBe(23);
      expect(options[0]).toBe(10);
      expect(options[options.length - 1]).toBe(120);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds only for durations under 60s', () => {
      expect(DurationPreferencesStorage.formatDuration(10)).toBe('10s');
      expect(DurationPreferencesStorage.formatDuration(45)).toBe('45s');
      expect(DurationPreferencesStorage.formatDuration(59)).toBe('59s');
    });

    it('formats minutes only for exact minute durations', () => {
      expect(DurationPreferencesStorage.formatDuration(60)).toBe('1m');
      expect(DurationPreferencesStorage.formatDuration(120)).toBe('2m');
      expect(DurationPreferencesStorage.formatDuration(300)).toBe('5m');
    });

    it('formats minutes and seconds for mixed durations', () => {
      expect(DurationPreferencesStorage.formatDuration(65)).toBe('1m 5s');
      expect(DurationPreferencesStorage.formatDuration(90)).toBe('1m 30s');
      expect(DurationPreferencesStorage.formatDuration(135)).toBe('2m 15s');
    });
  });

  describe('error handling', () => {
    it('handles localStorage access errors gracefully', () => {
      // Mock localStorage to throw an error
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      // Should not throw and return defaults
      const preferences = DurationPreferencesStorage.getPreferences();
      expect(preferences).toEqual(DEFAULT_DURATION_PREFERENCES);
    });

    it('handles localStorage save errors by throwing', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      expect(() => {
        DurationPreferencesStorage.savePreferences({ warmupDuration: 30 });
      }).toThrow();
    });

    it('handles localStorage removal errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      // Should not throw
      expect(() => {
        DurationPreferencesStorage.resetToDefaults();
      }).not.toThrow();
    });
  });
});