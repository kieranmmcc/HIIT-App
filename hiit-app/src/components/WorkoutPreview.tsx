import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { WorkoutSettings } from '../types/workout';
import type { GeneratedWorkout } from '../types/circuit';
import type { Equipment } from '../types/equipment';
import type { Exercise } from '../types/exercise';
import { generateWorkout, regenerateExercise } from '../utils/workoutGenerator';
import { equipmentData } from '../data/equipment';
import { BlacklistStorage } from '../utils/blacklistStorage';
import { muscleGroupLabels } from '../types/muscleGroups';
import { circuitTypeOptions } from '../types/circuit';
import { InstructionPreferences } from '../utils/instructionPreferences';
import { difficultyOptions } from '../data/workoutOptions';

interface WorkoutPreviewProps {
  workoutSettings: WorkoutSettings;
  existingWorkout?: GeneratedWorkout | null;
  onStartWorkout: (workout: GeneratedWorkout) => void;
  onBack: () => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({
  workoutSettings,
  existingWorkout,
  onStartWorkout,
  onBack
}) => {
  const [workout, setWorkout] = useState<GeneratedWorkout>(() =>
    existingWorkout || generateWorkout(workoutSettings)
  );

  // Update workout if existingWorkout changes (e.g., coming back from active workout)
  useEffect(() => {
    if (existingWorkout && existingWorkout !== workout) {
      setWorkout(existingWorkout);
    }
  }, [existingWorkout]);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(() => {
    // Load saved preference and expand all if user prefers instructions visible
    const instructionsVisible = InstructionPreferences.getInstructionsVisible();
    if (instructionsVisible) {
      // Create set of all exercise keys
      const allKeys = new Set<string>();
      if (workout.circuit) {
        workout.circuit.stations.forEach((station: any) => {
          station.exercises.forEach((exercise: any) => {
            allKeys.add(`${station.id}-${exercise.id}`);
          });
        });
      }
      return allKeys;
    }
    return new Set();
  });

  // Get circuit info and display type
  const circuitInfo = workout.circuit;
  const selectedCircuitType = circuitTypeOptions.find(option => option.value === workoutSettings.circuitType);

  // Create dynamic description based on exercise count
  const getDynamicDescription = () => {
    if (!selectedCircuitType) return 'Your personalized workout';

    if (selectedCircuitType.value === 'classic_cycle') {
      const exerciseCount = workoutSettings.exerciseCount || 8;
      return `Cycle through ${exerciseCount} different exercises continuously`;
    }

    return selectedCircuitType.description;
  };

  // Get equipment data for display
  const getEquipmentInfo = (equipmentId: string): Equipment | undefined => {
    return equipmentData.find(eq => eq.id === equipmentId);
  };

  // Get user's selected equipment for display
  const workoutEquipment = useMemo(() => {
    return workoutSettings.selectedEquipment;
  }, [workoutSettings.selectedEquipment]);

  const totalWorkoutTime = Math.round(workout.totalDuration / 60);

  // Calculate exercise vs rest time breakdown
  const getTimeBreakdown = () => {
    if (circuitInfo) {
      // For circuit workouts, calculate based on circuit structure
      const totalExercises = workout.exercises.length;
      const totalWorkTime = totalExercises * circuitInfo.workTime;

      let totalRestTime = 0;

      if (circuitInfo.type === 'classic_cycle') {
        // Classic circuits: no rest after the last exercise of each round
        const restPeriods = totalExercises - circuitInfo.rounds; // Remove one rest per round
        totalRestTime = restPeriods * circuitInfo.restTime;
      } else {
        // Other circuit types: rest after every exercise except the very last one
        totalRestTime = (totalExercises - 1) * circuitInfo.restTime;
      }

      // Add station rest time if applicable
      let stationRestTime = 0;
      if (circuitInfo.stationRestTime && circuitInfo.stationRestTime > 0) {
        // Calculate number of station transitions
        // const exercisesPerRound = circuitInfo.stations.reduce((sum: number, station: any) => sum + station.exercises.length, 0);
        const stationsPerRound = circuitInfo.stations.length;
        const stationTransitions = circuitInfo.rounds * (stationsPerRound - 1);
        stationRestTime = stationTransitions * circuitInfo.stationRestTime;
      }

      return {
        exerciseTime: totalWorkTime,
        restTime: totalRestTime + stationRestTime
      };
    } else {
      // For legacy workouts
      let totalExerciseTime = 0;
      let totalRestTime = 0;

      workout.exercises.forEach(workoutEx => {
        totalExerciseTime += workoutEx.duration;
        totalRestTime += workoutEx.restDuration;
      });

      return {
        exerciseTime: totalExerciseTime,
        restTime: totalRestTime
      };
    }
  };

  const timeBreakdown = getTimeBreakdown();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeMinutes = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    return `${mins}min`;
  };

