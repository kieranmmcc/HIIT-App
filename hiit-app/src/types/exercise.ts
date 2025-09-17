export interface Exercise {
  id: number;
  name: string;
  instructions: string;
  muscleGroups: string[];
  primaryMuscle: string;
  difficulty: number; // 1-5 scale
  equipment: string[];
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
}

export interface ActiveWorkout {
  workout: GeneratedWorkout;
  currentExerciseIndex: number;
  phase: 'prepare' | 'work' | 'rest' | 'complete';
  timeRemaining: number; // seconds remaining in current phase
  isActive: boolean;
  isPaused: boolean;
}