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
});