export type CircuitType = 'classic_cycle' | 'station_pairs' | 'pyramid' | 'super_sets';

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
    value: 'station_pairs',
    name: 'Station Pairs',
    description: 'Alternate between 2 exercises at each of 6 stations',
    structure: '6 stations × 2 exercises each',
    icon: '⚡'
  },
  {
    value: 'pyramid',
    name: 'Pyramid Circuit',
    description: 'Build up and down through exercise difficulty',
    structure: '5 exercises in pyramid pattern',
    icon: '🔺'
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
}

import type { Exercise } from './exercise';