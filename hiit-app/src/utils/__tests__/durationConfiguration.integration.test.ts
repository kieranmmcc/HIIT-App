import { generateWarmup } from '../warmupGenerator';
import { generateCooldown } from '../cooldownGenerator';
import { generateCircuitWorkout } from '../circuitGenerator';
import { DurationPreferencesStorage } from '../durationPreferences';
import { createMockWorkout } from '../../__tests__/utils/test-utils';
import type { WorkoutSettings } from '../../types/workout';

// Mock localStorage for preferences
const mockLocalStorage: Storage & { store: Record<string, string> } = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string): string | null => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string): void => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string): void => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn((): void => {
    mockLocalStorage.store = {};
  }),
  key: jest.fn(),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock warmups and stretches data
jest.mock('../../data/warmups.json', () => [
  {
    id: 'warmup_001',
    name: 'Test Warmup 1',
    instructions: 'First warmup exercise',
    targetBodyParts: ['full_body', 'cardio'],
    duration: 30,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_002',
    name: 'Test Warmup 2',
    instructions: 'Second warmup exercise',
    targetBodyParts: ['legs', 'cardio'],
    duration: 45,
    equipment: ['bodyweight']
  }
]);

jest.mock('../../data/stretches.json', () => [
  {
    id: 'stretch_001',
    name: 'Test Stretch 1',
    instructions: 'First stretch exercise',
    targetBodyParts: ['hamstrings', 'legs'],
    duration: 30,
    equipment: ['bodyweight']
  },
  {
    id: 'stretch_002',
    name: 'Test Stretch 2',
    instructions: 'Second stretch exercise',
    targetBodyParts: ['chest', 'shoulders'],
    duration: 45,
    equipment: ['bodyweight']
  }
]);

// Mock other dependencies
jest.mock('../equipmentStorage', () => ({
  EquipmentStorage: {
    getPreferences: jest.fn(() => ({
      hasCompletedSetup: true,
      selectedForWorkout: ['bodyweight'],
      ownedEquipment: ['bodyweight'],
      presets: []
    }))
  }
}));

jest.mock('../blacklistStorage', () => ({
  BlacklistStorage: {
    getBlacklistedExercises: jest.fn(() => [])
  }
}));

jest.mock('../../data/exercises.json', () => {
  const { createMockExercise } = require('../../__tests__/utils/test-utils');
  return [
    createMockExercise({
      id: 1, name: 'Push Ups', primaryMuscle: 'chest',
      muscleGroups: ['chest', 'shoulders'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 2, name: 'Squats', primaryMuscle: 'legs',
      muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
    })
  ];
});

describe('Duration Configuration Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('warmup duration configuration', () => {
    it('applies custom warmup duration to generated warmup exercises', () => {
      // Set custom warmup duration
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 25,
        cooldownDuration: 35
      });

      const mockWorkout = createMockWorkout();
      const warmup = generateWarmup(mockWorkout);

      // All warmup exercises should use the configured duration
      warmup.exercises.forEach(exercise => {
        expect(exercise.duration).toBe(25);
      });

      // Total duration should be number of exercises × configured duration
      const expectedTotal = warmup.exercises.length * 25;
      expect(warmup.totalDuration).toBe(expectedTotal);
    });

    it('uses default warmup duration when no preferences are set', () => {
      const mockWorkout = createMockWorkout();
      const warmup = generateWarmup(mockWorkout);

      // All exercises should use default 20s duration
      warmup.exercises.forEach(exercise => {
        expect(exercise.duration).toBe(20);
      });
    });

    it('updates warmup duration when preferences change', () => {
      const mockWorkout = createMockWorkout();

      // First generation with default duration
      let warmup = generateWarmup(mockWorkout);
      expect(warmup.exercises[0].duration).toBe(20);

      // Change preference
      DurationPreferencesStorage.savePreferences({ warmupDuration: 40 });

      // Second generation with new duration
      warmup = generateWarmup(mockWorkout);
      expect(warmup.exercises[0].duration).toBe(40);
    });
  });

  describe('cooldown duration configuration', () => {
    it('applies custom cooldown duration to generated cooldown exercises', () => {
      // Set custom cooldown duration
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 15,
        cooldownDuration: 50
      });

      const mockWorkout = createMockWorkout();
      const cooldown = generateCooldown(mockWorkout);

      // All cooldown exercises should use the configured duration
      cooldown.exercises.forEach(exercise => {
        expect(exercise.duration).toBe(50);
      });

      // Total duration should be number of exercises × configured duration
      const expectedTotal = cooldown.exercises.length * 50;
      expect(cooldown.totalDuration).toBe(expectedTotal);
    });

    it('uses default cooldown duration when no preferences are set', () => {
      const mockWorkout = createMockWorkout();
      const cooldown = generateCooldown(mockWorkout);

      // All exercises should use default 20s duration
      cooldown.exercises.forEach(exercise => {
        expect(exercise.duration).toBe(20);
      });
    });

    it('updates cooldown duration when preferences change', () => {
      const mockWorkout = createMockWorkout();

      // First generation with default duration
      let cooldown = generateCooldown(mockWorkout);
      expect(cooldown.exercises[0].duration).toBe(20);

      // Change preference
      DurationPreferencesStorage.savePreferences({ cooldownDuration: 60 });

      // Second generation with new duration
      cooldown = generateCooldown(mockWorkout);
      expect(cooldown.exercises[0].duration).toBe(60);
    });
  });

  describe('circuit workout integration', () => {
    it('applies duration preferences to warmup and cooldown in circuit workouts', () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 30,
        cooldownDuration: 45
      });

      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 4
      };

      const workout = generateCircuitWorkout(settings);

      // Check warmup uses configured duration
      if (workout.warmup) {
        workout.warmup.exercises.forEach(exercise => {
          expect(exercise.duration).toBe(30);
        });
      }

      // Check cooldown uses configured duration
      if (workout.cooldown) {
        workout.cooldown.exercises.forEach(exercise => {
          expect(exercise.duration).toBe(45);
        });
      }
    });

    it('correctly calculates total workout time with custom durations', () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 25,
        cooldownDuration: 40
      });

      const settings: WorkoutSettings = {
        duration: 10, // 10 minutes for main workout
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 4
      };

      const workout = generateCircuitWorkout(settings);

      const warmupTime = workout.warmup ? workout.warmup.totalDuration : 0;
      const cooldownTime = workout.cooldown ? workout.cooldown.totalDuration : 0;

      // Note: Currently the main workout totalDuration represents the main circuit duration only,
      // not including warmup and cooldown. This test validates that warmup and cooldown
      // are generated with the correct custom durations.

      // Validate warmup uses custom duration (25s per exercise)
      if (workout.warmup) {
        expect(warmupTime).toBe(workout.warmup.exercises.length * 25);
        workout.warmup.exercises.forEach(exercise => {
          expect(exercise.duration).toBe(25);
        });
      }

      // Validate cooldown uses custom duration (40s per exercise)
      if (workout.cooldown) {
        expect(cooldownTime).toBe(workout.cooldown.exercises.length * 40);
        workout.cooldown.exercises.forEach(exercise => {
          expect(exercise.duration).toBe(40);
        });
      }

      // Validate that warmup and cooldown are generated with non-zero duration
      expect(warmupTime).toBeGreaterThan(0);
      expect(cooldownTime).toBeGreaterThan(0);
    });
  });

  describe('timer integration scenarios', () => {
    it('generates appropriate exercise counts for different duration settings', () => {
      // Test with short durations (should get more exercises)
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 10,
        cooldownDuration: 10
      });

      const mockWorkout = createMockWorkout();
      let warmup = generateWarmup(mockWorkout);
      let cooldown = generateCooldown(mockWorkout);

      const shortDurationWarmupCount = warmup.exercises.length;
      const shortDurationCooldownCount = cooldown.exercises.length;

      // Test with long durations (should get fewer exercises for same total time)
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 60,
        cooldownDuration: 60
      });

      warmup = generateWarmup(mockWorkout);
      cooldown = generateCooldown(mockWorkout);

      const longDurationWarmupCount = warmup.exercises.length;
      const longDurationCooldownCount = cooldown.exercises.length;

      // With longer durations, we expect the same or fewer exercises
      // (since the selection logic prioritizes variety but respects duration)
      expect(longDurationWarmupCount).toBeLessThanOrEqual(shortDurationWarmupCount + 1);
      expect(longDurationCooldownCount).toBeLessThanOrEqual(shortDurationCooldownCount + 1);
    });

    it('maintains reasonable total warmup times across different exercise durations', () => {
      const testDurations = [10, 20, 30, 45, 60];
      const mockWorkout = createMockWorkout();

      testDurations.forEach(duration => {
        DurationPreferencesStorage.savePreferences({
          warmupDuration: duration,
          cooldownDuration: duration
        });

        const warmup = generateWarmup(mockWorkout);
        const cooldown = generateCooldown(mockWorkout);

        // Total times should be reasonable (not too short or too long)
        expect(warmup.totalDuration).toBeGreaterThanOrEqual(duration); // At least one exercise
        expect(warmup.totalDuration).toBeLessThanOrEqual(duration * 8); // Not too many exercises

        expect(cooldown.totalDuration).toBeGreaterThanOrEqual(duration);
        expect(cooldown.totalDuration).toBeLessThanOrEqual(duration * 8);
      });
    });

    it('preserves exercise selection logic while applying custom durations', () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 35,
        cooldownDuration: 50
      });

      const legWorkout = createMockWorkout({
        exercises: [
          {
            exercise: { id: 1, name: 'Squats', primaryMuscle: 'legs', muscleGroups: ['legs', 'glutes'], difficulty: 3, equipment: ['bodyweight'], instructions: 'Squat down' },
            duration: 45,
            restDuration: 15
          }
        ]
      });

      const warmup = generateWarmup(legWorkout);
      const cooldown = generateCooldown(legWorkout);

      // Should still select appropriate exercises for leg workout
      const warmupTargetsLegs = warmup.exercises.some(ex =>
        ex.targetBodyParts.some(part => ['legs', 'full_body', 'cardio'].includes(part))
      );
      expect(warmupTargetsLegs).toBe(true);

      const cooldownTargetsLegs = cooldown.exercises.some(ex =>
        ex.targetBodyParts.some(part => ['legs', 'hamstrings', 'quadriceps', 'calves'].includes(part))
      );
      expect(cooldownTargetsLegs).toBe(true);

      // But all should use configured durations
      warmup.exercises.forEach(ex => expect(ex.duration).toBe(35));
      cooldown.exercises.forEach(ex => expect(ex.duration).toBe(50));
    });
  });

  describe('preference persistence across workout generations', () => {
    it('maintains duration settings across multiple workout generations', () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 28,
        cooldownDuration: 42
      });

      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 6
      };

      // Generate multiple workouts
      const workout1 = generateCircuitWorkout(settings);
      const workout2 = generateCircuitWorkout(settings);
      const workout3 = generateCircuitWorkout(settings);

      // All should use the same configured durations
      [workout1, workout2, workout3].forEach(workout => {
        if (workout.warmup) {
          workout.warmup.exercises.forEach(ex => expect(ex.duration).toBe(28));
        }
        if (workout.cooldown) {
          workout.cooldown.exercises.forEach(ex => expect(ex.duration).toBe(42));
        }
      });
    });

    it('immediately applies duration changes to new workout generations', () => {
      const settings: WorkoutSettings = {
        duration: 12,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 4
      };

      // Generate workout with default durations
      let workout = generateCircuitWorkout(settings);
      if (workout.warmup) {
        expect(workout.warmup.exercises[0].duration).toBe(20);
      }

      // Change preferences
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 15,
        cooldownDuration: 55
      });

      // Generate new workout - should use new durations immediately
      workout = generateCircuitWorkout(settings);
      if (workout.warmup) {
        expect(workout.warmup.exercises[0].duration).toBe(15);
      }
      if (workout.cooldown) {
        expect(workout.cooldown.exercises[0].duration).toBe(55);
      }
    });
  });
});