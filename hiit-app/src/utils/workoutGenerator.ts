import type { Exercise, WorkoutExercise, GeneratedWorkout } from '../types/exercise';
import type { WorkoutSettings } from '../types/workout';
import { generateCircuitWorkout } from './circuitGenerator';
import { generateWarmup } from './warmupGenerator';
import { generateCooldown } from './cooldownGenerator';
import exercisesData from '../data/exercises.json';
import { BlacklistStorage } from './blacklistStorage';

const exercises = exercisesData as Exercise[];

export function generateWorkout(settings: WorkoutSettings): GeneratedWorkout {
  // Use new circuit-based generation if circuitType is specified
  if (settings.circuitType) {
    return generateCircuitWorkout(settings);
  }

  // Legacy generation for backward compatibility
  return generateLegacyWorkout(settings);
}

function generateLegacyWorkout(settings: WorkoutSettings): GeneratedWorkout {
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

  // Create the workout object
  const workout: GeneratedWorkout = {
    exercises: workoutExercises,
    totalDuration: actualDuration,
    difficulty,
    equipmentUsed: selectedEquipment
  };

  // Generate warmup and cooldown based on the workout
  const warmup = generateWarmup(workout);
  const cooldown = generateCooldown(workout);
  workout.warmup = warmup;
  workout.cooldown = cooldown;

  return workout;
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
  settings: WorkoutSettings,
  existingExercises?: Exercise[]
): Exercise | null {
  const { selectedEquipment, difficulty, targetMuscleGroups, excludedMuscleGroups } = settings;

  // Get all existing exercise IDs to avoid duplicates, always include current exercise
  const existingExerciseIds = existingExercises
    ? [...existingExercises.map(ex => ex.id), currentExercise.id]
    : [currentExercise.id];

  // Helper function to check if an exercise is cardio
  const isCardioExercise = (exercise: Exercise) => {
    const cardioMuscleGroups = ['legs', 'shoulders', 'core'];
    const cardioKeywords = ['jumping', 'burpee', 'mountain', 'jack', 'high knees', 'butt kickers', 'jump'];

    return (
      exercise.muscleGroups.some(mg => cardioMuscleGroups.includes(mg)) &&
      cardioKeywords.some(keyword => exercise.name.toLowerCase().includes(keyword))
    ) || exercise.name.toLowerCase().includes('cardio');
  };

  // Function to apply filters with fallback levels
  const getFilteredExercises = (fallbackLevel: number): Exercise[] => {
    const blacklistedExercises = BlacklistStorage.getBlacklistedExercises();

    // Level 1: Base filters (always applied)
    let filtered = exercises.filter(exercise =>
      exercise.equipment.some(equipmentType =>
        selectedEquipment.includes(equipmentType)
      ) && !blacklistedExercises.includes(exercise.id.toString()) &&
      !existingExerciseIds.includes(exercise.id) // Exclude all existing exercises
    );

    // For refresh, we want more variety - be more lenient with difficulty
    // Level 2: Apply difficulty filter (expand range at higher fallback levels)
    if (fallbackLevel === 0) {
      // Strict difficulty matching
      const difficultyMap = { easy: [1, 2, 3], medium: [2, 3, 4], hard: [3, 4, 5] };
      const allowedDifficulties = difficultyMap[difficulty];
      filtered = filtered.filter(exercise =>
        allowedDifficulties.includes(exercise.difficulty)
      );
    } else if (fallbackLevel === 1) {
      // Expanded difficulty range for more variety
      const expandedDifficultyMap = { easy: [1, 2, 3, 4], medium: [1, 2, 3, 4, 5], hard: [2, 3, 4, 5] };
      const allowedDifficulties = expandedDifficultyMap[difficulty];
      filtered = filtered.filter(exercise =>
        allowedDifficulties.includes(exercise.difficulty)
      );
    }
    // fallbackLevel >= 2: Skip difficulty filter entirely

    // Level 3: Apply excluded muscle groups filter (skip if fallbackLevel >= 3)
    if (fallbackLevel < 3 && excludedMuscleGroups && excludedMuscleGroups.length > 0) {
      filtered = filtered.filter(exercise => {
        // Exclude if primary muscle is in excluded list
        if (excludedMuscleGroups.includes(exercise.primaryMuscle)) {
          return false;
        }
        // Exclude if any muscle group is in excluded list
        if (exercise.muscleGroups.some(mg => excludedMuscleGroups.includes(mg))) {
          return false;
        }
        return true;
      });
    }

    // Level 4: Apply target muscle groups filter (skip if fallbackLevel >= 4)
    if (fallbackLevel < 4 && targetMuscleGroups && targetMuscleGroups.length > 0) {
      filtered = filtered.filter(exercise => {
        return targetMuscleGroups.some(targetMuscle => {
          if (targetMuscle === 'cardio') {
            return isCardioExercise(exercise);
          } else if (targetMuscle === 'core') {
            return exercise.primaryMuscle === 'core' || exercise.muscleGroups.includes('core');
          } else {
            return exercise.primaryMuscle === targetMuscle || exercise.muscleGroups.includes(targetMuscle);
          }
        });
      });
    }

    return filtered;
  };

  // Try different levels of filtering until we find exercises
  let candidateExercises: Exercise[] = [];
  let usedFallbackLevel = -1;

  // Prioritize avoid selections over variety - only ignore them as absolute last resort
  for (let level = 0; level <= 4; level++) {
    const filtered = getFilteredExercises(level);

    // Simple priority: use first level that has any exercises, avoid selections are respected until level 3+
    if (filtered.length > 0) {
      usedFallbackLevel = level;
      // Prefer exercises targeting the same primary muscle group (if not excluded at this level)
      if (level < 3 && (!excludedMuscleGroups || !excludedMuscleGroups.includes(currentExercise.primaryMuscle))) {
        const sameMuscleExercises = filtered.filter(exercise =>
          exercise.primaryMuscle === currentExercise.primaryMuscle
        );
        candidateExercises = sameMuscleExercises.length > 0 ? sameMuscleExercises : filtered;
      } else {
        candidateExercises = filtered;
      }
      break;
    }
  }

  if (candidateExercises.length === 0) {
    return null; // No suitable replacement found even with all fallbacks
  }

  // Return a random replacement with fallback reason if needed
  const randomIndex = Math.floor(Math.random() * candidateExercises.length);
  const selectedExercise = { ...candidateExercises[randomIndex] };

  // Set fallback reason based on the level that was needed
  if (usedFallbackLevel > 0) {
    if (usedFallbackLevel >= 4) {
      selectedExercise.fallbackReason = 'target_muscle_unavailable';
    } else if (usedFallbackLevel >= 3) {
      selectedExercise.fallbackReason = 'no_suitable_alternatives';
    } else if (usedFallbackLevel >= 2) {
      selectedExercise.fallbackReason = 'difficulty_mismatch';
    } else {
      selectedExercise.fallbackReason = 'equipment_unavailable';
    }
  }

  return selectedExercise;
}