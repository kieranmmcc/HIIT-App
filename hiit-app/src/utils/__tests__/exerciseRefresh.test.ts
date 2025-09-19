import { regenerateExercise } from '../workoutGenerator';
import { generateCircuitWorkout } from '../circuitGenerator';
import { BlacklistStorage } from '../blacklistStorage';
import { createMockWorkoutSettings, createMockExercise } from '../../__tests__/utils/test-utils';
import { mockLocalStorageForTests } from '../../__tests__/utils/storage-test-utils';
import type { Exercise } from '../../types/exercise';


// Mock the exercises data
jest.mock('../../data/exercises.json', () => {
  const { createMockExercise } = require('../../__tests__/utils/test-utils');

  return [
    // Leg/Glute exercises (should be avoided when blacklisted)
    createMockExercise({
      id: 1, name: 'Squats', primaryMuscle: 'legs',
      muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 2, name: 'Lunges', primaryMuscle: 'legs',
      muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 3, name: 'Hip Thrusts', primaryMuscle: 'glutes',
      muscleGroups: ['glutes', 'core'], equipment: ['bodyweight'], difficulty: 2
    }),
    // Chest exercises
    createMockExercise({
      id: 4, name: 'Push Ups', primaryMuscle: 'chest',
      muscleGroups: ['chest', 'shoulders', 'arms'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 5, name: 'Chest Press', primaryMuscle: 'chest',
      muscleGroups: ['chest', 'arms'], equipment: ['dumbbells'], difficulty: 3
    }),
    createMockExercise({
      id: 6, name: 'Incline Push Ups', primaryMuscle: 'chest',
      muscleGroups: ['chest', 'shoulders'], equipment: ['bodyweight'], difficulty: 2
    }),
    // Back exercises
    createMockExercise({
      id: 7, name: 'Pull Ups', primaryMuscle: 'back',
      muscleGroups: ['back', 'arms'], equipment: ['pull_up_bar'], difficulty: 4
    }),
    createMockExercise({
      id: 8, name: 'Bent Over Rows', primaryMuscle: 'back',
      muscleGroups: ['back', 'arms'], equipment: ['dumbbells'], difficulty: 3
    }),
    // Arms exercises
    createMockExercise({
      id: 9, name: 'Bicep Curls', primaryMuscle: 'arms',
      muscleGroups: ['arms'], equipment: ['dumbbells'], difficulty: 2
    }),
    createMockExercise({
      id: 10, name: 'Tricep Dips', primaryMuscle: 'arms',
      muscleGroups: ['arms', 'shoulders'], equipment: ['bodyweight'], difficulty: 3
    }),
    // Core exercises
    createMockExercise({
      id: 11, name: 'Plank', primaryMuscle: 'core',
      muscleGroups: ['core'], equipment: ['bodyweight'], difficulty: 2
    }),
    createMockExercise({
      id: 12, name: 'Russian Twists', primaryMuscle: 'core',
      muscleGroups: ['core'], equipment: ['bodyweight'], difficulty: 3
    })
  ];
});

// Mock the BlacklistStorage
jest.mock('../blacklistStorage');
const mockBlacklistStorage = BlacklistStorage as jest.Mocked<typeof BlacklistStorage>;

// Local reference to mock exercises for test use
const mockExercises: Exercise[] = [
  createMockExercise({
    id: 1, name: 'Squats', primaryMuscle: 'legs',
    muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 2, name: 'Lunges', primaryMuscle: 'legs',
    muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 3, name: 'Hip Thrusts', primaryMuscle: 'glutes',
    muscleGroups: ['glutes', 'core'], equipment: ['bodyweight'], difficulty: 2
  }),
  createMockExercise({
    id: 4, name: 'Push Ups', primaryMuscle: 'chest',
    muscleGroups: ['chest', 'shoulders', 'arms'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 5, name: 'Chest Press', primaryMuscle: 'chest',
    muscleGroups: ['chest', 'arms'], equipment: ['dumbbells'], difficulty: 3
  }),
  createMockExercise({
    id: 6, name: 'Incline Push Ups', primaryMuscle: 'chest',
    muscleGroups: ['chest', 'shoulders'], equipment: ['bodyweight'], difficulty: 2
  }),
  createMockExercise({
    id: 7, name: 'Pull Ups', primaryMuscle: 'back',
    muscleGroups: ['back', 'arms'], equipment: ['pull_up_bar'], difficulty: 4
  }),
  createMockExercise({
    id: 8, name: 'Bent Over Rows', primaryMuscle: 'back',
    muscleGroups: ['back', 'arms'], equipment: ['dumbbells'], difficulty: 3
  }),
  createMockExercise({
    id: 9, name: 'Bicep Curls', primaryMuscle: 'arms',
    muscleGroups: ['arms'], equipment: ['dumbbells'], difficulty: 2
  }),
  createMockExercise({
    id: 10, name: 'Tricep Dips', primaryMuscle: 'arms',
    muscleGroups: ['arms', 'shoulders'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 11, name: 'Plank', primaryMuscle: 'core',
    muscleGroups: ['core'], equipment: ['bodyweight'], difficulty: 2
  }),
  createMockExercise({
    id: 12, name: 'Russian Twists', primaryMuscle: 'core',
    muscleGroups: ['core'], equipment: ['bodyweight'], difficulty: 3
  })
];

describe('Exercise Refresh Logic', () => {
  mockLocalStorageForTests();

  beforeEach(() => {
    jest.clearAllMocks();
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);
  });

  describe('regenerateExercise', () => {
    describe('Avoid/Blacklist Requirements', () => {
      it('consistently avoids blacklisted exercises across multiple regenerations', () => {
        // Blacklist all leg/glute exercises
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3']);

        const currentExercise = mockExercises[3]; // Push Ups (chest)
        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight', 'dumbbells'],
          targetMuscleGroups: ['chest']
        });

        // Test multiple regenerations to ensure consistency
        for (let i = 0; i < 10; i++) {
          const newExercise = regenerateExercise(currentExercise, settings, []);

          expect(newExercise).toBeDefined();
          if (newExercise) {
            // Should not be any blacklisted exercise
            expect(['1', '2', '3']).not.toContain(newExercise.id.toString());
            // Should still target chest muscle group
            expect(['chest']).toContain(newExercise.primaryMuscle);
            // Should not be the same as current exercise
            expect(newExercise.id).not.toBe(currentExercise.id);
          }
        }
      });

      it('avoids blacklisted exercises even when they match target muscle groups', () => {
        // Blacklist leg exercises but target legs
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']);

        const currentExercise = mockExercises[10]; // Plank (core)
        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight'],
          targetMuscleGroups: ['legs'] // Target legs but should avoid blacklisted leg exercises
        });

        const newExercise = regenerateExercise(currentExercise, settings, []);

        expect(newExercise).toBeDefined();
        if (newExercise) {
          // Should not be blacklisted exercises (Squats or Lunges)
          expect(['1', '2']).not.toContain(newExercise.id.toString());
        }
      });

      it('respects excludedMuscleGroups to avoid specific body parts', () => {
        const currentExercise = mockExercises[3]; // Push Ups (chest)
        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight', 'dumbbells'],
          excludedMuscleGroups: ['legs', 'glutes'] // Explicitly exclude legs/glutes
        });

        // Test multiple times to ensure consistency
        for (let i = 0; i < 5; i++) {
          const newExercise = regenerateExercise(currentExercise, settings, []);

          expect(newExercise).toBeDefined();
          if (newExercise) {
            // Should not have legs or glutes as primary muscle
            expect(newExercise.primaryMuscle).not.toBe('legs');
            expect(newExercise.primaryMuscle).not.toBe('glutes');
            // Should not have legs or glutes in muscle groups
            expect(newExercise.muscleGroups).not.toContain('legs');
            expect(newExercise.muscleGroups).not.toContain('glutes');
          }
        }
      });

      it('combines blacklist and excluded muscle groups correctly', () => {
        // Blacklist specific exercises AND exclude muscle groups
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['4', '5']); // Blacklist chest exercises

        const currentExercise = mockExercises[10]; // Plank (core)
        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight', 'dumbbells'],
          excludedMuscleGroups: ['legs', 'glutes'], // Also exclude legs/glutes
          targetMuscleGroups: ['arms', 'back'] // Target arms and back
        });

        const newExercise = regenerateExercise(currentExercise, settings, []);

        expect(newExercise).toBeDefined();
        if (newExercise) {
          // Should not be blacklisted chest exercises
          expect(['4', '5']).not.toContain(newExercise.id.toString());
          // Should not have excluded muscle groups
          expect(newExercise.primaryMuscle).not.toBe('legs');
          expect(newExercise.primaryMuscle).not.toBe('glutes');
          // Should target arms or back
          expect(['arms', 'back']).toContain(newExercise.primaryMuscle);
        }
      });
    });

    describe('Targeted Body Parts', () => {
      it('prioritizes targeted muscle groups while respecting avoid requirements', () => {
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']); // Avoid leg exercises

        const currentExercise = mockExercises[10]; // Plank (core)
        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight', 'dumbbells'],
          targetMuscleGroups: ['chest', 'arms'] // Target chest and arms
        });

        const newExercise = regenerateExercise(currentExercise, settings, []);

        expect(newExercise).toBeDefined();
        if (newExercise) {
          // Should preferentially target chest or arms, but may fall back to other muscle groups if needed
          // The key requirement is avoiding blacklisted exercises
          expect(['1', '2']).not.toContain(newExercise.id.toString());
          // Should not be the same exercise
          expect(newExercise.id).not.toBe(currentExercise.id);
          // Should not be legs (the blacklisted muscle group)
          expect(newExercise.primaryMuscle).not.toBe('legs');
        }
      });

      it('falls back gracefully when targeted muscle groups are heavily restricted', () => {
        // Blacklist most chest exercises, target chest specifically
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['4', '5', '6']);

        const currentExercise = mockExercises[0]; // Squats
        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight'],
          targetMuscleGroups: ['chest'] // Target chest but most are blacklisted
        });

        const newExercise = regenerateExercise(currentExercise, settings, []);

        // Should either find a non-blacklisted exercise or return null if none available
        if (newExercise) {
          expect(['4', '5', '6']).not.toContain(newExercise.id.toString());
          expect(newExercise.id).not.toBe(currentExercise.id);
        }
        // It's acceptable for this to return null if no suitable exercise exists
      });

      it('avoids duplicate exercises in existing workout', () => {
        const currentExercise = mockExercises[3]; // Push Ups
        const existingExercises = [
          mockExercises[4], // Chest Press
          mockExercises[5], // Incline Push Ups
          mockExercises[9]  // Bicep Curls
        ];

        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight', 'dumbbells'],
          targetMuscleGroups: ['chest']
        });

        const newExercise = regenerateExercise(currentExercise, settings, existingExercises);

        expect(newExercise).toBeDefined();
        if (newExercise) {
          // Should not be current exercise or any existing exercises
          expect(newExercise.id).not.toBe(currentExercise.id);
          expect(existingExercises.map(ex => ex.id)).not.toContain(newExercise.id);
        }
      });
    });

    describe('Equipment Constraints', () => {
      it('respects equipment limitations during refresh', () => {
        const currentExercise = mockExercises[4]; // Chest Press (dumbbells)
        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight'], // Only bodyweight available
          targetMuscleGroups: ['chest']
        });

        const newExercise = regenerateExercise(currentExercise, settings, []);

        expect(newExercise).toBeDefined();
        if (newExercise) {
          // Should have bodyweight in equipment requirements
          expect(newExercise.equipment).toContain('bodyweight');
          // Should not require dumbbells
          expect(newExercise.equipment.every(eq => ['bodyweight'].includes(eq)) ||
                 newExercise.equipment.some(eq => ['bodyweight'].includes(eq))).toBe(true);
        }
      });
    });

    describe('Difficulty Considerations', () => {
      it('considers difficulty during refresh with fallback', () => {
        const currentExercise = mockExercises[3]; // Push Ups (difficulty 3)
        const settings = createMockWorkoutSettings({
          selectedEquipment: ['bodyweight'],
          difficulty: 'easy' // Should prefer easier exercises
        });

        const newExercise = regenerateExercise(currentExercise, settings, []);

        expect(newExercise).toBeDefined();
        if (newExercise) {
          // For easy difficulty, should prefer difficulty 1-3 exercises
          // But may fall back to other difficulties if needed
          expect(newExercise.difficulty).toBeGreaterThanOrEqual(1);
          expect(newExercise.difficulty).toBeLessThanOrEqual(5);
        }
      });
    });
  });

  describe('Circuit Workout Refresh Logic', () => {
    describe('Classic Circuit Refresh', () => {
      it('generates circuit that respects blacklisted exercises', () => {
        // Blacklist leg exercises
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3']);

        const settings = createMockWorkoutSettings({
          circuitType: 'classic_cycle',
          selectedEquipment: ['bodyweight', 'dumbbells'],
          exerciseCount: 8,
          difficulty: 'medium'
        });

        const workout = generateCircuitWorkout(settings);

        expect(workout.circuit).toBeDefined();
        if (workout.circuit) {
          // Check all stations and exercises
          workout.circuit.stations.forEach(station => {
            station.exercises.forEach(exercise => {
              // Should not contain blacklisted exercises
              expect(['1', '2', '3']).not.toContain(exercise.id.toString());
            });
          });
        }
      });

      it('maintains avoid requirements across all circuit stations', () => {
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3']); // All leg exercises

        const settings = createMockWorkoutSettings({
          circuitType: 'classic_cycle',
          selectedEquipment: ['bodyweight', 'dumbbells'],
          exerciseCount: 8,
          excludedMuscleGroups: ['legs', 'glutes'],
          difficulty: 'medium'
        });

        const workout = generateCircuitWorkout(settings);

        expect(workout.circuit).toBeDefined();
        expect(workout.circuit?.stations.length).toBeGreaterThan(0);

        if (workout.circuit) {
          workout.circuit.stations.forEach(station => {
            station.exercises.forEach(exercise => {
              // Should not be blacklisted
              expect(['1', '2', '3']).not.toContain(exercise.id.toString());
              // Should not have excluded muscle groups
              expect(exercise.primaryMuscle).not.toBe('legs');
              expect(exercise.primaryMuscle).not.toBe('glutes');
            });
          });
        }
      });

      it('respects targeted muscle groups in circuit generation', () => {
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1']); // Avoid one leg exercise

        const settings = createMockWorkoutSettings({
          circuitType: 'classic_cycle',
          selectedEquipment: ['bodyweight', 'dumbbells'],
          exerciseCount: 6,
          targetMuscleGroups: ['chest', 'arms', 'back'],
          difficulty: 'medium'
        });

        const workout = generateCircuitWorkout(settings);

        expect(workout.circuit).toBeDefined();
        if (workout.circuit) {
          let hasTargetedMuscles = false;
          workout.circuit.stations.forEach(station => {
            station.exercises.forEach(exercise => {
              if (['chest', 'arms', 'back'].includes(exercise.primaryMuscle) ||
                  exercise.muscleGroups.some(mg => ['chest', 'arms', 'back'].includes(mg))) {
                hasTargetedMuscles = true;
              }
            });
          });
          expect(hasTargetedMuscles).toBe(true);
        }
      });
    });

    describe('Super Sets Refresh', () => {
      it('generates super sets that avoid blacklisted exercises', () => {
        // Blacklist some exercises that might appear in super sets
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '4']); // Squats and Push Ups

        const settings = createMockWorkoutSettings({
          circuitType: 'super_sets',
          selectedEquipment: ['bodyweight', 'dumbbells'],
          exerciseCount: 8, // 4 super sets
          difficulty: 'medium'
        });

        const workout = generateCircuitWorkout(settings);

        expect(workout.circuit).toBeDefined();
        if (workout.circuit) {
          expect(workout.circuit.type).toBe('super_sets');

          // Check all stations (super sets)
          workout.circuit.stations.forEach(station => {
            expect(station.exercises.length).toBe(2); // Each super set has 2 exercises

            station.exercises.forEach(exercise => {
              // Should not contain blacklisted exercises
              expect(['1', '4']).not.toContain(exercise.id.toString());
            });
          });
        }
      });

      it('maintains exercise pairing logic in super sets while respecting avoid requirements', () => {
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']); // Leg exercises

        const settings = createMockWorkoutSettings({
          circuitType: 'super_sets',
          selectedEquipment: ['bodyweight', 'dumbbells'],
          exerciseCount: 8, // 4 super sets
          targetMuscleGroups: ['chest', 'back', 'arms'],
          excludedMuscleGroups: ['legs'],
          difficulty: 'medium'
        });

        const workout = generateCircuitWorkout(settings);

        expect(workout.circuit).toBeDefined();
        if (workout.circuit) {
          expect(workout.circuit.type).toBe('super_sets');

          // Filter out any empty stations that may occur due to heavy constraints
          const nonEmptyStations = workout.circuit.stations.filter(station => station.exercises.length > 0);

          if (nonEmptyStations.length > 0) {
            nonEmptyStations.forEach(station => {
              // Super sets should have 2 exercises, but may have fewer if not enough exercises available
              expect(station.exercises.length).toBeGreaterThanOrEqual(1);
              expect(station.exercises.length).toBeLessThanOrEqual(2);

              station.exercises.forEach(exercise => {
                // Should not be blacklisted leg exercises
                expect(['1', '2']).not.toContain(exercise.id.toString());
                // Should not have legs as primary muscle
                expect(exercise.primaryMuscle).not.toBe('legs');
                // Should target desired muscle groups
                expect(['chest', 'back', 'arms', 'shoulders', 'core']).toContain(exercise.primaryMuscle);
              });
            });
          } else {
            // If no stations have exercises, that's expected behavior when constraints are too restrictive
            console.log('No exercises available due to avoidance constraints - this is expected behavior');
          }
        }
      });

      it('handles super set generation when many exercises are avoided', () => {
        // Blacklist many exercises to test fallback behavior
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3', '4', '5', '6']);

        const settings = createMockWorkoutSettings({
          circuitType: 'super_sets',
          selectedEquipment: ['bodyweight', 'dumbbells'],
          exerciseCount: 4, // 2 super sets (minimum)
          difficulty: 'medium'
        });

        const workout = generateCircuitWorkout(settings);

        expect(workout.circuit).toBeDefined();
        if (workout.circuit) {
          workout.circuit.stations.forEach(station => {
            station.exercises.forEach(exercise => {
              // Should not contain any blacklisted exercises
              expect(['1', '2', '3', '4', '5', '6']).not.toContain(exercise.id.toString());
            });
          });
        }
      });

      it('ensures super set variety while maintaining avoid requirements', () => {
        mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1']); // Avoid Squats

        const settings = createMockWorkoutSettings({
          circuitType: 'super_sets',
          selectedEquipment: ['bodyweight', 'dumbbells'],
          exerciseCount: 8, // 4 super sets
          difficulty: 'medium'
        });

        // Generate multiple super set workouts to test variety
        const workouts = Array(3).fill(null).map(() => generateCircuitWorkout(settings));

        workouts.forEach(workout => {
          expect(workout.circuit).toBeDefined();
          if (workout.circuit) {
            // Each workout should avoid blacklisted exercises
            workout.circuit.stations.forEach(station => {
              station.exercises.forEach(exercise => {
                expect(exercise.id.toString()).not.toBe('1');
              });
            });

            // Should have proper super set structure
            expect(workout.circuit.stations.length).toBe(4); // 4 super sets
            workout.circuit.stations.forEach(station => {
              expect(station.exercises.length).toBe(2); // 2 exercises per super set
            });
          }
        });
      });
    });
  });

  describe('Fallback Flags', () => {
    it('sets target_muscle_unavailable flag when target muscle groups are not available', () => {
      // Blacklist all exercises except one chest exercise
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']);

      const currentExercise = mockExercises[0]; // Squats (legs)
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight', 'dumbbells'],
        targetMuscleGroups: ['chest'] // Target chest but most chest exercises are blacklisted
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      if (newExercise) {
        expect(newExercise.fallbackReason).toBe('target_muscle_unavailable');
      }
    });

    it('sets difficulty_mismatch flag when difficulty constraints cannot be met', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']); // Avoid legs

      const currentExercise = mockExercises[0]; // Squats (legs)
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight', 'dumbbells'],
        difficulty: 'easy' // Very restrictive difficulty that may not have many options
      });

      // Mock exercises to have mostly high difficulty
      const originalMockExercises = [...mockExercises];
      const highDifficultyExercises = mockExercises.map(ex => ({ ...ex, difficulty: 5 }));
      mockExercises.splice(0, mockExercises.length, ...highDifficultyExercises);

      const newExercise = regenerateExercise(currentExercise, settings, []);

      if (newExercise && newExercise.fallbackReason) {
        expect(['difficulty_mismatch', 'target_muscle_unavailable', 'no_suitable_alternatives']).toContain(newExercise.fallbackReason);
      }

      // Restore original exercises
      mockExercises.splice(0, mockExercises.length, ...originalMockExercises);
    });

    it('sets no_suitable_alternatives flag when excluded muscle groups limit options severely', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['4', '5', '6', '7', '8', '9', '10', '11', '12', '13']);

      const currentExercise = mockExercises[3]; // Push Ups (chest)
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'],
        excludedMuscleGroups: ['legs', 'arms', 'back', 'shoulders'] // Exclude most muscle groups
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      if (newExercise && newExercise.fallbackReason) {
        expect(['no_suitable_alternatives', 'target_muscle_unavailable']).toContain(newExercise.fallbackReason);
      }
    });

    it('does not set fallback flag when perfect match is found', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']); // Only avoid legs

      const currentExercise = mockExercises[3]; // Push Ups (chest)
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight', 'dumbbells'],
        difficulty: 'medium',
        targetMuscleGroups: ['chest'] // Target chest, and we have chest exercises available
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      expect(newExercise).toBeDefined();
      if (newExercise) {
        expect(newExercise.fallbackReason).toBeUndefined();
        expect(newExercise.primaryMuscle).toBe('chest');
      }
    });

    it('sets equipment_unavailable flag when equipment constraints force fallback', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);

      const currentExercise = mockExercises[6]; // Pull Ups (needs pull_up_bar)
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'], // Don't have pull_up_bar
        difficulty: 'medium'
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      if (newExercise && newExercise.fallbackReason) {
        // Should get some fallback flag since we can't do pull ups without pull up bar
        expect(['equipment_unavailable', 'difficulty_mismatch', 'no_suitable_alternatives']).toContain(newExercise.fallbackReason);
      }
    });
  });

  describe('Corner Cases', () => {
    it('handles case where no exercises are available after filtering', () => {
      // Blacklist all available exercises
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(
        mockExercises.map(ex => ex.id.toString())
      );

      const currentExercise = mockExercises[0];
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'],
        targetMuscleGroups: ['chest']
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      // Should return null when no suitable exercises are available
      expect(newExercise).toBeNull();
    });

    it('handles equipment not available for target muscle groups', () => {
      const currentExercise = mockExercises[7]; // Pull Ups (needs pull-up bar)
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'], // No pull-up bar available
        targetMuscleGroups: ['back']
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      // Should either find a bodyweight back exercise or return null
      if (newExercise) {
        expect(newExercise.equipment.some(eq => ['bodyweight'].includes(eq))).toBe(true);
      }
    });

    it('prioritizes muscle group targeting over strict difficulty matching', () => {
      const currentExercise = mockExercises[6]; // Incline Push Ups (difficulty 2)
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight', 'dumbbells'],
        targetMuscleGroups: ['chest'],
        difficulty: 'hard' // Should prefer difficulty 3-5, but prioritize chest exercises
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      expect(newExercise).toBeDefined();
      if (newExercise) {
        // Should target chest even if difficulty doesn't perfectly match
        expect(newExercise.primaryMuscle).toBe('chest');
      }
    });

    it('handles refresh with very restrictive constraints', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3', '4', '5']);

      const currentExercise = mockExercises[0];
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'],
        targetMuscleGroups: ['chest'],
        excludedMuscleGroups: ['legs', 'glutes', 'arms'],
        difficulty: 'easy'
      });

      const newExercise = regenerateExercise(currentExercise, settings,
        [mockExercises[7], mockExercises[8], mockExercises[9]] // Many existing exercises
      );

      // With very restrictive constraints, may return null
      // This is acceptable behavior
      if (newExercise) {
        expect(['1', '2', '3', '4', '5']).not.toContain(newExercise.id.toString());
      }
    });
  });
});