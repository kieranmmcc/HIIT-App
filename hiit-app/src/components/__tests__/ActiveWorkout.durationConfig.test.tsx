import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

      // First warmup exercise
      expect(screen.getByText('Warmup: First Warmup')).toBeInTheDocument();
      expect(screen.getByText('00:12')).toBeInTheDocument();

      // Advance by configured duration
      jest.advanceTimersByTime(12000);

      // Should move to second warmup exercise
      await waitFor(() => {
        expect(screen.getByText('Warmup: Second Warmup')).toBeInTheDocument();
        expect(screen.getByText('00:12')).toBeInTheDocument();
      });

      // Advance by configured duration again
      jest.advanceTimersByTime(12000);

      // Should move to prepare phase
      await waitFor(() => {
        expect(screen.getByText('prepare')).toBeInTheDocument();
      });
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
            duration: 1, // Very short for fast test
            restDuration: 1
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

      // Wait for exercise and rest to complete
      jest.advanceTimersByTime(1000); // Exercise duration
      await waitFor(() => expect(screen.getByText('rest')).toBeInTheDocument());

      jest.advanceTimersByTime(1000); // Rest duration

      // Should transition to cooldown
      await waitFor(() => {
        expect(screen.getByText('cooldown')).toBeInTheDocument();
        expect(screen.getByText('Cooldown: Test Stretch')).toBeInTheDocument();
      });

      // Timer should show configured cooldown duration
      expect(screen.getByText('00:25')).toBeInTheDocument();

      // Advance by configured cooldown duration
      jest.advanceTimersByTime(25000);

      // Should complete workout
      await waitFor(() => {
        expect(screen.getByText('Workout Complete! 🎉')).toBeInTheDocument();
      });
    });

    it('handles multiple cooldown exercises with configured durations', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 8,
        cooldownDuration: 18
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: { id: 1, name: 'Quick Exercise', primaryMuscle: 'legs', muscleGroups: ['legs'], difficulty: 2, equipment: ['bodyweight'], instructions: 'Quick exercise' },
            duration: 1,
            restDuration: 1
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

      // Fast forward through main workout
      jest.advanceTimersByTime(2000); // Exercise + rest

      // Should be in cooldown with first stretch
      await waitFor(() => {
        expect(screen.getByText('Cooldown: First Stretch')).toBeInTheDocument();
        expect(screen.getByText('00:18')).toBeInTheDocument();
      });

      // Advance by configured duration
      jest.advanceTimersByTime(18000);

      // Should move to second stretch
      await waitFor(() => {
        expect(screen.getByText('Cooldown: Second Stretch')).toBeInTheDocument();
        expect(screen.getByText('00:18')).toBeInTheDocument();
      });

      // Advance by configured duration again
      jest.advanceTimersByTime(18000);

      // Should complete
      await waitFor(() => {
        expect(screen.getByText('Workout Complete! 🎉')).toBeInTheDocument();
      });
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
      expect(screen.getByText('00:20')).toBeInTheDocument();

      // Change preferences while workout is running (shouldn't affect current workout)
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 40,
        cooldownDuration: 50
      });

      // Should still use original 20s duration
      expect(screen.getByText('00:20')).toBeInTheDocument();

      jest.advanceTimersByTime(20000);

      await waitFor(() => {
        expect(screen.getByText('prepare')).toBeInTheDocument();
      });
    });
  });

  describe('timer accuracy with custom durations', () => {
    it('accurately counts down from configured warmup duration', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 33,
        cooldownDuration: 27
      });

      const workout = createMockWorkout({
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

      // Should start at configured duration
      expect(screen.getByText('00:33')).toBeInTheDocument();

      // Advance 10 seconds
      jest.advanceTimersByTime(10000);
      expect(screen.getByText('00:23')).toBeInTheDocument();

      // Advance another 15 seconds
      jest.advanceTimersByTime(15000);
      expect(screen.getByText('00:08')).toBeInTheDocument();

      // Advance final 8 seconds
      jest.advanceTimersByTime(8000);

      await waitFor(() => {
        expect(screen.getByText('prepare')).toBeInTheDocument();
      });
    });

    it('accurately counts down from configured cooldown duration', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 5,
        cooldownDuration: 37
      });

      const workout = createMockWorkout({
        exercises: [
          {
            exercise: { id: 1, name: 'Quick Exercise', primaryMuscle: 'core', muscleGroups: ['core'], difficulty: 2, equipment: ['bodyweight'], instructions: 'Quick exercise' },
            duration: 1,
            restDuration: 1
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

      // Fast forward through main workout
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText('cooldown')).toBeInTheDocument();
      });

      // Should start at configured cooldown duration
      expect(screen.getByText('00:37')).toBeInTheDocument();

      // Test countdown accuracy
      jest.advanceTimersByTime(12000);
      expect(screen.getByText('00:25')).toBeInTheDocument();

      jest.advanceTimersByTime(20000);
      expect(screen.getByText('00:05')).toBeInTheDocument();

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText('Workout Complete! 🎉')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases with duration configuration', () => {
    it('handles very short configured durations correctly', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 10, // Minimum allowed
        cooldownDuration: 10
      });

      const workout = createMockWorkout({
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
      expect(screen.getByText('00:10')).toBeInTheDocument();

      jest.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(screen.getByText('prepare')).toBeInTheDocument();
      });
    });

    it('handles longer configured durations correctly', async () => {
      DurationPreferencesStorage.savePreferences({
        warmupDuration: 120, // 2 minutes
        cooldownDuration: 90   // 1.5 minutes
      });

      const workout = createMockWorkout({
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

      // Should show 2 minutes
      expect(screen.getByText('02:00')).toBeInTheDocument();

      // Advance 30 seconds
      jest.advanceTimersByTime(30000);
      expect(screen.getByText('01:30')).toBeInTheDocument();

      // Advance rest of time
      jest.advanceTimersByTime(90000);

      await waitFor(() => {
        expect(screen.getByText('prepare')).toBeInTheDocument();
      });
    });
  });
});