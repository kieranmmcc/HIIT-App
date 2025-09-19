import { render, screen, fireEvent } from '@testing-library/react';
import WorkoutPreview from '../WorkoutPreview';
import { createMockWorkout, createMockHandlers } from '../../__tests__/utils/test-utils';
import type { WorkoutSettings } from '../../types/workout';

// Mock duration preferences storage
jest.mock('../../utils/durationPreferences', () => ({
  DurationPreferencesStorage: {
    getPreferences: jest.fn(() => ({
      warmupDuration: 20,
      cooldownDuration: 25,
      lastUpdated: '2024-01-01T00:00:00Z'
    })),
    getDurationOptions: jest.fn(() => [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]),
    formatDuration: jest.fn((seconds: number) => {
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
    })
  }
}));

// Mock workout generation
jest.mock('../../utils/workoutGenerator', () => ({
  generateWorkout: jest.fn(),
  regenerateExercise: jest.fn()
}));

// Mock other dependencies
jest.mock('../../utils/blacklistStorage', () => ({
  BlacklistStorage: {
    getBlacklistedExercises: jest.fn(() => [])
  }
}));

jest.mock('../../utils/instructionPreferences', () => ({
  InstructionPreferences: {
    getInstructionsVisible: jest.fn(() => false)
  }
}));

