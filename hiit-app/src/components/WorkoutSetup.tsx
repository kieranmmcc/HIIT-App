import React, { useState, useEffect } from 'react';
import type { Equipment } from '../types/equipment';
import type { WorkoutSettings } from '../types/workout';
import { durationOptions, difficultyOptions } from '../data/workoutOptions';
import EquipmentSummary from './EquipmentSummary';
import QuickEquipmentSelector from './QuickEquipmentSelector';
import MuscleGroupSelector from './MuscleGroupSelector';
import { EquipmentStorage } from '../utils/equipmentStorage';
import PWAInstallButton from './PWAInstallButton';

interface WorkoutSetupProps {
  selectedEquipment: Equipment[];
  onBack: () => void;
  onStartWorkout: (settings: WorkoutSettings) => void;
}

const WorkoutSetup: React.FC<WorkoutSetupProps> = ({
  selectedEquipment,
  onBack,
  onStartWorkout
}) => {
  const [duration, setDuration] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [workoutEquipment, setWorkoutEquipment] = useState<string[]>([]);
  const [targetMuscleGroups, setTargetMuscleGroups] = useState<string[]>([]);

  useEffect(() => {
    // Initialize workout equipment from storage
    const preferences = EquipmentStorage.getPreferences();
    setWorkoutEquipment(preferences.selectedForWorkout);
  }, []);

  const handleEquipmentChange = (equipmentIds: string[]) => {
    setWorkoutEquipment(equipmentIds);
  };

  const handleStartWorkout = () => {
    const settings: WorkoutSettings = {
      duration,
      difficulty,
      selectedEquipment: workoutEquipment,
      targetMuscleGroups: targetMuscleGroups.length > 0 ? targetMuscleGroups : undefined
    };
    onStartWorkout(settings);
  };

  const selectedDifficultyOption = difficultyOptions.find(opt => opt.value === difficulty);

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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ color: 'white', marginBottom: '1rem' }}>Create Your Workout</h1>
              <p style={{ color: '#b8bcc8' }}>
                Choose your workout duration and intensity level
              </p>
            </div>
            <PWAInstallButton size="small" />
          </div>

          <QuickEquipmentSelector
            selectedEquipment={workoutEquipment}
            onEquipmentChange={handleEquipmentChange}
            onEditAllEquipment={onBack}
          />
        </header>

        {/* Duration Selection */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#ff4757',
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
            {durationOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => setDuration(option.value)}
                style={{
                  background: duration === option.value ? '#1c1c20' : '#131315',
                  border: duration === option.value ? '2px solid #ff4757' : '2px solid #2a2a2f',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: duration === option.value ? '0 8px 24px rgba(255, 71, 87, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: duration === option.value ? '#ff4757' : 'white',
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
            color: '#ff4757',
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
                  boxShadow: difficulty === option.value ? `0 8px 24px ${option.color}25` : '0 4px 12px rgba(0, 0, 0, 0.4)'
                }}
              >
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
        />

        {/* Start Workout Button */}
        <div className="workout-actions" style={{ textAlign: 'center' }}>
          <button
            className="btn-primary"
            onClick={handleStartWorkout}
            style={{
              background: 'linear-gradient(135deg, #ff4757 0%, #ff6b35 100%)',
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
            Start {duration}-Minute Workout
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
              <polygon points="5,3 19,12 5,21" />
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