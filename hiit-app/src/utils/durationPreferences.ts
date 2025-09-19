/**
 * Duration preferences storage and management
 * Handles user preferences for warmup and cooldown exercise durations
 */

export interface DurationPreferences {
  warmupDuration: number; // seconds
  cooldownDuration: number; // seconds
  lastUpdated: string;
}

export const DEFAULT_DURATION_PREFERENCES: DurationPreferences = {
  warmupDuration: 20,
  cooldownDuration: 20,
  lastUpdated: new Date().toISOString()
};

const STORAGE_KEY = 'hiit_duration_preferences';

export class DurationPreferencesStorage {
  /**
   * Get current duration preferences from localStorage
   */
  static getPreferences(): DurationPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate structure - accept partial preferences
        const isValid = parsed && typeof parsed === 'object' && (
          typeof parsed.warmupDuration === 'number' ||
          typeof parsed.cooldownDuration === 'number'
        );

        if (isValid) {
          return {
            ...DEFAULT_DURATION_PREFERENCES,
            ...parsed
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load duration preferences:', error);
    }

    return DEFAULT_DURATION_PREFERENCES;
  }

  /**
   * Save duration preferences to localStorage
   */
  static savePreferences(preferences: Partial<DurationPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated: DurationPreferences = {
        ...current,
        ...preferences,
        lastUpdated: new Date().toISOString()
      };

      // Validate durations are within reasonable bounds (10-300 seconds)
      if (updated.warmupDuration < 10 || updated.warmupDuration > 300) {
        throw new Error('Warmup duration must be between 10-300 seconds');
      }
      if (updated.cooldownDuration < 10 || updated.cooldownDuration > 300) {
        throw new Error('Cooldown duration must be between 10-300 seconds');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save duration preferences:', error);
      throw error;
    }
  }

  /**
   * Reset preferences to defaults
   */
  static resetToDefaults(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to reset duration preferences:', error);
    }
  }

  /**
   * Update warmup duration only
   */
  static setWarmupDuration(duration: number): void {
    this.savePreferences({ warmupDuration: duration });
  }

  /**
   * Update cooldown duration only
   */
  static setCooldownDuration(duration: number): void {
    this.savePreferences({ cooldownDuration: duration });
  }

  /**
   * Get available duration options (10s to 120s in 5s increments)
   */
  static getDurationOptions(): number[] {
    const options = [];
    for (let i = 10; i <= 120; i += 5) {
      options.push(i);
    }
    return options;
  }

  /**
   * Format duration for display
   */
  static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
    }
  }
}