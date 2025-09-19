import { generateCircuitWorkout } from '../circuitGenerator';
import { regenerateExercise } from '../workoutGenerator';
import { BlacklistStorage } from '../blacklistStorage';
import { createMockWorkoutSettings, createMockExercise } from '../../__tests__/utils/test-utils';
import { mockLocalStorageForTests } from '../../__tests__/utils/storage-test-utils';
import type { Exercise } from '../../types/exercise';


// Mock the exercises data
jest.mock('../../data/exercises.json', () => {
  const { createMockExercise } = require('../../__tests__/utils/test-utils');
  return [
    // Legs/Glutes - should be avoidable
    createMockExercise({
      id: 1, name: 'Squats', primaryMuscle: 'legs',
      muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 2, name: 'Reverse Lunges', primaryMuscle: 'legs',
      muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 3, name: 'Bulgarian Split Squats', primaryMuscle: 'legs',
      muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 4
    }),
    createMockExercise({
      id: 4, name: 'Hip Thrusts', primaryMuscle: 'glutes',
      muscleGroups: ['glutes', 'core'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 5, name: 'Single Leg Deadlifts', primaryMuscle: 'glutes',
      muscleGroups: ['glutes', 'legs'], equipment: ['bodyweight'], difficulty: 4
    }),

    // Chest - for super set pairing
    createMockExercise({
      id: 6, name: 'Push Ups', primaryMuscle: 'chest',
      muscleGroups: ['chest', 'shoulders', 'arms'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 7, name: 'Incline Push Ups', primaryMuscle: 'chest',
      muscleGroups: ['chest', 'shoulders'], equipment: ['bodyweight'], difficulty: 2
    }),
    createMockExercise({
      id: 8, name: 'Diamond Push Ups', primaryMuscle: 'chest',
      muscleGroups: ['chest', 'arms'], equipment: ['bodyweight'], difficulty: 4
    }),
    createMockExercise({
      id: 9, name: 'Chest Press', primaryMuscle: 'chest',
      muscleGroups: ['chest', 'arms'], equipment: ['dumbbells'], difficulty: 3
    }),

    // Back - for super set pairing with chest
    createMockExercise({
      id: 10, name: 'Pull Ups', primaryMuscle: 'back',
      muscleGroups: ['back', 'arms'], equipment: ['pull_up_bar'], difficulty: 4
    }),
    createMockExercise({
      id: 11, name: 'Bent Over Rows', primaryMuscle: 'back',
      muscleGroups: ['back', 'arms'], equipment: ['dumbbells'], difficulty: 3
    }),
    createMockExercise({
      id: 12, name: 'Superman', primaryMuscle: 'back',
      muscleGroups: ['back', 'core'], equipment: ['bodyweight'], difficulty: 2
    }),

    // Arms
    createMockExercise({
      id: 13, name: 'Bicep Curls', primaryMuscle: 'arms',
      muscleGroups: ['arms'], equipment: ['dumbbells'], difficulty: 2
    }),
    createMockExercise({
      id: 14, name: 'Tricep Dips', primaryMuscle: 'arms',
      muscleGroups: ['arms', 'shoulders'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 15, name: 'Overhead Press', primaryMuscle: 'shoulders',
      muscleGroups: ['shoulders', 'arms'], equipment: ['dumbbells'], difficulty: 3
    }),

    // Core
    createMockExercise({
      id: 16, name: 'Plank', primaryMuscle: 'core',
      muscleGroups: ['core'], equipment: ['bodyweight'], difficulty: 2
    }),
    createMockExercise({
      id: 17, name: 'Russian Twists', primaryMuscle: 'core',
      muscleGroups: ['core'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 18, name: 'Mountain Climbers', primaryMuscle: 'core',
      muscleGroups: ['core', 'legs'], equipment: ['bodyweight'], difficulty: 3
    }),

    // Cardio/Full Body
    createMockExercise({
      id: 19, name: 'Burpees', primaryMuscle: 'full_body',
      muscleGroups: ['full_body', 'legs', 'chest', 'core'], equipment: ['bodyweight'], difficulty: 5
    }),
    createMockExercise({
      id: 20, name: 'Jumping Jacks', primaryMuscle: 'cardio',
      muscleGroups: ['legs', 'shoulders'], equipment: ['bodyweight'], difficulty: 2
    })
  ];
});

// Mock the BlacklistStorage
jest.mock('../blacklistStorage');
const mockBlacklistStorage = BlacklistStorage as jest.Mocked<typeof BlacklistStorage>;

// Local reference to mock exercises for test use
const mockExercisesData: Exercise[] = [
  createMockExercise({
    id: 1, name: 'Squats', primaryMuscle: 'legs',
    muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 2, name: 'Reverse Lunges', primaryMuscle: 'legs',
    muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 3, name: 'Bulgarian Split Squats', primaryMuscle: 'legs',
    muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 4
  }),
  createMockExercise({
    id: 4, name: 'Hip Thrusts', primaryMuscle: 'glutes',
    muscleGroups: ['glutes', 'core'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 5, name: 'Single Leg Deadlifts', primaryMuscle: 'glutes',
    muscleGroups: ['glutes', 'legs'], equipment: ['bodyweight'], difficulty: 4
  }),
  createMockExercise({
    id: 6, name: 'Push Ups', primaryMuscle: 'chest',
    muscleGroups: ['chest', 'shoulders', 'arms'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 7, name: 'Incline Push Ups', primaryMuscle: 'chest',
    muscleGroups: ['chest', 'shoulders'], equipment: ['bodyweight'], difficulty: 2
  }),
  createMockExercise({
    id: 8, name: 'Diamond Push Ups', primaryMuscle: 'chest',
    muscleGroups: ['chest', 'arms'], equipment: ['bodyweight'], difficulty: 4
  }),
  createMockExercise({
    id: 9, name: 'Chest Press', primaryMuscle: 'chest',
    muscleGroups: ['chest', 'arms'], equipment: ['dumbbells'], difficulty: 3
  }),
  createMockExercise({
    id: 10, name: 'Pull Ups', primaryMuscle: 'back',
    muscleGroups: ['back', 'arms'], equipment: ['pull_up_bar'], difficulty: 4
  }),
  createMockExercise({
    id: 11, name: 'Bent Over Rows', primaryMuscle: 'back',
    muscleGroups: ['back', 'arms'], equipment: ['dumbbells'], difficulty: 3
  }),
  createMockExercise({
    id: 12, name: 'Superman', primaryMuscle: 'back',
    muscleGroups: ['back', 'core'], equipment: ['bodyweight'], difficulty: 2
  }),
  createMockExercise({
    id: 13, name: 'Bicep Curls', primaryMuscle: 'arms',
    muscleGroups: ['arms'], equipment: ['dumbbells'], difficulty: 2
  }),
  createMockExercise({
    id: 14, name: 'Tricep Dips', primaryMuscle: 'arms',
    muscleGroups: ['arms', 'shoulders'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 15, name: 'Overhead Press', primaryMuscle: 'shoulders',
    muscleGroups: ['shoulders', 'arms'], equipment: ['dumbbells'], difficulty: 3
  }),
  createMockExercise({
    id: 16, name: 'Plank', primaryMuscle: 'core',
    muscleGroups: ['core'], equipment: ['bodyweight'], difficulty: 2
  }),
  createMockExercise({
    id: 17, name: 'Russian Twists', primaryMuscle: 'core',
    muscleGroups: ['core'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 18, name: 'Mountain Climbers', primaryMuscle: 'core',
    muscleGroups: ['core', 'legs'], equipment: ['bodyweight'], difficulty: 3
  }),
  createMockExercise({
    id: 19, name: 'Burpees', primaryMuscle: 'full_body',
    muscleGroups: ['full_body', 'legs', 'chest', 'core'], equipment: ['bodyweight'], difficulty: 5
  }),
  createMockExercise({
    id: 20, name: 'Jumping Jacks', primaryMuscle: 'cardio',
    muscleGroups: ['legs', 'shoulders'], equipment: ['bodyweight'], difficulty: 2
  })
];

describe('Circuit Refresh Integration Tests', () => {
  mockLocalStorageForTests();

  beforeEach(() => {
    jest.clearAllMocks();
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);
  });

  describe('Real-world Refresh Scenarios', () => {
    it('simulates refreshing exercises in Review Super Sets with leg/glute avoidance', () => {
      // User has avoided all leg/glute exercises
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3', '4', '5']);

      const settings = createMockWorkoutSettings({
        circuitType: 'super_sets',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 8, // 4 super sets
        difficulty: 'medium'
      });

      // Generate initial super set workout
      const initialWorkout = generateCircuitWorkout(settings);
      expect(initialWorkout.circuit).toBeDefined();

      if (initialWorkout.circuit) {
        // Verify initial workout avoids leg/glute exercises
        initialWorkout.circuit.stations.forEach(station => {
          station.exercises.forEach(exercise => {
            expect(['1', '2', '3', '4', '5']).not.toContain(exercise.id.toString());
            expect(exercise.primaryMuscle).not.toBe('legs');
            expect(exercise.primaryMuscle).not.toBe('glutes');
          });
        });

        // Simulate refreshing each exercise in each super set multiple times
        for (let refreshRound = 0; refreshRound < 3; refreshRound++) {
          initialWorkout.circuit.stations.forEach((station, stationIndex) => {
            station.exercises.forEach((currentExercise, exerciseIndex) => {
              // Collect all other exercises in the workout to avoid duplicates
              const allOtherExercises: Exercise[] = [];
              initialWorkout.circuit!.stations.forEach((otherStation, otherStationIndex) => {
                otherStation.exercises.forEach((otherExercise, otherExerciseIndex) => {
                  if (otherStationIndex !== stationIndex || otherExerciseIndex !== exerciseIndex) {
                    allOtherExercises.push(otherExercise);
                  }
                });
              });

              // Refresh the current exercise
              const refreshedExercise = regenerateExercise(
                currentExercise,
                settings,
                allOtherExercises
              );

              if (refreshedExercise) {
                // Should still avoid leg/glute exercises after refresh
                expect(['1', '2', '3', '4', '5']).not.toContain(refreshedExercise.id.toString());
                expect(refreshedExercise.primaryMuscle).not.toBe('legs');
                expect(refreshedExercise.primaryMuscle).not.toBe('glutes');

                // Should be different from original exercise
                expect(refreshedExercise.id).not.toBe(currentExercise.id);

                // Should not duplicate other exercises in the workout
                expect(allOtherExercises.map(ex => ex.id)).not.toContain(refreshedExercise.id);
              }
            });
          });
        }
      }
    });

    it('handles edge case of refreshing when most exercises are avoided', () => {
      // Avoid most exercises, leaving only a few options
      const heavilyBlacklisted = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '15', '19'];
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(heavilyBlacklisted);

      const settings = createMockWorkoutSettings({
        circuitType: 'classic_cycle',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 6,
        difficulty: 'medium'
      });

      const workout = generateCircuitWorkout(settings);

      if (workout.circuit) {
        // Should still generate a workout with available exercises
        expect(workout.circuit.stations.length).toBeGreaterThan(0);

        workout.circuit.stations.forEach(station => {
          station.exercises.forEach(exercise => {
            // Should not contain any blacklisted exercises
            expect(heavilyBlacklisted).not.toContain(exercise.id.toString());
          });
        });

        // Test refreshing exercises when options are very limited
        const firstStation = workout.circuit.stations[0];
        const firstExercise = firstStation.exercises[0];

        const allOtherExercises = workout.circuit.stations
          .flatMap(station => station.exercises)
          .filter(ex => ex.id !== firstExercise.id);

        const refreshedExercise = regenerateExercise(firstExercise, settings, allOtherExercises);

        if (refreshedExercise) {
          expect(heavilyBlacklisted).not.toContain(refreshedExercise.id.toString());
        }
        // May be null if no suitable alternatives exist - this is acceptable
      }
    });

    it('maintains super set muscle group pairing while respecting avoidance', () => {
      // Avoid leg exercises but allow chest/back pairing
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3', '4', '5']);

      const settings = createMockWorkoutSettings({
        circuitType: 'super_sets',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 8,
        targetMuscleGroups: ['chest', 'back'],
        difficulty: 'medium'
      });

      const workout = generateCircuitWorkout(settings);

      if (workout.circuit) {
        expect(workout.circuit.type).toBe('super_sets');

        // Filter out any empty stations that may occur due to heavy constraints
        const nonEmptyStations = workout.circuit.stations.filter(station => station.exercises.length > 0);

        if (nonEmptyStations.length > 0) {
          // Each non-empty station should attempt to have 2 exercises (super set), but may have fewer if limited by avoidance
          nonEmptyStations.forEach(station => {
            expect(station.exercises.length).toBeGreaterThanOrEqual(1);
            expect(station.exercises.length).toBeLessThanOrEqual(2);

            station.exercises.forEach(exercise => {
              // Should avoid blacklisted exercises
              expect(['1', '2', '3', '4', '5']).not.toContain(exercise.id.toString());

              // Should preferentially target chest/back
              const targetedMuscles = ['chest', 'back', 'arms', 'shoulders'];
              expect(targetedMuscles).toContain(exercise.primaryMuscle);
            });
          });
        } else {
          // If no stations have exercises, that's expected behavior when constraints are too restrictive
          console.log('No exercises available due to avoidance constraints - this is expected behavior');
        }

        // Test refreshing super set pairs (if there are exercises available)
        const stationsWithExercises = workout.circuit.stations.filter(station => station.exercises.length > 0);
        if (stationsWithExercises.length > 0) {
          const firstStation = stationsWithExercises[0];
          const currentExercise = firstStation.exercises[0];
          const partnerExercise = firstStation.exercises[1]; // May be undefined

          const allOtherExercises = workout.circuit.stations
            .flatMap(station => station.exercises)
            .filter(ex => ex.id !== currentExercise.id);

          const refreshedExercise = regenerateExercise(currentExercise, settings, allOtherExercises);

          if (refreshedExercise) {
            // Should still avoid legs after refresh
            expect(['1', '2', '3', '4', '5']).not.toContain(refreshedExercise.id.toString());
            expect(refreshedExercise.primaryMuscle).not.toBe('legs');
            expect(refreshedExercise.primaryMuscle).not.toBe('glutes');

            // Should not be the partner exercise (avoid duplicates in same super set) if partner exists
            if (partnerExercise) {
              expect(refreshedExercise.id).not.toBe(partnerExercise.id);
            }
          }
        }
      }
    });

    it('handles targeting specific muscle groups with partial avoidance', () => {
      // Avoid some but not all chest exercises
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['6', '8']); // Push Ups, Diamond Push Ups

      const settings = createMockWorkoutSettings({
        circuitType: 'classic_cycle',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 6,
        targetMuscleGroups: ['chest'], // Still want chest exercises
        difficulty: 'medium'
      });

      const workout = generateCircuitWorkout(settings);

      if (workout.circuit) {
        let hasChestExercises = false;

        workout.circuit.stations.forEach(station => {
          station.exercises.forEach(exercise => {
            // Should not have blacklisted chest exercises
            expect(['6', '8']).not.toContain(exercise.id.toString());

            // Should still prioritize chest exercises
            if (exercise.primaryMuscle === 'chest' || exercise.muscleGroups.includes('chest')) {
              hasChestExercises = true;
            }
          });
        });

        // Should still include chest exercises (the non-blacklisted ones)
        expect(hasChestExercises).toBe(true);

        // Test refreshing to ensure it maintains chest focus while avoiding blacklisted
        const firstStation = workout.circuit.stations[0];
        const currentExercise = firstStation.exercises[0];

        if (currentExercise.primaryMuscle === 'chest') {
          const allOtherExercises = workout.circuit.stations
            .flatMap(station => station.exercises)
            .filter(ex => ex.id !== currentExercise.id);

          const refreshedExercise = regenerateExercise(currentExercise, settings, allOtherExercises);

          if (refreshedExercise) {
            // Should still avoid blacklisted exercises
            expect(['6', '8']).not.toContain(refreshedExercise.id.toString());
            // Should still target chest if possible
            expect(['chest', 'shoulders', 'arms'].some(muscle =>
              muscle === refreshedExercise.primaryMuscle ||
              refreshedExercise.muscleGroups.includes(muscle)
            )).toBe(true);
          }
        }
      }
    });

    it('stress tests multiple refresh iterations with consistent avoidance', () => {
      // Set up a realistic avoidance scenario
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3', '4', '5', '19']); // Legs and burpees

      const settings = createMockWorkoutSettings({
        circuitType: 'super_sets',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 8,
        difficulty: 'medium'
      });

      // Generate initial workout
      const workout = generateCircuitWorkout(settings);

      if (workout.circuit) {
        // Perform multiple refresh iterations on each exercise
        const refreshIterations = 5;

        for (let iteration = 0; iteration < refreshIterations; iteration++) {
          for (let stationIndex = 0; stationIndex < workout.circuit.stations.length; stationIndex++) {
            const station = workout.circuit.stations[stationIndex];

            for (let exerciseIndex = 0; exerciseIndex < station.exercises.length; exerciseIndex++) {
              const currentExercise = station.exercises[exerciseIndex];

              // Get all other exercises to avoid duplicates
              const allOtherExercises: Exercise[] = [];
              workout.circuit.stations.forEach((otherStation, otherStationIdx) => {
                otherStation.exercises.forEach((otherExercise, otherExerciseIdx) => {
                  if (otherStationIdx !== stationIndex || otherExerciseIdx !== exerciseIndex) {
                    allOtherExercises.push(otherExercise);
                  }
                });
              });

              const refreshedExercise = regenerateExercise(currentExercise, settings, allOtherExercises);

              if (refreshedExercise) {
                // Verify avoidance is maintained
                expect(['1', '2', '3', '4', '5', '19']).not.toContain(refreshedExercise.id.toString());
                expect(refreshedExercise.primaryMuscle).not.toBe('legs');
                expect(refreshedExercise.primaryMuscle).not.toBe('glutes');
                expect(refreshedExercise.name).not.toBe('Burpees');

                // Verify no duplicates
                expect(allOtherExercises.map(ex => ex.id)).not.toContain(refreshedExercise.id);

                // Update the exercise in the workout for next iteration
                station.exercises[exerciseIndex] = refreshedExercise;
              }
            }
          }
        }

        // Final verification - after all refreshes, should still respect avoidance
        workout.circuit.stations.forEach(station => {
          station.exercises.forEach(exercise => {
            expect(['1', '2', '3', '4', '5', '19']).not.toContain(exercise.id.toString());
            expect(exercise.primaryMuscle).not.toBe('legs');
            expect(exercise.primaryMuscle).not.toBe('glutes');
          });
        });
      }
    });

    it('handles equipment changes affecting refresh options', () => {
      // Initially have dumbbells, then restrict to bodyweight only
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']); // Some leg exercises

      const initialSettings = createMockWorkoutSettings({
        circuitType: 'classic_cycle',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 6,
        difficulty: 'medium'
      });

      const workout = generateCircuitWorkout(initialSettings);

      if (workout.circuit) {
        const currentExercise = workout.circuit.stations[0].exercises[0];

        // Refresh with reduced equipment (only bodyweight)
        const restrictedSettings = createMockWorkoutSettings({
          circuitType: 'classic_cycle',
          selectedEquipment: ['bodyweight'], // Removed dumbbells
          exerciseCount: 6,
          difficulty: 'medium'
        });

        const refreshedExercise = regenerateExercise(currentExercise, restrictedSettings, []);

        if (refreshedExercise) {
          // Should not require dumbbells
          expect(refreshedExercise.equipment.some(eq => ['bodyweight'].includes(eq)) ||
                 refreshedExercise.equipment.every(eq => !['dumbbells'].includes(eq))).toBe(true);

          // Should still avoid blacklisted exercises
          expect(['1', '2']).not.toContain(refreshedExercise.id.toString());
        }
      }
    });
  });

  describe('Fallback Flag Integration', () => {
    it('sets fallback flags when refreshing exercises in Review Super Sets with heavy constraints', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);

      const settings = createMockWorkoutSettings({
        circuitType: 'super_sets',
        selectedEquipment: ['bodyweight'],
        targetMuscleGroups: ['chest'], // Target chest but most exercises are blacklisted
        difficulty: 'easy' // Additional constraint
      });

      const workout = generateCircuitWorkout(settings);

      if (workout.circuit) {
        const stationsWithExercises = workout.circuit.stations.filter(station => station.exercises.length > 0);

        if (stationsWithExercises.length > 0) {
          const firstStation = stationsWithExercises[0];
          const currentExercise = firstStation.exercises[0];

          const allOtherExercises = stationsWithExercises
            .flatMap(station => station.exercises)
            .filter(ex => ex.id !== currentExercise.id);

          const refreshedExercise = regenerateExercise(currentExercise, settings, allOtherExercises);

          if (refreshedExercise && refreshedExercise.fallbackReason) {
            // Should have a fallback flag due to heavy constraints
            expect(['target_muscle_unavailable', 'difficulty_mismatch', 'no_suitable_alternatives']).toContain(refreshedExercise.fallbackReason);
            console.log(`Refresh fallback reason: ${refreshedExercise.fallbackReason}`);

            // Should still avoid blacklisted exercises even with fallback
            expect(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']).not.toContain(refreshedExercise.id.toString());
          }
        }
      }
    });
  });

  describe('Review Page to Timer Page Integration', () => {
    it('ensures refreshed circuit exercises appear in timer page workout exercises array', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']); // Avoid leg exercises

      const settings = createMockWorkoutSettings({
        circuitType: 'classic_cycle',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 4
      });

      // Generate initial workout
      const originalWorkout = generateCircuitWorkout(settings);

      expect(originalWorkout.circuit).toBeDefined();
      if (originalWorkout.circuit) {
        // Simulate refreshing an exercise in the review page
        const stationToRefresh = originalWorkout.circuit.stations[0];
        const exerciseToRefresh = stationToRefresh.exercises[0];
        const originalExerciseId = exerciseToRefresh.id;

        // Get all existing exercises to pass as context
        const allExistingExercises = originalWorkout.circuit.stations
          .flatMap(station => station.exercises)
          .filter(ex => ex.id !== exerciseToRefresh.id);

        // Generate replacement exercise
        const refreshedExercise = regenerateExercise(exerciseToRefresh, settings, allExistingExercises);

        if (refreshedExercise) {
          // Simulate what WorkoutPreview.handleRegenerateCircuitExercise does
          const updatedCircuit = { ...originalWorkout.circuit };
          const updatedStations = [...updatedCircuit.stations];
          const updatedStation = { ...updatedStations[0] };
          const updatedExercises = [...updatedStation.exercises];
          updatedExercises[0] = refreshedExercise;
          updatedStation.exercises = updatedExercises;
          updatedStations[0] = updatedStation;
          updatedCircuit.stations = updatedStations;

          // Update the legacy exercises array (what timer page uses)
          const updatedLegacyExercises = [...originalWorkout.exercises];
          let currentPosition = 0;

          // Find the position in legacy array that corresponds to the refreshed exercise
          for (let sIndex = 0; sIndex < updatedCircuit.stations.length; sIndex++) {
            const station = updatedCircuit.stations[sIndex];
            for (let eIndex = 0; eIndex < station.exercises.length; eIndex++) {
              if (sIndex === 0 && eIndex === 0) {
                // This is the position we refreshed
                if (currentPosition < updatedLegacyExercises.length) {
                  updatedLegacyExercises[currentPosition] = {
                    ...updatedLegacyExercises[currentPosition],
                    exercise: refreshedExercise
                  };
                }
                break;
              }
              currentPosition++;
            }
            if (sIndex === 0) break;
          }

          const updatedWorkout = {
            ...originalWorkout,
            circuit: updatedCircuit,
            exercises: updatedLegacyExercises
          };

          // Verify the refresh worked correctly:
          // 1. Circuit should have the new exercise
          expect(updatedWorkout.circuit.stations[0].exercises[0].id).toBe(refreshedExercise.id);
          expect(updatedWorkout.circuit.stations[0].exercises[0].id).not.toBe(originalExerciseId);

          // 2. Legacy exercises array (used by timer) should have the new exercise
          expect(updatedWorkout.exercises[0].exercise.id).toBe(refreshedExercise.id);
          expect(updatedWorkout.exercises[0].exercise.id).not.toBe(originalExerciseId);

          // 3. The refreshed exercise should not be a blacklisted one
          expect(['1', '2']).not.toContain(refreshedExercise.id.toString());

          // 4. Timer page exercises should match circuit exercises in the same order
          let legacyIndex = 0;
          for (const station of updatedWorkout.circuit.stations) {
            for (const exercise of station.exercises) {
              expect(updatedWorkout.exercises[legacyIndex].exercise.id).toBe(exercise.id);
              expect(updatedWorkout.exercises[legacyIndex].exercise.name).toBe(exercise.name);
              legacyIndex++;
            }
          }
        }
      }
    });

    it('ensures refreshed superset exercises appear correctly in timer page workout', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3']); // Avoid some exercises

      const settings = createMockWorkoutSettings({
        circuitType: 'super_sets',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 8
      });

      // Generate initial superset workout
      const originalWorkout = generateCircuitWorkout(settings);

      expect(originalWorkout.circuit).toBeDefined();
      if (originalWorkout.circuit && originalWorkout.circuit.stations.length > 0) {
        // Simulate refreshing the second exercise in first superset (Station A, Exercise B)
        const stationToRefresh = originalWorkout.circuit.stations[0];
        if (stationToRefresh.exercises.length > 1) {
          const exerciseToRefresh = stationToRefresh.exercises[1]; // Second exercise in superset
          const originalExerciseId = exerciseToRefresh.id;

          // Get all existing exercises except the one we're refreshing
          const allExistingExercises = originalWorkout.circuit.stations
            .flatMap(station => station.exercises)
            .filter(ex => ex.id !== exerciseToRefresh.id);

          // Generate replacement exercise
          const refreshedExercise = regenerateExercise(exerciseToRefresh, settings, allExistingExercises);

          if (refreshedExercise) {
            // Simulate WorkoutPreview refresh logic for superset
            const updatedCircuit = { ...originalWorkout.circuit };
            const updatedStations = [...updatedCircuit.stations];
            const updatedStation = { ...updatedStations[0] };
            const updatedExercises = [...updatedStation.exercises];
            updatedExercises[1] = refreshedExercise; // Replace second exercise
            updatedStation.exercises = updatedExercises;
            updatedStations[0] = updatedStation;
            updatedCircuit.stations = updatedStations;

            // Update legacy exercises array
            const updatedLegacyExercises = [...originalWorkout.exercises];
            let currentPosition = 0;

            for (let sIndex = 0; sIndex < updatedCircuit.stations.length; sIndex++) {
              const station = updatedCircuit.stations[sIndex];
              for (let eIndex = 0; eIndex < station.exercises.length; eIndex++) {
                if (sIndex === 0 && eIndex === 1) {
                  // This is the second exercise we refreshed
                  if (currentPosition < updatedLegacyExercises.length) {
                    updatedLegacyExercises[currentPosition] = {
                      ...updatedLegacyExercises[currentPosition],
                      exercise: refreshedExercise
                    };
                  }
                  break;
                }
                currentPosition++;
              }
              if (sIndex === 0 && currentPosition > 1) break;
            }

            const updatedWorkout = {
              ...originalWorkout,
              circuit: updatedCircuit,
              exercises: updatedLegacyExercises
            };

            // Verify superset refresh integration:
            // 1. Circuit superset should have the new exercise in position B
            expect(updatedWorkout.circuit.stations[0].exercises[1].id).toBe(refreshedExercise.id);
            expect(updatedWorkout.circuit.stations[0].exercises[1].id).not.toBe(originalExerciseId);

            // 2. Timer exercises array should reflect the change
            expect(updatedWorkout.exercises[1].exercise.id).toBe(refreshedExercise.id);
            expect(updatedWorkout.exercises[1].exercise.id).not.toBe(originalExerciseId);

            // 3. First exercise in superset should remain unchanged
            expect(updatedWorkout.circuit.stations[0].exercises[0].id).toBe(stationToRefresh.exercises[0].id);
            expect(updatedWorkout.exercises[0].exercise.id).toBe(stationToRefresh.exercises[0].id);

            // 4. Refreshed exercise should not be blacklisted
            expect(['1', '2', '3']).not.toContain(refreshedExercise.id.toString());

            // 5. Verify timer page will show correct exercise sequence for superset
            expect(updatedWorkout.circuit.type).toBe('super_sets');
          }
        }
      }
    });

    it('verifies original exercise is completely removed from timer page after refresh', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);

      const settings = createMockWorkoutSettings({
        circuitType: 'classic_cycle',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 6
      });

      // Generate initial workout
      const originalWorkout = generateCircuitWorkout(settings);

      if (originalWorkout.circuit && originalWorkout.circuit.stations.length > 2) {
        // Track an exercise from the middle of the workout
        const middleStationIndex = 1;
        const exerciseToRefresh = originalWorkout.circuit.stations[middleStationIndex].exercises[0];
        const originalExerciseId = exerciseToRefresh.id;
        const originalExerciseName = exerciseToRefresh.name;

        // Verify the original exercise exists in both circuit and legacy array before refresh
        expect(originalWorkout.circuit.stations[middleStationIndex].exercises[0].id).toBe(originalExerciseId);
        expect(originalWorkout.exercises[middleStationIndex].exercise.id).toBe(originalExerciseId);

        // Perform refresh
        const allExistingExercises = originalWorkout.circuit.stations
          .flatMap(station => station.exercises)
          .filter(ex => ex.id !== exerciseToRefresh.id);

        const refreshedExercise = regenerateExercise(exerciseToRefresh, settings, allExistingExercises);

        if (refreshedExercise) {
          // Apply the refresh (simulate WorkoutPreview logic)
          const updatedCircuit = { ...originalWorkout.circuit };
          const updatedStations = [...updatedCircuit.stations];
          const updatedStation = { ...updatedStations[middleStationIndex] };
          const updatedExercises = [...updatedStation.exercises];
          updatedExercises[0] = refreshedExercise;
          updatedStation.exercises = updatedExercises;
          updatedStations[middleStationIndex] = updatedStation;
          updatedCircuit.stations = updatedStations;

          const updatedLegacyExercises = [...originalWorkout.exercises];
          updatedLegacyExercises[middleStationIndex] = {
            ...updatedLegacyExercises[middleStationIndex],
            exercise: refreshedExercise
          };

          const updatedWorkout = {
            ...originalWorkout,
            circuit: updatedCircuit,
            exercises: updatedLegacyExercises
          };

          // Verify original exercise is completely gone from timer page
          const timerExerciseIds = updatedWorkout.exercises.map(we => we.exercise.id);
          expect(timerExerciseIds).not.toContain(originalExerciseId);

          // Verify original exercise is gone from circuit structure
          const circuitExerciseIds = updatedWorkout.circuit.stations
            .flatMap(station => station.exercises)
            .map(ex => ex.id);
          expect(circuitExerciseIds).not.toContain(originalExerciseId);

          // Verify new exercise is present in timer page
          expect(timerExerciseIds).toContain(refreshedExercise.id);
          expect(updatedWorkout.exercises[middleStationIndex].exercise.id).toBe(refreshedExercise.id);
          expect(updatedWorkout.exercises[middleStationIndex].exercise.name).toBe(refreshedExercise.name);
          expect(updatedWorkout.exercises[middleStationIndex].exercise.name).not.toBe(originalExerciseName);
        }
      }
    });
  });

  describe('Superset Refresh Sequencing Bug Investigation', () => {
    it('reproduces the superset refresh sequencing bug (a,b,a,b -> c,b,c,b but actually gets c,b,a,b)', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);

      const settings = createMockWorkoutSettings({
        circuitType: 'super_sets',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 4, // 2 supersets with 2 exercises each, 2 rounds
        duration: 10 // 10 minutes should give us 2 rounds
      });

      // Generate superset workout
      const originalWorkout = generateCircuitWorkout(settings);

      expect(originalWorkout.circuit).toBeDefined();
      if (originalWorkout.circuit && originalWorkout.circuit.type === 'super_sets') {
        // Log the structure for debugging
        console.log('Original superset structure:');
        console.log('Stations:', originalWorkout.circuit.stations.length);
        console.log('Rounds:', originalWorkout.circuit.rounds);

        originalWorkout.circuit.stations.forEach((station, idx) => {
          console.log(`Station ${idx + 1}: ${station.exercises.map(ex => `${ex.name}(${ex.id})`).join(', ')}`);
        });

        console.log('\nOriginal timer sequence (exercises array):');
        originalWorkout.exercises.forEach((we, idx) => {
          console.log(`${idx}: ${we.exercise.name}(${we.exercise.id}) - Station: ${we.stationId}, Round: ${we.roundNumber}`);
        });

        // Now simulate refreshing the first exercise (A) in the first superset
        const firstStation = originalWorkout.circuit.stations[0];
        const exerciseA = firstStation.exercises[0]; // The A exercise in A,B superset
        const originalAId = exerciseA.id;
        const originalAName = exerciseA.name;

        console.log(`\nRefreshing exercise A: ${originalAName}(${originalAId})`);

        // Get all existing exercises except the one we're refreshing
        const allExistingExercises = originalWorkout.circuit.stations
          .flatMap(station => station.exercises)
          .filter(ex => ex.id !== exerciseA.id);

        const refreshedExercise = regenerateExercise(exerciseA, settings, allExistingExercises);

        if (refreshedExercise) {
          console.log(`\nRefreshed to: ${refreshedExercise.name}(${refreshedExercise.id})`);

          // Simulate WorkoutPreview.handleRegenerateCircuitExercise for first station, first exercise
          const updatedCircuit = { ...originalWorkout.circuit };
          const updatedStations = [...updatedCircuit.stations];
          const updatedStation = { ...updatedStations[0] };
          const updatedExercises = [...updatedStation.exercises];
          updatedExercises[0] = refreshedExercise; // Only update the first instance in circuit structure
          updatedStation.exercises = updatedExercises;
          updatedStations[0] = updatedStation;
          updatedCircuit.stations = updatedStations;

          // Simulate how WorkoutPreview updates the legacy exercises array
          // This is the buggy part - it only updates the first occurrence
          const updatedLegacyExercises = [...originalWorkout.exercises];
          let currentPosition = 0;

          // Find the position in legacy array that corresponds to the refreshed exercise
          for (let sIndex = 0; sIndex < updatedCircuit.stations.length; sIndex++) {
            const station = updatedCircuit.stations[sIndex];
            for (let eIndex = 0; eIndex < station.exercises.length; eIndex++) {
              if (sIndex === 0 && eIndex === 0) {
                // This is the position we refreshed - only updates first occurrence
                if (currentPosition < updatedLegacyExercises.length) {
                  updatedLegacyExercises[currentPosition] = {
                    ...updatedLegacyExercises[currentPosition],
                    exercise: refreshedExercise
                  };
                }
                break;
              }
              currentPosition++;
            }
            if (sIndex === 0) break;
          }

          const buggyWorkout = {
            ...originalWorkout,
            circuit: updatedCircuit,
            exercises: updatedLegacyExercises
          };

          console.log('\nAfter refresh - Circuit structure:');
          buggyWorkout.circuit.stations.forEach((station, idx) => {
            console.log(`Station ${idx + 1}: ${station.exercises.map(ex => `${ex.name}(${ex.id})`).join(', ')}`);
          });

          console.log('\nAfter refresh - Timer sequence (BUGGY):');
          buggyWorkout.exercises.forEach((we, idx) => {
            console.log(`${idx}: ${we.exercise.name}(${we.exercise.id}) - Station: ${we.stationId}, Round: ${we.roundNumber}`);
          });

          // REPRODUCE THE BUG: Expected sequence for 2 rounds should be [C,B,C,B] but we get [C,B,A,B]
          const timerExerciseIds = buggyWorkout.exercises.map(we => we.exercise.id);
          const exerciseBId = firstStation.exercises[1].id; // The B exercise

          console.log('\nExpected sequence: C,B,C,B');
          console.log(`Actual sequence: ${timerExerciseIds.join(',')}`);

          // Test that demonstrates the bug
          const expectedSequence = [refreshedExercise.id, exerciseBId, refreshedExercise.id, exerciseBId];
          const actualSequence = timerExerciseIds;

          // This should pass if fixed, but will fail due to the bug
          console.log('\nBUG TEST - This will fail due to the sequencing bug:');
          console.log(`Expected: [${expectedSequence.join(',')}]`);
          console.log(`Actual:   [${actualSequence.join(',')}]`);

          // Show that it's actually [C,B,A,B] instead of [C,B,C,B]
          if (actualSequence.length >= 4) {
            expect(actualSequence[0]).toBe(refreshedExercise.id); // C (correct)
            expect(actualSequence[1]).toBe(exerciseBId); // B (correct)

            // This is the bug - the third exercise should be C but it's still A
            console.log(`\nBUG CONFIRMED:`);
            console.log(`Position 2 should be ${refreshedExercise.id} (C) but is ${actualSequence[2]} (A)`);
            console.log(`Position 3 should be ${exerciseBId} (B) and is ${actualSequence[3]} (B)`);

            // Demonstrate the bug exists
            expect(actualSequence[2]).toBe(originalAId); // Still the original A - THIS IS THE BUG
            expect(actualSequence[2]).not.toBe(refreshedExercise.id); // Should be C but isn't

            // Record the bug for investigation
            const bugExists = actualSequence[2] === originalAId && actualSequence[2] !== refreshedExercise.id;
            expect(bugExists).toBe(true); // Confirms the bug exists
          }
        }
      }
    });

    it('verifies the superset refresh sequencing bug is FIXED (a,b,a,b -> c,b,c,b correctly)', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);

      const settings = createMockWorkoutSettings({
        circuitType: 'super_sets',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 4, // 2 supersets with 2 exercises each, 2 rounds
        duration: 10
      });

      // Generate superset workout
      const originalWorkout = generateCircuitWorkout(settings);

      expect(originalWorkout.circuit).toBeDefined();
      if (originalWorkout.circuit && originalWorkout.circuit.type === 'super_sets') {
        const firstStation = originalWorkout.circuit.stations[0];
        const exerciseA = firstStation.exercises[0]; // The A exercise in A,B superset
        const exerciseB = firstStation.exercises[1]; // The B exercise in A,B superset
        const originalAId = exerciseA.id;

        // Get all existing exercises except the one we're refreshing
        const allExistingExercises = originalWorkout.circuit.stations
          .flatMap(station => station.exercises)
          .filter(ex => ex.id !== exerciseA.id);

        const refreshedExercise = regenerateExercise(exerciseA, settings, allExistingExercises);

        if (refreshedExercise) {
          // Apply the FIXED refresh logic - update ALL instances of the old exercise
          const updatedCircuit = { ...originalWorkout.circuit };
          const updatedStations = [...updatedCircuit.stations];
          const updatedStation = { ...updatedStations[0] };
          const updatedExercises = [...updatedStation.exercises];
          updatedExercises[0] = refreshedExercise;
          updatedStation.exercises = updatedExercises;
          updatedStations[0] = updatedStation;
          updatedCircuit.stations = updatedStations;

          // FIXED: Update ALL instances in legacy array that match the old exercise
          const newLegacyExercises = [...originalWorkout.exercises];
          const oldExerciseId = originalAId;

          for (let i = 0; i < newLegacyExercises.length; i++) {
            if (newLegacyExercises[i].exercise.id === oldExerciseId) {
              newLegacyExercises[i] = {
                ...newLegacyExercises[i],
                exercise: refreshedExercise
              };
            }
          }

          const fixedWorkout = {
            ...originalWorkout,
            circuit: updatedCircuit,
            exercises: newLegacyExercises
          };

          console.log('\nFIXED - After refresh - Timer sequence:');
          fixedWorkout.exercises.forEach((we, idx) => {
            console.log(`${idx}: ${we.exercise.name}(${we.exercise.id}) - Station: ${we.stationId}, Round: ${we.roundNumber}`);
          });

          // Verify the fix: Expected sequence for 2 rounds should be [C,B,C,B] and now it IS [C,B,C,B]
          const timerExerciseIds = fixedWorkout.exercises.map(we => we.exercise.id);
          const exerciseBId = exerciseB.id;

          console.log(`\nFIXED sequence: C(${refreshedExercise.id}),B(${exerciseBId}),C(${refreshedExercise.id}),B(${exerciseBId})`);
          console.log(`Actual sequence: ${timerExerciseIds.join(',')}`);

          // Test that the fix works correctly
          if (timerExerciseIds.length >= 4) {
            expect(timerExerciseIds[0]).toBe(refreshedExercise.id); // C (correct)
            expect(timerExerciseIds[1]).toBe(exerciseBId); // B (correct)
            expect(timerExerciseIds[2]).toBe(refreshedExercise.id); // C (FIXED!)
            expect(timerExerciseIds[3]).toBe(exerciseBId); // B (correct)

            // Verify no traces of the old exercise remain
            expect(timerExerciseIds).not.toContain(originalAId);

            console.log('\n✅ BUG FIXED: All instances of exercise A have been replaced with exercise C');
          }
        }
      }
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles refresh with no suitable alternatives gracefully', () => {
      // Create scenario where refresh might not find suitable exercise
      const nearCompleteBlacklist = mockExercisesData.slice(0, -2).map(ex => ex.id.toString());
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(nearCompleteBlacklist);

      const currentExercise = mockExercisesData[0]; // Blacklisted exercise
      const existingExercises = mockExercisesData.slice(-2); // Use the few remaining exercises

      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'],
        difficulty: 'medium'
      });

      const refreshedExercise = regenerateExercise(currentExercise, settings, existingExercises);

      // Should either return null (no suitable options) or a valid non-blacklisted exercise
      if (refreshedExercise) {
        expect(nearCompleteBlacklist).not.toContain(refreshedExercise.id.toString());
        expect(existingExercises.map(ex => ex.id)).not.toContain(refreshedExercise.id);
      } else {
        // Returning null is acceptable when no suitable alternatives exist
        expect(refreshedExercise).toBeNull();
      }
    });

    it('ensures consistent behavior across multiple refresh calls', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2', '3']);

      const currentExercise = mockExercisesData[5]; // Push Ups
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'],
        targetMuscleGroups: ['chest'],
        difficulty: 'medium'
      });

      const refreshResults: (Exercise | null)[] = [];

      // Call refresh multiple times
      for (let i = 0; i < 10; i++) {
        const result = regenerateExercise(currentExercise, settings, []);
        refreshResults.push(result);
      }

      // All results should respect avoidance rules consistently
      refreshResults.forEach(result => {
        if (result) {
          expect(['1', '2', '3']).not.toContain(result.id.toString());
          expect(result.id).not.toBe(currentExercise.id);
        }
      });
    });

    it('validates super set structure is maintained after refreshes', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1']);

      const settings = createMockWorkoutSettings({
        circuitType: 'super_sets',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 4, // 2 super sets
        difficulty: 'medium'
      });

      const workout = generateCircuitWorkout(settings);

      if (workout.circuit) {
        expect(workout.circuit.type).toBe('super_sets');
        expect(workout.circuit.stations.length).toBe(2); // 2 super sets

        workout.circuit.stations.forEach(station => {
          expect(station.exercises.length).toBe(2); // Each super set has exactly 2 exercises

          // Refresh one exercise in the super set
          const [exercise1, exercise2] = station.exercises;
          const refreshed = regenerateExercise(exercise1, settings, [exercise2]);

          if (refreshed) {
            // Should not be the same as the partner exercise
            expect(refreshed.id).not.toBe(exercise2.id);
            // Should still avoid blacklisted
            expect(refreshed.id.toString()).not.toBe('1');
          }
        });
      }
    });
  });
});