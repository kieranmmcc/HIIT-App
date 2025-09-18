import React, { useState, useEffect } from 'react';
import type { Equipment } from '../types/equipment';
import type { WorkoutSettings } from '../types/workout';
import type { CircuitType } from '../types/circuit';
import { durationOptions, difficultyOptions } from '../data/workoutOptions';
import { circuitTypeOptions } from '../types/circuit';
import QuickEquipmentSelector from './QuickEquipmentSelector';
import MuscleGroupSelector from './MuscleGroupSelector';
import { EquipmentStorage } from '../utils/equipmentStorage';
import { CircuitStorage } from '../utils/circuitStorage';
import { WorkoutFavoritesManager } from '../utils/workoutFavorites';
import PWAInstallButton from './PWAInstallButton';

interface WorkoutSetupProps {
  selectedEquipment: Equipment[];
  onBack: () => void;
  onStartWorkout: (settings: WorkoutSettings) => void;
}

const WorkoutSetup: React.FC<WorkoutSetupProps> = ({
  // selectedEquipment,
  onBack,
  onStartWorkout
}) => {
  const [duration, setDuration] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [workoutEquipment, setWorkoutEquipment] = useState<string[]>([]);
  const [targetMuscleGroups, setTargetMuscleGroups] = useState<string[]>([]);
  const [excludedMuscleGroups, setExcludedMuscleGroups] = useState<string[]>([]);
  const [circuitType, setCircuitType] = useState<CircuitType>('classic_cycle');
  const [exerciseCount, setExerciseCount] = useState<number>(8); // Default 8 exercises for classic, 4 sets for super sets
  const [favoriteCircuitType, setFavoriteCircuitType] = useState<CircuitType>('classic_cycle');
  const [favoriteDuration, setFavoriteDuration] = useState<number | null>(null);
  const [favoriteDifficulty, setFavoriteDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [favoriteExerciseCount, setFavoriteExerciseCount] = useState<number | null>(null);

  // Calculate duration based on exercise count and difficulty
  const calculateDuration = (count: number, diff: 'easy' | 'medium' | 'hard'): number => {
    const timings = {
      easy: { work: 30, rest: 30 }, // 60 seconds per exercise
      medium: { work: 45, rest: 15 }, // 60 seconds per exercise
      hard: { work: 50, rest: 10 } // 60 seconds per exercise
    };

    const secondsPerExercise = timings[diff].work + timings[diff].rest;
    const secondsPerRound = count * secondsPerExercise;

    // Aim for roughly 15-25 minutes, calculate rounds needed
    const targetMinutes = 20;
    const rounds = Math.max(1, Math.round((targetMinutes * 60) / secondsPerRound));

    return Math.round((secondsPerRound * rounds) / 60); // Convert back to minutes
  };

  // Update duration when exercise count or difficulty changes
  useEffect(() => {
    const newDuration = calculateDuration(exerciseCount, difficulty);
    setDuration(newDuration);
  }, [exerciseCount, difficulty]);

  useEffect(() => {
    // Initialize workout equipment from storage
    const preferences = EquipmentStorage.getPreferences();
    setWorkoutEquipment(preferences.selectedForWorkout);

    // Initialize favorite circuit type from storage
    const storedFavorite = CircuitStorage.getFavoriteCircuitType();
    setFavoriteCircuitType(storedFavorite);
    setCircuitType(storedFavorite);

    // Initialize favorite duration, difficulty, and exercise count from storage
    const favDuration = WorkoutFavoritesManager.getFavoriteDuration();
    const favDifficulty = WorkoutFavoritesManager.getFavoriteDifficulty();
    const favExerciseCount = WorkoutFavoritesManager.getFavoriteExerciseCount();

    setFavoriteDuration(favDuration);
    setFavoriteDifficulty(favDifficulty);
    setFavoriteExerciseCount(favExerciseCount);

    // Set defaults to favorites if they exist
    if (favDifficulty) {
      setDifficulty(favDifficulty);
    }
    if (favExerciseCount) {
      // For super sets, favorite is stored as set count, so multiply by 2 for total exercises
      // For classic, favorite is stored as exercise count directly
      const initialExerciseCount = storedFavorite === 'super_sets' ? favExerciseCount * 2 : favExerciseCount;
      setExerciseCount(initialExerciseCount);
    }

    // Initialize duration based on initial circuit type and difficulty
    setTimeout(() => {
      const initialDurations = getAvailableDurations(storedFavorite, favDifficulty || 'medium', exerciseCount);
      if (initialDurations.length > 0) {
        const middleIndex = Math.floor(initialDurations.length / 2);
        setDuration(initialDurations[middleIndex].value);
      }
    }, 0);
  }, []);

  // Update duration when circuit type, difficulty, or exercise count changes
  useEffect(() => {
    const durations = getAvailableDurations(circuitType, difficulty, exerciseCount);
    if (durations.length > 0) {
      // Try to find a matching duration, otherwise use the middle option
      const matchingDuration = durations.find(d => d.value === duration);
      if (!matchingDuration) {
        const middleIndex = Math.floor(durations.length / 2);
        setDuration(durations[middleIndex].value);
      }
    }
  }, [circuitType, difficulty, exerciseCount]);

  // Handle circuit type changes - adjust exercise count appropriately
  useEffect(() => {
    // When switching to super sets, ensure even number of exercises
    if (circuitType === 'super_sets' && exerciseCount % 2 !== 0) {
      setExerciseCount(exerciseCount + 1);
    }
    // When switching from super sets to classic, keep reasonable range
    else if (circuitType === 'classic_cycle' && exerciseCount < 6) {
      setExerciseCount(8); // Default to 8 for classic circuits
    }
  }, [circuitType]);

  const handleEquipmentChange = (equipmentIds: string[]) => {
    setWorkoutEquipment(equipmentIds);
  };

  const handleFavoriteCircuitType = (type: CircuitType, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the circuit selection

    if (favoriteCircuitType === type) {
      // If clicking on already favorited type, unfavorite it (set to default)
      CircuitStorage.setFavoriteCircuitType('classic_cycle');
      setFavoriteCircuitType('classic_cycle');
    } else {
      // Set new favorite
      CircuitStorage.setFavoriteCircuitType(type);
      setFavoriteCircuitType(type);
    }
  };

  const handleFavoriteDuration = (durationValue: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the duration selection

    if (favoriteDuration === durationValue) {
      // If clicking on already favorited duration, unfavorite it
      WorkoutFavoritesManager.clearFavoriteDuration();
      setFavoriteDuration(null);
    } else {
      // Set new favorite
      WorkoutFavoritesManager.setFavoriteDuration(durationValue);
      setFavoriteDuration(durationValue);
    }
  };

  const handleFavoriteDifficulty = (difficultyValue: 'easy' | 'medium' | 'hard', event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the difficulty selection

    if (favoriteDifficulty === difficultyValue) {
      // If clicking on already favorited difficulty, unfavorite it
      WorkoutFavoritesManager.clearFavoriteDifficulty();
      setFavoriteDifficulty(null);
    } else {
      // Set new favorite
      WorkoutFavoritesManager.setFavoriteDifficulty(difficultyValue);
      setFavoriteDifficulty(difficultyValue);
    }
  };

  const handleFavoriteExerciseCount = (displayValue: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent any other interactions

    // Store the display value (sets for super sets, exercises for classic)
    if (favoriteExerciseCount === displayValue) {
      // If clicking on already favorited count, unfavorite it
      WorkoutFavoritesManager.clearFavoriteExerciseCount();
      setFavoriteExerciseCount(null);
    } else {
      // Set new favorite
      WorkoutFavoritesManager.setFavoriteExerciseCount(displayValue);
      setFavoriteExerciseCount(displayValue);
    }
  };

  const handleStartWorkout = () => {
    const settings: WorkoutSettings = {
      duration,
      difficulty,
      selectedEquipment: workoutEquipment,
      targetMuscleGroups: targetMuscleGroups.length > 0 ? targetMuscleGroups : undefined,
      excludedMuscleGroups: excludedMuscleGroups.length > 0 ? excludedMuscleGroups : undefined,
      circuitType,
      exerciseCount
    };
    onStartWorkout(settings);
  };

  // const selectedCircuitTypeOption = circuitTypeOptions.find(opt => opt.value === circuitType);
  const selectedDifficultyOption = difficultyOptions.find(opt => opt.value === difficulty);

  // Calculate available durations based on exercise count
  const getAvailableDurations = (circuit: CircuitType, diff: 'easy' | 'medium' | 'hard', exerciseCount: number) => {
    const diffOption = difficultyOptions.find(d => d.value === diff);
    if (!diffOption) return [];

    const workTime = diffOption.workTime;
    const restTime = diffOption.restTime;

    switch (circuit) {
      case 'classic_cycle':
        const classicRoundTime = (workTime + restTime) * exerciseCount; // seconds per round
        return [
          { value: Math.round(classicRoundTime * 1 / 60), label: `${Math.round(classicRoundTime * 1 / 60)} Minutes`, description: '1 round', exercises: exerciseCount },
          { value: Math.round(classicRoundTime * 2 / 60), label: `${Math.round(classicRoundTime * 2 / 60)} Minutes`, description: '2 rounds', exercises: exerciseCount * 2 },
          { value: Math.round(classicRoundTime * 3 / 60), label: `${Math.round(classicRoundTime * 3 / 60)} Minutes`, description: '3 rounds', exercises: exerciseCount * 3 },
          { value: Math.round(classicRoundTime * 4 / 60), label: `${Math.round(classicRoundTime * 4 / 60)} Minutes`, description: '4 rounds', exercises: exerciseCount * 4 }
        ];

      case 'super_sets':
        const numStations = exerciseCount / 2;
        const superSetRoundTime = (workTime + restTime) * exerciseCount + 30 * (numStations - 1); // transitions between stations
        return [
          { value: Math.round(superSetRoundTime * 1 / 60), label: `${Math.round(superSetRoundTime * 1 / 60)} Minutes`, description: '1 round', exercises: exerciseCount },
          { value: Math.round(superSetRoundTime * 2 / 60), label: `${Math.round(superSetRoundTime * 2 / 60)} Minutes`, description: '2 rounds', exercises: exerciseCount * 2 },
          { value: Math.round(superSetRoundTime * 3 / 60), label: `${Math.round(superSetRoundTime * 3 / 60)} Minutes`, description: '3 rounds', exercises: exerciseCount * 3 }
        ];

      default:
        return durationOptions;
    }
  };

  const availableDurations = getAvailableDurations(circuitType, difficulty, exerciseCount);

  return (
    <div className="workout-setup fade-in" style={{ minHeight: '100vh', color: 'white' }}>
      <div className="container">
        <header className="workout-header" style={{ padding: '2rem 0' }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid #3a3a40',
              borderRadius: '8px',
              color: '#b8bcc8',
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Back to Equipment
          </button>

          {/* Mobile: Button at top center */}
          <div className="mobile-only" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <PWAInstallButton size="small" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }} className="desktop-flex">
            <div>
              <h1 style={{ color: 'white', marginBottom: '1rem' }}>Create Your Workout</h1>
              <p style={{ color: '#b8bcc8' }}>
                Choose your workout duration and intensity level
              </p>
            </div>
            <div className="desktop-only">
              <PWAInstallButton size="small" />
            </div>
          </div>

          <QuickEquipmentSelector
            selectedEquipment={workoutEquipment}
            onEquipmentChange={handleEquipmentChange}
            onEditAllEquipment={onBack}
          />
        </header>

        {/* Circuit Type Selection */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#22c55e',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Circuit Type
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {circuitTypeOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => setCircuitType(option.value)}
                style={{
                  background: circuitType === option.value ? '#1c1c20' : '#131315',
                  border: circuitType === option.value ? '2px solid #22c55e' : '2px solid #2a2a2f',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: circuitType === option.value ? '0 8px 24px rgba(34, 197, 94, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.4)',
                  position: 'relative'
                }}
              >
                {/* Favorite Button */}
                <button
                  onClick={(e) => handleFavoriteCircuitType(option.value, e)}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title={favoriteCircuitType === option.value ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={favoriteCircuitType === option.value ? '#feca57' : 'none'}
                    stroke={favoriteCircuitType === option.value ? '#feca57' : '#6c7293'}
                    strokeWidth="2"
                    style={{
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </button>

                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.75rem'
                }}>
                  {option.icon}
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: circuitType === option.value ? '#22c55e' : 'white',
                  marginBottom: '0.5rem'
                }}>
                  {option.name}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#b8bcc8',
                  marginBottom: '0.5rem'
                }}>
                  {option.description}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6c7293'
                }}>
                  {option.structure}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Count Selection */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#22c55e',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {circuitType === 'super_sets' ? 'Super Set Count' : 'Exercise Count'}
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <input
              type="range"
              min={circuitType === 'super_sets' ? '2' : '6'}
              max={circuitType === 'super_sets' ? '4' : '12'}
              step="1"
              value={circuitType === 'super_sets' ? exerciseCount / 2 : exerciseCount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setExerciseCount(circuitType === 'super_sets' ? value * 2 : value);
              }}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                background: '#2a2a2f',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <div style={{
              minWidth: '60px',
              textAlign: 'center',
              background: '#131315',
              border: '2px solid #22c55e',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#22c55e',
              fontWeight: 'bold',
              fontSize: '1.125rem'
            }}>
              {circuitType === 'super_sets' ? exerciseCount / 2 : exerciseCount}
            </div>
            <button
              onClick={(e) => handleFavoriteExerciseCount(
                circuitType === 'super_sets' ? exerciseCount / 2 : exerciseCount,
                e
              )}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title={favoriteExerciseCount === (circuitType === 'super_sets' ? exerciseCount / 2 : exerciseCount) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={favoriteExerciseCount === (circuitType === 'super_sets' ? exerciseCount / 2 : exerciseCount) ? '#feca57' : 'none'}
                stroke={favoriteExerciseCount === (circuitType === 'super_sets' ? exerciseCount / 2 : exerciseCount) ? '#feca57' : '#6c7293'}
                strokeWidth="2"
                style={{
                  transition: 'all 0.2s ease'
                }}
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </button>
          </div>

          <div style={{
            background: '#131315',
            border: '1px solid #2a2a2f',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '0.875rem',
            color: '#b8bcc8',
            lineHeight: 1.4
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#22c55e' }}>Estimated Duration: {duration} minutes</strong>
            </div>
            <div>
              {circuitType === 'super_sets'
                ? `${exerciseCount / 2} super sets (${exerciseCount} total exercises)`
                : `${exerciseCount} exercises in your circuit`
              }
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#22c55e',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Duration
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {availableDurations.map((option) => (
              <div
                key={option.value}
                onClick={() => setDuration(option.value)}
                style={{
                  background: duration === option.value ? '#1c1c20' : '#131315',
                  border: duration === option.value ? '2px solid #22c55e' : '2px solid #2a2a2f',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: duration === option.value ? '0 8px 24px rgba(34, 197, 94, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.4)',
                  position: 'relative'
                }}
              >
                {/* Favorite Button */}
                <button
                  onClick={(e) => handleFavoriteDuration(option.value, e)}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title={favoriteDuration === option.value ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={favoriteDuration === option.value ? '#feca57' : 'none'}
                    stroke={favoriteDuration === option.value ? '#feca57' : '#6c7293'}
                    strokeWidth="2"
                    style={{
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </button>

                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: duration === option.value ? '#22c55e' : 'white',
                  marginBottom: '0.5rem'
                }}>
                  {option.label}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#b8bcc8',
                  marginBottom: '0.25rem'
                }}>
                  {option.description}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6c7293'
                }}>
                  ~{option.exercises} exercises
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#22c55e',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Difficulty Level
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem'
          }}>
            {difficultyOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => setDifficulty(option.value)}
                style={{
                  background: difficulty === option.value ? '#1c1c20' : '#131315',
                  border: difficulty === option.value ? `2px solid ${option.color}` : '2px solid #2a2a2f',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: difficulty === option.value ? `0 8px 24px ${option.color}25` : '0 4px 12px rgba(0, 0, 0, 0.4)',
                  position: 'relative'
                }}
              >
                {/* Favorite Button */}
                <button
                  onClick={(e) => handleFavoriteDifficulty(option.value, e)}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: favoriteDifficulty === option.value ? '#ffd700' : '#6c7293',
                    transition: 'color 0.3s ease, transform 0.2s ease',
                    padding: '0.25rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={favoriteDifficulty === option.value ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={favoriteDifficulty === option.value ? '#feca57' : 'none'}
                    stroke={favoriteDifficulty === option.value ? '#feca57' : '#6c7293'}
                    strokeWidth="2"
                    style={{
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </button>

                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: difficulty === option.value ? option.color : 'white',
                  marginBottom: '0.5rem'
                }}>
                  {option.label}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#b8bcc8',
                  marginBottom: '0.75rem'
                }}>
                  {option.description}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6c7293',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem'
                }}>
                  <span>Work: {option.workTime}s</span>
                  <span>Rest: {option.restTime}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Muscle Group Selection */}
        <MuscleGroupSelector
          selectedMuscleGroups={targetMuscleGroups}
          onMuscleGroupsChange={setTargetMuscleGroups}
          excludedMuscleGroups={excludedMuscleGroups}
          onExcludedMuscleGroupsChange={setExcludedMuscleGroups}
          circuitType={circuitType}
          exerciseCount={exerciseCount}
        />

        {/* Generate Workout Button */}
        <div className="workout-actions" style={{ textAlign: 'center' }}>
          <button
            className="btn-primary"
            onClick={handleStartWorkout}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
              color: 'black',
              padding: '1rem 2.5rem',
              fontSize: '1.25rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              marginBottom: '1rem'
            }}
          >
            Generate {duration}-Minute Workout
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
          <p style={{ fontSize: '0.875rem', color: '#6c7293', margin: 0 }}>
            {selectedDifficultyOption?.workTime}s work • {selectedDifficultyOption?.restTime}s rest • Using {workoutEquipment.length} equipment types
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSetup;