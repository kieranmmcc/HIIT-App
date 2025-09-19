import { generateWarmup, warmupBodyPartLabels } from '../warmupGenerator';
import type { GeneratedWorkout } from '../../types/circuit';

// Mock warmup data
jest.mock('../warmupGenerator', () => {
  const actual = jest.requireActual('../warmupGenerator');
  return {
    ...actual,
    // We'll use the actual function but can override if needed
  };
});

// Mock warmups data
jest.mock('../../data/warmups.json', () => [
  {
    id: 'warmup_001',
    name: 'Jumping Jacks',
    instructions: 'Do jumping jacks',
    targetBodyParts: ['full_body', 'cardio', 'legs'],
    duration: 30,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_002',
    name: 'High Knees',
    instructions: 'Do high knees',
    targetBodyParts: ['cardio', 'legs', 'core'],
    duration: 30,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_003',
    name: 'Arm Circles',
    instructions: 'Do arm circles',
    targetBodyParts: ['shoulders', 'chest'],
    duration: 30,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_004',
    name: 'Push Up Hold',
    instructions: 'Hold push up position',
    targetBodyParts: ['chest', 'shoulders', 'core'],
    duration: 45,
    equipment: ['bodyweight']
  }
]);

describe('warmupGenerator', () => {
  describe('generateWarmup', () => {
    it('generates warmup with minimum 1 minute duration', () => {
      const workout: GeneratedWorkout = {
        circuit: {
          type: 'classic_cycle',
          stations: [
            {
              id: 'station-1',
              name: 'Station 1',
              currentExerciseIndex: 0,
              exercises: [
                {
                  id: 1,
                  name: 'Push Ups',
                  primaryMuscle: 'chest',
                  muscleGroups: ['chest', 'shoulders'],
                  instructions: 'Do push ups',
                  difficulty: 3,
                  equipment: ['bodyweight']
                }
              ]
            }
          ],
          rounds: 3,
          workTime: 30,
          restTime: 15,
          stationRestTime: 60,
          totalDuration: 1200,
          difficulty: 'medium',
          equipmentUsed: ['bodyweight']
        },
        exercises: [],
        totalDuration: 1200,
        difficulty: 'medium',
        equipmentUsed: ['bodyweight']
      };

      const warmup = generateWarmup(workout);

      expect(warmup.totalDuration).toBeGreaterThanOrEqual(60);
      expect(warmup.exercises.length).toBeGreaterThanOrEqual(2); // Should select at least 2 exercises to reach 60s
    });

    it('generates warmup targeting workout muscle groups', () => {
      const workout: GeneratedWorkout = {
        circuit: {
          type: 'classic_cycle',
          stations: [
            {
              id: 'station-1',
              name: 'Station 1',
              currentExerciseIndex: 0,
              exercises: [
                {
                  id: 1,
                  name: 'Push Ups',
                  primaryMuscle: 'chest',
                  muscleGroups: ['chest', 'shoulders'],
                  instructions: 'Do push ups',
                  difficulty: 3,
                  equipment: ['bodyweight']
                }
              ]
            }
          ],
          rounds: 3,
          workTime: 30,
          restTime: 15,
          stationRestTime: 60,
          totalDuration: 1200,
          difficulty: 'medium',
          equipmentUsed: ['bodyweight']
        },
        exercises: [],
        totalDuration: 1200,
        difficulty: 'medium',
        equipmentUsed: ['bodyweight']
      };

      const warmup = generateWarmup(workout);

      // Should include warmups that target chest and shoulders
      const hasChestTargeting = warmup.exercises.some(ex =>
        ex.targetBodyParts.includes('chest') || ex.targetBodyParts.includes('shoulders')
      );
      expect(hasChestTargeting).toBe(true);
    });

    it('handles legacy workout format', () => {
      const workout: GeneratedWorkout = {
        exercises: [
          {
            exercise: {
              id: 1,
              name: 'Squats',
              primaryMuscle: 'legs',
              muscleGroups: ['legs', 'glutes'],
              instructions: 'Do squats',
              difficulty: 3,
              equipment: ['bodyweight']
            },
            duration: 30,
            restDuration: 15
          }
        ],
        totalDuration: 1200,
        difficulty: 'medium',
        equipmentUsed: ['bodyweight']
      };

      const warmup = generateWarmup(workout);

      expect(warmup.exercises).toBeDefined();
      expect(warmup.totalDuration).toBeGreaterThan(0);

      // Should target leg muscles
      const hasLegTargeting = warmup.exercises.some(ex =>
        ex.targetBodyParts.includes('legs') || ex.targetBodyParts.includes('glutes')
      );
      expect(hasLegTargeting).toBe(true);
    });

    it('respects maximum duration constraint', () => {
      const workout: GeneratedWorkout = {
        circuit: {
          type: 'classic_cycle',
          stations: [
            {
              id: 'station-1',
              name: 'Station 1',
              currentExerciseIndex: 0,
              exercises: [
                {
                  id: 1,
                  name: 'Full Body Exercise',
                  primaryMuscle: 'full_body',
                  muscleGroups: ['chest', 'back', 'legs', 'arms'],
                  instructions: 'Do full body exercise',
                  difficulty: 3,
                  equipment: ['bodyweight']
                }
              ]
            }
          ],
          rounds: 3,
          workTime: 30,
          restTime: 15,
          stationRestTime: 60,
          totalDuration: 1200,
          difficulty: 'medium',
          equipmentUsed: ['bodyweight']
        },
        exercises: [],
        totalDuration: 1200,
        difficulty: 'medium',
        equipmentUsed: ['bodyweight']
      };

      const warmup = generateWarmup(workout);

      expect(warmup.totalDuration).toBeLessThanOrEqual(180); // 3 minutes max
    });

    it('ensures at least one exercise is selected', () => {
      const workout: GeneratedWorkout = {
        exercises: [],
        totalDuration: 0,
        difficulty: 'easy',
        equipmentUsed: []
      };

      const warmup = generateWarmup(workout);

      expect(warmup.exercises.length).toBeGreaterThan(0);
    });

    it('includes full_body and cardio warmups by default', () => {
      const workout: GeneratedWorkout = {
        circuit: {
          type: 'classic_cycle',
          stations: [
            {
              id: 'station-1',
              name: 'Station 1',
              currentExerciseIndex: 0,
              exercises: [
                {
                  id: 1,
                  name: 'Bicep Curls',
                  primaryMuscle: 'arms',
                  muscleGroups: ['arms'],
                  instructions: 'Do bicep curls',
                  difficulty: 2,
                  equipment: ['dumbbells']
                }
              ]
            }
          ],
          rounds: 3,
          workTime: 30,
          restTime: 15,
          stationRestTime: 60,
          totalDuration: 1200,
          difficulty: 'medium',
          equipmentUsed: ['dumbbells']
        },
        exercises: [],
        totalDuration: 1200,
        difficulty: 'medium',
        equipmentUsed: ['dumbbells']
      };

      const warmup = generateWarmup(workout);

      // Should prioritize full_body and cardio exercises
      const hasFullBodyOrCardio = warmup.exercises.some(ex =>
        ex.targetBodyParts.includes('full_body') || ex.targetBodyParts.includes('cardio')
      );
      expect(hasFullBodyOrCardio).toBe(true);
    });
  });

  describe('warmupBodyPartLabels', () => {
    it('contains expected body part labels', () => {
      expect(warmupBodyPartLabels).toHaveProperty('full_body', 'Full Body');
      expect(warmupBodyPartLabels).toHaveProperty('cardio', 'Cardio');
      expect(warmupBodyPartLabels).toHaveProperty('legs', 'Legs');
      expect(warmupBodyPartLabels).toHaveProperty('chest', 'Chest');
      expect(warmupBodyPartLabels).toHaveProperty('shoulders', 'Shoulders');
    });

    it('transforms body part keys to readable labels', () => {
      expect(warmupBodyPartLabels['hip_flexors']).toBe('Hip Flexors');
      expect(warmupBodyPartLabels['lower_back']).toBe('Lower Back');
      expect(warmupBodyPartLabels['upper_back']).toBe('Upper Back');
    });
  });
});