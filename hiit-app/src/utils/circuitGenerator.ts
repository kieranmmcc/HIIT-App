import type { Exercise } from '../types/exercise';
import type { WorkoutSettings } from '../types/workout';
import type {
  CircuitWorkout,
  CircuitStation,
  CircuitType,
  WorkoutExercise,
  GeneratedWorkout
} from '../types/circuit';
import exercisesData from '../data/exercises.json';
import { BlacklistStorage } from './blacklistStorage';

const exercises = exercisesData as Exercise[];

export function generateCircuitWorkout(settings: WorkoutSettings): GeneratedWorkout {
  const { duration, difficulty, selectedEquipment, targetMuscleGroups, circuitType, exerciseCount } = settings;

  // Get filtered exercises
  const availableExercises = getFilteredExercises(settings);

  // Calculate timing based on difficulty
  const { workTime, restTime } = getTimingForDifficulty(difficulty);

  // Generate circuit based on type
  const circuit = generateCircuitByType(
    circuitType,
    availableExercises,
    duration,
    workTime,
    restTime,
    difficulty,
    selectedEquipment,
    targetMuscleGroups,
    exerciseCount
  );

  // Convert circuit to legacy exercise format for compatibility
  const legacyExercises = convertCircuitToLegacyFormat(circuit);

  return {
    exercises: legacyExercises,
    totalDuration: circuit.totalDuration,
    difficulty,
    equipmentUsed: selectedEquipment,
    circuit
  };
}

