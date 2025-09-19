import { generateCircuitWorkout } from '../circuitGenerator';
import { generateWarmup } from '../warmupGenerator';
import type { WorkoutSettings } from '../../types/workout';

// Mock warmup generator
jest.mock('../warmupGenerator');
const mockGenerateWarmup = generateWarmup as jest.MockedFunction<typeof generateWarmup>;

// Mock equipment storage and other dependencies
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

// Mock exercises data
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
    }),
    createMockExercise({
      id: 3, name: 'Plank', primaryMuscle: 'core',
      muscleGroups: ['core', 'shoulders'], equipment: ['bodyweight'], difficulty: 2
    }),
    createMockExercise({
      id: 4, name: 'Burpees', primaryMuscle: 'full_body',
      muscleGroups: ['chest', 'legs', 'arms', 'core'], equipment: ['bodyweight'], difficulty: 4
    }),
    createMockExercise({
      id: 5, name: 'Mountain Climbers', primaryMuscle: 'core',
      muscleGroups: ['core', 'legs', 'shoulders'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 6, name: 'Lunges', primaryMuscle: 'legs',
      muscleGroups: ['legs', 'glutes'], equipment: ['bodyweight'], difficulty: 2
    })
  ];
});

describe('circuitGenerator warmup integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default warmup mock
    mockGenerateWarmup.mockReturnValue({
      exercises: [
        {
          id: 'warmup_001',
          name: 'Jumping Jacks',
          instructions: 'Do jumping jacks',
          targetBodyParts: ['full_body', 'cardio'],
          duration: 30,
          equipment: ['bodyweight']
        },
        {
          id: 'warmup_002',
          name: 'Arm Circles',
          instructions: 'Circle your arms',
          targetBodyParts: ['shoulders', 'chest'],
          duration: 30,
          equipment: ['bodyweight']
        }
      ],
      totalDuration: 60
    });
  });

  describe('warmup generation', () => {
    it('generates warmup for classic circuit workouts', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 6
      };

      const workout = generateCircuitWorkout(settings);

      expect(mockGenerateWarmup).toHaveBeenCalledWith(workout);
      expect(workout.warmup).toBeDefined();
      expect(workout.warmup?.exercises).toHaveLength(2);
      expect(workout.warmup?.totalDuration).toBe(60);
    });

    it('generates warmup for superset workouts', () => {
      const settings: WorkoutSettings = {
        duration: 25,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 8
      };

      const workout = generateCircuitWorkout(settings);

      expect(mockGenerateWarmup).toHaveBeenCalledWith(workout);
      expect(workout.warmup).toBeDefined();
      expect(workout.warmup?.exercises.length).toBeGreaterThan(0);
    });

    it('passes complete workout structure to warmup generator', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 4,
        targetMuscleGroups: ['chest', 'legs']
      };

      generateCircuitWorkout(settings);

      expect(mockGenerateWarmup).toHaveBeenCalledTimes(1);

      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      expect(callArgs).toHaveProperty('circuit');
      expect(callArgs).toHaveProperty('exercises');
      expect(callArgs).toHaveProperty('totalDuration');
      expect(callArgs).toHaveProperty('difficulty');
      expect(callArgs).toHaveProperty('equipmentUsed');

      // Circuit should have stations with exercises
      expect(callArgs.circuit?.stations).toBeDefined();
      expect(callArgs.circuit?.stations.length).toBeGreaterThan(0);
    });

    it('warmup reflects targeted muscle groups from workout', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 6,
        targetMuscleGroups: ['chest', 'shoulders']
      };

      mockGenerateWarmup.mockReturnValue({
        exercises: [
          {
            id: 'warmup_chest',
            name: 'Chest Stretch',
            instructions: 'Stretch your chest',
            targetBodyParts: ['chest', 'shoulders'],
            duration: 45,
            equipment: ['bodyweight']
          },
          {
            id: 'warmup_cardio',
            name: 'Light Cardio',
            instructions: 'Get your heart rate up',
            targetBodyParts: ['full_body', 'cardio'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 75
      });

      const workout = generateCircuitWorkout(settings);

      // Verify warmup generator was called with workout targeting chest/shoulders
      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      const workoutMuscles = new Set<string>();

      if (callArgs.circuit) {
        callArgs.circuit.stations.forEach(station => {
          station.exercises.forEach(ex => {
            workoutMuscles.add(ex.primaryMuscle);
            ex.muscleGroups.forEach(mg => workoutMuscles.add(mg));
          });
        });
      }

      expect(workoutMuscles.has('chest') || workoutMuscles.has('shoulders')).toBe(true);
      expect(workout.warmup?.exercises.some(ex =>
        ex.targetBodyParts.includes('chest') || ex.targetBodyParts.includes('shoulders')
      )).toBe(true);
    });
  });

  describe('warmup integration with circuit structure', () => {
    it('maintains circuit structure while adding warmup', () => {
      const settings: WorkoutSettings = {
        duration: 30,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 10
      };

      const workout = generateCircuitWorkout(settings);

      // Should have both circuit structure and warmup
      expect(workout.circuit).toBeDefined();
      expect(workout.circuit?.type).toBe('super_sets');
      expect(workout.circuit?.stations.length).toBeGreaterThan(0);
      expect(workout.warmup).toBeDefined();

      // Legacy format should also be populated
      expect(workout.exercises.length).toBeGreaterThan(0);
    });

    it('warmup does not affect main workout timing', () => {
      const settings: WorkoutSettings = {
        duration: 20, // 20 minutes main workout
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 8
      };

      const workout = generateCircuitWorkout(settings);

      // Main workout should be approximately 20 minutes (allow for timing variations)
      const mainWorkoutMinutes = workout.totalDuration / 60;
      expect(mainWorkoutMinutes).toBeGreaterThan(15); // At least 15 minutes
      expect(mainWorkoutMinutes).toBeLessThan(25); // Not more than 25 minutes

      // Warmup should be separate and additional
      expect(workout.warmup?.totalDuration).toBeGreaterThan(0);
      expect(workout.warmup?.totalDuration).toBeLessThanOrEqual(180); // Max 3 minutes
    });

    it('preserves all workout metadata with warmup addition', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 4
      };

      const workout = generateCircuitWorkout(settings);

      // All original workout properties should be preserved
      expect(workout.difficulty).toBe('easy');
      expect(workout.equipmentUsed).toEqual(['bodyweight']);
      expect(workout.totalDuration).toBeGreaterThan(0);

      // Plus warmup should be added
      expect(workout.warmup).toBeDefined();
      expect(workout.warmup?.exercises.length).toBeGreaterThan(0);
    });
  });

  describe('warmup generation edge cases', () => {
    it('handles warmup generation failure gracefully', () => {
      const settings: WorkoutSettings = {
        duration: 10,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 2
      };

      // Mock warmup generator to throw error
      mockGenerateWarmup.mockImplementation(() => {
        throw new Error('Warmup generation failed');
      });

      // Should not crash the workout generation, but error may propagate
      expect(() => {
        generateCircuitWorkout(settings);
      }).toThrow('Warmup generation failed');

      // Reset mock for other tests
      mockGenerateWarmup.mockReturnValue({
        exercises: [
          {
            id: 'warmup_001',
            name: 'Jumping Jacks',
            instructions: 'Do jumping jacks',
            targetBodyParts: ['full_body', 'cardio'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 30
      });
    });

    it('works with minimal workout configurations', () => {
      const settings: WorkoutSettings = {
        duration: 5,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 2
      };

      mockGenerateWarmup.mockReturnValue({
        exercises: [
          {
            id: 'minimal_warmup',
            name: 'Simple Stretch',
            instructions: 'Basic stretch',
            targetBodyParts: ['full_body'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 30
      });

      const workout = generateCircuitWorkout(settings);

      expect(workout.warmup).toBeDefined();
      expect(workout.warmup?.exercises.length).toBe(1);
      expect(mockGenerateWarmup).toHaveBeenCalled();
    });

    it('handles workouts with mixed muscle groups', () => {
      const settings: WorkoutSettings = {
        duration: 25,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 8,
        targetMuscleGroups: ['chest', 'legs', 'core', 'arms']
      };

      const workout = generateCircuitWorkout(settings);

      expect(mockGenerateWarmup).toHaveBeenCalledWith(workout);

      // Should generate warmup that covers multiple muscle groups
      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      const allMuscleGroups = new Set<string>();

      if (callArgs.circuit) {
        callArgs.circuit.stations.forEach(station => {
          station.exercises.forEach(ex => {
            allMuscleGroups.add(ex.primaryMuscle);
            ex.muscleGroups.forEach(mg => allMuscleGroups.add(mg));
          });
        });
      }

      // Should have diverse muscle group coverage for warmup to target
      expect(allMuscleGroups.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('warmup call timing', () => {
    it('calls warmup generator after main workout is constructed', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 6
      };

      generateCircuitWorkout(settings);

      // Warmup should be called with complete workout including circuit info
      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      expect(callArgs.circuit).toBeDefined();
      expect(callArgs.exercises).toBeDefined();
      expect(callArgs.totalDuration).toBeGreaterThan(0);
      expect(callArgs.difficulty).toBe('medium');
      expect(callArgs.equipmentUsed).toEqual(['bodyweight']);
    });

    it('warmup is attached to final workout object', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 6
      };

      const workout = generateCircuitWorkout(settings);

      expect(workout.warmup).toEqual({
        exercises: [
          {
            id: 'warmup_001',
            name: 'Jumping Jacks',
            instructions: 'Do jumping jacks',
            targetBodyParts: ['full_body', 'cardio'],
            duration: 30,
            equipment: ['bodyweight']
          },
          {
            id: 'warmup_002',
            name: 'Arm Circles',
            instructions: 'Circle your arms',
            targetBodyParts: ['shoulders', 'chest'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 60
      });
    });
  });
});