import type { CircuitType } from '../types/circuit';

interface CircuitPreferences {
  favoriteCircuitType: CircuitType;
}

const STORAGE_KEY = 'hiit-app-circuit-preferences';

export class CircuitStorage {
  static getPreferences(): CircuitPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load circuit preferences:', error);
    }

    // Return default preferences if nothing stored
    return {
      favoriteCircuitType: 'classic_cycle'
    };
  }

  static savePreferences(preferences: CircuitPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save circuit preferences:', error);
    }
  }

  static setFavoriteCircuitType(circuitType: CircuitType): void {
    const preferences = this.getPreferences();
    preferences.favoriteCircuitType = circuitType;
    this.savePreferences(preferences);
  }

  static getFavoriteCircuitType(): CircuitType {
    const preferences = this.getPreferences();
    return preferences.favoriteCircuitType;
  }
}