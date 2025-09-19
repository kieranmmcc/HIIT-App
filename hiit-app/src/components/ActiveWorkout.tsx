import React, { useState, useEffect, useCallback } from 'react';
import type { ActiveWorkout } from '../types/exercise';
import type { GeneratedWorkout } from '../types/circuit';
import { audioManager } from '../utils/audioManager';

interface ActiveWorkoutProps {
  workout: GeneratedWorkout;
  onComplete: () => void;
  onExit: () => void;
}

const ActiveWorkoutComponent: React.FC<ActiveWorkoutProps> = ({
  workout,
  onComplete,
  onExit
}) => {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout>({
    workout,
    currentExerciseIndex: 0,
    phase: workout.warmup ? 'warmup' : 'prepare',
    timeRemaining: workout.warmup ? workout.warmup.exercises[0].duration : 5, // Start with first warmup or 5 sec prep
    isActive: false,
    isPaused: false,
    currentWarmupIndex: 0
  });

  const [completionCountdown, setCompletionCountdown] = useState<number>(10); // 10 second countdown


  // Circuit information - enhanced workout timer with circuit context
  const circuitInfo = workout.circuit;

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
    const { phase, currentExerciseIndex, workout, currentWarmupIndex } = current;

    switch (phase) {
      case 'warmup':
        const warmupIndex = currentWarmupIndex || 0;

        // Check if warmup is complete
        if (!workout.warmup || warmupIndex >= workout.warmup.exercises.length - 1) {
          // Move to prepare phase for main workout
          return {
            ...current,
            phase: 'prepare',
            timeRemaining: 5,
            currentWarmupIndex: undefined
          };
        }

        // Move to next warmup exercise
        return {
          ...current,
          currentWarmupIndex: warmupIndex + 1,
          timeRemaining: workout.warmup.exercises[warmupIndex + 1].duration
        };

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

  // Handle workout completion countdown
  useEffect(() => {
    if (activeWorkout.phase === 'complete' && completionCountdown > 0) {
      const timer = setTimeout(() => {
        setCompletionCountdown(prev => {
          if (prev <= 1) {
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeWorkout.phase, completionCountdown, onComplete]);

  // Get current exercise based on phase
  const getCurrentExercise = () => {
    if (activeWorkout.phase === 'warmup' && workout.warmup) {
      const warmupIndex = activeWorkout.currentWarmupIndex || 0;
      return workout.warmup.exercises[warmupIndex];
    }
    return workout.exercises[activeWorkout.currentExerciseIndex]?.exercise;
  };

  const currentExercise = getCurrentExercise();

  // Calculate progress based on current phase
  const progress = activeWorkout.phase === 'warmup' && workout.warmup
    ? ((activeWorkout.currentWarmupIndex || 0) + 1) / workout.warmup.exercises.length * 100
    : ((activeWorkout.currentExerciseIndex + 1) / workout.exercises.length) * 100;

  // Circuit context helpers
  const getCurrentCircuitContext = () => {
    if (!circuitInfo) return null;

    const currentWorkoutExercise = workout.exercises[activeWorkout.currentExerciseIndex];
    if (!currentWorkoutExercise) return null;

    // Find which station and round we're in
    let exercisesSoFar = 0;
    const totalExercisesPerRound = circuitInfo.stations.reduce((sum: number, station: any) => sum + station.exercises.length, 0);

    const currentRound = Math.floor(activeWorkout.currentExerciseIndex / totalExercisesPerRound) + 1;
    const indexInRound = activeWorkout.currentExerciseIndex % totalExercisesPerRound;

    // Find current station within the round
    let currentStationIndex = 0;
    let exercisesInCurrentStation = 0;
    for (let i = 0; i < circuitInfo.stations.length; i++) {
      if (indexInRound < exercisesSoFar + circuitInfo.stations[i].exercises.length) {
        currentStationIndex = i;
        exercisesInCurrentStation = indexInRound - exercisesSoFar;
        break;
      }
      exercisesSoFar += circuitInfo.stations[i].exercises.length;
    }

    const currentStation = circuitInfo.stations[currentStationIndex];
    const exerciseInStation = currentStation.exercises[exercisesInCurrentStation];

    return {
      station: currentStation,
      stationIndex: currentStationIndex,
      exerciseInStation,
      exerciseIndexInStation: exercisesInCurrentStation,
      round: currentRound,
      totalRounds: circuitInfo.rounds,
      exerciseLetter: String.fromCharCode(65 + exercisesInCurrentStation) // A, B, C, etc.
    };
  };

  const circuitContext = getCurrentCircuitContext();

  // Get next exercise preview for circuit awareness
  const getNextExercisePreview = () => {
    const previewCount = 2; // Show only next 2 items for compact display
    const preview: Array<{
      exercise: any;
      type: 'exercise' | 'rest' | 'station-rest';
      stationName?: string;
      exerciseLetter?: string;
      isCurrentStation?: boolean;
      duration?: number;
    }> = [];

    let itemsAdded = 0;

    // Start from the next phase after current
    let startFromRest = activeWorkout.phase === 'work';

    for (let i = 0; itemsAdded < previewCount; i++) {
      // Determine if this should be a rest or exercise
      const isRestPhase = startFromRest ? (i % 2 === 0) : (i % 2 === 1);

      if (isRestPhase) {
        // This is a rest period
        const exerciseIndex = Math.floor(i / 2) + activeWorkout.currentExerciseIndex + (startFromRest ? 0 : 1);

        if (exerciseIndex >= workout.exercises.length) {
          break; // No more exercises
        }

        const currentWorkoutEx = workout.exercises[exerciseIndex];
        const nextExerciseIndex = exerciseIndex + 1;

        // Check if this is a station transition rest
        let isStationTransition = false;
        let nextStationName = '';

        if (circuitInfo && circuitContext && nextExerciseIndex < workout.exercises.length) {
          // Calculate current and next station
          const totalExercisesPerRound = circuitInfo.stations.reduce((sum: number, station: any) => sum + station.exercises.length, 0);

          const currentIndexInRound = exerciseIndex % totalExercisesPerRound;
          const nextIndexInRound = nextExerciseIndex % totalExercisesPerRound;

          // Find current station
          let currentStationIndex = 0;
          let exercisesSoFar = 0;
          for (let j = 0; j < circuitInfo.stations.length; j++) {
            if (currentIndexInRound < exercisesSoFar + circuitInfo.stations[j].exercises.length) {
              currentStationIndex = j;
              break;
            }
            exercisesSoFar += circuitInfo.stations[j].exercises.length;
          }

          // Find next station
          let nextStationIndex = 0;
          exercisesSoFar = 0;
          for (let j = 0; j < circuitInfo.stations.length; j++) {
            if (nextIndexInRound < exercisesSoFar + circuitInfo.stations[j].exercises.length) {
              nextStationIndex = j;
              break;
            }
            exercisesSoFar += circuitInfo.stations[j].exercises.length;
          }

          isStationTransition = currentStationIndex !== nextStationIndex;
          if (isStationTransition) {
            nextStationName = circuitInfo.stations[nextStationIndex].name;
          }
        }

        const restDuration = isStationTransition ?
          (circuitInfo?.stationRestTime || 30) :
          currentWorkoutEx.restDuration;

        preview.push({
          exercise: {
            name: isStationTransition ? `Moving to ${nextStationName}` : 'Rest'
          },
          type: isStationTransition ? 'station-rest' : 'rest',
          duration: restDuration,
          stationName: isStationTransition ? nextStationName : undefined
        });

      } else {
        // This is an exercise
        const exerciseIndex = Math.floor((i + 1) / 2) + activeWorkout.currentExerciseIndex + (startFromRest ? 0 : 1);

        if (exerciseIndex >= workout.exercises.length) {
          preview.push({
            exercise: { name: 'Workout Complete!' },
            type: 'exercise',
            duration: 0
          });
          break;
        }

        const nextExercise = workout.exercises[exerciseIndex];
        let stationName = '';
        let exerciseLetter = '';
        let isCurrentStation = false;

        if (circuitInfo && circuitContext) {
          // Calculate station context for next exercise
          const totalExercisesPerRound = circuitInfo.stations.reduce((sum: number, station: any) => sum + station.exercises.length, 0);
          const nextIndexInRound = exerciseIndex % totalExercisesPerRound;

          let exercisesSoFar = 0;
          let nextStationIndex = 0;
          let exercisesInNextStation = 0;

          for (let j = 0; j < circuitInfo.stations.length; j++) {
            if (nextIndexInRound < exercisesSoFar + circuitInfo.stations[j].exercises.length) {
              nextStationIndex = j;
              exercisesInNextStation = nextIndexInRound - exercisesSoFar;
              break;
            }
            exercisesSoFar += circuitInfo.stations[j].exercises.length;
          }

          const nextStation = circuitInfo.stations[nextStationIndex];
          stationName = nextStation.name;
          exerciseLetter = String.fromCharCode(65 + exercisesInNextStation);
          isCurrentStation = nextStationIndex === circuitContext.stationIndex;
        }

        preview.push({
          exercise: nextExercise.exercise,
          type: 'exercise',
          stationName,
          exerciseLetter,
          isCurrentStation,
          duration: nextExercise.duration
        });
      }

      itemsAdded++;
    }

    return preview;
  };

  const nextExercisePreview = getNextExercisePreview();

  // // Get equipment info for current exercise
  // const getEquipmentInfo = (equipmentId: string): Equipment | undefined => {
  //   return equipmentData.find(eq => eq.id === equipmentId);
  // };

  // const currentExerciseEquipment = currentExercise?.equipment
  //   .map(id => getEquipmentInfo(id))
  //   .filter(Boolean) || [];

  // Calculate remaining exercise and rest time
  const getRemainingTimes = () => {
    let remainingExerciseTime = 0;
    let remainingRestTime = 0;

    // Add current phase time
    if (activeWorkout.phase === 'work') {
      remainingExerciseTime += activeWorkout.timeRemaining;
    } else if (activeWorkout.phase === 'rest') {
      remainingRestTime += activeWorkout.timeRemaining;
    }

    // Add time for remaining exercises
    for (let i = activeWorkout.currentExerciseIndex + (activeWorkout.phase === 'work' ? 1 : 0); i < workout.exercises.length; i++) {
      const exercise = workout.exercises[i];
      remainingExerciseTime += exercise.duration;
      if (i < workout.exercises.length - 1) { // No rest after last exercise
        remainingRestTime += exercise.restDuration;
      }
    }

    // Add station rest time if applicable
    if (circuitInfo && circuitInfo.stationRestTime) {
      // Calculate remaining station transitions
      const totalExercisesPerRound = circuitInfo.stations.reduce((sum: number, station: any) => sum + station.exercises.length, 0);
      const currentRound = Math.floor(activeWorkout.currentExerciseIndex / totalExercisesPerRound) + 1;
      const indexInRound = activeWorkout.currentExerciseIndex % totalExercisesPerRound;

      // Find current station
      let currentStationIndex = 0;
      let exercisesSoFar = 0;
      for (let i = 0; i < circuitInfo.stations.length; i++) {
        if (indexInRound < exercisesSoFar + circuitInfo.stations[i].exercises.length) {
          currentStationIndex = i;
          break;
        }
        exercisesSoFar += circuitInfo.stations[i].exercises.length;
      }

      // Count remaining station transitions in current round
      const remainingStationsInRound = circuitInfo.stations.length - currentStationIndex - 1;
      // Plus transitions in remaining rounds
      const remainingRounds = circuitInfo.rounds - currentRound;
      const remainingStationTransitions = remainingStationsInRound + (remainingRounds * (circuitInfo.stations.length - 1));

      if (remainingStationTransitions > 0) {
        remainingRestTime += remainingStationTransitions * circuitInfo.stationRestTime;
      }
    }

    return { remainingExerciseTime, remainingRestTime };
  };

  const remainingTimes = getRemainingTimes();

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeMinutes = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    return `${mins}min`;
  };

  // Phase colors
  const getPhaseColor = () => {
    switch (activeWorkout.phase) {
      case 'warmup': return '#fd79a8'; // Pink
      case 'prepare': return '#feca57'; // Yellow
      case 'work': return '#2ed573'; // Green
      case 'rest': return '#ff4757'; // Red
      case 'complete': return '#2ed573'; // Green
      default: return '#ffffff';
    }
  };

  const getPhaseBackground = () => {
    switch (activeWorkout.phase) {
      case 'warmup': return 'rgba(253, 121, 168, 0.1)';
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

        {/* Countdown and Back Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 71, 87, 0.1)',
            border: '2px solid #ff4757',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            color: '#ff4757',
            fontWeight: '600'
          }}>
            Returning to setup in {completionCountdown} seconds
          </div>

          <button
            onClick={onComplete}
            style={{
              background: 'linear-gradient(135deg, #2ed573 0%, #20bf6b 100%)',
              color: 'black',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .exercise-description-scroll::-webkit-scrollbar {
            display: none;
          }
          .exercise-description-scroll {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
        `}
      </style>
      <div style={{
        height: '100vh',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${getPhaseBackground()}, #0a0a0b)`,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
      {/* Compact Header */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #2a2a2f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        flexShrink: 0
      }}>
        <button
          onClick={onExit}
          style={{
            background: 'transparent',
            border: '1px solid #3a3a40',
            borderRadius: '6px',
            color: '#b8bcc8',
            fontSize: '0.75rem',
            padding: '0.375rem 0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          Exit
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            background: '#131315',
            borderRadius: '16px',
            padding: '0.375rem 0.75rem',
            border: '2px solid #2a2a2f',
            display: 'inline-block'
          }}>
            <span style={{ color: getPhaseColor(), fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              {activeWorkout.phase}
            </span>
          </div>
        </div>

        <div style={{
          background: '#131315',
          borderRadius: '6px',
          padding: '0.375rem 0.5rem',
          border: '1px solid #2a2a2f',
          fontSize: '0.625rem',
          color: '#b8bcc8',
          textAlign: 'center',
          minWidth: '60px'
        }}>
          <div style={{ color: 'white', fontWeight: 'bold' }}>
            {circuitContext ?
              `${circuitContext.round}/${circuitContext.totalRounds}` :
              `${Math.round(progress)}%`
            }
          </div>
          <div>{circuitContext ? 'Round' : 'Done'}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '6px',
        background: '#131315',
        position: 'relative',
        flexShrink: 0
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
        padding: '0.5rem 1rem',
        textAlign: 'center',
        minHeight: 0,
        overflow: 'auto'
      }}>
        {/* Remaining Time Display */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          fontSize: '0.625rem',
          color: '#b8bcc8',
          marginBottom: '0.5rem',
          flexShrink: 0
        }}>
          <div style={{
            background: 'rgba(46, 213, 115, 0.1)',
            border: '1px solid #2ed573',
            borderRadius: '6px',
            padding: '0.375rem 0.5rem',
            textAlign: 'center',
            minWidth: '60px'
          }}>
            <div style={{ color: '#2ed573', fontWeight: 'bold', marginBottom: '0.125rem', fontSize: '0.625rem' }}>
              Work
            </div>
            <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {formatTimeMinutes(remainingTimes.remainingExerciseTime)}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid #ff4757',
            borderRadius: '6px',
            padding: '0.375rem 0.5rem',
            textAlign: 'center',
            minWidth: '60px'
          }}>
            <div style={{ color: '#ff4757', fontWeight: 'bold', marginBottom: '0.125rem', fontSize: '0.625rem' }}>
              Rest
            </div>
            <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {formatTimeMinutes(remainingTimes.remainingRestTime)}
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div style={{
          fontSize: 'clamp(3rem, 12vw, 5rem)',
          fontWeight: 'bold',
          color: getPhaseColor(),
          marginBottom: '0.75rem',
          fontFamily: 'monospace',
          lineHeight: 1,
          textShadow: `0 0 30px ${getPhaseColor()}40`,
          flexShrink: 0
        }}>
          {formatTime(activeWorkout.timeRemaining)}
        </div>

        {/* Control Buttons - Fixed Position */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '350px',
          width: '100%',
          marginBottom: '0.75rem',
          flexShrink: 0
        }}>
          {!activeWorkout.isActive ? (
            <button
              onClick={startWorkout}
              style={{
                background: 'linear-gradient(135deg, #2ed573 0%, #20bf6b 100%)',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1,
                justifyContent: 'center',
                minWidth: '140px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Start
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
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  flex: 1,
                  justifyContent: 'center',
                  minWidth: '80px'
                }}
              >
                {activeWorkout.isPaused ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                  border: '1px solid #ff4757',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,4 15,12 5,20" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>

              <button
                onClick={stopWorkout}
                style={{
                  background: 'transparent',
                  color: '#6c7293',
                  border: '1px solid #3a3a40',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Current Exercise - Fixed Height */}
        {currentExercise && (
          <div style={{
            background: '#131315',
            border: '1px solid #2a2a2f',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '100%',
            height: '160px', // Reduced for iPhone SE compatibility
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
              fontWeight: 'bold'
            }}>
              {activeWorkout.phase === 'warmup' ? `Warmup: ${currentExercise?.name || 'Loading...'}` :
               activeWorkout.phase === 'prepare' ? `Get Ready: ${currentExercise?.name || 'Loading...'}` :
               activeWorkout.phase === 'rest' ? 'Rest Time' :
               currentExercise?.name || 'Loading...'}
            </h2>

            {/* Circuit Info - Compact */}
            {circuitContext && activeWorkout.phase === 'work' && (
              <div style={{
                color: '#ff4757',
                fontSize: '0.75rem',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {circuitContext.station.name} - Exercise {circuitContext.exerciseLetter}
              </div>
            )}

            <div
              className="exercise-description-scroll"
              style={{
                flex: 1,
                overflow: 'auto', // Allow scrolling
                minHeight: 0
              }}>
              {(activeWorkout.phase === 'work' || activeWorkout.phase === 'warmup') && (
                <p style={{
                  color: '#b8bcc8',
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  margin: 0
                }}>
                  {currentExercise?.instructions}
                </p>
              )}

              {activeWorkout.phase === 'rest' && (
                <div>
                  <p style={{ color: '#ff4757', fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.75rem 0' }}>
                    Next: {workout.exercises[activeWorkout.currentExerciseIndex + 1]?.exercise?.name || 'Complete!'}
                  </p>
                  {workout.exercises[activeWorkout.currentExerciseIndex + 1]?.exercise?.instructions && (
                    <p style={{
                      color: '#b8bcc8',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      margin: 0
                    }}>
                      {workout.exercises[activeWorkout.currentExerciseIndex + 1].exercise.instructions}
                    </p>
                  )}
                </div>
              )}

              {activeWorkout.phase === 'prepare' && (
                <div>
                  <p style={{ color: '#fd79a8', fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.75rem 0' }}>
                    {workout.warmup ? 'Starting with warmup exercises' : 'Get ready to begin!'}
                  </p>
                  <p style={{ color: '#b8bcc8', fontSize: '0.875rem', margin: 0 }}>
                    {currentExercise?.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compact Next Preview - Fixed Height */}
        <div style={{
          background: '#131315',
          border: '1px solid #2a2a2f',
          borderRadius: '8px',
          padding: '0.375rem',
          maxWidth: '400px',
          width: '100%',
          height: '80px', // Reduced for iPhone SE
          marginBottom: '0.5rem',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{
            color: '#ff4757',
            fontSize: '0.5rem',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}>
            Coming Up
          </div>

          {nextExercisePreview.slice(0, 2).map((item, index) => {
            const isRest = item.type === 'rest' || item.type === 'station-rest';

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.25rem 0.375rem',
                  background: isRest ? 'rgba(255, 71, 87, 0.1)' : 'rgba(46, 213, 115, 0.1)',
                  border: `1px solid ${isRest ? '#ff4757' : '#2ed573'}`,
                  borderRadius: '4px',
                  marginBottom: index < 1 ? '0.25rem' : '0',
                  opacity: index === 0 ? 1 : 0.7
                }}
              >
                <div style={{
                  color: 'white',
                  fontSize: '0.625rem',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {isRest ? '🛌 Rest' : item.exercise.name}
                </div>

                <div style={{
                  fontSize: '0.625rem',
                  color: '#6c7293',
                  fontWeight: '500',
                  marginLeft: '0.5rem'
                }}>
                  {item.duration ? `${item.duration}s` : '0s'}
                </div>
              </div>
            );
          })}
        </div>

      </div>
      </div>
    </>
  );
};

export default ActiveWorkoutComponent;