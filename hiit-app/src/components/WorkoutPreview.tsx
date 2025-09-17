import React, { useState, useCallback, useMemo } from 'react';
import type { WorkoutSettings } from '../types/workout';
import type { GeneratedWorkout, Exercise } from '../types/exercise';
import type { Equipment } from '../types/equipment';
import { generateWorkout, regenerateExercise } from '../utils/workoutGenerator';
import { equipmentData } from '../data/equipment';
import { BlacklistStorage } from '../utils/blacklistStorage';
import { muscleGroupLabels } from '../types/muscleGroups';

interface WorkoutPreviewProps {
  workoutSettings: WorkoutSettings;
  onStartWorkout: () => void;
  onBack: () => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({
  workoutSettings,
  onStartWorkout,
  onBack
}) => {
  const [workout, setWorkout] = useState<GeneratedWorkout>(() => generateWorkout(workoutSettings));

  // Get equipment data for display
  const getEquipmentInfo = (equipmentId: string): Equipment | undefined => {
    return equipmentData.find(eq => eq.id === equipmentId);
  };

  // Get all unique equipment needed for the workout
  const workoutEquipment = useMemo(() => {
    const allEquipmentIds = new Set<string>();
    workout.exercises.forEach(workoutEx => {
      workoutEx.exercise.equipment.forEach(equipId => {
        allEquipmentIds.add(equipId);
      });
    });
    return Array.from(allEquipmentIds);
  }, [workout.exercises]);
  const totalWorkoutTime = Math.round(workout.totalDuration / 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRegenerateExercise = useCallback((exerciseIndex: number) => {
    setWorkout(prevWorkout => {
      const currentExercise = prevWorkout.exercises[exerciseIndex].exercise;
      const newExercise = regenerateExercise(currentExercise, workoutSettings);

      if (newExercise) {
        console.log('Replacing exercise at index', exerciseIndex, 'from', currentExercise.name, 'to', newExercise.name);
        const newExercises = [...prevWorkout.exercises];
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          exercise: newExercise
        };

        return {
          ...prevWorkout,
          exercises: newExercises
        };
      }
      return prevWorkout;
    });
  }, [workoutSettings]);

  const handleBlacklistExercise = useCallback((exerciseIndex: number) => {
    setWorkout(prevWorkout => {
      const currentExercise = prevWorkout.exercises[exerciseIndex].exercise;
      BlacklistStorage.addToBlacklist(currentExercise.id.toString());

      // Find all instances of this exercise in the current workout
      const exerciseId = currentExercise.id;
      const indicesToReplace: number[] = [];

      prevWorkout.exercises.forEach((workoutEx, index) => {
        if (workoutEx.exercise.id === exerciseId) {
          indicesToReplace.push(index);
        }
      });

      console.log(`Blacklisting "${currentExercise.name}" - found ${indicesToReplace.length} instances at positions:`, indicesToReplace);

      // Replace all instances of the blacklisted exercise
      const newExercises = [...prevWorkout.exercises];
      let replacementCount = 0;

      for (const index of indicesToReplace) {
        const replacementExercise = regenerateExercise(currentExercise, workoutSettings);
        if (replacementExercise) {
          newExercises[index] = {
            ...newExercises[index],
            exercise: replacementExercise
          };
          replacementCount++;
          console.log(`Replaced instance at position ${index} with "${replacementExercise.name}"`);
        }
      }

      if (replacementCount > 0) {
        return {
          ...prevWorkout,
          exercises: newExercises
        };
      }

      return prevWorkout;
    });
  }, [workoutSettings]);

  return (
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

          <h1 style={{
            color: 'white',
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ff4757 0%, #ff6b35 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Workout Preview
          </h1>

          <div style={{
            display: 'flex',
            gap: '2rem',
            color: '#b8bcc8',
            fontSize: '1.125rem',
            marginBottom: '1.5rem'
          }}>
            <span>⏱️ {totalWorkoutTime} minutes</span>
            <span>💪 {workout.exercises.length} exercises</span>
            <span>🔥 {workout.difficulty} difficulty</span>
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
            color: '#ff4757',
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
                    background: equipment.isRequired ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 71, 87, 0.15)',
                    border: `2px solid ${equipment.isRequired ? '#2ed573' : '#ff4757'}`,
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

        {/* Exercise List */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#ff4757',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Exercise Sequence
          </h2>

          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {workout.exercises.map((workoutEx, index) => {
              const exercise = workoutEx.exercise;
              const exerciseEquipment = exercise.equipment.map(id => getEquipmentInfo(id)).filter(Boolean);

              return (
                <div
                  key={`${index}-${exercise.id}`}
                  style={{
                    background: '#131315',
                    border: '2px solid #2a2a2f',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}
                >
                  {/* Exercise Number */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b35 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>

                  {/* Exercise Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      {exercise.name}
                    </h3>

                    <p style={{
                      color: '#b8bcc8',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      marginBottom: '0.75rem'
                    }}>
                      {exercise.instructions}
                    </p>

                    {/* Exercise Equipment */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      {exerciseEquipment.map(equipment => {
                        if (!equipment) return null;

                        return (
                          <div
                            key={equipment.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              background: 'rgba(108, 114, 147, 0.2)',
                              border: '1px solid #3a3a40',
                              borderRadius: '8px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              color: '#b8bcc8'
                            }}
                          >
                            <img
                              src={equipment.svgUrl}
                              alt={equipment.name}
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '2px',
                                objectFit: 'cover'
                              }}
                            />
                            <span>{equipment.name}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Muscle Groups */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.375rem'
                    }}>
                      <div
                        style={{
                          background: 'rgba(255, 71, 87, 0.2)',
                          border: '1px solid #ff4757',
                          borderRadius: '6px',
                          padding: '0.125rem 0.5rem',
                          fontSize: '0.625rem',
                          color: '#ff4757',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Primary: {muscleGroupLabels[exercise.primaryMuscle] || exercise.primaryMuscle}
                      </div>
                      {exercise.muscleGroups
                        .filter(mg => mg !== exercise.primaryMuscle)
                        .slice(0, 3)
                        .map(muscleGroup => (
                          <div
                            key={muscleGroup}
                            style={{
                              background: 'rgba(255, 107, 53, 0.15)',
                              border: '1px solid #ff6b35',
                              borderRadius: '6px',
                              padding: '0.125rem 0.5rem',
                              fontSize: '0.625rem',
                              color: '#ff6b35',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {muscleGroupLabels[muscleGroup] || muscleGroup}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => handleRegenerateExercise(index)}
                      title="Get a different exercise"
                      style={{
                        background: 'rgba(255, 193, 7, 0.2)',
                        border: '2px solid #ffc107',
                        borderRadius: '8px',
                        color: '#ffc107',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        gap: '0.25rem',
                        transition: 'all 0.2s ease'
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
                      Replace
                    </button>

                    <button
                      onClick={() => handleBlacklistExercise(index)}
                      title="Never show this exercise again"
                      style={{
                        background: 'rgba(255, 71, 87, 0.2)',
                        border: '2px solid #ff4757',
                        borderRadius: '8px',
                        color: '#ff4757',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        gap: '0.25rem',
                        transition: 'all 0.2s ease'
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
                      Block
                    </button>
                  </div>

                  {/* Timing Info */}
                  <div style={{
                    textAlign: 'center',
                    flexShrink: 0,
                    minWidth: '100px'
                  }}>
                    <div style={{
                      color: '#2ed573',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      marginBottom: '0.25rem'
                    }}>
                      {formatTime(workoutEx.duration)}
                    </div>
                    <div style={{
                      color: '#6c7293',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Work
                    </div>
                    <div style={{
                      color: '#ff4757',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem'
                    }}>
                      {formatTime(workoutEx.restDuration)} rest
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Workout Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onStartWorkout}
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
  );
};

export default WorkoutPreview;