function getFilteredExercises(settings: WorkoutSettings): Exercise[] {
  const { selectedEquipment, targetMuscleGroups, excludedMuscleGroups } = settings;

  // Helper function to check if an exercise is cardio
  const isCardioExercise = (exercise: Exercise) => {
    return exercise.primaryMuscle === 'cardio' ||
           exercise.muscleGroups.includes('cardio') ||
           // Also include high-intensity full-body exercises as cardio
           (exercise.difficulty >= 3 && exercise.primaryMuscle === 'full_body' &&
            (exercise.name.toLowerCase().includes('burpee') ||
             exercise.name.toLowerCase().includes('jump') ||
             exercise.name.toLowerCase().includes('sprint') ||
             exercise.name.toLowerCase().includes('explosive') ||
             exercise.name.toLowerCase().includes('plyometric') ||
             exercise.name.toLowerCase().includes('hop') ||
             exercise.name.toLowerCase().includes('skip')));
  };

  // Helper function to check if an exercise is core
  const isCoreExercise = (exercise: Exercise) => {
    return exercise.primaryMuscle === 'core' ||
           exercise.muscleGroups.includes('core') ||
           // Also include exercises that are clearly core-focused
           (exercise.name.toLowerCase().includes('plank') ||
            exercise.name.toLowerCase().includes('crunch') ||
            exercise.name.toLowerCase().includes('sit-up') ||
            exercise.name.toLowerCase().includes('abs') ||
            exercise.name.toLowerCase().includes('russian twist') ||
            exercise.name.toLowerCase().includes('hollow') ||
            exercise.name.toLowerCase().includes('v-up') ||
            exercise.name.toLowerCase().includes('bicycle'));
  };

  // Filter exercises by available equipment and exclude blacklisted exercises
  const blacklistedExercises = BlacklistStorage.getBlacklistedExercises();

  // Create an expanded equipment list that includes compatible substitutions
  const expandedEquipment = [...selectedEquipment];

  // If user has bench_step, they can also do weight_bench exercises
  if (selectedEquipment.includes('bench_step') && !selectedEquipment.includes('weight_bench')) {
    expandedEquipment.push('weight_bench');
  }

  let availableExercises = exercises.filter(exercise =>
    exercise.equipment.some(equipmentType =>
      expandedEquipment.includes(equipmentType)
    ) && !blacklistedExercises.includes(exercise.id.toString())
  );

  // Filter by target muscle groups if specified
  if (targetMuscleGroups && targetMuscleGroups.length > 0) {

    availableExercises = availableExercises.filter(exercise => {
      // Check each target muscle group
      return targetMuscleGroups.some(targetMuscle => {
        if (targetMuscle === 'cardio') {
          return isCardioExercise(exercise);
        } else if (targetMuscle === 'core') {
          return isCoreExercise(exercise);
        } else if (targetMuscle === 'legs_glutes') {
          return exercise.primaryMuscle === 'legs' ||
                 exercise.primaryMuscle === 'quadriceps' ||
                 exercise.primaryMuscle === 'hamstrings' ||
                 exercise.primaryMuscle === 'glutes' ||
                 exercise.muscleGroups.includes('legs') ||
                 exercise.muscleGroups.includes('quadriceps') ||
                 exercise.muscleGroups.includes('hamstrings') ||
                 exercise.muscleGroups.includes('glutes');
        } else if (targetMuscle === 'arms') {
          return exercise.primaryMuscle === 'biceps' ||
                 exercise.primaryMuscle === 'triceps' ||
                 exercise.muscleGroups.includes('biceps') ||
                 exercise.muscleGroups.includes('triceps') ||
                 exercise.muscleGroups.includes('arms');
        } else if (targetMuscle === 'chest_back') {
          return exercise.primaryMuscle === 'chest' ||
                 exercise.primaryMuscle === 'back' ||
                 exercise.muscleGroups.includes('chest') ||
                 exercise.muscleGroups.includes('back');
        } else if (targetMuscle === 'shoulders_core') {
          return exercise.primaryMuscle === 'shoulders' ||
                 exercise.primaryMuscle === 'core' ||
                 exercise.muscleGroups.includes('shoulders') ||
                 exercise.muscleGroups.includes('core') ||
                 isCoreExercise(exercise);
        } else if (targetMuscle === 'cardio_core') {
          return isCardioExercise(exercise) || isCoreExercise(exercise);
        } else {
          return exercise.primaryMuscle === targetMuscle ||
                 exercise.muscleGroups.includes(targetMuscle);
        }
      });
    });
  }

  // Filter out excluded muscle groups
  if (excludedMuscleGroups && excludedMuscleGroups.length > 0) {
    availableExercises = availableExercises.filter(exercise => {
      // Check if exercise should be excluded
      return !excludedMuscleGroups.some(excludedMuscle => {
        if (excludedMuscle === 'cardio') {
          return isCardioExercise(exercise);
        } else if (excludedMuscle === 'core') {
          return isCoreExercise(exercise);
        } else if (excludedMuscle === 'legs_glutes') {
          return exercise.primaryMuscle === 'legs' ||
                 exercise.primaryMuscle === 'quadriceps' ||
                 exercise.primaryMuscle === 'hamstrings' ||
                 exercise.primaryMuscle === 'glutes' ||
                 exercise.muscleGroups.includes('legs') ||
                 exercise.muscleGroups.includes('quadriceps') ||
                 exercise.muscleGroups.includes('hamstrings') ||
                 exercise.muscleGroups.includes('glutes');
        } else if (excludedMuscle === 'arms') {
          return exercise.primaryMuscle === 'biceps' ||
                 exercise.primaryMuscle === 'triceps' ||
                 exercise.muscleGroups.includes('biceps') ||
                 exercise.muscleGroups.includes('triceps') ||
                 exercise.muscleGroups.includes('arms');
        } else if (excludedMuscle === 'chest_back') {
          return exercise.primaryMuscle === 'chest' ||
                 exercise.primaryMuscle === 'back' ||
                 exercise.muscleGroups.includes('chest') ||
                 exercise.muscleGroups.includes('back');
        } else if (excludedMuscle === 'shoulders_core') {
          return exercise.primaryMuscle === 'shoulders' ||
                 exercise.primaryMuscle === 'core' ||
                 exercise.muscleGroups.includes('shoulders') ||
                 exercise.muscleGroups.includes('core') ||
                 isCoreExercise(exercise);
        } else if (excludedMuscle === 'cardio_core') {
          return isCardioExercise(exercise) || isCoreExercise(exercise);
        } else {
          return exercise.primaryMuscle === excludedMuscle ||
                 exercise.muscleGroups.includes(excludedMuscle);
        }
      });
    });
  }

  return availableExercises;
}

function getTimingForDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      return { workTime: 30, restTime: 30 };
    case 'medium':
      return { workTime: 45, restTime: 15 };
    case 'hard':
      return { workTime: 50, restTime: 10 };
  }
}

