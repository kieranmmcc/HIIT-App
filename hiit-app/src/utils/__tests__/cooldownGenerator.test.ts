import { generateCooldown, cooldownBodyPartLabels } from '../cooldownGenerator';
import type { GeneratedWorkout } from '../../types/circuit';
import { createMockExercise, createMockWorkout } from '../../__tests__/utils/test-utils';

// Mock stretches data
jest.mock('../../data/stretches.json', () => [
  {
    "id": "stretch_001",
    "name": "Standing Hamstring Stretch",
    "instructions": "Stand with your feet hip-width apart. Extend one leg straight out in front of you, heel on the floor, toes pointing up. Hinge at your hips and lean forward over the straight leg until you feel a stretch in your hamstring.",
    "targetBodyParts": ["hamstrings", "legs"],
    "duration": 30,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_002",
    "name": "Standing Quad Stretch",
    "instructions": "Stand on one leg, holding onto a wall or chair for balance if needed. Grab your other foot and pull it towards your glute, feeling a stretch in the front of your thigh.",
    "targetBodyParts": ["quadriceps", "legs", "hip_flexors"],
    "duration": 30,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_003",
    "name": "Pigeon Pose",
    "instructions": "Start in a plank position. Bring one knee forward and place it behind the corresponding wrist. Lower your hips to the floor and feel a deep stretch in the glute.",
    "targetBodyParts": ["glutes", "hips", "piriformis"],
    "duration": 60,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_004",
    "name": "Calf Stretch",
    "instructions": "Stand facing a wall with your hands on it for support. Step one foot back, keeping the leg straight and the heel flat on the floor.",
    "targetBodyParts": ["calves", "legs"],
    "duration": 30,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_005",
    "name": "Cross-Body Shoulder Stretch",
    "instructions": "Stand or sit tall. Bring one arm straight across your body. Use your other hand to gently pull the straight arm closer to your chest.",
    "targetBodyParts": ["shoulders", "back"],
    "duration": 30,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_006",
    "name": "Triceps Stretch",
    "instructions": "Raise one arm straight up, then bend your elbow to let your hand fall behind your head. Use your other hand to gently pull the bent elbow towards your head.",
    "targetBodyParts": ["triceps", "shoulders", "arms"],
    "duration": 30,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_007",
    "name": "Doorway Chest Stretch",
    "instructions": "Stand in a doorway and place your forearms on the frame, with your elbows bent at 90 degrees. Step one foot forward and gently lean into the doorway.",
    "targetBodyParts": ["chest", "shoulders"],
    "duration": 30,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_008",
    "name": "Child's Pose",
    "instructions": "Kneel on the floor, sit back on your heels, then fold forward, resting your forehead on the floor. Breathe deeply and relax into the stretch.",
    "targetBodyParts": ["back", "hips", "glutes", "spine"],
    "duration": 60,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_009",
    "name": "Cobra Pose",
    "instructions": "Lie on your stomach with your hands under your shoulders. Gently press up, lifting your chest off the floor while keeping your hips on the ground.",
    "targetBodyParts": ["spine", "abdominals", "back"],
    "duration": 30,
    "equipment": ["bodyweight"]
  },
  {
    "id": "stretch_010",
    "name": "Downward-Facing Dog",
    "instructions": "Start on your hands and knees. Lift your hips up and back, forming an inverted V-shape with your body.",
    "targetBodyParts": ["full_body", "hamstrings", "calves", "shoulders", "back"],
    "duration": 45,
    "equipment": ["bodyweight"]
  }
]);

