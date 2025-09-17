export interface WorkoutSettings {
  duration: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  selectedEquipment: string[];
  targetMuscleGroups?: string[]; // optional muscle group filtering
}

export interface DurationOption {
  value: number;
  label: string;
  description: string;
  exercises: number;
}

export interface DifficultyOption {
  value: 'easy' | 'medium' | 'hard';
  label: string;
  description: string;
  workTime: number; // seconds
  restTime: number; // seconds
  color: string;
}