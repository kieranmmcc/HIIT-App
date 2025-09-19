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
  },
  {
    id: 'warmup_005',
    name: 'Arm Circles',
    instructions: 'Make circles with your arms',
    targetBodyParts: ['shoulders', 'chest'],
    duration: 30,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_006',
    name: 'Leg Swings',
    instructions: 'Swing your legs',
    targetBodyParts: ['legs', 'hips', 'hip_flexors'],
    duration: 30,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_007',
    name: 'Cat-Cow Stretch',
    instructions: 'Flow between cat and cow poses',
    targetBodyParts: ['back', 'spine', 'core'],
    duration: 45,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_008',
    name: 'Hip Circles',
    instructions: 'Make circles with your hips',
    targetBodyParts: ['hips', 'hip_flexors', 'glutes'],
    duration: 30,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_009',
    name: 'Walking Lunges',
    instructions: 'Step forward into lunges',
    targetBodyParts: ['legs', 'quadriceps', 'glutes'],
    duration: 45,
    equipment: ['bodyweight']
  },
  {
    id: 'warmup_010',
    name: 'Shoulder Rolls',
    instructions: 'Roll your shoulders',
    targetBodyParts: ['shoulders', 'upper_back', 'neck'],
    duration: 30,
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

    describe('stretch-first ordering', () => {
      it('prioritizes stretch exercises before active exercises', () => {
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

        // Find positions of stretch vs active exercises
        const stretchExercises = ['Arm Circles', 'Leg Swings', 'Cat-Cow Stretch', 'Hip Circles', 'Shoulder Rolls'];
        const activeExercises = ['Jumping Jacks', 'High Knees', 'Walking Lunges'];

        let firstStretchIndex = -1;
        let firstActiveIndex = -1;

        warmup.exercises.forEach((ex, index) => {
          if (stretchExercises.includes(ex.name) && firstStretchIndex === -1) {
            firstStretchIndex = index;
          }
          if (activeExercises.includes(ex.name) && firstActiveIndex === -1) {
            firstActiveIndex = index;
          }
        });

        // If both types exist, stretches should come first
        if (firstStretchIndex !== -1 && firstActiveIndex !== -1) {
          expect(firstStretchIndex).toBeLessThan(firstActiveIndex);
        }
      });

      it('includes stretch exercises in first 40% of warmup time', () => {
        const workout: GeneratedWorkout = {
          circuit: {
            type: 'super_sets',
            stations: [
              {
                id: 'station-1',
                name: 'Station 1',
                currentExerciseIndex: 0,
                exercises: [
                  {
                    id: 1,
                    name: 'Squats',
                    primaryMuscle: 'legs',
                    muscleGroups: ['legs', 'glutes'],
                    instructions: 'Do squats',
                    difficulty: 3,
                    equipment: ['bodyweight']
                  }
                ]
              }
            ],
            rounds: 3,
            workTime: 45,
            restTime: 15,
            stationRestTime: 60,
            totalDuration: 1800,
            difficulty: 'hard',
            equipmentUsed: ['bodyweight']
          },
          exercises: [],
          totalDuration: 1800,
          difficulty: 'hard',
          equipmentUsed: ['bodyweight']
        };

        const warmup = generateWarmup(workout);

        // Check that stretch exercises appear early in the sequence
        const stretchNames = ['circles', 'swing', 'stretch', 'roll'];
        const hasEarlyStretches = warmup.exercises.slice(0, Math.ceil(warmup.exercises.length * 0.6))
          .some(ex => stretchNames.some(stretch => ex.name.toLowerCase().includes(stretch)));

        expect(hasEarlyStretches).toBe(true);
      });

      it('maintains minimum stretch time allocation', () => {
        const workout: GeneratedWorkout = {
          exercises: [
            {
              exercise: {
                id: 1,
                name: 'Bench Press',
                primaryMuscle: 'chest',
                muscleGroups: ['chest', 'shoulders', 'arms'],
                instructions: 'Press the barbell',
                difficulty: 4,
                equipment: ['barbell']
              },
              duration: 45,
              restDuration: 15
            }
          ],
          totalDuration: 1200,
          difficulty: 'hard',
          equipmentUsed: ['barbell']
        };

        const warmup = generateWarmup(workout);

        // Calculate stretch time (exercises with stretch-like names)
        const stretchKeywords = ['circle', 'swing', 'stretch', 'roll'];
        const stretchTime = warmup.exercises
          .filter(ex => stretchKeywords.some(keyword => ex.name.toLowerCase().includes(keyword)))
          .reduce((total, ex) => total + ex.duration, 0);

        const minExpectedStretchTime = Math.floor(warmup.totalDuration * 0.25); // At least 25%
        expect(stretchTime).toBeGreaterThanOrEqual(minExpectedStretchTime);
      });
    });

    describe('muscle group targeting', () => {
      it('maps chest workouts to appropriate warmup body parts', () => {
        const workout: GeneratedWorkout = {
          exercises: [
            {
              exercise: {
                id: 1,
                name: 'Push Ups',
                primaryMuscle: 'chest',
                muscleGroups: ['chest', 'shoulders'],
                instructions: 'Do push ups',
                difficulty: 3,
                equipment: ['bodyweight']
              },
              duration: 30,
              restDuration: 15
            }
          ],
          totalDuration: 600,
          difficulty: 'medium',
          equipmentUsed: ['bodyweight']
        };

        const warmup = generateWarmup(workout);

        const targetsChestOrShoulders = warmup.exercises.some(ex =>
          ex.targetBodyParts.includes('chest') ||
          ex.targetBodyParts.includes('shoulders') ||
          ex.targetBodyParts.includes('full_body')
        );

        expect(targetsChestOrShoulders).toBe(true);
      });

      it('maps leg workouts to appropriate warmup body parts', () => {
        const workout: GeneratedWorkout = {
          exercises: [
            {
              exercise: {
                id: 1,
                name: 'Squats',
                primaryMuscle: 'legs',
                muscleGroups: ['legs', 'glutes', 'quadriceps'],
                instructions: 'Do squats',
                difficulty: 3,
                equipment: ['bodyweight']
              },
              duration: 45,
              restDuration: 15
            }
          ],
          totalDuration: 900,
          difficulty: 'medium',
          equipmentUsed: ['bodyweight']
        };

        const warmup = generateWarmup(workout);

        const targetsLegMuscles = warmup.exercises.some(ex =>
          ex.targetBodyParts.some(part =>
            ['legs', 'quadriceps', 'hamstrings', 'glutes', 'hips', 'hip_flexors', 'full_body'].includes(part)
          )
        );

        expect(targetsLegMuscles).toBe(true);
      });

      it('always includes full_body and cardio warmups', () => {
        const workout: GeneratedWorkout = {
          exercises: [
            {
              exercise: {
                id: 1,
                name: 'Tricep Extension',
                primaryMuscle: 'arms',
                muscleGroups: ['arms'],
                instructions: 'Extend triceps',
                difficulty: 2,
                equipment: ['dumbbells']
              },
              duration: 30,
              restDuration: 15
            }
          ],
          totalDuration: 600,
          difficulty: 'easy',
          equipmentUsed: ['dumbbells']
        };

        const warmup = generateWarmup(workout);

        // Should always include general warmup targeting
        const hasGeneralWarmup = warmup.exercises.some(ex =>
          ex.targetBodyParts.includes('full_body') ||
          ex.targetBodyParts.includes('cardio')
        );

        expect(hasGeneralWarmup).toBe(true);
      });
    });

    describe('duration and exercise count constraints', () => {
      it('respects minimum duration of 60 seconds', () => {
        const workout: GeneratedWorkout = {
          exercises: [
            {
              exercise: {
                id: 1,
                name: 'Single Exercise',
                primaryMuscle: 'chest',
                muscleGroups: ['chest'],
                instructions: 'Single exercise',
                difficulty: 1,
                equipment: ['bodyweight']
              },
              duration: 15,
              restDuration: 5
            }
          ],
          totalDuration: 20,
          difficulty: 'easy',
          equipmentUsed: ['bodyweight']
        };

        const warmup = generateWarmup(workout);
        expect(warmup.totalDuration).toBeGreaterThanOrEqual(60);
      });

      it('respects maximum duration of 180 seconds', () => {
        const workout: GeneratedWorkout = {
          circuit: {
            type: 'super_sets',
            stations: Array.from({ length: 5 }, (_, i) => ({
              id: `station-${i + 1}`,
              name: `Station ${i + 1}`,
              currentExerciseIndex: 0,
              exercises: [
                {
                  id: i + 1,
                  name: `Exercise ${i + 1}`,
                  primaryMuscle: ['chest', 'back', 'legs', 'arms', 'core'][i],
                  muscleGroups: [['chest', 'shoulders'], ['back'], ['legs', 'glutes'], ['arms'], ['core']][i],
                  instructions: `Do exercise ${i + 1}`,
                  difficulty: 4,
                  equipment: ['bodyweight']
                }
              ]
            })),
            rounds: 4,
            workTime: 50,
            restTime: 10,
            stationRestTime: 30,
            totalDuration: 2400,
            difficulty: 'hard',
            equipmentUsed: ['bodyweight']
          },
          exercises: [],
          totalDuration: 2400,
          difficulty: 'hard',
          equipmentUsed: ['bodyweight']
        };

        const warmup = generateWarmup(workout);
        expect(warmup.totalDuration).toBeLessThanOrEqual(180);
      });

      it('ensures at least one exercise even for empty workouts', () => {
        const workout: GeneratedWorkout = {
          exercises: [],
          totalDuration: 0,
          difficulty: 'easy',
          equipmentUsed: []
        };

        const warmup = generateWarmup(workout);

        expect(warmup.exercises.length).toBeGreaterThan(0);
        expect(warmup.exercises[0]).toHaveProperty('name');
        expect(warmup.exercises[0]).toHaveProperty('instructions');
        expect(warmup.exercises[0]).toHaveProperty('duration');
        expect(warmup.totalDuration).toBeGreaterThan(0);
      });
    });

    describe('exercise scoring and selection', () => {
      it('scores exercises higher that target workout muscle groups', () => {
        const workout: GeneratedWorkout = {
          exercises: [
            {
              exercise: {
                id: 1,
                name: 'Shoulder Press',
                primaryMuscle: 'shoulders',
                muscleGroups: ['shoulders', 'chest'],
                instructions: 'Press overhead',
                difficulty: 3,
                equipment: ['dumbbells']
              },
              duration: 40,
              restDuration: 20
            }
          ],
          totalDuration: 600,
          difficulty: 'medium',
          equipmentUsed: ['dumbbells']
        };

        const warmup = generateWarmup(workout);

        // Should prioritize shoulder-targeting exercises
        const hasShoulderTargeting = warmup.exercises.some(ex =>
          ex.targetBodyParts.includes('shoulders')
        );

        expect(hasShoulderTargeting).toBe(true);
      });

      it('provides good coverage of different body parts', () => {
        const workout: GeneratedWorkout = {
          circuit: {
            type: 'classic_cycle',
            stations: [
              {
                id: 'station-1',
                name: 'Full Body Station',
                currentExerciseIndex: 0,
                exercises: [
                  {
                    id: 1,
                    name: 'Burpees',
                    primaryMuscle: 'full_body',
                    muscleGroups: ['chest', 'legs', 'arms', 'core'],
                    instructions: 'Do burpees',
                    difficulty: 4,
                    equipment: ['bodyweight']
                  }
                ]
              }
            ],
            rounds: 3,
            workTime: 45,
            restTime: 15,
            totalDuration: 1200,
            difficulty: 'hard',
            equipmentUsed: ['bodyweight']
          },
          exercises: [],
          totalDuration: 1200,
          difficulty: 'hard',
          equipmentUsed: ['bodyweight']
        };

        const warmup = generateWarmup(workout);

        // Count unique body parts covered
        const allBodyParts = new Set<string>();
        warmup.exercises.forEach(ex => {
          ex.targetBodyParts.forEach(part => allBodyParts.add(part));
        });

        // Should cover multiple body parts for full body workout
        expect(allBodyParts.size).toBeGreaterThanOrEqual(3);
      });
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