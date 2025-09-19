import stretchesData from '../data/stretches.json';
import type { GeneratedWorkout } from '../types/circuit';
import { DurationPreferencesStorage } from './durationPreferences';

export interface CooldownExercise {
  id: string;
  name: string;
  instructions: string;
  targetBodyParts: string[];
  duration: number;
  equipment: string[];
}

export interface GeneratedCooldown {
  exercises: CooldownExercise[];
  totalDuration: number;
}

// Mapping from workout muscle groups to stretch body parts
const muscleGroupToCooldownParts: Record<string, string[]> = {
  chest: ['chest', 'shoulders'],
  back: ['back', 'spine', 'shoulders'],
  shoulders: ['shoulders', 'back'],
  arms: ['triceps', 'shoulders', 'arms'],
  legs: ['hamstrings', 'quadriceps', 'calves', 'legs'],
  glutes: ['glutes', 'hips', 'piriformis'],
  core: ['spine', 'abdominals', 'back', 'hips'],
  cardio: ['full_body', 'hamstrings', 'calves'],
  full_body: ['full_body', 'spine', 'back', 'shoulders', 'hips'],
  quadriceps: ['quadriceps', 'hip_flexors', 'legs'],
  hamstrings: ['hamstrings', 'legs', 'glutes'],
  calves: ['calves', 'legs'],
  triceps: ['triceps', 'shoulders', 'arms'],
  biceps: ['shoulders', 'arms', 'back'],
  hip_flexors: ['hip_flexors', 'hips', 'quadriceps'],
  lower_back: ['spine', 'back', 'hips', 'glutes'],
  upper_back: ['back', 'shoulders', 'spine'],
  traps: ['shoulders', 'back', 'spine']
};

// Body part labels for display
export const cooldownBodyPartLabels: Record<string, string> = {
  hamstrings: 'Hamstrings',
  quadriceps: 'Quadriceps',
  glutes: 'Glutes',
  calves: 'Calves',
  legs: 'Legs',
  chest: 'Chest',
  shoulders: 'Shoulders',
  back: 'Back',
  spine: 'Spine',
  triceps: 'Triceps',
  arms: 'Arms',
  hips: 'Hips',
  hip_flexors: 'Hip Flexors',
  piriformis: 'Piriformis',
  abdominals: 'Abdominals',
  full_body: 'Full Body',
  adductors: 'Adductors',
  inner_thighs: 'Inner Thighs',
  core: 'Core',
  lower_back: 'Lower Back'
};

function getWorkoutMuscleGroups(workout: GeneratedWorkout): Set<string> {
  const muscleGroups = new Set<string>();

  // Extract from circuit stations
  if (workout.circuit?.stations) {
    workout.circuit.stations.forEach(station => {
      station.exercises.forEach(exercise => {
        muscleGroups.add(exercise.primaryMuscle);
        exercise.muscleGroups.forEach(mg => muscleGroups.add(mg));
      });
    });
  }

  // Extract from legacy exercises
  if (workout.exercises) {
    workout.exercises.forEach(workoutExercise => {
      muscleGroups.add(workoutExercise.exercise.primaryMuscle);
      workoutExercise.exercise.muscleGroups.forEach(mg => muscleGroups.add(mg));
    });
  }

  return muscleGroups;
}

function getTargetCooldownBodyParts(workoutMuscleGroups: Set<string>): Set<string> {
  const targetParts = new Set<string>();

  // Always include essential recovery stretches
  targetParts.add('full_body');
  targetParts.add('spine');
  targetParts.add('back');

  // Add specific body parts based on workout muscle groups
  workoutMuscleGroups.forEach(muscleGroup => {
    const cooldownParts = muscleGroupToCooldownParts[muscleGroup] || [];
    cooldownParts.forEach(part => targetParts.add(part));
  });

  return targetParts;
}

function scoreStretchExercise(stretch: CooldownExercise, targetParts: Set<string>): number {
  let score = 0;

  // Base score for any stretch
  score += 1;

  // Higher score for stretches that target needed body parts
  stretch.targetBodyParts.forEach(part => {
    if (targetParts.has(part)) {
      if (part === 'full_body' || part === 'spine' || part === 'back') {
        score += 3; // Essential recovery areas get higher priority
      } else {
        score += 2; // Specific targeted areas
      }
    }
  });

  // Slight preference for longer stretches (better for cooldown)
  if (stretch.duration >= 45) {
    score += 1;
  }

  return score;
}

export function generateCooldown(workout: GeneratedWorkout): GeneratedCooldown {
  const workoutMuscleGroups = getWorkoutMuscleGroups(workout);
  const targetParts = getTargetCooldownBodyParts(workoutMuscleGroups);

  // Score and sort stretches
  const scoredStretches = stretchesData.map(stretch => ({
    stretch: stretch as CooldownExercise,
    score: scoreStretchExercise(stretch as CooldownExercise, targetParts)
  }));

  scoredStretches.sort((a, b) => b.score - a.score);

  // Select stretches for cooldown
  const selectedStretches: CooldownExercise[] = [];
  const usedBodyParts = new Set<string>();
  const minDuration = 180; // 3 minutes minimum
  const maxDuration = 480; // 8 minutes maximum
  let totalDuration = 0;

  // First pass: select high-priority stretches that cover different body parts
  for (const { stretch } of scoredStretches) {
    if (selectedStretches.length >= 8 || totalDuration >= maxDuration) {
      break;
    }

    // Check if this stretch targets new body parts
    const newBodyParts = stretch.targetBodyParts.filter(part => !usedBodyParts.has(part));

    if (newBodyParts.length > 0 || selectedStretches.length === 0) {
      selectedStretches.push(stretch);
      totalDuration += stretch.duration;
      stretch.targetBodyParts.forEach(part => usedBodyParts.add(part));
    }
  }

  // Second pass: fill to minimum duration if needed
  if (totalDuration < minDuration) {
    for (const { stretch } of scoredStretches) {
      if (selectedStretches.some(s => s.id === stretch.id)) {
        continue; // Already selected
      }

      if (totalDuration + stretch.duration <= maxDuration) {
        selectedStretches.push(stretch);
        totalDuration += stretch.duration;

        if (totalDuration >= minDuration) {
          break;
        }
      }
    }
  }

  // Ensure we have at least one stretch
  if (selectedStretches.length === 0) {
    const defaultStretch = stretchesData[0] as CooldownExercise;
    selectedStretches.push(defaultStretch);
    totalDuration = defaultStretch.duration;
  }

  // Apply user-configured duration to all selected stretches
  const preferences = DurationPreferencesStorage.getPreferences();
  const configuredStretches = selectedStretches.map(stretch => ({
    ...stretch,
    duration: preferences.cooldownDuration
  }));

  const configuredTotalDuration = configuredStretches.length * preferences.cooldownDuration;

  return {
    exercises: configuredStretches,
    totalDuration: configuredTotalDuration
  };
}