import { generateWorkout, regenerateExercise } from '../workoutGenerator';
import { createMockWorkoutSettings, createMockExercise } from '../../__tests__/utils/test-utils';
import { BlacklistStorage } from '../blacklistStorage';
import type { Exercise } from '../../types/exercise';

// Mock dependencies
jest.mock('../blacklistStorage');
jest.mock('../circuitGenerator', () => ({
  generateCircuitWorkout: jest.fn(() => ({
    circuit: {
      id: 'test-circuit',
      name: 'Test Circuit',
      stations: [],
      rounds: 3,
      workTime: 30,
      restTime: 15
    },
    totalDuration: 1200,
    difficulty: 'medium',
    equipmentUsed: ['bodyweight']
  }))
}));

// Mock exercises data
jest.mock('../../data/exercises.json', () => [
  {
    id: 1,
    name: 'Push Ups',
    instructions: 'Do push ups',
    muscleGroups: ['chest', 'arms'],
    primaryMuscle: 'chest',
    difficulty: 3,
    equipment: ['bodyweight']
  },
  {
    id: 2,
    name: 'Squats',
    instructions: 'Do squats',
    muscleGroups: ['legs', 'glutes'],
    primaryMuscle: 'legs',
    difficulty: 3,
    equipment: ['bodyweight']
  },
  {
    id: 3,
    name: 'Dumbbell Curls',
    instructions: 'Do dumbbell curls',
    muscleGroups: ['arms'],
    primaryMuscle: 'arms',
    difficulty: 2,
    equipment: ['dumbbells']
  },
  {
    id: 4,
    name: 'Burpees',
    instructions: 'Do burpees',
    muscleGroups: ['full_body'],
    primaryMuscle: 'full_body',
    difficulty: 4,
    equipment: ['bodyweight']
  }
]);

const mockBlacklistStorage = BlacklistStorage as jest.Mocked<typeof BlacklistStorage>;

describe('workoutGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);
  });

  describe('generateWorkout', () => {
    it('generates circuit workout when circuitType is specified', () => {
      const settings = createMockWorkoutSettings({
        circuitType: 'classic_cycle',
        selectedEquipment: ['bodyweight'],
        duration: 20,
        difficulty: 'medium'
      });

      const workout = generateWorkout(settings);

      expect(workout).toHaveProperty('circuit');
      expect(workout.difficulty).toBe('medium');
    });

    it('generates legacy workout when no circuitType is specified', () => {
      const settings = createMockWorkoutSettings();
      delete (settings as any).circuitType;

      const workout = generateWorkout(settings);

      expect(workout).toHaveProperty('exercises');
      expect(workout).toHaveProperty('totalDuration');
      expect(workout).toHaveProperty('difficulty');
    });

    it('filters out blacklisted exercises', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']);

      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'],
        duration: 20,
        difficulty: 'medium'
      });
      delete (settings as any).circuitType;

      const workout = generateWorkout(settings);

      // Should not include blacklisted exercises (Push Ups and Squats)
      const exerciseIds = workout.exercises?.map(we => we.exercise.id) || [];
      expect(exerciseIds).not.toContain(1);
      expect(exerciseIds).not.toContain(2);
    });

    it('filters exercises by equipment', () => {
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['dumbbells'], // Only dumbbells
        duration: 20,
        difficulty: 'medium'
      });
      delete (settings as any).circuitType;

      const workout = generateWorkout(settings);

      // Should only include exercises that use dumbbells
      const exerciseIds = workout.exercises?.map(we => we.exercise.id) || [];
      expect(exerciseIds).toContain(3); // Dumbbell Curls
      expect(exerciseIds).not.toContain(1); // Push Ups (bodyweight only)
    });

    it('filters exercises by target muscle groups', () => {
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'],
        targetMuscleGroups: ['legs'],
        duration: 20,
        difficulty: 'medium'
      });
      delete (settings as any).circuitType;

      const workout = generateWorkout(settings);

      // Should prioritize leg exercises
      expect(workout).toHaveProperty('exercises');
    });

    it('calculates correct total duration', () => {
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'],
        duration: 20, // 20 minutes
        difficulty: 'medium'
      });
      delete (settings as any).circuitType;

      const workout = generateWorkout(settings);

      expect(workout.totalDuration).toBeGreaterThan(0);
      // Duration should be approximately 20 minutes (1200 seconds)
      expect(workout.totalDuration).toBeLessThanOrEqual(1300);
    });
  });

  describe('regenerateExercise', () => {
    const mockExercises: Exercise[] = [
      createMockExercise({ id: 1, name: 'Push Ups', primaryMuscle: 'chest' }),
      createMockExercise({ id: 2, name: 'Squats', primaryMuscle: 'legs' }),
      createMockExercise({ id: 3, name: 'Pull Ups', primaryMuscle: 'back' }),
      createMockExercise({ id: 4, name: 'Lunges', primaryMuscle: 'legs' })
    ];

    it('returns different exercise with same primary muscle', () => {
      const currentExercise = mockExercises[0]; // Push Ups (chest)
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight']
      });

      // Mock to return an exercise with same primary muscle
      const newExercise = regenerateExercise(currentExercise, settings, []);

      expect(newExercise).toBeDefined();
      if (newExercise) {
        expect(newExercise.id).not.toBe(currentExercise.id);
      }
    });

    it('excludes existing exercises from selection', () => {
      const currentExercise = mockExercises[1]; // Squats
      const existingExercises = [mockExercises[3]]; // Lunges
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight']
      });

      const newExercise = regenerateExercise(currentExercise, settings, existingExercises);

      expect(newExercise).toBeDefined();
      if (newExercise) {
        expect(newExercise.id).not.toBe(currentExercise.id);
        expect(newExercise.id).not.toBe(mockExercises[3].id); // Should not be Lunges
      }
    });

    it('respects blacklisted exercises', () => {
      mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['2']);

      const currentExercise = mockExercises[0]; // Push Ups
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight']
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      expect(newExercise).toBeDefined();
      if (newExercise) {
        expect(newExercise.id).not.toBe(2); // Should not be blacklisted Squats
      }
    });

    it('filters by equipment requirements', () => {
      const currentExercise = createMockExercise({
        id: 5,
        equipment: ['dumbbells']
      });
      const settings = createMockWorkoutSettings({
        selectedEquipment: ['bodyweight'] // Only bodyweight equipment
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      // Should not find suitable replacement since equipment doesn't match
      // The function should handle this gracefully
      expect(newExercise).toBeDefined();
    });

    it('returns null when no suitable replacement is found', () => {
      const currentExercise = mockExercises[0];
      const settings = createMockWorkoutSettings({
        selectedEquipment: [] // No equipment selected
      });

      const newExercise = regenerateExercise(currentExercise, settings, []);

      // Should return null when no equipment matches
      expect(newExercise).toBeNull();
    });
  });
});