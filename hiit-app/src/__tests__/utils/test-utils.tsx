import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { Equipment } from '../../types/equipment';
import type { WorkoutSettings } from '../../types/workout';
import type { GeneratedWorkout, Exercise } from '../../types/exercise';

// Custom render function for components that might need providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockEquipment = (overrides?: Partial<Equipment>): Equipment => ({
  id: 'test-equipment',
  name: 'Test Equipment',
  category: 'cardio',
  description: 'Test equipment description',
  svgUrl: '/test.svg',
  isSelected: false,
  isRequired: false,
  ...overrides,
});

export const createMockExercise = (overrides?: Partial<Exercise>): Exercise => ({
  id: 1,
  name: 'Test Exercise',
  instructions: 'Test exercise instructions',
  muscleGroups: ['chest', 'arms'],
  primaryMuscle: 'chest',
  difficulty: 3,
  equipment: ['bodyweight'],
  ...overrides,
});

export const createMockWorkoutSettings = (
  overrides?: Partial<WorkoutSettings>
): WorkoutSettings => ({
  duration: 20,
  difficulty: 'medium',
  selectedEquipment: ['bodyweight'],
  circuitType: 'classic_cycle',
  exerciseCount: 8,
  ...overrides,
});

export const createMockWorkout = (
  overrides?: Partial<GeneratedWorkout>
): GeneratedWorkout => ({
  exercises: [
    {
      exercise: createMockExercise(),
      duration: 30,
      restDuration: 15,
    },
  ],
  totalDuration: 1200,
  difficulty: 'medium',
  equipmentUsed: ['bodyweight'],
  ...overrides,
});

// Mock localStorage utilities
export const mockLocalStorage = () => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get store() {
      return store;
    },
  };
};

// Helper to mock window.scrollTo
export const mockScrollTo = jest.fn();
beforeEach(() => {
  global.scrollTo = mockScrollTo;
});

// Helper to create mock handlers
export const createMockHandlers = () => ({
  onBack: jest.fn(),
  onContinue: jest.fn(),
  onStartWorkout: jest.fn(),
  onShowAvoidedExercises: jest.fn(),
  onEquipmentUpdate: jest.fn(),
  onWorkoutGenerated: jest.fn(),
});

// Test utilities functionality
describe('Test Utils', () => {
  it('creates mock equipment with default properties', () => {
    const equipment = createMockEquipment();
    expect(equipment).toHaveProperty('id', 'test-equipment');
    expect(equipment).toHaveProperty('name', 'Test Equipment');
    expect(equipment).toHaveProperty('isSelected', false);
    expect(equipment).toHaveProperty('isRequired', false);
  });

  it('creates mock equipment with overrides', () => {
    const equipment = createMockEquipment({
      id: 'custom-id',
      name: 'Custom Equipment',
      isSelected: true
    });
    expect(equipment.id).toBe('custom-id');
    expect(equipment.name).toBe('Custom Equipment');
    expect(equipment.isSelected).toBe(true);
  });

  it('creates mock exercise with default properties', () => {
    const exercise = createMockExercise();
    expect(exercise).toHaveProperty('id', 1);
    expect(exercise).toHaveProperty('name', 'Test Exercise');
    expect(exercise).toHaveProperty('primaryMuscle', 'chest');
    expect(exercise).toHaveProperty('difficulty', 3);
  });

  it('creates mock handlers', () => {
    const handlers = createMockHandlers();
    expect(typeof handlers.onBack).toBe('function');
    expect(typeof handlers.onContinue).toBe('function');
    expect(typeof handlers.onStartWorkout).toBe('function');
  });
});