function generateCircuitByType(
  type: CircuitType,
  availableExercises: Exercise[],
  duration: number,
  workTime: number,
  restTime: number,
  difficulty: 'easy' | 'medium' | 'hard',
  selectedEquipment: string[],
  targetMuscleGroups?: string[],
  exerciseCount?: number
): CircuitWorkout {
  switch (type) {
    case 'classic_cycle':
      return generateClassicCircuit(availableExercises, duration, workTime, restTime, difficulty, selectedEquipment, exerciseCount || 8);
    case 'super_sets':
      return generateSuperSets(availableExercises, duration, workTime, restTime, difficulty, selectedEquipment, targetMuscleGroups, exerciseCount || 8);
    default:
      return generateClassicCircuit(availableExercises, duration, workTime, restTime, difficulty, selectedEquipment, exerciseCount || 8);
  }
}

function generateClassicCircuit(
  availableExercises: Exercise[],
  duration: number,
  workTime: number,
  restTime: number,
  difficulty: 'easy' | 'medium' | 'hard',
  selectedEquipment: string[],
  exerciseCount: number = 8
): CircuitWorkout {
  // Select exercises based on the specified count
  const selectedExercises = selectBalancedExercises(availableExercises, exerciseCount, difficulty);

  // Calculate rounds needed
  const roundDuration = (workTime + restTime) * exerciseCount;
  const totalSeconds = duration * 60;
  const rounds = Math.max(1, Math.floor(totalSeconds / roundDuration));

  // Create single station with all exercises
  const station: CircuitStation = {
    id: 'main-circuit',
    name: 'Classic Circuit',
    exercises: selectedExercises,
    currentExerciseIndex: 0
  };

  return {
    type: 'classic_cycle',
    stations: [station],
    rounds,
    workTime,
    restTime,
    totalDuration: rounds * roundDuration,
    difficulty,
    equipmentUsed: selectedEquipment
  };
}


