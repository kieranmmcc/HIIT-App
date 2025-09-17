import type { DurationOption, DifficultyOption } from '../types/workout';

export const durationOptions: DurationOption[] = [
  {
    value: 15,
    label: '15 Minutes',
    description: 'Quick burn session',
    exercises: 12
  },
  {
    value: 20,
    label: '20 Minutes',
    description: 'Balanced workout',
    exercises: 16
  },
  {
    value: 30,
    label: '30 Minutes',
    description: 'Full intensity',
    exercises: 24
  },
  {
    value: 45,
    label: '45 Minutes',
    description: 'Complete challenge',
    exercises: 36
  }
];

export const difficultyOptions: DifficultyOption[] = [
  {
    value: 'easy',
    label: 'Beginner',
    description: 'New to HIIT training',
    workTime: 30,
    restTime: 30,
    color: '#2ed573' // Green
  },
  {
    value: 'medium',
    label: 'Intermediate',
    description: 'Regular fitness routine',
    workTime: 45,
    restTime: 15,
    color: '#feca57' // Yellow
  },
  {
    value: 'hard',
    label: 'Advanced',
    description: 'High-intensity athlete',
    workTime: 50,
    restTime: 10,
    color: '#ff4757' // Red
  }
];