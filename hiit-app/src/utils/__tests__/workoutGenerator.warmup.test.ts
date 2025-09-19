import { generateWorkout } from '../workoutGenerator';
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
      id: 5, name: 'Dips', primaryMuscle: 'arms',
      muscleGroups: ['arms', 'chest'], equipment: ['bodyweight'], difficulty: 3
    }),
    createMockExercise({
      id: 6, name: 'Jumping Jacks', primaryMuscle: 'cardio',
      muscleGroups: ['cardio', 'legs'], equipment: ['bodyweight'], difficulty: 2
    })
  ];
});

describe('workoutGenerator warmup integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default warmup mock
    mockGenerateWarmup.mockReturnValue({
      exercises: [
        {
          id: 'warmup_001',
          name: 'Shoulder Rolls',
          instructions: 'Roll your shoulders',
          targetBodyParts: ['shoulders', 'upper_back'],
          duration: 30,
          equipment: ['bodyweight']
        },
        {
          id: 'warmup_002',
          name: 'High Knees',
          instructions: 'Bring knees to chest',
          targetBodyParts: ['cardio', 'legs'],
          duration: 30,
          equipment: ['bodyweight']
        }
      ],
      totalDuration: 60
    });
  });

  describe('warmup generation', () => {
    it('generates warmup for standard workouts', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 6,
        circuitType: 'classic_cycle'
      };

      const workout = generateWorkout(settings);

      expect(mockGenerateWarmup).toHaveBeenCalledWith(workout);
      expect(workout.warmup).toBeDefined();
      expect(workout.warmup?.exercises).toHaveLength(2);
      expect(workout.warmup?.totalDuration).toBe(60);
    });

    it('generates warmup for different difficulty levels', () => {
      const easySettings: WorkoutSettings = {
        duration: 15,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 4,
        circuitType: 'classic_cycle'
      };

      const hardSettings: WorkoutSettings = {
        duration: 25,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 8,
        circuitType: 'classic_cycle'
      };

      generateWorkout(easySettings);
      generateWorkout(hardSettings);

      expect(mockGenerateWarmup).toHaveBeenCalledTimes(2);

      // Check that difficulty is passed correctly
      const easyCall = mockGenerateWarmup.mock.calls[0][0];
      const hardCall = mockGenerateWarmup.mock.calls[1][0];

      expect(easyCall.difficulty).toBe('easy');
      expect(hardCall.difficulty).toBe('hard');
    });

    it('passes complete workout structure to warmup generator', () => {
      const settings: WorkoutSettings = {
        duration: 10,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 4,
        targetMuscleGroups: ['chest', 'arms'],
        circuitType: 'classic_cycle'
      };

      generateWorkout(settings);

      expect(mockGenerateWarmup).toHaveBeenCalledTimes(1);

      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      expect(callArgs).toHaveProperty('exercises');
      expect(callArgs).toHaveProperty('totalDuration');
      expect(callArgs).toHaveProperty('difficulty');
      expect(callArgs).toHaveProperty('equipmentUsed');

      // Should have workout exercises
      expect(callArgs.exercises.length).toBeGreaterThan(0);
      expect(callArgs.exercises[0]).toHaveProperty('exercise');
      expect(callArgs.exercises[0]).toHaveProperty('duration');
      expect(callArgs.exercises[0]).toHaveProperty('restDuration');
    });

    it('warmup reflects targeted muscle groups from workout exercises', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 4,
        targetMuscleGroups: ['arms', 'chest'],
        circuitType: 'classic_cycle'
      };

      mockGenerateWarmup.mockReturnValue({
        exercises: [
          {
            id: 'warmup_arms',
            name: 'Arm Swings',
            instructions: 'Swing your arms',
            targetBodyParts: ['arms', 'shoulders'],
            duration: 30,
            equipment: ['bodyweight']
          },
          {
            id: 'warmup_chest',
            name: 'Chest Stretch',
            instructions: 'Stretch your chest',
            targetBodyParts: ['chest', 'shoulders'],
            duration: 45,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 75
      });

      const workout = generateWorkout(settings);

      // Verify warmup generator received workout with arms/chest exercises
      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      const workoutMuscles = new Set<string>();

      callArgs.exercises.forEach(ex => {
        workoutMuscles.add(ex.exercise.primaryMuscle);
        ex.exercise.muscleGroups.forEach(mg => workoutMuscles.add(mg));
      });

      expect(workoutMuscles.has('arms') || workoutMuscles.has('chest')).toBe(true);
      expect(workout.warmup?.exercises.some(ex =>
        ex.targetBodyParts.includes('arms') || ex.targetBodyParts.includes('chest')
      )).toBe(true);
    });
  });

  describe('warmup integration with workout structure', () => {
    it('maintains workout structure while adding warmup', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 6,
        circuitType: 'classic_cycle'
      };

      const workout = generateWorkout(settings);

      // Should have both workout exercises and warmup
      expect(workout.exercises.length).toBeGreaterThan(0);
      expect(workout.warmup).toBeDefined();
      expect(workout.warmup?.exercises.length).toBeGreaterThan(0);

      // Each workout exercise should have proper structure
      workout.exercises.forEach(ex => {
        expect(ex).toHaveProperty('exercise');
        expect(ex).toHaveProperty('duration');
        expect(ex).toHaveProperty('restDuration');
        expect(ex.exercise).toHaveProperty('name');
        expect(ex.exercise).toHaveProperty('primaryMuscle');
      });
    });

    it('warmup does not affect main workout duration', () => {
      const settings: WorkoutSettings = {
        duration: 15, // 15 minutes main workout
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 5,
        circuitType: 'classic_cycle'
      };

      const workout = generateWorkout(settings);

      // Main workout should be approximately 15 minutes (allow for variations)
      const mainWorkoutMinutes = workout.totalDuration / 60;
      expect(mainWorkoutMinutes).toBeGreaterThan(12); // At least 12 minutes
      expect(mainWorkoutMinutes).toBeLessThan(18); // Not more than 18 minutes

      // Warmup should be separate and additional
      expect(workout.warmup?.totalDuration).toBeGreaterThan(0);
      expect(workout.warmup?.totalDuration).toBeLessThanOrEqual(180); // Max 3 minutes
    });

    it('preserves all workout metadata with warmup addition', () => {
      const settings: WorkoutSettings = {
        duration: 12,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 6,
        circuitType: 'classic_cycle'
      };

      const workout = generateWorkout(settings);

      // All original workout properties should be preserved
      expect(workout.difficulty).toBe('hard');
      expect(workout.equipmentUsed).toEqual(['bodyweight']);
      expect(workout.totalDuration).toBeGreaterThan(0);

      // Plus warmup should be added
      expect(workout.warmup).toBeDefined();
      expect(workout.warmup?.exercises.length).toBeGreaterThan(0);
    });

    it('handles workout with mixed exercise types', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 8,
        circuitType: 'classic_cycle'
      };

      const workout = generateWorkout(settings);

      expect(mockGenerateWarmup).toHaveBeenCalledWith(workout);

      // Should have a variety of exercises for warmup to target
      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      const uniqueMuscles = new Set<string>();

      callArgs.exercises.forEach(ex => {
        uniqueMuscles.add(ex.exercise.primaryMuscle);
      });

      // Legacy workouts cycle through exercises, so variety should be good
      expect(uniqueMuscles.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('warmup generation edge cases', () => {
    it('handles very short workouts', () => {
      const settings: WorkoutSettings = {
        duration: 5, // Very short workout
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 2,
        circuitType: 'classic_cycle'
      };

      mockGenerateWarmup.mockReturnValue({
        exercises: [
          {
            id: 'quick_warmup',
            name: 'Quick Stretch',
            instructions: 'Basic stretch',
            targetBodyParts: ['full_body'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 30
      });

      const workout = generateWorkout(settings);

      expect(workout.warmup).toBeDefined();
      expect(workout.warmup?.exercises.length).toBe(1);
      expect(mockGenerateWarmup).toHaveBeenCalled();
    });

    it('handles workouts with single exercise type', () => {
      const settings: WorkoutSettings = {
        duration: 10,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 4,
        targetMuscleGroups: ['core'],
        circuitType: 'classic_cycle'
      };

      generateWorkout(settings);

      expect(mockGenerateWarmup).toHaveBeenCalled();

      // Should still generate warmup even for focused workouts
      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      expect(callArgs.exercises.length).toBeGreaterThan(0);
    });

    it('handles warmup generation failure gracefully', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 4,
        circuitType: 'classic_cycle'
      };

      // Mock warmup generator to throw error
      mockGenerateWarmup.mockImplementation(() => {
        throw new Error('Warmup generation failed');
      });

      // Error will propagate from circuit generator since workout generator calls it
      expect(() => {
        generateWorkout(settings);
      }).toThrow('Warmup generation failed');
    });
  });

  describe('warmup call timing and data flow', () => {
    it('calls warmup generator after main workout is constructed', () => {
      const settings: WorkoutSettings = {
        duration: 18,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 6,
        circuitType: 'classic_cycle'
      };

      generateWorkout(settings);

      // Warmup should be called with complete workout structure
      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      expect(callArgs.exercises).toBeDefined();
      expect(callArgs.exercises.length).toBeGreaterThan(0);
      expect(callArgs.totalDuration).toBeGreaterThan(0);
      expect(callArgs.difficulty).toBe('medium');
      expect(callArgs.equipmentUsed).toEqual(['bodyweight']);
    });

    it('warmup is attached to final workout object', () => {
      const settings: WorkoutSettings = {
        duration: 12,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 4,
        circuitType: 'classic_cycle'
      };

      const workout = generateWorkout(settings);

      expect(workout.warmup).toEqual({
        exercises: [
          {
            id: 'warmup_001',
            name: 'Shoulder Rolls',
            instructions: 'Roll your shoulders',
            targetBodyParts: ['shoulders', 'upper_back'],
            duration: 30,
            equipment: ['bodyweight']
          },
          {
            id: 'warmup_002',
            name: 'High Knees',
            instructions: 'Bring knees to chest',
            targetBodyParts: ['cardio', 'legs'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 60
      });
    });

    it('provides muscle group diversity for warmup targeting', () => {
      const settings: WorkoutSettings = {
        duration: 25,
        difficulty: 'hard',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 10,
        circuitType: 'classic_cycle'
      };

      generateWorkout(settings);

      // Legacy workouts should provide good muscle group variety
      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      const primaryMuscles = callArgs.exercises.map(ex => ex.exercise.primaryMuscle);
      const uniquePrimary = new Set(primaryMuscles);

      // Should have diverse primary muscles for warmup generator to work with
      expect(uniquePrimary.size).toBeGreaterThanOrEqual(2);
    });

    it('passes correct equipment information', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight', 'dumbbells'],
        exerciseCount: 6,
        circuitType: 'classic_cycle'
      };

      generateWorkout(settings);

      const callArgs = mockGenerateWarmup.mock.calls[0][0];
      expect(callArgs.equipmentUsed).toEqual(['bodyweight', 'dumbbells']);
    });
  });

  describe('warmup integration consistency', () => {
    it('generates consistent warmup structure across multiple calls', () => {
      const settings: WorkoutSettings = {
        duration: 20,
        difficulty: 'medium',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 6,
        circuitType: 'classic_cycle'
      };

      const workout1 = generateWorkout(settings);
      const workout2 = generateWorkout(settings);

      // Both should have warmup with consistent structure
      expect(workout1.warmup).toBeDefined();
      expect(workout2.warmup).toBeDefined();

      expect(workout1.warmup?.exercises.length).toBeGreaterThan(0);
      expect(workout2.warmup?.exercises.length).toBeGreaterThan(0);

      expect(workout1.warmup?.totalDuration).toBeGreaterThan(0);
      expect(workout2.warmup?.totalDuration).toBeGreaterThan(0);
    });

    it('warmup exercises have required properties', () => {
      const settings: WorkoutSettings = {
        duration: 15,
        difficulty: 'easy',
        selectedEquipment: ['bodyweight'],
        exerciseCount: 4,
        circuitType: 'classic_cycle'
      };

      const workout = generateWorkout(settings);

      expect(workout.warmup?.exercises).toBeDefined();

      workout.warmup?.exercises.forEach(exercise => {
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('instructions');
        expect(exercise).toHaveProperty('targetBodyParts');
        expect(exercise).toHaveProperty('duration');
        expect(exercise).toHaveProperty('equipment');

        expect(exercise.name).toBeTruthy();
        expect(exercise.instructions).toBeTruthy();
        expect(exercise.targetBodyParts.length).toBeGreaterThan(0);
        expect(exercise.duration).toBeGreaterThan(0);
      });
    });
  });
});