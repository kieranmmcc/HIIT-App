import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DurationSettings from '../DurationSettings';
import { DurationPreferencesStorage } from '../../utils/durationPreferences';

// Mock duration preferences storage
jest.mock('../../utils/durationPreferences', () => ({
  DurationPreferencesStorage: {
    getPreferences: jest.fn(() => ({
      warmupDuration: 20,
      cooldownDuration: 20,
      lastUpdated: '2024-01-01T00:00:00Z'
    })),
    savePreferences: jest.fn(),
    getDurationOptions: jest.fn(() => [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]),
    formatDuration: jest.fn((seconds: number) => {
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
    })
  }
}));

const mockDurationPreferencesStorage = DurationPreferencesStorage as jest.Mocked<typeof DurationPreferencesStorage>;

describe('DurationSettings Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(<DurationSettings {...defaultProps} />);

      expect(screen.getByText('Duration Settings')).toBeInTheDocument();
      expect(screen.getByText('Warmup Exercise Duration')).toBeInTheDocument();
      expect(screen.getByText('Cooldown Exercise Duration')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<DurationSettings {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Duration Settings')).not.toBeInTheDocument();
    });

    it('displays current duration preferences', () => {
      mockDurationPreferencesStorage.getPreferences.mockReturnValue({
        warmupDuration: 30,
        cooldownDuration: 45,
        lastUpdated: '2024-01-01T00:00:00Z'
      });

      render(<DurationSettings {...defaultProps} />);

      expect(screen.getByText('Warmup: 30s per exercise')).toBeInTheDocument();
      expect(screen.getByText('Cooldown: 45s per stretch')).toBeInTheDocument();
    });

    it('renders duration option buttons for both warmup and cooldown', () => {
      render(<DurationSettings {...defaultProps} />);

      // Should have buttons for each duration option for both warmup and cooldown
      // 12 options × 2 (warmup + cooldown) = 24 duration buttons
      const durationButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.match(/^\d+s$/) || button.textContent?.match(/^\d+m/)
      );

      expect(durationButtons.length).toBe(24); // 12 warmup + 12 cooldown
    });

    it('highlights currently selected durations', () => {
      mockDurationPreferencesStorage.getPreferences.mockReturnValue({
        warmupDuration: 25,
        cooldownDuration: 40,
        lastUpdated: '2024-01-01T00:00:00Z'
      });

      render(<DurationSettings {...defaultProps} />);

      // Find the 25s button for warmup (should be highlighted)
      const warmup25Button = screen.getAllByRole('button').find(button =>
        button.textContent === '25s' &&
        button.style.background.includes('rgb(253, 121, 168)') // warmup color
      );
      expect(warmup25Button).toBeInTheDocument();

      // Find the 40s button for cooldown (should be highlighted)
      const cooldown40Button = screen.getAllByRole('button').find(button =>
        button.textContent === '40s' &&
        button.style.background.includes('rgb(116, 185, 255)') // cooldown color
      );
      expect(cooldown40Button).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('allows selecting warmup duration', () => {
      render(<DurationSettings {...defaultProps} />);

      // Click on 30s warmup duration button
      const warmup30Button = screen.getAllByRole('button').find(button =>
        button.textContent === '30s' &&
        !button.style.background.includes('74b9ff') // not cooldown color
      );

      fireEvent.click(warmup30Button!);

      // Should update the current settings display
      expect(screen.getByText('Warmup: 30s per exercise')).toBeInTheDocument();
    });

    it('allows selecting cooldown duration', () => {
      render(<DurationSettings {...defaultProps} />);

      // Find all 45s buttons
      const all45sButtons = screen.getAllByRole('button').filter(button =>
        button.textContent === '45s'
      );

      // The cooldown 45s button should be the second one (after warmup 45s)
      const cooldown45Button = all45sButtons[1];
      expect(cooldown45Button).toBeInTheDocument();

      fireEvent.click(cooldown45Button);
      expect(screen.getByText('Cooldown: 45s per stretch')).toBeInTheDocument();
    });

    it('allows custom duration input for warmup', () => {
      render(<DurationSettings {...defaultProps} />);

      const warmupCustomInput = screen.getAllByRole('spinbutton')[0]; // First number input is warmup
      fireEvent.change(warmupCustomInput, { target: { value: '35' } });

      expect(screen.getByText('Warmup: 35s per exercise')).toBeInTheDocument();
    });

    it('allows custom duration input for cooldown', () => {
      render(<DurationSettings {...defaultProps} />);

      const cooldownCustomInput = screen.getAllByRole('spinbutton')[1]; // Second number input is cooldown
      fireEvent.change(cooldownCustomInput, { target: { value: '55' } });

      expect(screen.getByText('Cooldown: 55s per stretch')).toBeInTheDocument();
    });

    it('enforces minimum and maximum bounds for custom input', () => {
      render(<DurationSettings {...defaultProps} />);

      const warmupInput = screen.getAllByRole('spinbutton')[0];

      // Test minimum bound
      fireEvent.change(warmupInput, { target: { value: '5' } });
      expect(screen.getByText('Warmup: 10s per exercise')).toBeInTheDocument(); // Should clamp to 10

      // Test maximum bound
      fireEvent.change(warmupInput, { target: { value: '350' } });
      expect(screen.getByText('Warmup: 5m per exercise')).toBeInTheDocument(); // Should clamp to 300s = 5m
    });

    it('enables save button when changes are made', () => {
      render(<DurationSettings {...defaultProps} />);

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();

      // Make a change
      const warmup25Button = screen.getAllByRole('button').find(button =>
        button.textContent === '25s' &&
        !button.style.background.includes('74b9ff')
      );
      fireEvent.click(warmup25Button!);

      expect(saveButton).not.toBeDisabled();
    });

    it('resets to 20s for both durations when reset button is clicked', () => {
      mockDurationPreferencesStorage.getPreferences.mockReturnValue({
        warmupDuration: 45,
        cooldownDuration: 60,
        lastUpdated: '2024-01-01T00:00:00Z'
      });

      render(<DurationSettings {...defaultProps} />);

      const resetButton = screen.getByText('Reset to 20s');
      fireEvent.click(resetButton);

      expect(screen.getByText('Warmup: 20s per exercise')).toBeInTheDocument();
      expect(screen.getByText('Cooldown: 20s per stretch')).toBeInTheDocument();
    });
  });

  describe('save functionality', () => {
    it('saves preferences and calls onSave when save button is clicked', async () => {
      // Reset mock to return default values for this test
      mockDurationPreferencesStorage.getPreferences.mockReturnValue({
        warmupDuration: 20,
        cooldownDuration: 20,
        lastUpdated: '2024-01-01T00:00:00Z'
      });

      render(<DurationSettings {...defaultProps} />);

      // Make a simple change by using custom input
      const warmupInput = screen.getAllByRole('spinbutton')[0];
      fireEvent.change(warmupInput, { target: { value: '30' } });

      // Save changes
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockDurationPreferencesStorage.savePreferences).toHaveBeenCalledWith({
          warmupDuration: 30,
          cooldownDuration: 20, // unchanged
          lastUpdated: expect.any(String)
        });
      });

      expect(defaultProps.onSave).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('handles save errors gracefully', async () => {
      mockDurationPreferencesStorage.savePreferences.mockImplementation(() => {
        throw new Error('Save failed');
      });

      // Mock alert to prevent actual alert dialog
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<DurationSettings {...defaultProps} />);

      // Make a change and try to save
      const warmup25Button = screen.getAllByRole('button').find(button =>
        button.textContent === '25s' && !button.style.background.includes('74b9ff')
      );
      fireEvent.click(warmup25Button!);

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to save preferences. Please try again.');
      });

      // Should not close on error
      expect(defaultProps.onClose).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('close functionality', () => {
    it('calls onClose when close button is clicked', () => {
      render(<DurationSettings {...defaultProps} />);

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button is clicked', () => {
      render(<DurationSettings {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has proper button roles and labels', () => {
      render(<DurationSettings {...defaultProps} />);

      const closeButton = screen.getByText('×');
      expect(closeButton).toBeInTheDocument();

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
    });

    it('has descriptive labels for input fields', () => {
      render(<DurationSettings {...defaultProps} />);

      expect(screen.getByText('Warmup Exercise Duration')).toBeInTheDocument();
      expect(screen.getByText('Cooldown Exercise Duration')).toBeInTheDocument();
    });

    it('provides helpful descriptions for each section', () => {
      render(<DurationSettings {...defaultProps} />);

      expect(screen.getByText('How long should each warmup exercise last?')).toBeInTheDocument();
      expect(screen.getByText('How long should each cooldown stretch last?')).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('renders in a mobile-friendly grid layout', () => {
      render(<DurationSettings {...defaultProps} />);

      // Check that duration buttons are in a grid layout
      const durationGrids = document.querySelectorAll('[style*="grid-template-columns"]');
      expect(durationGrids.length).toBeGreaterThan(0);

      // Should have responsive grid columns
      durationGrids.forEach(grid => {
        expect(grid).toHaveStyle({
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
          gap: '0.5rem'
        });
      });
    });

    it('has appropriate button sizes for mobile interaction', () => {
      render(<DurationSettings {...defaultProps} />);

      const durationButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.match(/^\d+s$/) || button.textContent?.match(/^\d+m/)
      );

      durationButtons.forEach(button => {
        expect(button).toHaveStyle({
          padding: '0.75rem 0.5rem',
          borderRadius: '6px'
        });
      });
    });
  });
});