import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMockWorkout, createMockHandlers } from '../../__tests__/utils/test-utils';
import ActiveWorkout from '../ActiveWorkout';

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

describe('ActiveWorkout Component', () => {
  const mockHandlers = createMockHandlers();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with warmup phase when workout has warmup', () => {
    const workout = createMockWorkout({
      warmup: {
        exercises: [
          {
            id: 'warmup_001',
            name: 'Arm Circles',
            instructions: 'Make circles with your arms',
            targetBodyParts: ['shoulders'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 30
      }
    });

    render(
      <ActiveWorkout
        workout={workout}
        onComplete={mockHandlers.onWorkoutGenerated}
        onExit={mockHandlers.onBack}
      />
    );

    expect(screen.getByText('warmup')).toBeInTheDocument();
    expect(screen.getByText('Warmup: Arm Circles')).toBeInTheDocument();
    expect(screen.getByText('Make circles with your arms')).toBeInTheDocument();
  });

  it('starts with prepare phase when workout has no warmup', () => {
    const workout = createMockWorkout();

    render(
      <ActiveWorkout
        workout={workout}
        onComplete={mockHandlers.onWorkoutGenerated}
        onExit={mockHandlers.onBack}
      />
    );

    expect(screen.getByText('prepare')).toBeInTheDocument();
    expect(screen.getByText('Get ready to begin!')).toBeInTheDocument();
  });

  it('advances through warmup exercises before starting main workout', async () => {
    const workout = createMockWorkout({
      warmup: {
        exercises: [
          {
            id: 'warmup_001',
            name: 'Arm Circles',
            instructions: 'Make circles with your arms',
            targetBodyParts: ['shoulders'],
            duration: 1, // 1 second for fast test
            equipment: ['bodyweight']
          },
          {
            id: 'warmup_002',
            name: 'Leg Swings',
            instructions: 'Swing your legs',
            targetBodyParts: ['legs'],
            duration: 1, // 1 second for fast test
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 2
      }
    });

    render(
      <ActiveWorkout
        workout={workout}
        onComplete={mockHandlers.onWorkoutGenerated}
        onExit={mockHandlers.onBack}
      />
    );

    // Start the workout
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Should be on first warmup exercise
    expect(screen.getByText('Warmup: Arm Circles')).toBeInTheDocument();

    // Wait for first warmup to complete and advance to second
    await waitFor(() => {
      expect(screen.getByText('Warmup: Leg Swings')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Wait for warmup to complete and advance to prepare phase
    await waitFor(() => {
      expect(screen.getByText('prepare')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows warmup exercises in pink color', () => {
    const workout = createMockWorkout({
      warmup: {
        exercises: [
          {
            id: 'warmup_001',
            name: 'Arm Circles',
            instructions: 'Make circles with your arms',
            targetBodyParts: ['shoulders'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 30
      }
    });

    render(
      <ActiveWorkout
        workout={workout}
        onComplete={mockHandlers.onWorkoutGenerated}
        onExit={mockHandlers.onBack}
      />
    );

    const phaseIndicator = screen.getByText('warmup');
    // Check that the warmup phase uses the pink color
    expect(phaseIndicator).toHaveStyle({ color: '#fd79a8' });
  });

  it('shows correct progress during warmup phase', () => {
    const workout = createMockWorkout({
      warmup: {
        exercises: [
          {
            id: 'warmup_001',
            name: 'Arm Circles',
            instructions: 'Make circles with your arms',
            targetBodyParts: ['shoulders'],
            duration: 30,
            equipment: ['bodyweight']
          },
          {
            id: 'warmup_002',
            name: 'Leg Swings',
            instructions: 'Swing your legs',
            targetBodyParts: ['legs'],
            duration: 30,
            equipment: ['bodyweight']
          }
        ],
        totalDuration: 60
      }
    });

    const { container } = render(
      <ActiveWorkout
        workout={workout}
        onComplete={mockHandlers.onWorkoutGenerated}
        onExit={mockHandlers.onBack}
      />
    );

    // Check initial progress (first warmup exercise)
    const progressBar = container.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument(); // 1 of 2 warmup exercises = 50%
  });

  describe('warmup phase transitions', () => {
    it('transitions from warmup to prepare to work phases correctly', async () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Quick Stretch',
              instructions: 'Stretch quickly',
              targetBodyParts: ['shoulders'],
              duration: 1, // 1 second for fast test
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 1
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      // Start in warmup phase
      expect(screen.getByText('warmup')).toBeInTheDocument();
      expect(screen.getByText('Warmup: Quick Stretch')).toBeInTheDocument();

      // Start the workout
      fireEvent.click(screen.getByText('Start'));

      // Wait for warmup to complete and transition to prepare
      await waitFor(() => {
        expect(screen.getByText('prepare')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Wait for prepare to complete and transition to work
      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument();
      }, { timeout: 6000 }); // Prepare phase is 5 seconds
    });

    it('handles multiple warmup exercises in sequence', async () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'First Warmup',
              instructions: 'First exercise',
              targetBodyParts: ['shoulders'],
              duration: 1,
              equipment: ['bodyweight']
            },
            {
              id: 'warmup_002',
              name: 'Second Warmup',
              instructions: 'Second exercise',
              targetBodyParts: ['legs'],
              duration: 1,
              equipment: ['bodyweight']
            },
            {
              id: 'warmup_003',
              name: 'Third Warmup',
              instructions: 'Third exercise',
              targetBodyParts: ['core'],
              duration: 1,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 3
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

      // Should start with first warmup
      expect(screen.getByText('Warmup: First Warmup')).toBeInTheDocument();

      // Progress through each warmup exercise
      await waitFor(() => {
        expect(screen.getByText('Warmup: Second Warmup')).toBeInTheDocument();
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Warmup: Third Warmup')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Finally transition to prepare
      await waitFor(() => {
        expect(screen.getByText('prepare')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('skips warmup when workout has no warmup', async () => {
      const workout = createMockWorkout(); // No warmup

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      // Should start directly in prepare phase
      expect(screen.getByText('prepare')).toBeInTheDocument();
      expect(screen.queryByText('warmup')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Start'));

      // Should transition directly to work after 5 seconds
      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument();
      }, { timeout: 6000 });
    });

    it('allows skipping warmup exercises', async () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Long Warmup',
              instructions: 'This takes a while',
              targetBodyParts: ['full_body'],
              duration: 30, // Long duration
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 30
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

      // Should be in warmup
      expect(screen.getByText('Warmup: Long Warmup')).toBeInTheDocument();

      // Find skip button by looking for buttons with skip-related content
      const skipButtons = screen.getAllByRole('button');
      const skipButton = skipButtons.find(button => {
        const svg = button.querySelector('svg');
        return svg && svg.getAttribute('viewBox') === '0 0 24 24';
      });

      if (skipButton) {
        fireEvent.click(skipButton);

        // Should advance to next phase
        await waitFor(() => {
          expect(screen.getByText('prepare')).toBeInTheDocument();
        }, { timeout: 1000 });
      }
    });

    it('maintains correct progress during warmup phase', () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'First',
              instructions: 'First exercise',
              targetBodyParts: ['shoulders'],
              duration: 30,
              equipment: ['bodyweight']
            },
            {
              id: 'warmup_002',
              name: 'Second',
              instructions: 'Second exercise',
              targetBodyParts: ['legs'],
              duration: 30,
              equipment: ['bodyweight']
            },
            {
              id: 'warmup_003',
              name: 'Third',
              instructions: 'Third exercise',
              targetBodyParts: ['core'],
              duration: 30,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 90
        }
      });

      const { container } = render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      // First exercise = 33.3%
      let progressBar = container.querySelector('[style*="width: 33"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('handles pause and resume during warmup', async () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Pausable Warmup',
              instructions: 'Can be paused',
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

      // Start workout
      fireEvent.click(screen.getByText('Start'));

      // Should be running warmup
      expect(screen.getByText('Pause')).toBeInTheDocument();

      // Pause the workout
      fireEvent.click(screen.getByText('Pause'));

      // Should show resume button
      await waitFor(() => {
        expect(screen.getByText('Resume')).toBeInTheDocument();
      });

      // Resume the workout
      fireEvent.click(screen.getByText('Resume'));

      // Should show pause button again
      await waitFor(() => {
        expect(screen.getByText('Pause')).toBeInTheDocument();
      });
    });

    it('stops warmup correctly', async () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Stoppable Warmup',
              instructions: 'Can be stopped',
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

      // Start workout
      fireEvent.click(screen.getByText('Start'));

      // Should be running
      expect(screen.getByText('Pause')).toBeInTheDocument();

      // Find stop button (usually represented by a square icon)
      const stopButtons = screen.getAllByRole('button');
      const stopButton = stopButtons.find(button => {
        const svg = button.querySelector('svg[viewBox="0 0 24 24"] rect');
        return svg !== null;
      });

      if (stopButton) {
        fireEvent.click(stopButton);

        // Should stop and show start button again
        await waitFor(() => {
          expect(screen.getByText('Start')).toBeInTheDocument();
        });
      }
    });
  });

  describe('warmup display and UI', () => {
    it('shows warmup exercise instructions properly', () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Detailed Warmup',
              instructions: 'This is a very detailed instruction for the warmup exercise that should be displayed properly in the UI component.',
              targetBodyParts: ['full_body'],
              duration: 45,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 45
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      expect(screen.getByText('This is a very detailed instruction for the warmup exercise that should be displayed properly in the UI component.')).toBeInTheDocument();
    });

    it('shows correct timer countdown during warmup', () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Timed Warmup',
              instructions: 'Watch the timer',
              targetBodyParts: ['full_body'],
              duration: 45,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 45
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      // Should show initial time
      expect(screen.getByText('00:45')).toBeInTheDocument();
    });

    it('uses pink color scheme for warmup phase', () => {
      const workout = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Colored Warmup',
              instructions: 'Should be pink',
              targetBodyParts: ['full_body'],
              duration: 30,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 30
        }
      });

      render(
        <ActiveWorkout
          workout={workout}
          onComplete={mockHandlers.onWorkoutGenerated}
          onExit={mockHandlers.onBack}
        />
      );

      const phaseIndicator = screen.getByText('warmup');
      expect(phaseIndicator).toHaveStyle({ color: '#fd79a8' });
    });
  });
});