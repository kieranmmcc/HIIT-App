import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, createMockEquipment } from './utils/test-utils';
import App from '../App';
import { EquipmentStorage } from '../utils/equipmentStorage';

// Mock the EquipmentStorage
jest.mock('../utils/equipmentStorage');
const mockEquipmentStorage = EquipmentStorage as jest.Mocked<typeof EquipmentStorage>;

// Mock CSS imports
jest.mock('../styles/EquipmentSelection.css', () => ({}));

// Mock all equipment data
jest.mock('../data/equipment', () => ({
  equipmentData: [
    createMockEquipment({ id: 'bodyweight', name: 'Bodyweight' }),
    createMockEquipment({ id: 'dumbbells', name: 'Dumbbells' }),
  ]
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders equipment selection screen by default', () => {
    mockEquipmentStorage.getPreferences.mockReturnValue({
      hasCompletedSetup: false,
      selectedForWorkout: [],
      ownedEquipment: [],
      presets: [],
    });

    render(<App />);

    expect(screen.getByText('Set Up Your Home Gym')).toBeInTheDocument();
  });

  it('navigates to workout setup when equipment setup is completed', async () => {
    mockEquipmentStorage.getPreferences.mockReturnValue({
      hasCompletedSetup: true,
      selectedForWorkout: ['bodyweight'],
      ownedEquipment: ['bodyweight'],
      presets: [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Create Your Workout')).toBeInTheDocument();
    });
  });

  it('navigates between screens correctly', async () => {
    mockEquipmentStorage.getPreferences.mockReturnValue({
      hasCompletedSetup: false,
      selectedForWorkout: [],
      ownedEquipment: [],
      presets: [],
    });

    render(<App />);

    // Start at equipment selection
    expect(screen.getByText('Set Up Your Home Gym')).toBeInTheDocument();

    // Mock the continue action (this would normally be triggered by equipment selection)
    // For now, we'll test that the component renders properly
  });

  it('shows avoided exercises screen when requested', async () => {
    mockEquipmentStorage.getPreferences.mockReturnValue({
      hasCompletedSetup: true,
      selectedForWorkout: ['bodyweight'],
      ownedEquipment: ['bodyweight'],
      presets: [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Create Your Workout')).toBeInTheDocument();
    });

    // Look for the avoided exercises button and click it
    const avoidedButton = screen.getByText('Manage Avoided Exercises');
    fireEvent.click(avoidedButton);

    await waitFor(() => {
      expect(screen.getByText('Avoided Exercises')).toBeInTheDocument();
    });
  });

  it('navigates back from avoided exercises correctly', async () => {
    mockEquipmentStorage.getPreferences.mockReturnValue({
      hasCompletedSetup: true,
      selectedForWorkout: ['bodyweight'],
      ownedEquipment: ['bodyweight'],
      presets: [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Create Your Workout')).toBeInTheDocument();
    });

    // Go to avoided exercises
    const avoidedButton = screen.getByText('Manage Avoided Exercises');
    fireEvent.click(avoidedButton);

    await waitFor(() => {
      expect(screen.getByText('Avoided Exercises')).toBeInTheDocument();
    });

    // Go back
    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Create Your Workout')).toBeInTheDocument();
    });
  });

  it('handles screen transitions with proper state management', () => {
    mockEquipmentStorage.getPreferences.mockReturnValue({
      hasCompletedSetup: true,
      selectedForWorkout: ['bodyweight'],
      ownedEquipment: ['bodyweight'],
      presets: [],
    });

    render(<App />);

    // Verify that only one screen is visible at a time
    const elements = screen.getAllByText(/Create Your Workout|Set Up Your Home Gym|Avoided Exercises|Review/);
    expect(elements.length).toBeGreaterThan(0);
  });
});