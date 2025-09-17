export interface EquipmentPreferences {
  // All equipment the user owns (saved permanently)
  ownedEquipment: string[];

  // Equipment selected for the current workout
  selectedForWorkout: string[];

  // Preferences for different workout types
  presets: EquipmentPreset[];
}

export interface EquipmentPreset {
  id: string;
  name: string;
  description: string;
  equipmentIds: string[];
  isDefault?: boolean;
}

// Default presets
export const defaultPresets: EquipmentPreset[] = [
  {
    id: 'bodyweight-only',
    name: 'Bodyweight Only',
    description: 'No equipment needed',
    equipmentIds: ['bodyweight'],
    isDefault: true
  },
  {
    id: 'minimal',
    name: 'Minimal Setup',
    description: 'Bodyweight + mat',
    equipmentIds: ['bodyweight', 'yoga_mat']
  },
  {
    id: 'bench-only',
    name: 'Weight Bench Only',
    description: 'Bodyweight + weight bench',
    equipmentIds: ['bodyweight', 'weight_bench']
  },
  {
    id: 'bench-dumbbells',
    name: 'Bench & Dumbbells',
    description: 'Classic strength combo',
    equipmentIds: ['bodyweight', 'weight_bench', 'dumbbells']
  },
  {
    id: 'home-gym',
    name: 'Home Gym',
    description: 'Full equipment workout',
    equipmentIds: ['bodyweight', 'dumbbells', 'resistance_bands', 'yoga_mat', 'kettlebell', 'weight_bench']
  },
  {
    id: 'cardio-focused',
    name: 'Cardio Blast',
    description: 'High-intensity cardio equipment',
    equipmentIds: ['bodyweight', 'jump_rope', 'battle_ropes', 'medicine_ball']
  },
  {
    id: 'strength-focused',
    name: 'Strength Training',
    description: 'Weight-based exercises',
    equipmentIds: ['bodyweight', 'dumbbells', 'kettlebell', 'resistance_bands', 'weight_plates', 'weight_bench']
  }
];