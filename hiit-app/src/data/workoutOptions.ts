import type { DurationOption, DifficultyOption } from '../types/workout';

export const durationOptions: DurationOption[] = [
  {
    value: 15,
    label: '15 Minutes',
    description: 'Quick energy boost',
    exercises: 12
  },
  {
    value: 20,
    label: '20 Minutes',
    description: 'Balanced full workout',
    exercises: 16
  },
  {
    value: 30,
    label: '30 Minutes',
    description: 'Extended training session',
    exercises: 24
  },
  {
    value: 45,
    label: '45 Minutes',
    description: 'Maximum endurance challenge',
    exercises: 36
  }
];

export const difficultyOptions: DifficultyOption[] = [
  {
    value: 'easy',
    label: 'Beginner',
    description: 'Perfect for newcomers to HIIT',
    workTime: 30,
    restTime: 30,
    color: '#22c55e' // Green
  },
  {
    value: 'medium',
    label: 'Intermediate',
    description: 'Ideal for regular exercisers',
    workTime: 45,
    restTime: 15,
    color: '#fbbf24' // Amber
  },
  {
    value: 'hard',
    label: 'Advanced',
    description: 'Designed for fitness athletes',
    workTime: 50,
    restTime: 10,
    color: '#ef4444' // Red
  }
];