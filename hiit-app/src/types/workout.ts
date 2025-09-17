import type { CircuitType } from './circuit';

export interface WorkoutSettings {
  duration: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  selectedEquipment: string[];
  targetMuscleGroups?: string[]; // optional muscle group filtering
  excludedMuscleGroups?: string[]; // optional muscle group exclusions
  circuitType: CircuitType; // type of circuit structure
  exerciseCount?: number; // number of exercises in the circuit
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