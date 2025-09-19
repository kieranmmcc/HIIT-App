export interface Exercise {
  id: number;
  name: string;
  instructions: string;
  muscleGroups: string[];
  primaryMuscle: string;
  difficulty: number; // 1-5 scale
  equipment: string[];
  fallbackReason?: 'target_muscle_unavailable' | 'difficulty_mismatch' | 'equipment_unavailable' | 'no_suitable_alternatives';
}

export interface WorkoutExercise {
  exercise: Exercise;
  duration: number; // work duration in seconds
  restDuration: number; // rest duration in seconds
}

export interface GeneratedWorkout {
  exercises: WorkoutExercise[];
  totalDuration: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  equipmentUsed: string[];

  // Warmup exercises
  warmup?: {
    exercises: WarmupExercise[];
    totalDuration: number;
  };
}

export interface WarmupExercise {
  id: string;
  name: string;
  instructions: string;
  targetBodyParts: string[];
  duration: number;
  equipment: string[];
}

export interface ActiveWorkout {
  workout: GeneratedWorkout;
  currentExerciseIndex: number;
  phase: 'warmup' | 'prepare' | 'work' | 'rest' | 'complete';
  timeRemaining: number; // seconds remaining in current phase
  isActive: boolean;
  isPaused: boolean;
  currentWarmupIndex?: number; // For tracking warmup exercises
}