function generateSuperSets(
  availableExercises: Exercise[],
  duration: number,
  workTime: number,
  restTime: number,
  difficulty: 'easy' | 'medium' | 'hard',
  selectedEquipment: string[],
  targetMuscleGroups?: string[],
  exerciseCount: number = 8
): CircuitWorkout {
  // Select exercises for super sets (must be even number for pairing)
  const evenCount = exerciseCount % 2 === 0 ? exerciseCount : exerciseCount - 1;
  const selectedExercises = selectComplementaryExercises(availableExercises, evenCount, difficulty, targetMuscleGroups);


  // Create super set stations based on exercise count
  const numStations = evenCount / 2;
  const stations: CircuitStation[] = [];
  for (let i = 0; i < numStations; i++) {
    const exercise1 = selectedExercises[i * 2];
    const exercise2 = selectedExercises[i * 2 + 1];

    stations.push({
      id: `superset-${i + 1}`,
      name: `Super Set ${i + 1}`,
      exercises: [exercise1, exercise2].filter(Boolean), // Filter out undefined exercises
      currentExerciseIndex: 0
    });
  }

  const superSetTime = (workTime + restTime) * 2; // 2 exercises per super set
  const stationRestTime = 30; // Extra rest between super sets
  const fullCircuitTime = superSetTime * numStations + stationRestTime * (numStations - 1); // Dynamic stations + transitions
  const totalSeconds = duration * 60;
  const rounds = Math.max(1, Math.floor(totalSeconds / fullCircuitTime));

  return {
    type: 'super_sets',
    stations,
    rounds,
    workTime,
    restTime,
    stationRestTime,
    totalDuration: rounds * fullCircuitTime,
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
      const randomIndex = Math.floor(Math.random() * availableInGroup.length);
      selected.push(availableInGroup[randomIndex]);
    }

    currentMuscleIndex++;

    if (currentMuscleIndex >= muscleGroupKeys.length * 3) {
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

function selectComplementaryExercises(
  availableExercises: Exercise[],
  count: number,
  difficulty: 'easy' | 'medium' | 'hard',
  targetMuscleGroups?: string[]
): Exercise[] {
  // For super sets, try to pair opposing muscle groups
  const complementaryPairs = [
    ['chest', 'back'],
    ['quadriceps', 'hamstrings'],
    ['biceps', 'triceps'],
    ['shoulders', 'core'],
    ['cardio', 'cardio'], // Cardio can be paired with itself for high-intensity intervals
    ['cardio', 'core'], // Cardio/core combinations
    ['cardio', 'quadriceps'], // Cardio/leg combinations
    ['cardio', 'chest'], // Cardio/upper body combinations
    ['core', 'core'], // Core can be paired with itself for intense core circuits
    ['core', 'legs'], // Core/leg combinations
    ['core', 'glutes'], // Core/glute combinations
    ['core', 'shoulders'], // Core/shoulder stability combinations
    ['legs_glutes', 'legs_glutes'], // Lower body power combo
    ['arms', 'arms'], // Arms selection
    ['chest_back', 'chest_back'], // Chest/back antagonist pair
    ['shoulders_core', 'shoulders_core'], // Shoulders/core stability combo
    ['cardio_core', 'cardio_core'] // Cardio/core blast
  ];

  // If user selected target muscle groups, prioritize those pairs
  let prioritizedPairs = complementaryPairs;
  if (targetMuscleGroups && targetMuscleGroups.length > 0) {
    if (targetMuscleGroups.length === 4) {
      // If exactly 4 muscle groups selected, create 4 unique pairs
      // Group selected muscles into complementary pairs to ensure variety
      const selectedMuscles = [...targetMuscleGroups];
      const createdPairs: string[][] = [];

      // Try to create pairs from complementary groups first
      for (const [muscle1, muscle2] of complementaryPairs) {
        if (selectedMuscles.includes(muscle1) && selectedMuscles.includes(muscle2)) {
          createdPairs.push([muscle1, muscle2]);
          selectedMuscles.splice(selectedMuscles.indexOf(muscle1), 1);
          selectedMuscles.splice(selectedMuscles.indexOf(muscle2), 1);
        }
      }

      // For remaining muscles, pair them or use with themselves
      while (selectedMuscles.length >= 2) {
        createdPairs.push([selectedMuscles.pop()!, selectedMuscles.pop()!]);
      }

      // If one muscle left, pair with itself
      if (selectedMuscles.length === 1) {
        createdPairs.push([selectedMuscles[0], selectedMuscles[0]]);
      }

      prioritizedPairs = createdPairs;
    } else {
      // Find pairs that include the user's selected muscle groups
      const userPairs = complementaryPairs.filter(pair =>
        pair.some(muscle => targetMuscleGroups.includes(muscle))
      );
      // Put user's preferred pairs first
      prioritizedPairs = [...userPairs, ...complementaryPairs.filter(pair =>
        !userPairs.includes(pair)
      )];
    }
  }

  const difficultyMap = { easy: [1, 2, 3], medium: [2, 3, 4], hard: [3, 4, 5] };
  const allowedDifficulties = difficultyMap[difficulty];

  const suitableExercises = availableExercises.filter(exercise =>
    allowedDifficulties.includes(exercise.difficulty)
  );

  const selected: Exercise[] = [];

  // Try to create complementary pairs using prioritized pairs
  for (const [muscle1, muscle2] of prioritizedPairs) {
    if (selected.length >= count) break;

    // Helper function to check if an exercise is cardio
    const isCardioExercise = (exercise: Exercise) => {
      return exercise.primaryMuscle === 'cardio' ||
             exercise.muscleGroups.includes('cardio') ||
             // Also include high-intensity full-body exercises as cardio
             (exercise.difficulty >= 3 && exercise.primaryMuscle === 'full_body' &&
              (exercise.name.toLowerCase().includes('burpee') ||
               exercise.name.toLowerCase().includes('jump') ||
               exercise.name.toLowerCase().includes('sprint') ||
               exercise.name.toLowerCase().includes('explosive') ||
               exercise.name.toLowerCase().includes('plyometric') ||
               exercise.name.toLowerCase().includes('hop') ||
               exercise.name.toLowerCase().includes('skip')));
    };

    // Helper function to check if an exercise is core
    const isCoreExercise = (exercise: Exercise) => {
      return exercise.primaryMuscle === 'core' ||
             exercise.muscleGroups.includes('core') ||
             // Also include exercises that are clearly core-focused
             (exercise.name.toLowerCase().includes('plank') ||
              exercise.name.toLowerCase().includes('crunch') ||
              exercise.name.toLowerCase().includes('sit-up') ||
              exercise.name.toLowerCase().includes('abs') ||
              exercise.name.toLowerCase().includes('russian twist') ||
              exercise.name.toLowerCase().includes('hollow') ||
              exercise.name.toLowerCase().includes('v-up') ||
              exercise.name.toLowerCase().includes('bicycle'));
    };

    // Helper function to check if an exercise is arms-related
    const isArmsExercise = (exercise: Exercise) => {
      return exercise.primaryMuscle === 'biceps' ||
             exercise.primaryMuscle === 'triceps' ||
             exercise.muscleGroups.includes('biceps') ||
             exercise.muscleGroups.includes('triceps') ||
             exercise.muscleGroups.includes('arms');
    };

    // Helper function to check if an exercise is legs/glutes
    const isLegsGlutesExercise = (exercise: Exercise) => {
      return exercise.primaryMuscle === 'legs' ||
             exercise.primaryMuscle === 'quadriceps' ||
             exercise.primaryMuscle === 'hamstrings' ||
             exercise.primaryMuscle === 'glutes' ||
             exercise.muscleGroups.includes('legs') ||
             exercise.muscleGroups.includes('quadriceps') ||
             exercise.muscleGroups.includes('hamstrings') ||
             exercise.muscleGroups.includes('glutes');
    };

    // Helper function to check if an exercise is chest/back
    const isChestBackExercise = (exercise: Exercise) => {
      return exercise.primaryMuscle === 'chest' ||
             exercise.primaryMuscle === 'back' ||
             exercise.muscleGroups.includes('chest') ||
             exercise.muscleGroups.includes('back');
    };

    // Helper function to check if an exercise is shoulders/core
    const isShouldersCore = (exercise: Exercise) => {
      return exercise.primaryMuscle === 'shoulders' ||
             exercise.primaryMuscle === 'core' ||
             exercise.muscleGroups.includes('shoulders') ||
             exercise.muscleGroups.includes('core') ||
             isCoreExercise(exercise);
    };

    // Helper function to check if an exercise is cardio/core
    const isCardioCore = (exercise: Exercise) => {
      return isCardioExercise(exercise) || isCoreExercise(exercise);
    };

    const muscle1Exercises = suitableExercises.filter(ex => {
      let matchesMuscle = false;
      if (muscle1 === 'cardio') {
        matchesMuscle = isCardioExercise(ex);
      } else if (muscle1 === 'core') {
        matchesMuscle = isCoreExercise(ex);
      } else if (muscle1 === 'legs_glutes') {
        matchesMuscle = isLegsGlutesExercise(ex);
      } else if (muscle1 === 'arms') {
        matchesMuscle = isArmsExercise(ex);
      } else if (muscle1 === 'chest_back') {
        matchesMuscle = isChestBackExercise(ex);
      } else if (muscle1 === 'shoulders_core') {
        matchesMuscle = isShouldersCore(ex);
      } else if (muscle1 === 'cardio_core') {
        matchesMuscle = isCardioCore(ex);
      } else {
        matchesMuscle = ex.primaryMuscle === muscle1 || ex.muscleGroups.includes(muscle1);
      }
      return matchesMuscle && !selected.some(sel => sel.id === ex.id);
    });
    const muscle2Exercises = suitableExercises.filter(ex => {
      let matchesMuscle = false;
      if (muscle2 === 'cardio') {
        matchesMuscle = isCardioExercise(ex);
      } else if (muscle2 === 'core') {
        matchesMuscle = isCoreExercise(ex);
      } else if (muscle2 === 'legs_glutes') {
        matchesMuscle = isLegsGlutesExercise(ex);
      } else if (muscle2 === 'arms') {
        matchesMuscle = isArmsExercise(ex);
      } else if (muscle2 === 'chest_back') {
        matchesMuscle = isChestBackExercise(ex);
      } else if (muscle2 === 'shoulders_core') {
        matchesMuscle = isShouldersCore(ex);
      } else if (muscle2 === 'cardio_core') {
        matchesMuscle = isCardioCore(ex);
      } else {
        matchesMuscle = ex.primaryMuscle === muscle2 || ex.muscleGroups.includes(muscle2);
      }
      return matchesMuscle && !selected.some(sel => sel.id === ex.id);
    });

    // Special handling for cardio pairs
    if (muscle1 === 'cardio' && muscle2 === 'cardio') {
      // For cardio super sets, select 2 different high-intensity cardio exercises
      if (muscle1Exercises.length >= 2) {
        const shuffled = muscle1Exercises.sort(() => Math.random() - 0.5);
        selected.push(shuffled[0], shuffled[1]);
      } else if (muscle1Exercises.length > 0) {
        // If we only have 1 cardio exercise, pair it with itself (different intervals)
        selected.push(muscle1Exercises[0], muscle1Exercises[0]);
      }
    }
    // Special handling for core pairs
    else if (muscle1 === 'core' && muscle2 === 'core') {
      // For core super sets, select 2 different core exercises for variety
      if (muscle1Exercises.length >= 2) {
        const shuffled = muscle1Exercises.sort(() => Math.random() - 0.5);
        selected.push(shuffled[0], shuffled[1]);
      } else if (muscle1Exercises.length > 0) {
        // If we only have 1 core exercise, pair it with itself
        selected.push(muscle1Exercises[0], muscle1Exercises[0]);
      }
    }
    // Special handling for legs/glutes pairs
    else if (muscle1 === 'legs_glutes' && muscle2 === 'legs_glutes') {
      // For legs/glutes super sets, try to get one leg-focused and one glute-focused exercise
      const legExercises = muscle1Exercises.filter(ex =>
        ex.primaryMuscle === 'quadriceps' || ex.primaryMuscle === 'hamstrings' ||
        ex.muscleGroups.includes('quadriceps') || ex.muscleGroups.includes('hamstrings') ||
        (ex.primaryMuscle === 'legs' && !ex.muscleGroups.includes('glutes'))
      );
      const gluteExercises = muscle1Exercises.filter(ex =>
        ex.primaryMuscle === 'glutes' || ex.muscleGroups.includes('glutes')
      );

      if (legExercises.length > 0 && gluteExercises.length > 0) {
        // Perfect - one leg-focused, one glute-focused
        selected.push(
          legExercises[Math.floor(Math.random() * legExercises.length)],
          gluteExercises[Math.floor(Math.random() * gluteExercises.length)]
        );
      } else if (muscle1Exercises.length >= 2) {
        // Fallback to any 2 lower body exercises
        const shuffled = muscle1Exercises.sort(() => Math.random() - 0.5);
        selected.push(shuffled[0], shuffled[1]);
      } else if (muscle1Exercises.length > 0) {
        // Last resort - same exercise twice
        selected.push(muscle1Exercises[0], muscle1Exercises[0]);
      }
    }
    // Special handling for arms pairs (same logic as biceps_triceps)
    else if (muscle1 === 'arms' && muscle2 === 'arms') {
      // For arms super sets, try to get one bicep and one tricep exercise
      const bicepExercises = muscle1Exercises.filter(ex =>
        ex.primaryMuscle === 'biceps' || ex.muscleGroups.includes('biceps')
      );
      const tricepExercises = muscle1Exercises.filter(ex =>
        ex.primaryMuscle === 'triceps' || ex.muscleGroups.includes('triceps')
      );

      if (bicepExercises.length > 0 && tricepExercises.length > 0) {
        // Perfect - one bicep, one tricep
        selected.push(
          bicepExercises[Math.floor(Math.random() * bicepExercises.length)],
          tricepExercises[Math.floor(Math.random() * tricepExercises.length)]
        );
      } else if (muscle1Exercises.length >= 2) {
        // Fallback to any 2 arm exercises
        const shuffled = muscle1Exercises.sort(() => Math.random() - 0.5);
        selected.push(shuffled[0], shuffled[1]);
      } else if (muscle1Exercises.length > 0) {
        // Last resort - same exercise twice
        selected.push(muscle1Exercises[0], muscle1Exercises[0]);
      }
    }
    // Special handling for chest/back pairs
    else if (muscle1 === 'chest_back' && muscle2 === 'chest_back') {
      // For chest/back super sets, try to get one chest and one back exercise
      const chestExercises = muscle1Exercises.filter(ex =>
        ex.primaryMuscle === 'chest' || ex.muscleGroups.includes('chest')
      );
      const backExercises = muscle1Exercises.filter(ex =>
        ex.primaryMuscle === 'back' || ex.muscleGroups.includes('back')
      );

      if (chestExercises.length > 0 && backExercises.length > 0) {
        // Perfect - one chest, one back
        selected.push(
          chestExercises[Math.floor(Math.random() * chestExercises.length)],
          backExercises[Math.floor(Math.random() * backExercises.length)]
        );
      } else if (muscle1Exercises.length >= 2) {
        // Fallback to any 2 exercises
        const shuffled = muscle1Exercises.sort(() => Math.random() - 0.5);
        selected.push(shuffled[0], shuffled[1]);
      } else if (muscle1Exercises.length > 0) {
        selected.push(muscle1Exercises[0], muscle1Exercises[0]);
      }
    }
    // Special handling for shoulders/core pairs
    else if (muscle1 === 'shoulders_core' && muscle2 === 'shoulders_core') {
      const shoulderExercises = muscle1Exercises.filter(ex =>
        ex.primaryMuscle === 'shoulders' || ex.muscleGroups.includes('shoulders')
      );
      const coreExercises = muscle1Exercises.filter(ex =>
        ex.primaryMuscle === 'core' || ex.muscleGroups.includes('core') || isCoreExercise(ex)
      );

      if (shoulderExercises.length > 0 && coreExercises.length > 0) {
        selected.push(
          shoulderExercises[Math.floor(Math.random() * shoulderExercises.length)],
          coreExercises[Math.floor(Math.random() * coreExercises.length)]
        );
      } else if (muscle1Exercises.length >= 2) {
        const shuffled = muscle1Exercises.sort(() => Math.random() - 0.5);
        selected.push(shuffled[0], shuffled[1]);
      } else if (muscle1Exercises.length > 0) {
        selected.push(muscle1Exercises[0], muscle1Exercises[0]);
      }
    }
    // Special handling for cardio/core pairs
    else if (muscle1 === 'cardio_core' && muscle2 === 'cardio_core') {
      const cardioExercises = muscle1Exercises.filter(ex => isCardioExercise(ex));
      const coreExercises = muscle1Exercises.filter(ex => isCoreExercise(ex));

      if (cardioExercises.length > 0 && coreExercises.length > 0) {
        selected.push(
          cardioExercises[Math.floor(Math.random() * cardioExercises.length)],
          coreExercises[Math.floor(Math.random() * coreExercises.length)]
        );
      } else if (muscle1Exercises.length >= 2) {
        const shuffled = muscle1Exercises.sort(() => Math.random() - 0.5);
        selected.push(shuffled[0], shuffled[1]);
      } else if (muscle1Exercises.length > 0) {
        selected.push(muscle1Exercises[0], muscle1Exercises[0]);
      }
    } else if (muscle1Exercises.length > 0 && muscle2Exercises.length > 0) {
      selected.push(
        muscle1Exercises[Math.floor(Math.random() * muscle1Exercises.length)],
        muscle2Exercises[Math.floor(Math.random() * muscle2Exercises.length)]
      );
    }
  }

  // Fill remaining slots with balanced selection
  if (selected.length < count) {
    const remaining = selectBalancedExercises(
      suitableExercises.filter(ex => !selected.some(sel => sel.id === ex.id)),
      count - selected.length,
      difficulty
    );
    selected.push(...remaining);
  }

  return selected.slice(0, count);
}

function convertCircuitToLegacyFormat(circuit: CircuitWorkout): WorkoutExercise[] {
  const legacyExercises: WorkoutExercise[] = [];

  if (circuit.type === 'super_sets') {
    // For super sets, stay at each station and alternate exercises multiple times
    for (const station of circuit.stations) {
      // At each station, repeat the A->B pattern for the number of rounds
      for (let round = 0; round < circuit.rounds; round++) {
        for (const exercise of station.exercises) {
          legacyExercises.push({
            exercise,
            duration: circuit.workTime,
            restDuration: circuit.restTime,
            stationId: station.id,
            roundNumber: round + 1
          });
        }
      }
    }
  } else {
    // For other circuit types (classic_cycle), use the original logic
    // This goes through all exercises in each round before starting the next round
    for (let round = 0; round < circuit.rounds; round++) {
      for (const station of circuit.stations) {
        for (const exercise of station.exercises) {
          legacyExercises.push({
            exercise,
            duration: circuit.workTime,
            restDuration: circuit.restTime,
            stationId: station.id,
            roundNumber: round + 1
          });
        }
      }
    }
  }

  return legacyExercises;
}