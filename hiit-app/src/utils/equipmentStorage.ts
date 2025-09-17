import type { EquipmentPreferences, EquipmentPreset } from '../types/equipmentPreferences';
import { defaultPresets } from '../types/equipmentPreferences';

const STORAGE_KEY = 'hiit-app-equipment-preferences';

export class EquipmentStorage {
  static getPreferences(): EquipmentPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load equipment preferences:', error);
    }

    // Return default preferences if nothing stored
    return {
      ownedEquipment: ['bodyweight'], // Always start with bodyweight
      selectedForWorkout: ['bodyweight'],
      presets: defaultPresets
    };
  }

  static savePreferences(preferences: EquipmentPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save equipment preferences:', error);
    }
  }

  static updateOwnedEquipment(equipmentIds: string[]): void {
    const preferences = this.getPreferences();
    preferences.ownedEquipment = [...new Set([...equipmentIds, 'bodyweight'])]; // Always include bodyweight

    // Update selected for workout to only include owned equipment
    preferences.selectedForWorkout = preferences.selectedForWorkout.filter(id =>
      preferences.ownedEquipment.includes(id)
    );

    // Ensure at least bodyweight is selected
    if (preferences.selectedForWorkout.length === 0) {
      preferences.selectedForWorkout = ['bodyweight'];
    }

    this.savePreferences(preferences);
  }

  static updateWorkoutSelection(equipmentIds: string[]): void {
    const preferences = this.getPreferences();

    // Only allow selection of owned equipment
    const validIds = equipmentIds.filter(id =>
      preferences.ownedEquipment.includes(id)
    );

    // Always include bodyweight
    preferences.selectedForWorkout = [...new Set([...validIds, 'bodyweight'])];

    this.savePreferences(preferences);
  }

  static addCustomPreset(preset: Omit<EquipmentPreset, 'id'>): string {
    const preferences = this.getPreferences();
    const id = `custom-${Date.now()}`;

    const newPreset: EquipmentPreset = {
      ...preset,
      id,
      // Only include equipment the user owns
      equipmentIds: preset.equipmentIds.filter(equipId =>
        preferences.ownedEquipment.includes(equipId)
      )
    };

    preferences.presets.push(newPreset);
    this.savePreferences(preferences);

    return id;
  }

  static applyPreset(presetId: string): boolean {
    const preferences = this.getPreferences();
    const preset = preferences.presets.find(p => p.id === presetId);

    if (!preset) return false;

    // Apply preset selection (only owned equipment)
    const validEquipment = preset.equipmentIds.filter(id =>
      preferences.ownedEquipment.includes(id)
    );

    preferences.selectedForWorkout = validEquipment.length > 0
      ? validEquipment
      : ['bodyweight'];

    this.savePreferences(preferences);
    return true;
  }

  static removeCustomPreset(presetId: string): void {
    const preferences = this.getPreferences();
    preferences.presets = preferences.presets.filter(p =>
      p.id !== presetId || defaultPresets.some(dp => dp.id === p.id)
    );
    this.savePreferences(preferences);
  }
}