  const toggleExerciseDescription = (exerciseKey: string) => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseKey)) {
        newSet.delete(exerciseKey);
      } else {
        newSet.add(exerciseKey);
      }
      return newSet;
    });
  };

  const showAllInstructions = () => {
    const allKeys = new Set<string>();
    if (circuitInfo) {
      circuitInfo.stations.forEach((station: any) => {
        station.exercises.forEach((exercise: any) => {
          allKeys.add(`${station.id}-${exercise.id}`);
        });
      });
    }
    setExpandedExercises(allKeys);
    InstructionPreferences.setInstructionsVisible(true);
  };

  const hideAllInstructions = () => {
    setExpandedExercises(new Set());
    InstructionPreferences.setInstructionsVisible(false);
  };

  // Check if all instructions are currently visible
  const getAllExerciseKeys = () => {
    const allKeys = new Set<string>();
    if (circuitInfo) {
      circuitInfo.stations.forEach((station: any) => {
        if (station.exercises) {
          station.exercises.forEach((exercise: any) => {
            if (exercise && exercise.id) {
              allKeys.add(`${station.id}-${exercise.id}`);
            }
          });
        }
      });
    }
    return allKeys;
  };

  const allExerciseKeys = getAllExerciseKeys();
  const allInstructionsVisible = allExerciseKeys.size > 0 &&
    Array.from(allExerciseKeys).every(key => expandedExercises.has(key));

  const handleRegenerateCircuitExercise = useCallback((stationId: string, exerciseIndex: number) => {
    setWorkout(prevWorkout => {
      if (!prevWorkout.circuit) return prevWorkout;

      const newCircuit = { ...prevWorkout.circuit };
      const stationIndex = newCircuit.stations.findIndex((s: any) => s.id === stationId);

      if (stationIndex === -1) return prevWorkout;

      const currentExercise = newCircuit.stations[stationIndex].exercises[exerciseIndex];

      // Get all existing exercises in the workout to avoid duplicates
      const allExistingExercises: Exercise[] = [];
      newCircuit.stations.forEach((station: any) => {
        station.exercises.forEach((exercise: any) => {
          if (exercise.id !== currentExercise.id) { // Exclude the one we're replacing
            allExistingExercises.push(exercise);
          }
        });
      });

      const newExercise = regenerateExercise(currentExercise, workoutSettings, allExistingExercises);

      if (newExercise) {
        const newStations = [...newCircuit.stations];

        // Only replace the specific exercise instance, not all instances
        const newStationExercises = [...newStations[stationIndex].exercises];
        newStationExercises[exerciseIndex] = newExercise;
        newStations[stationIndex] = {
          ...newStations[stationIndex],
          exercises: newStationExercises
        };

        const updatedCircuit = {
          ...newCircuit,
          stations: newStations
        };

        // Update legacy exercises array - replace only matching instances in same position
        const newLegacyExercises = [...prevWorkout.exercises];
        let currentCircuitPosition = 0;

        // Find the exact position in the legacy array that corresponds to this circuit position
        for (let sIndex = 0; sIndex < updatedCircuit.stations.length; sIndex++) {
          const station = updatedCircuit.stations[sIndex];
          for (let eIndex = 0; eIndex < station.exercises.length; eIndex++) {
            if (sIndex === stationIndex && eIndex === exerciseIndex) {
              // This is the position we want to update
              if (currentCircuitPosition < newLegacyExercises.length) {
                newLegacyExercises[currentCircuitPosition] = {
                  ...newLegacyExercises[currentCircuitPosition],
                  exercise: newExercise
                };
              }
              break;
            }
            currentCircuitPosition++;
          }
          if (sIndex === stationIndex && exerciseIndex < station.exercises.length) break;
        }

        // Update expanded exercises state for regenerated exercise
        const instructionsVisible = InstructionPreferences.getInstructionsVisible();
        if (instructionsVisible) {
          const newExerciseKey = `${stationId}-${newExercise.id}`;
          setExpandedExercises(prev => {
            const newSet = new Set(prev);
            newSet.add(newExerciseKey);
            return newSet;
          });
        }

        return {
          ...prevWorkout,
          circuit: updatedCircuit,
          exercises: newLegacyExercises
        };
      }
      return prevWorkout;
    });
  }, [workoutSettings]);

  const handleBlacklistCircuitExercise = useCallback((stationId: string, exerciseIndex: number) => {
    setWorkout(prevWorkout => {
      if (!prevWorkout.circuit) return prevWorkout;

      const stationIndex = prevWorkout.circuit.stations.findIndex((s: any) => s.id === stationId);
      if (stationIndex === -1) return prevWorkout;

      const currentExercise = prevWorkout.circuit.stations[stationIndex].exercises[exerciseIndex];
      BlacklistStorage.addToBlacklist(currentExercise.id.toString());

      // Get all existing exercises except the ones we're replacing
      const allExistingExercises: Exercise[] = [];
      prevWorkout.circuit.stations.forEach((station: any) => {
        station.exercises.forEach((exercise: any) => {
          if (exercise.id !== currentExercise.id) { // Exclude the blacklisted exercise
            allExistingExercises.push(exercise);
          }
        });
      });

      // For blacklisting, we want to replace ALL instances of this exercise
      // But each instance should get a different replacement to avoid duplicates
      const newCircuit = { ...prevWorkout.circuit };
      const newStations = [...newCircuit.stations];
      const replacementMap = new Map<string, Exercise>(); // Map station-exercise positions to replacements

      // First pass: identify all instances that need replacement
      const instancesToReplace: Array<{stationIndex: number, exerciseIndex: number, stationId: string}> = [];

      for (let sIndex = 0; sIndex < newStations.length; sIndex++) {
        const station = newStations[sIndex];
        for (let eIndex = 0; eIndex < station.exercises.length; eIndex++) {
          if (station.exercises[eIndex].id === currentExercise.id) {
            instancesToReplace.push({
              stationIndex: sIndex,
              exerciseIndex: eIndex,
              stationId: station.id
            });
          }
        }
      }

      // Second pass: generate unique replacements for each instance
      for (const instance of instancesToReplace) {
        const currentlyUsedExercises = [...allExistingExercises];
        // Add already assigned replacements to avoid duplicates
        replacementMap.forEach(replacement => currentlyUsedExercises.push(replacement));

        const replacementExercise = regenerateExercise(currentExercise, workoutSettings, currentlyUsedExercises);
        if (replacementExercise) {
          const key = `${instance.stationIndex}-${instance.exerciseIndex}`;
          replacementMap.set(key, replacementExercise);
          allExistingExercises.push(replacementExercise);
        }
      }

      // Third pass: apply all replacements
      for (const instance of instancesToReplace) {
        const key = `${instance.stationIndex}-${instance.exerciseIndex}`;
        const replacement = replacementMap.get(key);
        if (replacement) {
          const newExercises = [...newStations[instance.stationIndex].exercises];
          newExercises[instance.exerciseIndex] = replacement;
          newStations[instance.stationIndex] = {
            ...newStations[instance.stationIndex],
            exercises: newExercises
          };
        }
      }

      const updatedCircuit = {
        ...newCircuit,
        stations: newStations
      };

      // Update legacy exercises array
      const newLegacyExercises = [...prevWorkout.exercises];
      let currentCircuitPosition = 0;

      for (let sIndex = 0; sIndex < updatedCircuit.stations.length; sIndex++) {
        const station = updatedCircuit.stations[sIndex];
        for (let eIndex = 0; eIndex < station.exercises.length; eIndex++) {
          if (currentCircuitPosition < newLegacyExercises.length) {
            newLegacyExercises[currentCircuitPosition] = {
              ...newLegacyExercises[currentCircuitPosition],
              exercise: station.exercises[eIndex]
            };
          }
          currentCircuitPosition++;
        }
      }

      // Update expanded exercises state for all replaced exercises
      const instructionsVisible = InstructionPreferences.getInstructionsVisible();
      if (instructionsVisible && replacementMap.size > 0) {
        setExpandedExercises(prev => {
          const newSet = new Set(prev);
          // Add all new exercise keys from updated circuit
          updatedCircuit.stations.forEach((station: any) => {
            station.exercises.forEach((exercise: any) => {
              const exerciseKey = `${station.id}-${exercise.id}`;
              newSet.add(exerciseKey);
            });
          });
          return newSet;
        });
      }

      return {
        ...prevWorkout,
        circuit: updatedCircuit,
        exercises: newLegacyExercises
      };
    });
  }, [workoutSettings]);

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div style={{ minHeight: '100vh', background: '#0a0a0b', color: 'white' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
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
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Back to Setup
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 style={{
              color: 'white',
              fontSize: '2.5rem',
              margin: 0,
              background: 'linear-gradient(135deg, #ff4757 0%, #ff6b35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Review {selectedCircuitType?.name || 'Workout'}
            </h1>
            {selectedCircuitType && (
              <span style={{ fontSize: '2rem' }}>{selectedCircuitType.icon}</span>
            )}
          </div>

          <p style={{
            color: '#b8bcc8',
            fontSize: '1.125rem',
            marginBottom: '1.5rem',
            margin: '0 0 1.5rem 0'
          }}>
            {getDynamicDescription()}
          </p>

          <div style={{
            display: 'flex',
            gap: '2rem',
            color: '#b8bcc8',
            fontSize: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}>
            <span>⏱️ {totalWorkoutTime} minutes</span>
            {circuitInfo ? (
              <>
                <span>🔄 {circuitInfo.rounds} rounds</span>
                <span>🏋️ {circuitInfo.stations.length} stations</span>
                <span>💪 {circuitInfo.stations.reduce((total: number, station: any) => total + station.exercises.length, 0)} unique exercises</span>
              </>
            ) : (
              <span>💪 {workout.exercises.length} exercises</span>
            )}
            <span>🔥 {difficultyOptions.find(d => d.value === workout.difficulty)?.label || workout.difficulty} difficulty</span>
          </div>

          {/* Time Breakdown */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'rgba(46, 213, 115, 0.15)',
              border: '2px solid #2ed573',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '1.25rem' }}>💪</div>
              <div>
                <div style={{ color: '#2ed573', fontSize: '0.875rem', fontWeight: '600' }}>
                  Exercise Time
                </div>
                <div style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
                  {formatTimeMinutes(timeBreakdown.exerciseTime)}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 71, 87, 0.15)',
              border: '2px solid #ff4757',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '1.25rem' }}>🛌</div>
              <div>
                <div style={{ color: '#ff4757', fontSize: '0.875rem', fontWeight: '600' }}>
                  Rest Time
                </div>
                <div style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
                  {formatTimeMinutes(timeBreakdown.restTime)}
                </div>
              </div>
            </div>


            <div style={{
              background: 'rgba(108, 114, 147, 0.15)',
              border: '2px solid #6c7293',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '1.25rem' }}>⏱️</div>
              <div>
                <div style={{ color: '#6c7293', fontSize: '0.875rem', fontWeight: '600' }}>
                  Work:Rest Ratio
                </div>
                <div style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
                  {Math.round((timeBreakdown.exerciseTime / timeBreakdown.restTime) * 10) / 10}:1
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Overview */}
        <div style={{
          background: '#131315',
          border: '2px solid #2a2a2f',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: '#22c55e',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Equipment Needed
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {workoutEquipment.map(equipId => {
              const equipment = getEquipmentInfo(equipId);
              if (!equipment) return null;

              return (
                <div
                  key={equipId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '2px solid #22c55e',
                    borderRadius: '12px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    color: 'white'
                  }}
                >
                  <img
                    src={equipment.svgUrl}
                    alt={equipment.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      objectFit: 'cover'
                    }}
                  />
                  <span>{equipment.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Circuit Layout */}
        {circuitInfo ? (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h2 style={{
                  color: '#ff4757',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: 0
                }}>
                  Circuit Structure
                </h2>

                {/* Toggle All Descriptions Button */}
                <div>
                  <button
                    onClick={allInstructionsVisible ? hideAllInstructions : showAllInstructions}
                    style={{
                      background: allInstructionsVisible ? 'rgba(255, 71, 87, 0.2)' : 'rgba(46, 213, 115, 0.2)',
                      border: `1px solid ${allInstructionsVisible ? '#ff4757' : '#2ed573'}`,
                      borderRadius: '6px',
                      color: allInstructionsVisible ? '#ff4757' : '#2ed573',
                      cursor: 'pointer',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      const isShowingAll = allInstructionsVisible;
                      e.currentTarget.style.background = isShowingAll ? 'rgba(255, 71, 87, 0.3)' : 'rgba(46, 213, 115, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      const isShowingAll = allInstructionsVisible;
                      e.currentTarget.style.background = isShowingAll ? 'rgba(255, 71, 87, 0.2)' : 'rgba(46, 213, 115, 0.2)';
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: allInstructionsVisible ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                    {allInstructionsVisible ? 'Hide All Descriptions' : 'Show All Descriptions'}
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255, 71, 87, 0.1)',
                border: '2px solid #ff4757',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                color: '#ff4757',
                fontWeight: '600',
                flexWrap: 'wrap'
              }}>
                <span>⏱️ Work: {formatTime(circuitInfo.workTime)}</span>
                <span>•</span>
                <span>🛌 Rest: {formatTime(circuitInfo.restTime)}</span>
                {circuitInfo.stationRestTime && (
                  <>
                    <span>•</span>
                    <span>⏸️ Between: {formatTime(circuitInfo.stationRestTime)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Stations Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              marginBottom: '1.5rem'
            }}>
              {circuitInfo.stations.map((station, stationIndex) => (
                <div
                  key={station.id}
                  style={{
                    background: '#131315',
                    border: '2px solid #2a2a2f',
                    borderRadius: '16px',
                    padding: '2rem',
                    position: 'relative'
                  }}
                >
                  {/* Station Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #ff4757 0%, #ff6b35 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'black',
                      fontSize: '1.125rem',
                      fontWeight: 'bold'
                    }}>
                      {stationIndex + 1}
                    </div>
                    <div>
                      <h3 style={{
                        color: 'white',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        margin: 0
                      }}>
                        {station.name}
                      </h3>
                      <p style={{
                        color: '#6c7293',
                        fontSize: '0.75rem',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {station.exercises.length} exercise{station.exercises.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Station Exercises */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {station.exercises?.map((exercise: any, exerciseIndex: number) => {
                      if (!exercise || !exercise.id) return null;

                      const exerciseEquipment = exercise.equipment?.map((id: string) => getEquipmentInfo(id)).filter(Boolean) || [];
                      const exerciseKey = `${station.id}-${exercise.id}`;
                      const isExpanded = expandedExercises.has(exerciseKey);

                      return (
                        <div
                          key={exerciseKey}
                          style={{
                            background: '#1c1c20',
                            border: '1px solid #3a3a40',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                            {/* Exercise Letter (A, B, etc.) */}
                            <div style={{
                              width: '28px',
                              height: '28px',
                              background: 'rgba(255, 71, 87, 0.2)',
                              border: '2px solid #ff4757',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ff4757',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>
                              {String.fromCharCode(65 + exerciseIndex)} {/* A, B, C, etc. */}
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                  <h4 style={{
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    marginBottom: '0.375rem',
                                    lineHeight: 1.3
                                  }}>
                                    {exercise.name}
                                  </h4>

                                  {/* Muscle Groups */}
                                  <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.375rem',
                                    marginBottom: '0.75rem'
                                  }}>
                                    <div style={{
                                      background: 'rgba(255, 71, 87, 0.2)',
                                      border: '1px solid #ff4757',
                                      borderRadius: '4px',
                                      padding: '0.125rem 0.375rem',
                                      fontSize: '0.625rem',
                                      color: '#ff4757',
                                      fontWeight: '600',
                                      textTransform: 'uppercase'
                                    }}>
                                      {muscleGroupLabels[exercise.primaryMuscle] || exercise.primaryMuscle}
                                    </div>
                                    {exercise.muscleGroups
                                      .filter((mg: string) => mg !== exercise.primaryMuscle)
                                      .slice(0, 2)
                                      .map((muscleGroup: string) => (
                                        <div
                                          key={muscleGroup}
                                          style={{
                                            background: 'rgba(255, 107, 53, 0.15)',
                                            border: '1px solid #ff6b35',
                                            borderRadius: '4px',
                                            padding: '0.125rem 0.375rem',
                                            fontSize: '0.625rem',
                                            color: '#ff6b35',
                                            textTransform: 'uppercase'
                                          }}
                                        >
                                          {muscleGroupLabels[muscleGroup] || muscleGroup}
                                        </div>
                                      ))}
                                  </div>

                                  {/* Equipment */}
                                  {exerciseEquipment.length > 0 && (
                                    <div style={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: '0.375rem'
                                    }}>
                                      {exerciseEquipment.map((equipment: Equipment) => {
                                        if (!equipment) return null;

                                        return (
                                          <div
                                            key={equipment.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.25rem',
                                              background: 'rgba(108, 114, 147, 0.2)',
                                              border: '1px solid #3a3a40',
                                              borderRadius: '4px',
                                              padding: '0.125rem 0.375rem',
                                              fontSize: '0.625rem',
                                              color: '#b8bcc8'
                                            }}
                                          >
                                            <img
                                              src={equipment.svgUrl}
                                              alt={equipment.name}
                                              style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '1px'
                                              }}
                                            />
                                            <span>{equipment.name}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem',
                                  flexShrink: 0
                                }}>
                                  <button
                                    onClick={() => handleRegenerateCircuitExercise(station.id, exerciseIndex)}
                                    title="Get a different exercise"
                                    style={{
                                      background: 'rgba(255, 193, 7, 0.2)',
                                      border: '1px solid #ffc107',
                                      borderRadius: '6px',
                                      color: '#ffc107',
                                      cursor: 'pointer',
                                      padding: '0.375rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: '500',
                                      transition: 'all 0.2s ease',
                                      minWidth: '32px',
                                      height: '32px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.2)';
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                      <path d="M21 3v5h-5" />
                                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                      <path d="M3 21v-5h5" />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={() => handleBlacklistCircuitExercise(station.id, exerciseIndex)}
                                    title="Never show this exercise again"
                                    style={{
                                      background: 'rgba(255, 71, 87, 0.2)',
                                      border: '1px solid #ff4757',
                                      borderRadius: '6px',
                                      color: '#ff4757',
                                      cursor: 'pointer',
                                      padding: '0.375rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: '500',
                                      transition: 'all 0.2s ease',
                                      minWidth: '32px',
                                      height: '32px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'rgba(255, 71, 87, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)';
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10" />
                                      <path d="15 9l-6 6" />
                                      <path d="9 9l6 6" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Description */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                              onClick={() => toggleExerciseDescription(exerciseKey)}
                              style={{
                                background: 'transparent',
                                border: '1px solid #3a3a40',
                                borderRadius: '6px',
                                color: '#b8bcc8',
                                cursor: 'pointer',
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ff4757';
                                e.currentTarget.style.color = '#ff4757';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#3a3a40';
                                e.currentTarget.style.color = '#b8bcc8';
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease'
                                }}
                              >
                                <polyline points="6,9 12,15 18,9" />
                              </svg>
                              {isExpanded ? 'Hide' : 'Show'} Instructions
                            </button>
                          </div>

                          {/* Exercise Description */}
                          {isExpanded && (
                            <div
                              style={{
                                marginTop: '1rem',
                                padding: '1.25rem',
                                background: 'rgba(255, 71, 87, 0.05)',
                                border: '1px solid rgba(255, 71, 87, 0.2)',
                                borderRadius: '8px',
                                animation: 'fadeIn 0.2s ease-in-out'
                              }}
                            >
                              <p style={{
                                color: '#e8eaed',
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                                margin: 0
                              }}>
                                {exercise.instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Cycle Indicator */}
                  {station.exercises.length > 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'rgba(46, 213, 115, 0.2)',
                      border: '2px solid #2ed573',
                      borderRadius: '6px',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#2ed573',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center'
                    }}>
                      <div style={{ marginBottom: '0.125rem' }}>↔️ Alternate</div>
                      <div style={{ fontSize: '0.625rem', opacity: 0.9 }}>
                        {circuitInfo.type === 'super_sets' ?
                          `${circuitInfo.rounds} times each` :
                          `${Math.ceil(circuitInfo.rounds / 2)} times each`
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Compact Rounds Indicator */}
            <div style={{
              textAlign: 'center',
              background: 'rgba(46, 213, 115, 0.1)',
              border: '2px solid #2ed573',
              borderRadius: '12px',
              padding: '1rem',
            }}>
              <h3 style={{
                color: '#2ed573',
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                🔄 {circuitInfo.rounds} Complete Round{circuitInfo.rounds !== 1 ? 's' : ''}
              </h3>

              <p style={{
                color: '#b8bcc8',
                fontSize: '0.75rem',
                margin: '0 0 0.5rem 0',
                lineHeight: 1.3
              }}>
                {circuitInfo.type === 'super_sets'
                  ? `Complete both exercises in each super set ${circuitInfo.rounds} time${circuitInfo.rounds !== 1 ? 's' : ''} before moving to next.`
                  : `Repeat the entire circuit ${circuitInfo.rounds} time${circuitInfo.rounds !== 1 ? 's' : ''} for your complete ${totalWorkoutTime}-minute workout.`
                }
              </p>

              <div style={{
                display: 'inline-block',
                background: 'rgba(46, 213, 115, 0.15)',
                border: '1px solid #2ed573',
                borderRadius: '6px',
                padding: '0.375rem 0.75rem',
                fontSize: '0.625rem',
                color: '#2ed573',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Total: {totalWorkoutTime} minutes
              </div>
            </div>
          </div>
        ) : (
          <div>Legacy workout view (no circuit structure)</div>
        )}

        {/* Start Workout Button */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingBottom: '2rem'
        }}>
          <button
            onClick={() => onStartWorkout(workout)}
            style={{
              background: 'linear-gradient(135deg, #2ed573 0%, #20bf6b 100%)',
              color: 'black',
              border: 'none',
              borderRadius: '16px',
              padding: '1.25rem 3rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px rgba(46, 213, 115, 0.3)',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(46, 213, 115, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(46, 213, 115, 0.3)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Start {totalWorkoutTime}-Minute Workout
          </button>

          <p style={{
            color: '#6c7293',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Make sure you have all equipment ready before starting
          </p>
        </div>
      </div>
      </div>
    </>
  );
};

export default WorkoutPreview;