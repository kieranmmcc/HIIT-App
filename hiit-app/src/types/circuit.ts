export type CircuitType = 'classic_cycle' | 'super_sets';

export interface CircuitTypeOption {
  value: CircuitType;
  name: string;
  description: string;
  structure: string;
  icon: string;
}

export const circuitTypeOptions: CircuitTypeOption[] = [
  {
    value: 'classic_cycle',
    name: 'Classic Circuit',
    description: 'Cycle through 8 different exercises continuously',
    structure: '8 exercises × multiple rounds',
    icon: '🔄'
  },
  {
    value: 'super_sets',
    name: 'Super Sets',
    description: 'Paired exercises targeting complementary muscle groups',
    structure: '4 super sets × 2 exercises',
    icon: '💪'
  }
];

export interface CircuitStation {
  id: string;
  name: string;
  exercises: Exercise[];
  currentExerciseIndex: number;
}

export interface CircuitWorkout {
  type: CircuitType;
  stations: CircuitStation[];
  rounds: number;
  workTime: number;
  restTime: number;
  stationRestTime?: number; // Additional rest between stations
  totalDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  equipmentUsed: string[];
}

export interface WorkoutExercise {
  exercise: Exercise;
  duration: number; // work duration in seconds
  restDuration: number; // rest duration in seconds
  stationId?: string; // Which station this exercise belongs to
  roundNumber?: number; // Which round this is executed in
}

export interface GeneratedWorkout {
  // Legacy support - keep existing structure but add circuit info
  exercises: WorkoutExercise[];
  totalDuration: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  equipmentUsed: string[];

  // New circuit-based structure
  circuit?: CircuitWorkout;

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

import type { Exercise } from './exercise';