describe('WorkoutPreview - Duration Settings Integration', () => {
  const mockHandlers = createMockHandlers();

  const workoutSettings: WorkoutSettings = {
    duration: 15,
    difficulty: 'medium',
    selectedEquipment: ['bodyweight'],
    circuitType: 'classic_cycle',
    exerciseCount: 6
  };

  const mockWorkoutWithWarmupAndCooldown = createMockWorkout({
    warmup: {
      exercises: [
        {
          id: 'warmup_001',
          name: 'Test Warmup',
          instructions: 'Do the warmup',
          targetBodyParts: ['full_body'],
          duration: 20,
          equipment: ['bodyweight']
        }
      ],
      totalDuration: 20
    },
    cooldown: {
      exercises: [
        {
          id: 'cooldown_001',
          name: 'Test Cooldown',
          instructions: 'Do the cooldown',
          targetBodyParts: ['full_body'],
          duration: 25,
          equipment: ['bodyweight']
        }
      ],
      totalDuration: 25
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('warmup configure button', () => {
    it('displays gear icon and "Warmup / Cooldown" text in warmup section', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      // Should have warmup section with configure button
      expect(screen.getByText('🔥 Preview Warm-Up (0 min)')).toBeInTheDocument();

      // Look for configure buttons with the gear emoji and text
      const configureButtons = screen.getAllByText(/Warmup \/ Cooldown/);
      expect(configureButtons.length).toBeGreaterThanOrEqual(1);

      // Check that the button has the gear emoji
      const warmupSection = screen.getByText('🔥 Preview Warm-Up (0 min)').closest('div');
      expect(warmupSection).toBeInTheDocument();

      // Find gear emoji in warmup section
      expect(warmupSection?.textContent).toContain('⚙️');
    });

    it('opens duration settings when warmup configure button is clicked', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      // Find and click the first configure button (in warmup section)
      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );
      fireEvent.click(configureButtons[0]);

      // Duration settings modal should open
      expect(screen.getByText('Duration Settings')).toBeInTheDocument();
      expect(screen.getByText('Warmup Exercise Duration')).toBeInTheDocument();
      expect(screen.getByText('Cooldown Exercise Duration')).toBeInTheDocument();
    });

    it('has proper styling for warmup configure button', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );
      const warmupConfigureButton = configureButtons[0];

      // Check styling attributes
      expect(warmupConfigureButton).toHaveStyle({
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
      });

      // Should have warmup-themed color
      expect(warmupConfigureButton.style.color).toBe('rgb(243, 156, 18)');
    });
  });

  describe('cooldown configure button', () => {
    it('displays gear icon and "Warmup / Cooldown" text in cooldown section', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      // Should have cooldown section with configure button
      expect(screen.getByText('🧘‍♀️ Preview Cooldown (0 min)')).toBeInTheDocument();

      // Should have at least 2 configure buttons (warmup + cooldown)
      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );
      expect(configureButtons.length).toBe(2);

      // Check that cooldown section has the gear emoji
      const cooldownSection = screen.getByText('🧘‍♀️ Preview Cooldown (0 min)').closest('div');
      expect(cooldownSection).toBeInTheDocument();
      expect(cooldownSection?.textContent).toContain('⚙️');
    });

    it('opens duration settings when cooldown configure button is clicked', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      // Find and click the second configure button (in cooldown section)
      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );
      expect(configureButtons.length).toBe(2);
      fireEvent.click(configureButtons[1]);

      // Duration settings modal should open
      expect(screen.getByText('Duration Settings')).toBeInTheDocument();
    });

    it('has proper styling for cooldown configure button', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );
      const cooldownConfigureButton = configureButtons[1];

      // Check styling attributes
      expect(cooldownConfigureButton).toHaveStyle({
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
      });

      // Should have cooldown-themed color (blue)
      expect(cooldownConfigureButton.style.color).toBe('rgb(74, 144, 226)');
    });
  });

  describe('button interactions', () => {
    it('both buttons open the same duration settings modal', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );

      // Click warmup button
      fireEvent.click(configureButtons[0]);
      expect(screen.getByText('Duration Settings')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByText('×'));
      expect(screen.queryByText('Duration Settings')).not.toBeInTheDocument();

      // Click cooldown button
      fireEvent.click(configureButtons[1]);
      expect(screen.getByText('Duration Settings')).toBeInTheDocument();
    });

    it('displays helpful tooltips on configure buttons', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );

      // Both buttons should have the same helpful tooltip
      configureButtons.forEach(button => {
        expect(button).toHaveAttribute('title', 'Configure warmup and cooldown durations');
      });
    });

    it('configure buttons are properly sized for mobile interaction', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );

      configureButtons.forEach(button => {
        // Should have adequate padding for mobile touch targets
        expect(button).toHaveStyle({
          padding: '0.5rem 0.75rem'
        });

        // Should have proper spacing between icon and text
        expect(button).toHaveStyle({
          gap: '0.375rem'
        });
      });
    });
  });

  describe('visual consistency', () => {
    it('warmup and cooldown buttons have consistent design with different colors', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );
      const [warmupButton, cooldownButton] = configureButtons;

      // Both should have same structure but different theme colors
      expect(warmupButton).toHaveStyle({
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '500'
      });

      expect(cooldownButton).toHaveStyle({
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '500'
      });

      // But different theme colors
      expect(warmupButton.style.color).toBe('rgb(243, 156, 18)'); // Orange/yellow
      expect(cooldownButton.style.color).toBe('rgb(74, 144, 226)'); // Blue
    });

    it('gear emoji displays consistently in both sections', () => {
      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={mockWorkoutWithWarmupAndCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );

      // Both buttons should contain the gear emoji
      configureButtons.forEach(button => {
        expect(button.textContent).toMatch(/⚙️\s*Warmup \/ Cooldown/);
      });
    });
  });

  describe('section visibility', () => {
    it('only shows configure buttons when respective sections are visible', () => {
      const workoutWithoutCooldown = createMockWorkout({
        warmup: {
          exercises: [
            {
              id: 'warmup_001',
              name: 'Test Warmup',
              instructions: 'Do the warmup',
              targetBodyParts: ['full_body'],
              duration: 20,
              equipment: ['bodyweight']
            }
          ],
          totalDuration: 20
        }
        // No cooldown
      });

      render(
        <WorkoutPreview
          workoutSettings={workoutSettings}
          existingWorkout={workoutWithoutCooldown}
          onStartWorkout={mockHandlers.onWorkoutGenerated}
          onBack={mockHandlers.onBack}
          onShowAvoidedExercises={mockHandlers.onShowAvoidedExercises}
        />
      );

      // Should only have one configure button (warmup)
      const configureButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Warmup / Cooldown')
      );
      expect(configureButtons.length).toBe(1);

      // Should have warmup section but not cooldown section
      expect(screen.getByText('🔥 Preview Warm-Up (0 min)')).toBeInTheDocument();
      expect(screen.queryByText('🧘‍♀️ Preview Cooldown')).not.toBeInTheDocument();
    });
  });
});