describe('cooldownGenerator', () => {
  describe('generateCooldown', () => {
    it('respects user-configured cooldown duration preferences', () => {
      const workout = createMockWorkout({
        exercises: [
          {
            exercise: createMockExercise({ primaryMuscle: 'legs', muscleGroups: ['legs', 'glutes'] }),
            duration: 45,
            restDuration: 15
          },
          {
            exercise: createMockExercise({ primaryMuscle: 'chest', muscleGroups: ['chest', 'shoulders'] }),
            duration: 45,
            restDuration: 15
          }
        ]
      });

      const cooldown = generateCooldown(workout);

      expect(cooldown.exercises.length).toBeGreaterThan(0);
      // Should respect user preferences (default 20s per stretch)
      cooldown.exercises.forEach(stretch => {
        expect(stretch.duration).toBe(20); // Default cooldown duration
      });
      // Total duration should be exercises count × user preference
      const expectedMinDuration = cooldown.exercises.length * 20;
      expect(cooldown.totalDuration).toBe(expectedMinDuration);
    });

    it('generates cooldown targeting workout muscle groups', () => {
      const workout = createMockWorkout({
        exercises: [
          {
            exercise: createMockExercise({
              primaryMuscle: 'legs',
              muscleGroups: ['legs', 'quadriceps', 'hamstrings']
            }),
            duration: 45,
            restDuration: 15
          }
        ]
      });

      const cooldown = generateCooldown(workout);

      // Should include stretches that target leg muscles
      const hasLegStretches = cooldown.exercises.some(stretch =>
        stretch.targetBodyParts.some(part =>
          ['legs', 'quadriceps', 'hamstrings', 'calves'].includes(part)
        )
      );

      expect(hasLegStretches).toBe(true);
    });

    it('handles circuit workout format', () => {
      const workout: GeneratedWorkout = {
        exercises: [],
        totalDuration: 1200,
        difficulty: 'medium',
        equipmentUsed: ['bodyweight'],
        circuit: {
          type: 'classic_cycle',
          stations: [
            {
              id: 'station1',
              name: 'Upper Body',
              exercises: [
                createMockExercise({ primaryMuscle: 'chest', muscleGroups: ['chest', 'shoulders'] }),
                createMockExercise({ primaryMuscle: 'back', muscleGroups: ['back', 'shoulders'] })
              ],
              currentExerciseIndex: 0
            }
          ],
          rounds: 3,
          workTime: 45,
          restTime: 15,
          totalDuration: 1200,
          difficulty: 'medium',
          equipmentUsed: ['bodyweight']
        }
      };

      const cooldown = generateCooldown(workout);

      expect(cooldown.exercises.length).toBeGreaterThan(0);
      expect(cooldown.totalDuration).toBeGreaterThan(0);

      // Should target upper body muscles from circuit
      const hasUpperBodyStretches = cooldown.exercises.some(stretch =>
        stretch.targetBodyParts.some(part =>
          ['chest', 'shoulders', 'back', 'spine'].includes(part)
        )
      );

      expect(hasUpperBodyStretches).toBe(true);
    });

    it('respects maximum duration constraint', () => {
      const workout = createMockWorkout({
        exercises: Array(20).fill(null).map(() => ({
          exercise: createMockExercise({ primaryMuscle: 'full_body', muscleGroups: ['chest', 'legs', 'arms', 'core'] }),
          duration: 45,
          restDuration: 15
        }))
      });

      const cooldown = generateCooldown(workout);

      expect(cooldown.totalDuration).toBeLessThanOrEqual(480); // Max 8 minutes
    });

    it('always includes essential recovery stretches', () => {
      const workout = createMockWorkout({
        exercises: [
          {
            exercise: createMockExercise({ primaryMuscle: 'biceps', muscleGroups: ['biceps', 'arms'] }),
            duration: 45,
            restDuration: 15
          }
        ]
      });

      const cooldown = generateCooldown(workout);

      // Should include full_body, spine, or back stretches for general recovery
      const hasEssentialStretches = cooldown.exercises.some(stretch =>
        stretch.targetBodyParts.some(part =>
          ['full_body', 'spine', 'back'].includes(part)
        )
      );

      expect(hasEssentialStretches).toBe(true);
    });

    it('ensures at least one exercise even for empty workouts', () => {
      const emptyWorkout = createMockWorkout({
        exercises: []
      });

      const cooldown = generateCooldown(emptyWorkout);

      expect(cooldown.exercises.length).toBeGreaterThanOrEqual(1);
      expect(cooldown.totalDuration).toBeGreaterThan(0);
    });

    it('provides good coverage of different body parts', () => {
      const fullBodyWorkout = createMockWorkout({
        exercises: [
          { exercise: createMockExercise({ primaryMuscle: 'chest', muscleGroups: ['chest', 'shoulders'] }), duration: 45, restDuration: 15 },
          { exercise: createMockExercise({ primaryMuscle: 'legs', muscleGroups: ['legs', 'glutes'] }), duration: 45, restDuration: 15 },
          { exercise: createMockExercise({ primaryMuscle: 'back', muscleGroups: ['back', 'shoulders'] }), duration: 45, restDuration: 15 },
          { exercise: createMockExercise({ primaryMuscle: 'core', muscleGroups: ['core', 'abdominals'] }), duration: 45, restDuration: 15 }
        ]
      });

      const cooldown = generateCooldown(fullBodyWorkout);

      // Count unique body parts targeted
      const targetedParts = new Set<string>();
      cooldown.exercises.forEach(stretch => {
        stretch.targetBodyParts.forEach(part => targetedParts.add(part));
      });

      // Should target at least 4 different body parts
      expect(targetedParts.size).toBeGreaterThanOrEqual(4);
    });

    it('muscle group mapping works correctly', () => {
      const legWorkout = createMockWorkout({
        exercises: [
          {
            exercise: createMockExercise({
              primaryMuscle: 'quadriceps',
              muscleGroups: ['quadriceps', 'legs']
            }),
            duration: 45,
            restDuration: 15
          }
        ]
      });

      const cooldown = generateCooldown(legWorkout);

      // Should include quad or leg stretches
      const hasQuadStretches = cooldown.exercises.some(stretch =>
        stretch.targetBodyParts.some(part =>
          ['quadriceps', 'legs', 'hip_flexors'].includes(part)
        )
      );

      expect(hasQuadStretches).toBe(true);
    });

    it('uses consistent user-configured stretch duration for recovery', () => {
      const workout = createMockWorkout({
        exercises: [
          {
            exercise: createMockExercise({ primaryMuscle: 'back', muscleGroups: ['back', 'spine'] }),
            duration: 45,
            restDuration: 15
          }
        ]
      });

      const cooldown = generateCooldown(workout);

      // All stretches should use the user-configured duration (default 20s)
      cooldown.exercises.forEach(stretch => {
        expect(stretch.duration).toBe(20); // Default cooldown duration
      });
      // Should have multiple exercises to ensure adequate recovery time
      expect(cooldown.exercises.length).toBeGreaterThan(0);
    });

    it('avoids duplicate stretch selections', () => {
      const workout = createMockWorkout({
        exercises: [
          { exercise: createMockExercise({ primaryMuscle: 'chest' }), duration: 45, restDuration: 15 }
        ]
      });

      const cooldown = generateCooldown(workout);

      // Check that all selected stretches have unique IDs
      const stretchIds = cooldown.exercises.map(stretch => stretch.id);
      const uniqueIds = new Set(stretchIds);

      expect(stretchIds.length).toBe(uniqueIds.size);
    });
  });

  describe('cooldownBodyPartLabels', () => {
    it('contains expected body part labels', () => {
      expect(cooldownBodyPartLabels).toHaveProperty('hamstrings');
      expect(cooldownBodyPartLabels).toHaveProperty('quadriceps');
      expect(cooldownBodyPartLabels).toHaveProperty('chest');
      expect(cooldownBodyPartLabels).toHaveProperty('shoulders');
      expect(cooldownBodyPartLabels).toHaveProperty('back');
      expect(cooldownBodyPartLabels).toHaveProperty('full_body');
      expect(cooldownBodyPartLabels).toHaveProperty('spine');

      // Check some label transformations
      expect(cooldownBodyPartLabels.hamstrings).toBe('Hamstrings');
      expect(cooldownBodyPartLabels.hip_flexors).toBe('Hip Flexors');
      expect(cooldownBodyPartLabels.full_body).toBe('Full Body');
    });

    it('transforms body part keys to readable labels', () => {
      expect(cooldownBodyPartLabels.inner_thighs).toBe('Inner Thighs');
      expect(cooldownBodyPartLabels.lower_back).toBe('Lower Back');
      expect(cooldownBodyPartLabels.adductors).toBe('Adductors');
    });
  });
});