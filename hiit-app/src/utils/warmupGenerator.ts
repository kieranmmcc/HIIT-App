import type { GeneratedWorkout } from '../types/circuit';
import warmupsData from '../data/warmups.json';

interface WarmupExercise {
  id: string;
  name: string;
  instructions: string;
  targetBodyParts: string[];
  duration: number;
  equipment: string[];
}

interface GeneratedWarmup {
  exercises: WarmupExercise[];
  totalDuration: number;
}

const warmups = warmupsData as WarmupExercise[];

// Map workout muscle groups to warmup body parts
const muscleGroupMapping: Record<string, string[]> = {
  'chest': ['chest', 'shoulders', 'full_body'],
  'back': ['back', 'shoulders', 'spine', 'full_body'],
  'shoulders': ['shoulders', 'chest', 'back', 'full_body'],
  'arms': ['shoulders', 'chest', 'full_body'],
  'legs': ['legs', 'quadriceps', 'hamstrings', 'glutes', 'hips', 'hip_flexors', 'full_body'],
  'core': ['core', 'back', 'spine', 'full_body'],
  'glutes': ['glutes', 'legs', 'hips', 'full_body'],
  'cardio': ['cardio', 'full_body', 'legs']
};

export function generateWarmup(workout: GeneratedWorkout): GeneratedWarmup {
  // Extract all muscle groups from the workout
  const workoutMuscleGroups = new Set<string>();

  if (workout.circuit) {
    // Circuit-based workout
    workout.circuit.stations.forEach((station: any) => {
      station.exercises.forEach((exercise: any) => {
        workoutMuscleGroups.add(exercise.primaryMuscle);
        exercise.muscleGroups.forEach((mg: string) => workoutMuscleGroups.add(mg));
      });
    });
  } else {
    // Legacy workout
    workout.exercises.forEach(workoutEx => {
      workoutMuscleGroups.add(workoutEx.exercise.primaryMuscle);
      workoutEx.exercise.muscleGroups.forEach(mg => workoutMuscleGroups.add(mg));
    });
  }

  // Find warmup body parts we need to target
  const targetWarmupParts = new Set<string>();
  workoutMuscleGroups.forEach(muscleGroup => {
    const mappedParts = muscleGroupMapping[muscleGroup] || [];
    mappedParts.forEach(part => targetWarmupParts.add(part));
  });

  // Always include full_body and cardio for general warmup
  targetWarmupParts.add('full_body');
  targetWarmupParts.add('cardio');

  // Score warmups based on how well they target our needs
  const scoredWarmups = warmups.map(warmup => {
    let score = 0;
    const targetedParts = new Set<string>();

    warmup.targetBodyParts.forEach(part => {
      if (targetWarmupParts.has(part)) {
        score += 1;
        targetedParts.add(part);
      }
    });

    // Bonus for full_body and cardio exercises
    if (warmup.targetBodyParts.includes('full_body')) score += 2;
    if (warmup.targetBodyParts.includes('cardio')) score += 1;

    return {
      warmup,
      score,
      targetedParts: Array.from(targetedParts)
    };
  });

  // Sort by score (highest first)
  scoredWarmups.sort((a, b) => b.score - a.score);

  // Categorize warmups by intensity
  const stretchWarmups = scoredWarmups.filter(({ warmup }) =>
    warmup.name.toLowerCase().includes('stretch') ||
    warmup.name.toLowerCase().includes('circle') ||
    warmup.name.toLowerCase().includes('roll') ||
    warmup.name.toLowerCase().includes('swing') ||
    warmup.name.toLowerCase().includes('cat-cow') ||
    warmup.name.toLowerCase().includes('cobra') ||
    warmup.name.toLowerCase().includes('downward') ||
    warmup.name.toLowerCase().includes('bridge')
  );

  const activeWarmups = scoredWarmups.filter(({ warmup }) =>
    warmup.name.toLowerCase().includes('jack') ||
    warmup.name.toLowerCase().includes('knee') ||
    warmup.name.toLowerCase().includes('kick') ||
    warmup.name.toLowerCase().includes('squat') ||
    warmup.name.toLowerCase().includes('lunge') ||
    warmup.name.toLowerCase().includes('crawl') ||
    warmup.name.toLowerCase().includes('walk')
  );

  // Select warmups ensuring good coverage and minimum duration
  const selectedWarmups: WarmupExercise[] = [];
  const coveredParts = new Set<string>();
  let totalDuration = 0;
  const minDuration = 60; // At least 1 minute
  const maxDuration = 180; // At most 3 minutes

  // First pass: Select stretch/mobility warmups
  for (const { warmup, targetedParts } of stretchWarmups) {
    if (totalDuration >= maxDuration * 0.4) break; // Use up to 40% of time for stretches

    const coversNewParts = targetedParts.some(part => !coveredParts.has(part));
    const needsMoreTime = totalDuration < minDuration * 0.3; // At least 30% stretch time

    if (coversNewParts || needsMoreTime) {
      selectedWarmups.push(warmup);
      targetedParts.forEach(part => coveredParts.add(part));
      totalDuration += warmup.duration;
    }
  }

  // Second pass: Add active warmups
  for (const { warmup, targetedParts } of activeWarmups) {
    if (totalDuration >= maxDuration) break;

    const coversNewParts = targetedParts.some(part => !coveredParts.has(part));
    const needsMoreTime = totalDuration < minDuration;

    if (coversNewParts || needsMoreTime) {
      selectedWarmups.push(warmup);
      targetedParts.forEach(part => coveredParts.add(part));
      totalDuration += warmup.duration;
    }
  }

  // Third pass: If we still don't have minimum duration, add remaining warmups
  if (totalDuration < minDuration) {
    for (const { warmup } of scoredWarmups) {
      if (totalDuration >= minDuration) break;
      if (!selectedWarmups.find(w => w.id === warmup.id)) {
        selectedWarmups.push(warmup);
        totalDuration += warmup.duration;
      }
    }
  }

  // Ensure we have at least one exercise
  if (selectedWarmups.length === 0) {
    const defaultWarmup = warmups.find(w => w.targetBodyParts.includes('full_body')) || warmups[0];
    selectedWarmups.push(defaultWarmup);
    totalDuration = defaultWarmup.duration;
  }

  return {
    exercises: selectedWarmups,
    totalDuration
  };
}

// Map warmup body parts to muscle group labels for display
export const warmupBodyPartLabels: Record<string, string> = {
  'full_body': 'Full Body',
  'cardio': 'Cardio',
  'legs': 'Legs',
  'quadriceps': 'Quads',
  'hamstrings': 'Hamstrings',
  'glutes': 'Glutes',
  'core': 'Core',
  'back': 'Back',
  'chest': 'Chest',
  'shoulders': 'Shoulders',
  'arms': 'Arms',
  'hips': 'Hips',
  'hip_flexors': 'Hip Flexors',
  'spine': 'Spine',
  'balance': 'Balance',
  'adductors': 'Inner Thighs',
  'abductors': 'Outer Thighs',
  'obliques': 'Obliques',
  'lower_back': 'Lower Back',
  'upper_back': 'Upper Back',
  'neck': 'Neck',
  'ankles': 'Ankles',
  'calves': 'Calves',
  'abdominals': 'Abs',
  'thoracic_spine': 'Mid Spine',
  'scapula': 'Shoulder Blades',
  'stability': 'Stability'
};