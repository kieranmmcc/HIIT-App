import type { Equipment } from '../types/equipment';

export const equipmentData: Equipment[] = [
  // Core Equipment (Always Available)
  {
    id: "bodyweight",
    name: "Bodyweight Only",
    description: "No equipment needed - push-ups, squats, burpees",
    svgUrl: "/icons/bodyweight.jpg",
    category: "core",
    isSelected: true,
    isRequired: true
  },

  // Weights Category
  {
    id: "dumbbells",
    name: "Dumbbells",
    description: "Any weight, adjustable preferred",
    svgUrl: "/icons/dumbbells.jpg",
    category: "weights",
    isSelected: false,
    isRequired: false
  },
  {
    id: "kettlebell",
    name: "Kettlebell",
    description: "Single or multiple kettlebells",
    svgUrl: "/icons/kettlebell.jpg",
    category: "weights",
    isSelected: false,
    isRequired: false
  },
  {
    id: "weight_plates",
    name: "Weight Plates",
    description: "Barbell plates for compound movements",
    svgUrl: "/icons/weight_plates.jpg",
    category: "weights",
    isSelected: false,
    isRequired: false
  },
  {
    id: "ankle_weights",
    name: "Ankle Weights",
    description: "Weighted straps for legs and arms",
    svgUrl: "/icons/ankle_weights.jpg",
    category: "weights",
    isSelected: false,
    isRequired: false
  },
  {
    id: "weight_bench",
    name: "Weight Bench",
    description: "Flat or adjustable weight bench for press exercises",
    svgUrl: "/icons/weight-bench.png",
    category: "weights",
    isSelected: false,
    isRequired: false
  },

  // Resistance Category
  {
    id: "resistance_bands",
    name: "Resistance Bands",
    description: "Tube bands with handles",
    svgUrl: "/icons/resistance_bands.jpg",
    category: "resistance",
    isSelected: false,
    isRequired: false
  },
  {
    id: "resistance_loops",
    name: "Resistance Loops",
    description: "Mini loop bands for activation",
    svgUrl: "/icons/resistance_loops.jpg",
    category: "resistance",
    isSelected: false,
    isRequired: false
  },
  {
    id: "suspension_trainer",
    name: "Suspension Trainer",
    description: "TRX or similar suspension system",
    svgUrl: "/icons/suspension_trainer.jpg",
    category: "resistance",
    isSelected: false,
    isRequired: false
  },

  // Cardio Category
  {
    id: "jump_rope",
    name: "Jump Rope",
    description: "Speed rope or weighted rope",
    svgUrl: "/icons/jump_rope.jpg",
    category: "cardio",
    isSelected: false,
    isRequired: false
  },
  {
    id: "battle_ropes",
    name: "Battle Ropes",
    description: "Heavy training ropes",
    svgUrl: "/icons/battle_ropes.jpg",
    category: "cardio",
    isSelected: false,
    isRequired: false
  },

  // Functional Equipment
  {
    id: "medicine_ball",
    name: "Medicine Ball",
    description: "Weighted ball for slams and throws",
    svgUrl: "/icons/medicine_ball.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  },
  {
    id: "slam_ball",
    name: "Slam Ball",
    description: "Dead bounce ball for high-impact exercises",
    svgUrl: "/icons/slam_ball.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  },
  {
    id: "stability_ball",
    name: "Stability Ball",
    description: "Exercise ball for core and balance",
    svgUrl: "/icons/stability_ball.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  },
  {
    id: "bosu_ball",
    name: "BOSU Ball",
    description: "Half-ball for balance training",
    svgUrl: "/icons/bosu_ball.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  },

  // Structural Equipment
  {
    id: "pull_up_bar",
    name: "Pull-up Bar",
    description: "Doorway or wall-mounted bar",
    svgUrl: "/icons/pull_up_bar.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  },
  {
    id: "bench_step",
    name: "Bench/Step",
    description: "Exercise bench or step platform",
    svgUrl: "/icons/bench_step.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  },
  {
    id: "parallette_bars",
    name: "Parallette Bars",
    description: "Low parallel bars for bodyweight training",
    svgUrl: "/icons/parallette_bars.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  },

  // Essential Accessories
  {
    id: "yoga_mat",
    name: "Yoga Mat",
    description: "Exercise mat for floor work and stretching",
    svgUrl: "/icons/yoga_mat.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  },
  {
    id: "ab_wheel",
    name: "Ab Wheel",
    description: "Rolling wheel for core strengthening",
    svgUrl: "/icons/ab_wheel.jpg",
    category: "accessories",
    isSelected: false,
    isRequired: false
  }
];