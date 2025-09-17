export interface Equipment {
  id: string;
  name: string;
  description: string;
  svgUrl: string;
  category: 'core' | 'weights' | 'resistance' | 'cardio' | 'accessories';
  isSelected: boolean;
  isRequired: boolean;
}

export interface EquipmentSelectionProps {
  equipment: Equipment[];
  onEquipmentToggle: (id: string) => void;
  onContinue: () => void;
}