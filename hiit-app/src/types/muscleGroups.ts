export interface MuscleGroupFilter {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const muscleGroupFilters: MuscleGroupFilter[] = [
  {
    id: 'full_body',
    name: 'Full Body',
    description: 'Complete body workouts',
    color: '#ff4757',
    icon: '🔥'
  },
  {
    id: 'legs',
    name: 'Legs',
    description: 'Quads, hamstrings, calves',
    color: '#2ed573',
    icon: '🦵'
  },
  {
    id: 'core',
    name: 'Core',
    description: 'Abs, obliques, lower back',
    color: '#ff6b35',
    icon: '💪'
  },
  {
    id: 'chest',
    name: 'Chest',
    description: 'Pecs, upper body push',
    color: '#3742fa',
    icon: '🛡️'
  },
  {
    id: 'back',
    name: 'Back',
    description: 'Lats, rhomboids, traps',
    color: '#2f3542',
    icon: '🔙'
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    description: 'Deltoids, rotator cuffs',
    color: '#ffa502',
    icon: '💪'
  },
  {
    id: 'arms',
    name: 'Arms',
    description: 'Biceps, triceps, forearms',
    color: '#ff3838',
    icon: '💪'
  },
  {
    id: 'glutes',
    name: 'Glutes',
    description: 'Glute max, glute med',
    color: '#ff9ff3',
    icon: '🍑'
  },
  {
    id: 'cardio',
    name: 'Cardio',
    description: 'Heart rate, endurance',
    color: '#ff4081',
    icon: '❤️'
  },
  {
    id: 'biceps_triceps',
    name: 'Biceps/Triceps',
    description: 'Classic arm super set pair',
    color: '#ff6b35',
    icon: '💪'
  },
  {
    id: 'legs_glutes',
    name: 'Legs/Glutes',
    description: 'Lower body power combo',
    color: '#2ed573',
    icon: '🦵'
  },
  {
    id: 'chest_back',
    name: 'Chest/Back',
    description: 'Push/pull antagonist pair',
    color: '#3742fa',
    icon: '🛡️'
  },
  {
    id: 'shoulders_core',
    name: 'Shoulders/Core',
    description: 'Stability & strength combo',
    color: '#ffa502',
    icon: '💪'
  },
  {
    id: 'cardio_core',
    name: 'Cardio/Core',
    description: 'High-intensity core blast',
    color: '#ff4081',
    icon: '❤️'
  }
];

export const muscleGroupLabels: Record<string, string> = {
  full_body: 'Full Body',
  legs: 'Legs',
  core: 'Core',
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  glutes: 'Glutes',
  cardio: 'Cardio',
  biceps_triceps: 'Biceps/Triceps',
  legs_glutes: 'Legs/Glutes',
  chest_back: 'Chest/Back',
  shoulders_core: 'Shoulders/Core',
  cardio_core: 'Cardio/Core'
};