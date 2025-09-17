import type { Exercise, WorkoutExercise, GeneratedWorkout } from '../types/exercise';
import type { WorkoutSettings } from '../types/workout';
import exercisesData from '../data/exercises.json';
import { BlacklistStorage } from './blacklistStorage';

const exercises = exercisesData as Exercise[];

export function generateWorkout(settings: WorkoutSettings): GeneratedWorkout {
  const { duration, difficulty, selectedEquipment, targetMuscleGroups } = settings;

  // Filter exercises by available equipment and exclude blacklisted exercises
  const blacklistedExercises = BlacklistStorage.getBlacklistedExercises();
  let availableExercises = exercises.filter(exercise =>
    exercise.equipment.some(equipmentType =>
      selectedEquipment.includes(equipmentType)
    ) && !blacklistedExercises.includes(exercise.id.toString())
  );

  // Filter by target muscle groups if specified
  if (targetMuscleGroups && targetMuscleGroups.length > 0) {
    availableExercises = availableExercises.filter(exercise =>
      targetMuscleGroups.includes(exercise.primaryMuscle) ||
      exercise.muscleGroups.some(muscleGroup => targetMuscleGroups.includes(muscleGroup))
    );
  }

  // Calculate timing based on difficulty
  let workTime: number;
  let restTime: number;

  switch (difficulty) {
    case 'easy':
      workTime = 30;
      restTime = 30;
      break;
    case 'medium':
      workTime = 45;
      restTime = 15;
      break;
    case 'hard':
      workTime = 50;
      restTime = 10;
      break;
  }

  // Calculate number of exercises needed
  const roundDuration = workTime + restTime; // seconds per exercise
  const totalSeconds = duration * 60;
  const targetExerciseCount = Math.floor(totalSeconds / roundDuration);

  // Limit variety: use max half the total exercises, then cycle through them
  const maxUniqueExercises = Math.max(3, Math.floor(targetExerciseCount / 2));

  // Smart exercise selection to avoid muscle group overload
  const uniqueExercises = selectBalancedExercises(
    availableExercises,
    maxUniqueExercises,
    difficulty
  );

  // Create workout by cycling through the selected exercises
  const selectedExercises = createCycledWorkout(uniqueExercises, targetExerciseCount);

  // Create workout exercises with timing
  const workoutExercises: WorkoutExercise[] = selectedExercises.map(exercise => ({
    exercise,
    duration: workTime,
    restDuration: restTime
  }));

  // Calculate actual total duration
  const actualDuration = workoutExercises.length * roundDuration;

  return {
    exercises: workoutExercises,
    totalDuration: actualDuration,
    difficulty,
    equipmentUsed: selectedEquipment
  };
}

function selectBalancedExercises(
  availableExercises: Exercise[],
  count: number,
  difficulty: 'easy' | 'medium' | 'hard'
): Exercise[] {
  // Filter by difficulty level
  const difficultyMap = { easy: [1, 2, 3], medium: [2, 3, 4], hard: [3, 4, 5] };
  const allowedDifficulties = difficultyMap[difficulty];

  const suitableExercises = availableExercises.filter(exercise =>
    allowedDifficulties.includes(exercise.difficulty)
  );

  if (suitableExercises.length === 0) {
    // Fallback to all available exercises if none match difficulty
    return availableExercises.slice(0, count);
  }

  // Group by primary muscle to ensure variety
  const muscleGroups: Record<string, Exercise[]> = {};
  suitableExercises.forEach(exercise => {
    const primary = exercise.primaryMuscle;
    if (!muscleGroups[primary]) {
      muscleGroups[primary] = [];
    }
    muscleGroups[primary].push(exercise);
  });

  // Select exercises with muscle group rotation
  const selected: Exercise[] = [];
  const muscleGroupKeys = Object.keys(muscleGroups);
  let currentMuscleIndex = 0;

  while (selected.length < count && selected.length < suitableExercises.length) {
    const currentMuscleGroup = muscleGroupKeys[currentMuscleIndex % muscleGroupKeys.length];
    const availableInGroup = muscleGroups[currentMuscleGroup].filter(
      exercise => !selected.some(sel => sel.id === exercise.id)
    );

    if (availableInGroup.length > 0) {
      // Pick a random exercise from this muscle group
      const randomIndex = Math.floor(Math.random() * availableInGroup.length);
      selected.push(availableInGroup[randomIndex]);
    }

    currentMuscleIndex++;

    // If we've cycled through all muscle groups and still need more exercises
    if (currentMuscleIndex >= muscleGroupKeys.length * 3) {
      // Add remaining exercises randomly
      const remaining = suitableExercises.filter(
        exercise => !selected.some(sel => sel.id === exercise.id)
      );
      const needed = count - selected.length;
      const randomRemaining = remaining
        .sort(() => Math.random() - 0.5)
        .slice(0, needed);
      selected.push(...randomRemaining);
      break;
    }
  }

  return selected;
}

function createCycledWorkout(uniqueExercises: Exercise[], targetCount: number): Exercise[] {
  if (uniqueExercises.length === 0) return [];

  const cycledWorkout: Exercise[] = [];

  for (let i = 0; i < targetCount; i++) {
    const exerciseIndex = i % uniqueExercises.length;
    cycledWorkout.push(uniqueExercises[exerciseIndex]);
  }

  return cycledWorkout;
}

export function regenerateExercise(
  currentExercise: Exercise,
  settings: WorkoutSettings
): Exercise | null {
  const { selectedEquipment, difficulty } = settings;

  // Filter exercises by available equipment and exclude blacklisted exercises
  const blacklistedExercises = BlacklistStorage.getBlacklistedExercises();
  const availableExercises = exercises.filter(exercise =>
    exercise.equipment.some(equipmentType =>
      selectedEquipment.includes(equipmentType)
    ) && !blacklistedExercises.includes(exercise.id.toString()) &&
    exercise.id !== currentExercise.id // Exclude current exercise
  );

  // Filter by difficulty level
  const difficultyMap = { easy: [1, 2, 3], medium: [2, 3, 4], hard: [3, 4, 5] };
  const allowedDifficulties = difficultyMap[difficulty];

  const suitableExercises = availableExercises.filter(exercise =>
    allowedDifficulties.includes(exercise.difficulty)
  );

  // Prefer exercises targeting the same primary muscle group
  const sameMuscleExercises = suitableExercises.filter(exercise =>
    exercise.primaryMuscle === currentExercise.primaryMuscle
  );

  // Choose from same muscle group if available, otherwise from all suitable exercises
  const candidateExercises = sameMuscleExercises.length > 0 ? sameMuscleExercises : suitableExercises;

  if (candidateExercises.length === 0) {
    return null; // No suitable replacement found
  }

  // Return a random replacement
  const randomIndex = Math.floor(Math.random() * candidateExercises.length);
  return candidateExercises[randomIndex];
}