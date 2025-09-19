import { render, screen, fireEvent } from '@testing-library/react';
import { createMockWorkout, createMockHandlers } from '../../__tests__/utils/test-utils';
import ActiveWorkout from '../ActiveWorkout';
import { DurationPreferencesStorage } from '../../utils/durationPreferences';

// Mock audio manager
jest.mock('../../utils/audioManager', () => ({
  audioManager: {
    playStartBeep: jest.fn(),
    playRestBeep: jest.fn(),
    playCompletionSound: jest.fn(),
    playCountdownBeep: jest.fn(),
    resumeAudio: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock localStorage for preferences
const mockLocalStorage: Storage & { store: Record<string, string> } = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string): string | null => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string): void => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((): void => {}),
  clear: jest.fn((): void => {
    mockLocalStorage.store = {};
  }),
  key: jest.fn(),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('ActiveWorkout Component - Duration Configuration Integration', () => {
  const mockHandlers = createMockHandlers();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('warmup duration configuration', () => {
    it('uses configured warmup duration for warmup exercises', async () => {
      // Set custom warmup duration
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 15,
        cooldownDuration: 20
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: {
              id: 1,
              name: 'Test Exercise',
              instructions: 'Do the exercise',
              muscleGroups: ['chest'],
              primaryMuscle: 'chest',
              difficulty: 2,
              equipment: ['bodyweight']
            },
            duration: 30,
            restDuration: 10
          }
        ],
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Test Warmup',
              instructions: 'Do the warmup',
              targetBodyParts: ['full_body'],
              duration: 15, // Should use configured duration
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 15
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      // Start workout
      fireEvent.click(screen.getByText('Start'));

      // Should be in warmup phase with configured exercise
      expect(screen.getByText('warmup')).toBeInTheDocument();
      expect(screen.getByText('Warmup: Test Warmup')).toBeInTheDocument();

      // Timer should show 15 seconds (configured duration)
      expect(screen.getByText('00:15')).toBeInTheDocument();

      // The workout should have the warmup exercise with the configured duration
      expect(workout.warmup!.exercises[0].duration).toBe(15);
      expect(workout.warmup!.totalDuration).toBe(15);
    });

    it('respects different warmup durations for multiple exercises', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 12,
        cooldownDuration: 18
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: {
              id: 1,
              name: 'Test Exercise',
              instructions: 'Do the exercise',
              muscleGroups: ['chest'],
              primaryMuscle: 'chest',
              difficulty: 2,
              equipment: ['bodyweight']
            },
            duration: 30,
            restDuration: 10
          }
        ],
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'First Warmup',
              instructions: 'First exercise',
              targetBodyParts: ['legs'],
              duration: 12,
              equipment: ['bodyweight']
            },
            {
              id: 'warmup_002',
              name: 'Second Warmup',
              instructions: 'Second exercise',
              targetBodyParts: ['arms'],
              duration: 12,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 24
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      fireEvent.click(screen.getByText('Start'));

      // Should be in warmup phase
      expect(screen.getByText('warmup')).toBeInTheDocument();

      // Both warmup exercises should have the configured duration
      expect(workout.warmup!.exercises[0].duration).toBe(12);
      expect(workout.warmup!.exercises[1].duration).toBe(12);
      expect(workout.warmup!.totalDuration).toBe(24);
    });
  });

  describe('cooldown duration configuration', () => {
    it('uses configured cooldown duration for cooldown exercises', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 10,
        cooldownDuration: 25
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: { id: 1, name: 'Quick Exercise', primaryMuscle: 'chest', muscleGroups: ['chest'], difficulty: 2, equipment: ['bodyweight'], instructions: 'Quick exercise' },
            duration: 30,
            restDuration: 10
          }
        ],
        cooldown: {
          exercises: [
            {
              id: 'cooldown_001',
              name: 'Test Stretch',
              instructions: 'Stretch it out',
              targetBodyParts: ['chest'],
              duration: 25, // Should use configured duration
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 25
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      fireEvent.click(screen.getByText('Start'));

      // Should show prepare phase initially
      expect(screen.getByText('prepare')).toBeInTheDocument();

      // The cooldown exercise should have the configured duration
      expect(workout.cooldown!.exercises[0].duration).toBe(25);
      expect(workout.cooldown!.totalDuration).toBe(25);
    });

    it('handles multiple cooldown exercises with configured durations', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 12,
        cooldownDuration: 18
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: { id: 1, name: 'Quick Exercise', primaryMuscle: 'legs', muscleGroups: ['legs'], difficulty: 2, equipment: ['bodyweight'], instructions: 'Quick exercise' },
            duration: 30,
            restDuration: 10
          }
        ],
        cooldown: {
          exercises: [
            {
              id: 'cooldown_001',
              name: 'First Stretch',
              instructions: 'First stretch',
              targetBodyParts: ['hamstrings'],
              duration: 18,
              equipment: ['bodyweight']
            },
            {
              id: 'cooldown_002',
              name: 'Second Stretch',
              instructions: 'Second stretch',
              targetBodyParts: ['quadriceps'],
              duration: 18,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 36
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      fireEvent.click(screen.getByText('Start'));

      // Should show prepare phase initially
      expect(screen.getByText('prepare')).toBeInTheDocument();

      // Both cooldown exercises should have the configured duration
      expect(workout.cooldown!.exercises[0].duration).toBe(18);
      expect(workout.cooldown!.exercises[1].duration).toBe(18);
      expect(workout.cooldown!.totalDuration).toBe(36);
    });
  });

  describe('duration changes during workout', () => {
    it('uses duration preferences that were active when workout was generated', async () => {
      // Set initial preferences
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 20,
        cooldownDuration: 30
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: {
              id: 1,
              name: 'Test Exercise',
              instructions: 'Do the exercise',
              muscleGroups: ['chest'],
              primaryMuscle: 'chest',
              difficulty: 2,
              equipment: ['bodyweight']
            },
            duration: 30,
            restDuration: 10
          }
        ],
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Test Warmup',
              instructions: 'Do the warmup',
              targetBodyParts: ['full_body'],
              duration: 20, // Generated with 20s preference
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 20
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      fireEvent.click(screen.getByText('Start'));

      // Change preferences while workout is running (shouldn't affect current workout)
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 40,
        cooldownDuration: 50
      });

      // Workout should still use original durations from when it was generated
      expect(workout.warmup!.exercises[0].duration).toBe(20);
      expect(workout.warmup!.totalDuration).toBe(20);
    });
  });

  describe('timer accuracy with custom durations', () => {
    it('accurately counts down from configured warmup duration', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 33,
        cooldownDuration: 27
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: {
              id: 1,
              name: 'Test Exercise',
              instructions: 'Do the exercise',
              muscleGroups: ['chest'],
              primaryMuscle: 'chest',
              difficulty: 2,
              equipment: ['bodyweight']
            },
            duration: 30,
            restDuration: 10
          }
        ],
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Custom Duration Warmup',
              instructions: 'Test warmup',
              targetBodyParts: ['full_body'],
              duration: 33,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 33
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      fireEvent.click(screen.getByText('Start'));

      // Should be in warmup phase
      expect(screen.getByText('warmup')).toBeInTheDocument();

      // Warmup exercise should have the configured duration
      expect(workout.warmup!.exercises[0].duration).toBe(33);
      expect(workout.warmup!.totalDuration).toBe(33);
    });

    it('accurately counts down from configured cooldown duration', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 15,
        cooldownDuration: 37
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: { id: 1, name: 'Quick Exercise', primaryMuscle: 'core', muscleGroups: ['core'], difficulty: 2, equipment: ['bodyweight'], instructions: 'Quick exercise' },
            duration: 30,
            restDuration: 10
          }
        ],
        cooldown: {
          exercises: [
            {
              id: 'cooldown_001',
              name: 'Custom Duration Stretch',
              instructions: 'Test stretch',
              targetBodyParts: ['core'],
              duration: 37,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 37
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      fireEvent.click(screen.getByText('Start'));

      // Should show prepare phase initially
      expect(screen.getByText('prepare')).toBeInTheDocument();

      // Cooldown exercise should have the configured duration
      expect(workout.cooldown!.exercises[0].duration).toBe(37);
      expect(workout.cooldown!.totalDuration).toBe(37);
    });
  });

  describe('edge cases with duration configuration', () => {
    it('handles very short configured durations correctly', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 10, // Minimum allowed
        cooldownDuration: 10
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: {
              id: 1,
              name: 'Test Exercise',
              instructions: 'Do the exercise',
              muscleGroups: ['chest'],
              primaryMuscle: 'chest',
              difficulty: 2,
              equipment: ['bodyweight']
            },
            duration: 30,
            restDuration: 10
          }
        ],
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Short Warmup',
              instructions: 'Quick warmup',
              targetBodyParts: ['full_body'],
              duration: 10,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 10
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      fireEvent.click(screen.getByText('Start'));

      // Warmup should use the minimum configured duration
      expect(workout.warmup!.exercises[0].duration).toBe(10);
      expect(workout.warmup!.totalDuration).toBe(10);
    });

    it('handles longer configured durations correctly', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 120, // 2 minutes
        cooldownDuration: 90   // 1.5 minutes
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: {
              id: 1,
              name: 'Test Exercise',
              instructions: 'Do the exercise',
              muscleGroups: ['chest'],
              primaryMuscle: 'chest',
              difficulty: 2,
              equipment: ['bodyweight']
            },
            duration: 30,
            restDuration: 10
          }
        ],
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Long Warmup',
              instructions: 'Extended warmup',
              targetBodyParts: ['full_body'],
              duration: 120,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 120
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      fireEvent.click(screen.getByText('Start'));

      // Warmup should use the longer configured duration
      expect(workout.warmup!.exercises[0].duration).toBe(120);
      expect(workout.warmup!.totalDuration).toBe(120);
    });
  });
});