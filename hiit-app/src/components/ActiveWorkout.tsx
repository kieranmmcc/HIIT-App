import React, { useState, useEffect, useCallback } from 'react';
import type { WorkoutSettings } from '../types/workout';
import type { ActiveWorkout, GeneratedWorkout } from '../types/exercise';
import type { Equipment } from '../types/equipment';
import { generateWorkout } from '../utils/workoutGenerator';
import { audioManager } from '../utils/audioManager';
import { equipmentData } from '../data/equipment';

interface ActiveWorkoutProps {
  workoutSettings: WorkoutSettings;
  onComplete: () => void;
  onExit: () => void;
}

const ActiveWorkoutComponent: React.FC<ActiveWorkoutProps> = ({
  workoutSettings,
  onComplete,
  onExit
}) => {
  const [workout] = useState<GeneratedWorkout>(() => generateWorkout(workoutSettings));
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout>({
    workout,
    currentExerciseIndex: 0,
    phase: 'prepare',
    timeRemaining: 5, // 5 second preparation
    isActive: false,
    isPaused: false
  });

  // Timer logic
  useEffect(() => {
    if (!activeWorkout.isActive || activeWorkout.isPaused) return;

    const timer = setInterval(() => {
      setActiveWorkout(prev => {
        if (prev.timeRemaining <= 1) {
          // Time to advance to next phase
          return advancePhase(prev);
        }

        // Play countdown beeps in last 3 seconds
        if (prev.timeRemaining <= 3 && prev.timeRemaining > 1) {
          audioManager.playCountdownBeep();
        }

        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeWorkout.isActive, activeWorkout.isPaused]);

  const advancePhase = useCallback((current: ActiveWorkout): ActiveWorkout => {
    const { phase, currentExerciseIndex, workout } = current;

    switch (phase) {
      case 'prepare':
        // Start first exercise
        audioManager.playStartBeep();
        return {
          ...current,
          phase: 'work',
          timeRemaining: workout.exercises[0].duration
        };

      case 'work':
        // Move to rest phase
        audioManager.playRestBeep();
        return {
          ...current,
          phase: 'rest',
          timeRemaining: workout.exercises[currentExerciseIndex].restDuration
        };

      case 'rest':
        // Check if workout is complete
        if (currentExerciseIndex >= workout.exercises.length - 1) {
          audioManager.playCompletionSound();
          return {
            ...current,
            phase: 'complete',
            timeRemaining: 0,
            isActive: false
          };
        }

        // Move to next exercise
        audioManager.playStartBeep();
        return {
          ...current,
          currentExerciseIndex: currentExerciseIndex + 1,
          phase: 'work',
          timeRemaining: workout.exercises[currentExerciseIndex + 1].duration
        };

      default:
        return current;
    }
  }, []);

  const startWorkout = async () => {
    // Resume audio context for browsers that require user interaction
    await audioManager.resumeAudio();
    setActiveWorkout(prev => ({ ...prev, isActive: true }));
  };

  const pauseWorkout = () => {
    setActiveWorkout(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const skipPhase = () => {
    setActiveWorkout(prev => advancePhase(prev));
  };

  const stopWorkout = () => {
    setActiveWorkout(prev => ({
      ...prev,
      isActive: false,
      isPaused: false
    }));
  };

  // Handle workout completion
  useEffect(() => {
    if (activeWorkout.phase === 'complete') {
      setTimeout(() => onComplete(), 2000);
    }
  }, [activeWorkout.phase, onComplete]);

  const currentExercise = workout.exercises[activeWorkout.currentExerciseIndex]?.exercise;
  const progress = ((activeWorkout.currentExerciseIndex + 1) / workout.exercises.length) * 100;

  // Get equipment info for current exercise
  const getEquipmentInfo = (equipmentId: string): Equipment | undefined => {
    return equipmentData.find(eq => eq.id === equipmentId);
  };

  const currentExerciseEquipment = currentExercise?.equipment
    .map(id => getEquipmentInfo(id))
    .filter(Boolean) || [];

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Phase colors
  const getPhaseColor = () => {
    switch (activeWorkout.phase) {
      case 'prepare': return '#feca57'; // Yellow
      case 'work': return '#2ed573'; // Green
      case 'rest': return '#ff4757'; // Red
      case 'complete': return '#2ed573'; // Green
      default: return '#ffffff';
    }
  };

  const getPhaseBackground = () => {
    switch (activeWorkout.phase) {
      case 'prepare': return 'rgba(254, 202, 87, 0.1)';
      case 'work': return 'rgba(46, 213, 115, 0.1)';
      case 'rest': return 'rgba(255, 71, 87, 0.1)';
      case 'complete': return 'rgba(46, 213, 115, 0.1)';
      default: return 'transparent';
    }
  };

  if (activeWorkout.phase === 'complete') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(46, 213, 115, 0.1)',
          border: '2px solid #2ed573',
          borderRadius: '50%',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2ed573" strokeWidth="3">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>
        <h1 style={{ color: '#2ed573', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Workout Complete! 🎉
        </h1>
        <p style={{ color: '#b8bcc8', fontSize: '1.125rem', marginBottom: '2rem' }}>
          Great job! You completed {workout.exercises.length} exercises in {Math.round(workout.totalDuration / 60)} minutes.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${getPhaseBackground()}, #0a0a0b)`,
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '2px solid #2a2a2f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onExit}
          style={{
            background: 'transparent',
            border: '1px solid #3a3a40',
            borderRadius: '8px',
            color: '#b8bcc8',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          Exit
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#b8bcc8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Exercise {activeWorkout.currentExerciseIndex + 1} of {workout.exercises.length}
          </div>
          <div style={{
            background: '#131315',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            border: '2px solid #2a2a2f'
          }}>
            <span style={{ color: getPhaseColor(), fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem' }}>
              {activeWorkout.phase}
            </span>
          </div>
        </div>

        <div style={{
          background: '#131315',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          border: '2px solid #2a2a2f'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6c7293', marginBottom: '0.125rem' }}>Progress</div>
          <div style={{ fontSize: '0.875rem', color: 'white', fontWeight: 'bold' }}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '8px',
        background: '#131315',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${getPhaseColor()}, #ff6b35)`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}>
        {/* Timer Display */}
        <div style={{
          fontSize: '6rem',
          fontWeight: 'bold',
          color: getPhaseColor(),
          marginBottom: '1rem',
          fontFamily: 'monospace',
          lineHeight: 1,
          textShadow: `0 0 30px ${getPhaseColor()}40`
        }}>
          {formatTime(activeWorkout.timeRemaining)}
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <div style={{
            background: '#131315',
            border: '2px solid #2a2a2f',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '2rem',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {activeWorkout.phase === 'prepare' ? 'Get Ready!' :
               activeWorkout.phase === 'rest' ? 'Rest Time' :
               currentExercise.name}
            </h2>

            {activeWorkout.phase === 'work' && (
              <div>
                <p style={{
                  color: '#b8bcc8',
                  fontSize: '1.125rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem'
                }}>
                  {currentExercise.instructions}
                </p>

                {/* Equipment Required */}
                {currentExerciseEquipment.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{
                      color: '#ff4757',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Equipment Needed:
                    </div>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      justifyContent: 'center'
                    }}>
                      {currentExerciseEquipment.map(equipment => {
                        if (!equipment) return null;

                        return (
                          <div
                            key={equipment.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: equipment.isRequired
                                ? 'rgba(46, 213, 115, 0.2)'
                                : 'rgba(255, 71, 87, 0.2)',
                              border: `2px solid ${equipment.isRequired ? '#2ed573' : '#ff4757'}`,
                              borderRadius: '12px',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.875rem',
                              color: 'white',
                              fontWeight: '500'
                            }}
                          >
                            <img
                              src={equipment.svgUrl}
                              alt={equipment.name}
                              style={{
                                width: '20px',
                                height: '20px',
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
                )}
              </div>
            )}

            {activeWorkout.phase === 'rest' && (
              <div>
                <p style={{ color: '#b8bcc8', marginBottom: '1rem' }}>Take a breather! Next up:</p>
                <p style={{ color: '#ff4757', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {workout.exercises[activeWorkout.currentExerciseIndex + 1]?.exercise?.name || 'Workout Complete!'}
                </p>
              </div>
            )}

            {activeWorkout.phase === 'prepare' && (
              <p style={{ color: '#b8bcc8', fontSize: '1.125rem' }}>
                {currentExercise.name} - {currentExercise.instructions}
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {!activeWorkout.isActive ? (
            <button
              onClick={startWorkout}
              style={{
                background: 'linear-gradient(135deg, #2ed573 0%, #20bf6b 100%)',
                color: 'black',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Start Workout
            </button>
          ) : (
            <>
              <button
                onClick={pauseWorkout}
                style={{
                  background: activeWorkout.isPaused ?
                    'linear-gradient(135deg, #2ed573 0%, #20bf6b 100%)' :
                    'linear-gradient(135deg, #feca57 0%, #ff9f43 100%)',
                  color: 'black',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {activeWorkout.isPaused ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pause
                  </>
                )}
              </button>

              <button
                onClick={skipPhase}
                style={{
                  background: 'transparent',
                  color: '#ff4757',
                  border: '2px solid #ff4757',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,4 15,12 5,20" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
                Skip
              </button>

              <button
                onClick={stopWorkout}
                style={{
                  background: 'transparent',
                  color: '#6c7293',
                  border: '2px solid #3a3a40',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
                Stop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkoutComponent;