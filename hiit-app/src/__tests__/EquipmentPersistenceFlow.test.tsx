import { EquipmentStorage } from '../utils/equipmentStorage';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string): string | null => store[key] || null),
    setItem: jest.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string): void => {
      delete store[key];
    }),
    clear: jest.fn((): void => {
      store = {};
    }),
    key: jest.fn(),
    get length() { return Object.keys(store).length; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Equipment Persistence Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('Core Equipment Persistence Behavior', () => {
    it('persists initial setup equipment through workout selection and completion cycle', () => {
      // STEP 1: User sets up initial equipment ownership (gym setup page)
      const initialOwnedEquipment = ['dumbbells', 'kettlebells', 'resistance_bands', 'pull_up_bar'];
      EquipmentStorage.updateOwnedEquipment(initialOwnedEquipment);

      // Verify equipment ownership is stored (includes bodyweight automatically)
      let preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...initialOwnedEquipment, 'bodyweight'])
      );

      // STEP 2: User selects subset for specific workout (create exercise page)
      const workoutSpecificEquipment = ['dumbbells', 'kettlebells']; // Subset of owned
      EquipmentStorage.updateWorkoutSelection(workoutSpecificEquipment);

      // CRITICAL: Verify workout selection doesn't affect owned equipment
      preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...initialOwnedEquipment, 'bodyweight'])
      );
      expect(preferences.selectedForWorkout).toEqual(
        expect.arrayContaining([...workoutSpecificEquipment, 'bodyweight'])
      );

      // STEP 3: After workout completion, verify equipment ownership is preserved
      // (This simulates the user returning to create another workout)
      preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...initialOwnedEquipment, 'bodyweight'])
      );

      // STEP 4: User can select different equipment for next workout
      const nextWorkoutEquipment = ['resistance_bands', 'pull_up_bar'];
      EquipmentStorage.updateWorkoutSelection(nextWorkoutEquipment);

      // FINAL VERIFICATION: Original owned equipment should still be intact
      preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...initialOwnedEquipment, 'bodyweight'])
      );
      expect(preferences.selectedForWorkout).toEqual(
        expect.arrayContaining([...nextWorkoutEquipment, 'bodyweight'])
      );
    });

    it('maintains equipment ownership through multiple workout sessions', () => {
      // Initial gym setup
      const fullGymEquipment = ['dumbbells', 'kettlebells', 'resistance_bands', 'pull_up_bar', 'yoga_mat'];
      EquipmentStorage.updateOwnedEquipment(fullGymEquipment);

      // First workout session - upper body focus
      EquipmentStorage.updateWorkoutSelection(['dumbbells', 'pull_up_bar']);
      let preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...fullGymEquipment, 'bodyweight'])
      );

      // Second workout session - legs focus
      EquipmentStorage.updateWorkoutSelection(['kettlebells', 'resistance_bands']);
      preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...fullGymEquipment, 'bodyweight'])
      );

      // Third workout session - bodyweight only
      EquipmentStorage.updateWorkoutSelection([]);
      preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...fullGymEquipment, 'bodyweight'])
      );
    });

    it('preserves equipment ownership when exiting workout without completion', () => {
      const originalEquipment = ['dumbbells', 'kettlebells', 'yoga_mat'];
      EquipmentStorage.updateOwnedEquipment(originalEquipment);

      // User starts creating workout but exits before completion
      EquipmentStorage.updateWorkoutSelection(['dumbbells']);

      // Equipment ownership should remain unchanged
      let preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...originalEquipment, 'bodyweight'])
      );

      // User returns and creates different workout
      EquipmentStorage.updateWorkoutSelection(['kettlebells', 'yoga_mat']);

      // Original equipment should still be available
      preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...originalEquipment, 'bodyweight'])
      );
    });

    it('handles equipment selection edge cases correctly', () => {
      const minimalEquipment = ['bodyweight'];
      EquipmentStorage.updateOwnedEquipment(minimalEquipment);

      // Test with empty workout selection (bodyweight is always included)
      EquipmentStorage.updateWorkoutSelection([]);
      let preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(['bodyweight']);
      expect(preferences.selectedForWorkout).toEqual(['bodyweight']); // Always includes bodyweight

      // Test with selection that matches owned equipment
      EquipmentStorage.updateWorkoutSelection(['bodyweight']);
      preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(['bodyweight']);
      expect(preferences.selectedForWorkout).toEqual(['bodyweight']);
    });
  });

  describe('Equipment Storage Integration', () => {
    it('verifies updateWorkoutSelection preserves ownedEquipment', () => {
      const owned = ['dumbbells', 'kettlebells', 'bands'];
      EquipmentStorage.updateOwnedEquipment(owned);

      const selectedForWorkout = ['dumbbells'];
      EquipmentStorage.updateWorkoutSelection(selectedForWorkout);

      // Core assertion: owned equipment unchanged (includes bodyweight automatically)
      const preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...owned, 'bodyweight'])
      );
      expect(preferences.selectedForWorkout).toEqual(
        expect.arrayContaining([...selectedForWorkout, 'bodyweight'])
      );
    });

    it('verifies updateOwnedEquipment only affects owned equipment', () => {
      // Set initial state
      EquipmentStorage.updateOwnedEquipment(['dumbbells']);
      EquipmentStorage.updateWorkoutSelection(['dumbbells']);

      // Update owned equipment
      const newOwned = ['dumbbells', 'kettlebells'];
      EquipmentStorage.updateOwnedEquipment(newOwned);

      // Owned should update, workout selection should remain (both include bodyweight)
      const preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining([...newOwned, 'bodyweight'])
      );
      expect(preferences.selectedForWorkout).toEqual(
        expect.arrayContaining(['dumbbells', 'bodyweight'])
      );
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('simulates typical user flow: setup → modify → workout → return', () => {
      // 1. User initially sets up gym with basic equipment
      EquipmentStorage.updateOwnedEquipment(['dumbbells', 'yoga_mat']);

      // 2. User adds more equipment to their gym later
      EquipmentStorage.updateOwnedEquipment(['dumbbells', 'yoga_mat', 'kettlebells']);

      // 3. User creates first workout with subset
      EquipmentStorage.updateWorkoutSelection(['dumbbells']);
      let preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining(['dumbbells', 'yoga_mat', 'kettlebells', 'bodyweight'])
      );

      // 4. User completes workout and returns to create new one
      // The key test: all equipment should still be available
      const availableEquipment = EquipmentStorage.getPreferences().ownedEquipment;
      expect(availableEquipment).toContain('dumbbells');
      expect(availableEquipment).toContain('yoga_mat');
      expect(availableEquipment).toContain('kettlebells');

      // 5. User creates second workout with different equipment
      EquipmentStorage.updateWorkoutSelection(['kettlebells', 'yoga_mat']);
      preferences = EquipmentStorage.getPreferences();
      expect(preferences.ownedEquipment).toEqual(
        expect.arrayContaining(['dumbbells', 'yoga_mat', 'kettlebells', 'bodyweight'])
      );
    });
  });
});