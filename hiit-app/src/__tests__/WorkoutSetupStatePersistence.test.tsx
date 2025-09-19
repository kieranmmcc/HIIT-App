import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, createMockEquipment } from './utils/test-utils';
import App from '../App';
import { EquipmentStorage } from '../utils/equipmentStorage';
import { CircuitStorage } from '../utils/circuitStorage';
import { WorkoutFavoritesManager } from '../utils/workoutFavorites';
import { BlacklistStorage } from '../utils/blacklistStorage';

// Mock the storage utilities
jest.mock('../utils/equipmentStorage');
jest.mock('../utils/circuitStorage');
jest.mock('../utils/workoutFavorites');
jest.mock('../utils/blacklistStorage');

// Mock CSS imports
jest.mock('../styles/EquipmentSelection.css', () => ({}));

// Mock all equipment data
jest.mock('../data/equipment', () => ({
  equipmentData: [
    createMockEquipment({ id: 'bodyweight', name: 'Bodyweight', isSelected: false }),
    createMockEquipment({ id: 'dumbbells', name: 'Dumbbells', isSelected: false }),
  ]
}));

// Mock components that might cause issues
jest.mock('../components/PWAInstallButton', () => {
  return function PWAInstallButton() {
    return <div data-testid="pwa-install-button">PWA Install Button</div>;
  };
});

jest.mock('../components/QuickEquipmentSelector', () => {
  return function QuickEquipmentSelector({ onEquipmentChange }: any) {
    return (
      <div data-testid="quick-equipment-selector">
        <span>Quick Equipment Selector</span>
        <button onClick={() => onEquipmentChange(['bodyweight'])}>
          Select Bodyweight
        </button>
      </div>
    );
  };
});

jest.mock('../components/MuscleGroupSelector', () => {
  return function MuscleGroupSelector({
    selectedMuscleGroups = [],
    onMuscleGroupsChange = () => {},
    excludedMuscleGroups = [],
    onExcludedMuscleGroupsChange = () => {}
  }: any) {
    return (
      <div data-testid="muscle-group-selector">
        <span>Muscle Group Selector</span>
        <div data-testid="current-target-groups">{selectedMuscleGroups?.join(',') || ''}</div>
        <div data-testid="current-excluded-groups">{excludedMuscleGroups?.join(',') || ''}</div>
        <button
          data-testid="add-chest-target"
          onClick={() => onMuscleGroupsChange(['chest'])}
        >
          Target Chest
        </button>
        <button
          data-testid="add-legs-excluded"
          onClick={() => onExcludedMuscleGroupsChange(['legs'])}
        >
          Exclude Legs
        </button>
        <button
          data-testid="add-multiple-targets"
          onClick={() => onMuscleGroupsChange(['chest', 'back', 'arms'])}
        >
          Target Multiple
        </button>
      </div>
    );
  };
});

const mockEquipmentStorage = EquipmentStorage as jest.Mocked<typeof EquipmentStorage>;
const mockCircuitStorage = CircuitStorage as jest.Mocked<typeof CircuitStorage>;
const mockWorkoutFavoritesManager = WorkoutFavoritesManager as jest.Mocked<typeof WorkoutFavoritesManager>;
const mockBlacklistStorage = BlacklistStorage as jest.Mocked<typeof BlacklistStorage>;

describe('WorkoutSetup State Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockEquipmentStorage.getPreferences.mockReturnValue({
      hasCompletedSetup: true,
      selectedForWorkout: ['bodyweight'],
      ownedEquipment: ['bodyweight'],
      presets: [],
    });

    mockCircuitStorage.getFavoriteCircuitType.mockReturnValue('classic_cycle');
    mockWorkoutFavoritesManager.getFavoriteDuration.mockReturnValue(null);
    mockWorkoutFavoritesManager.getFavoriteDifficulty.mockReturnValue(null);
    mockWorkoutFavoritesManager.getFavoriteExerciseCount.mockReturnValue(null);
    mockBlacklistStorage.getBlacklistedExercises.mockReturnValue([]);
  });

  it('demonstrates the navigation works but state is lost', async () => {
    render(<App />);

    // Wait for WorkoutSetup to load
    await waitFor(() => {
      expect(screen.getByText('Create Your Workout')).toBeInTheDocument();
    });

    // Verify we can click on Super Sets (even if we can't easily verify state change)
    const supersetOption = screen.getByText('Super Sets');
    expect(supersetOption).toBeInTheDocument();
    fireEvent.click(supersetOption);

    // Verify we can set muscle groups using our mock selector
    const addMultipleTargetsButton = screen.getByTestId('add-multiple-targets');
    fireEvent.click(addMultipleTargetsButton);

    await waitFor(() => {
      const targetGroups = screen.getByTestId('current-target-groups');
      expect(targetGroups).toHaveTextContent('chest,back,arms');
    });

    // Navigate to Manage Avoided Exercises
    const manageAvoidedButton = screen.getByText('Manage Avoided Exercises');
    fireEvent.click(manageAvoidedButton);

    // Verify we're on the avoided exercises page
    await waitFor(() => {
      expect(screen.getByText('Avoided Exercises')).toBeInTheDocument();
    });

    // Navigate back
    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);

    // Verify we're back on WorkoutSetup page
    await waitFor(() => {
      expect(screen.getByText('Create Your Workout')).toBeInTheDocument();
    });

    // BUG DEMONSTRATED: Muscle groups are lost (component was re-instantiated)
    const targetGroups = screen.getByTestId('current-target-groups');
    const targetGroupsText = targetGroups.textContent || '';

    console.log('🐛 STATE PERSISTENCE BUG:');
    console.log(`Target groups before navigation: 'chest,back,arms'`);
    console.log(`Target groups after navigation: '${targetGroupsText}'`);
    console.log('State was lost due to component remounting!');

    // This demonstrates the bug - state is lost
    expect(targetGroupsText).toBe(''); // Empty because component was remounted
  });

  it('confirms navigation flow works correctly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Create Your Workout')).toBeInTheDocument();
    });

    // Verify basic UI elements are present
    expect(screen.getByText('Classic Circuit')).toBeInTheDocument();
    expect(screen.getByText('Super Sets')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();

    // Navigate to Manage Avoided Exercises
    const manageAvoidedButton = screen.getByText('Manage Avoided Exercises');
    fireEvent.click(manageAvoidedButton);

    await waitFor(() => {
      expect(screen.getByText('Avoided Exercises')).toBeInTheDocument();
    });

    // Navigate back
    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Create Your Workout')).toBeInTheDocument();
    });

    // Verify all UI elements are still present (component successfully remounted)
    expect(screen.getByText('Classic Circuit')).toBeInTheDocument();
    expect(screen.getByText('Super Sets')).toBeInTheDocument();
    expect(screen.getByText('Create Your Workout')).toBeInTheDocument();

    console.log('✅ Navigation flow works correctly');
    console.log('🐛 BUT: Component state is lost due to unmount/remount cycle');
  });
});