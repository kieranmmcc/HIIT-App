import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, createMockHandlers } from '../../__tests__/utils/test-utils';
import AvoidedExercises from '../AvoidedExercises';
import { BlacklistStorage } from '../../utils/blacklistStorage';

// Mock the BlacklistStorage
jest.mock('../../utils/blacklistStorage');
const mockBlacklistStorage = BlacklistStorage as jest.Mocked<typeof BlacklistStorage>;

// Mock exercises data
jest.mock('../../data/exercises.json', () => [
  {
    id: 1,
    name: 'Push Ups',
    instructions: 'Do push ups',
    muscleGroups: ['chest', 'arms'],
    primaryMuscle: 'chest',
    difficulty: 3,
    equipment: ['bodyweight']
  },
  {
    id: 2,
    name: 'Burpees',
    instructions: 'Do burpees',
    muscleGroups: ['full_body'],
    primaryMuscle: 'full_body',
    difficulty: 4,
    equipment: ['bodyweight']
  }
]);

describe('AvoidedExercises Component', () => {
  const mockHandlers = createMockHandlers();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no exercises are avoided', () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    expect(screen.getByText('No Avoided Exercises')).toBeInTheDocument();
    expect(screen.getByText('You haven\'t marked any exercises as "never show again" yet.')).toBeInTheDocument();
  });

  it('renders avoided exercises when they exist', () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1']);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    expect(screen.getByText('Push Ups')).toBeInTheDocument();
    expect(screen.getByText('Do push ups')).toBeInTheDocument();
    expect(screen.getByText('1 exercise avoided')).toBeInTheDocument();
  });

  it('displays multiple avoided exercises correctly', () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    expect(screen.getByText('Push Ups')).toBeInTheDocument();
    expect(screen.getByText('Burpees')).toBeInTheDocument();
    expect(screen.getByText('2 exercises avoided')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);

    expect(mockHandlers.onBack).toHaveBeenCalledTimes(1);
  });

  it('removes exercise from avoid list when restore button is clicked', async () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1']);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    const restoreButton = screen.getByText('Restore');
    fireEvent.click(restoreButton);

    await waitFor(() => {
      expect(mockBlacklistStorage.removeFromBlacklist).toHaveBeenCalledWith('1');
    });
  });

  it('clears all exercises when clear all button is clicked and confirmed', async () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']);

    // Mock window.confirm to return true
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    await waitFor(() => {
      expect(mockBlacklistStorage.clearBlacklist).toHaveBeenCalledTimes(1);
    });

    confirmSpy.mockRestore();
  });

  it('does not clear exercises when clear all is cancelled', async () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1', '2']);

    // Mock window.confirm to return false
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    await waitFor(() => {
      expect(mockBlacklistStorage.clearBlacklist).not.toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });

  it('displays exercise difficulty and equipment correctly', () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue(['1']);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    expect(screen.getByText('Medium')).toBeInTheDocument(); // difficulty 3 = medium
    expect(screen.getByText('bodyweight')).toBeInTheDocument();
  });

  it('hides clear all button when no exercises are avoided', () => {
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);

    render(<AvoidedExercises onBack={mockHandlers.onBack} />);

    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });
});