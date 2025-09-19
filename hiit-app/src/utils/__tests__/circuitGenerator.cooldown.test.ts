import { generateCircuitWorkout } from '../circuitGenerator';
import { generateCooldown } from '../cooldownGenerator';
import type { WorkoutSettings } from '../../types/workout';

// Mock cooldown generator
jest.mock('../cooldownGenerator');
const mockGenerateCooldown = generateCooldown as jest.MockedFunction<typeof generateCooldown>;

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

describe('circuitGenerator cooldown integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default cooldown mock
    mockGenerateCooldown.mockReturnValue({
      exercises: [
        {
          id: 'cooldown_001',
          name: 'Standing Hamstring Stretch',
          instructions: 'Stretch your hamstrings',
          targetBodyParts: ['hamstrings', 'legs'],
          duration: 30,
          equipment: ['bodyweight']
        },
        {
          id: 'cooldown_002',
          name: 'Chest Stretch',
          instructions: 'Stretch your chest muscles',
          targetBodyParts: ['chest', 'shoulders'],
          duration: 45,
          equipment: ['bodyweight']
        }
      ],
      totalDuration: 75
    });
  });

  describe('cooldown generation', () => {
    it('generates cooldown for classic circuit workouts', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 6
      };

      const workout = generateCircuitWorkout(settings);

      expect(mockGenerateCooldown).toHaveBeenCalledWith(workout);
      expect(workout.cooldown).toBeDefined();
      expect(workout.cooldown?.exercises).toHaveLength(2);
      expect(workout.cooldown?.totalDuration).toBe(75);
    });

    it('generates cooldown for superset workouts', () => {
      const settings: WorkoutSettings = {
        duration: 25,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 8
      };

      const workout = generateCircuitWorkout(settings);

      expect(mockGenerateCooldown).toHaveBeenCalledWith(workout);
      expect(workout.cooldown).toBeDefined();
      expect(workout.cooldown?.exercises.length).toBeGreaterThan(0);
    });

    it('passes complete workout structure to cooldown generator', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 4,
        targetMuscleGroups: ['chest', 'legs']
      };

      generateCircuitWorkout(settings);

      expect(mockGenerateCooldown).toHaveBeenCalledTimes(1);

      const callArgs = mockGenerateCooldown.mock.calls[0][0];
      expect(callArgs).toHaveProperty('circuit');
      expect(callArgs).toHaveProperty('exercises');
      expect(callArgs).toHaveProperty('totalDuration');
      expect(callArgs).toHaveProperty('difficulty');
      expect(callArgs).toHaveProperty('equipmentUsed');

      // Circuit should have stations with exercises
      expect(callArgs.circuit?.stations).toBeDefined();
      expect(callArgs.circuit?.stations.length).toBeGreaterThan(0);
    });

    it('cooldown reflects targeted muscle groups from workout', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 6,
        targetMuscleGroups: ['chest', 'shoulders']
      };

      mockGenerateCooldown.mockReturnValue({
        exercises: [
          {
            id: 'cooldown_chest',
            name: 'Chest Stretch',
            instructions: 'Stretch your chest',
            targetBodyParts: ['chest', 'shoulders'],
            duration: 45,
            equipment: ['bodyweight']
          },
          {
            id: 'cooldown_recovery',
            name: 'Child\'s Pose',
            instructions: 'Full body recovery stretch',
            targetBodyParts: ['back', 'spine', 'hips'],
            duration: 60,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 105
      });

      const workout = generateCircuitWorkout(settings);

      // Verify cooldown generator was called with workout targeting chest/shoulders
      const callArgs = mockGenerateCooldown.mock.calls[0][0];
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
      expect(workout.cooldown?.exercises.some(ex =>
        ex.targetBodyParts.includes('chest') || ex.targetBodyParts.includes('shoulders')
      )).toBe(true);
    });
  });

  describe('cooldown integration with circuit structure', () => {
    it('maintains circuit structure while adding cooldown', () => {
      const settings: WorkoutSettings = {
        duration: 30,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 10
      };

      const workout = generateCircuitWorkout(settings);

      // Should have both circuit structure and cooldown
      expect(workout.circuit).toBeDefined();
      expect(workout.circuit?.type).toBe('super_sets');
      expect(workout.circuit?.stations.length).toBeGreaterThan(0);
      expect(workout.cooldown).toBeDefined();

      // Legacy format should also be populated
      expect(workout.exercises.length).toBeGreaterThan(0);
    });

    it('preserves all workout metadata with cooldown addition', () => {
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

      // Plus cooldown should be added
      expect(workout.cooldown).toBeDefined();
      expect(workout.cooldown?.exercises.length).toBeGreaterThan(0);
    });
  });

  describe('cooldown generation edge cases', () => {
    it('handles cooldown generation failure gracefully', () => {
      const settings: WorkoutSettings = {
        duration: 10,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 2
      };

      // Mock cooldown generator to throw error
      mockGenerateCooldown.mockImplementation(() => {
        throw new Error('Cooldown generation failed');
      });

      // Error will propagate from circuit generator
      expect(() => {
        generateCircuitWorkout(settings);
      }).toThrow('Cooldown generation failed');
    });

    it('works with minimal workout configurations', () => {
      const settings: WorkoutSettings = {
        duration: 5,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 2
      };

      mockGenerateCooldown.mockReturnValue({
        exercises: [
          {
            id: 'minimal_cooldown',
            name: 'Simple Stretch',
            instructions: 'Basic recovery stretch',
            targetBodyParts: ['full_body'],
            duration: 60,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 60
      });

      const workout = generateCircuitWorkout(settings);

      expect(workout.cooldown).toBeDefined();
      expect(workout.cooldown?.exercises.length).toBe(1);
      expect(mockGenerateCooldown).toHaveBeenCalled();
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

      expect(mockGenerateCooldown).toHaveBeenCalledWith(workout);

      // Should generate cooldown that covers multiple muscle groups
      const callArgs = mockGenerateCooldown.mock.calls[0][0];
      const allMuscleGroups = new Set<string>();

      if (callArgs.circuit) {
        callArgs.circuit.stations.forEach(station => {
          station.exercises.forEach(ex => {
            allMuscleGroups.add(ex.primaryMuscle);
            ex.muscleGroups.forEach(mg => allMuscleGroups.add(mg));
          });
        });
      }

      // Should have diverse muscle group coverage for cooldown to target
      expect(allMuscleGroups.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('cooldown call timing', () => {
    it('calls cooldown generator after main workout is constructed', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        circuitType: 'classic_cycle',
        exerciseCount: 6
      };

      generateCircuitWorkout(settings);

      // Cooldown should be called with complete workout including circuit info
      const callArgs = mockGenerateCooldown.mock.calls[0][0];
      expect(callArgs.circuit).toBeDefined();
      expect(callArgs.exercises).toBeDefined();
      expect(callArgs.totalDuration).toBeGreaterThan(0);
      expect(callArgs.difficulty).toBe('medium');
      expect(callArgs.equipmentUsed).toEqual(['bodyweight']);
    });

    it('cooldown is attached to final workout object', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        circuitType: 'super_sets',
        exerciseCount: 6
      };

      const workout = generateCircuitWorkout(settings);

      expect(workout.cooldown).toEqual({
        exercises: [
          {
            id: 'cooldown_001',
            name: 'Standing Hamstring Stretch',
            instructions: 'Stretch your hamstrings',
            targetBodyParts: ['hamstrings', 'legs'],
            duration: 30,
            equipment: ['bodyweight']
          },
          {
            id: 'cooldown_002',
            name: 'Chest Stretch',
            instructions: 'Stretch your chest muscles',
            targetBodyParts: ['chest', 'shoulders'],
            duration: 45,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 75
      });
    });
  });
});