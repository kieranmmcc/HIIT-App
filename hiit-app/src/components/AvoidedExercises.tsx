import { useState, useEffect } from 'react';
import type { Exercise } from '../types/exercise';
import { BlacklistStorage } from '../utils/blacklistStorage';
import exercisesData from '../data/exercises.json';

interface AvoidedExercisesProps {
  onBack: () => void;
}

const AvoidedExercises: React.FC<AvoidedExercisesProps> = ({ onBack }) => {
  const [avoidedExercises, setAvoidedExercises] = useState<Exercise[]>([]);
  const [allExercises] = useState<Exercise[]>(exercisesData as Exercise[]);

  // Load avoided exercises on component mount
  useEffect(() => {
    const blacklistedIds = BlacklistStorage.getBlacklistedExercises();
    const blacklistedExercises = allExercises.filter(exercise =>
      blacklistedIds.includes(exercise.id.toString())
    );
    setAvoidedExercises(blacklistedExercises);
  }, [allExercises]);

  const handleRemoveFromAvoid = (exerciseId: number) => {
    BlacklistStorage.removeFromBlacklist(exerciseId.toString());
    setAvoidedExercises(prev => prev.filter(exercise => exercise.id !== exerciseId));
  };

  const handleClearAll = () => {
    if (avoidedExercises.length > 0 &&
        window.confirm('Are you sure you want to remove all exercises from the avoid list?')) {
      BlacklistStorage.clearBlacklist();
      setAvoidedExercises([]);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return '#4ade80'; // green
    if (difficulty <= 3) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a1f 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back
          </button>

          {avoidedExercises.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                border: 'none',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Clear All
            </button>
          )}
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Avoided Exercises
        </h1>

        <p style={{
          color: '#a3a3a3',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          marginBottom: '10px'
        }}>
          Manage exercises you've marked as "never show again". You can restore any exercise by removing it from this list.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          color: '#6b7280',
          fontSize: '0.9rem'
        }}>
          <span>{avoidedExercises.length} exercise{avoidedExercises.length !== 1 ? 's' : ''} avoided</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {avoidedExercises.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✨</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#ffffff'
            }}>
              No Avoided Exercises
            </h3>
            <p style={{ color: '#a3a3a3', fontSize: '1rem' }}>
              You haven't marked any exercises as "never show again" yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {avoidedExercises.map((exercise) => (
              <div
                key={exercise.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        margin: 0,
                        color: '#ffffff'
                      }}>
                        {exercise.name}
                      </h3>

                      <div style={{
                        background: getDifficultyColor(exercise.difficulty),
                        color: exercise.difficulty <= 2 ? '#000' : '#fff',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {getDifficultyLabel(exercise.difficulty)}
                      </div>
                    </div>

                    <p style={{
                      color: '#a3a3a3',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                      margin: '0 0 12px 0'
                    }}>
                      {exercise.instructions}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#93c5fd',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {exercise.primaryMuscle.replace('_', ' ')}
                      </div>

                      {exercise.equipment.map((eq, index) => (
                        <div
                          key={index}
                          style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#6ee7b7',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}
                        >
                          {eq.replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFromAvoid(exercise.id)}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      marginLeft: '20px',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(22, 163, 74, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvoidedExercises;