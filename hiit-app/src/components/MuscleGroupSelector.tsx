import React from 'react';
import { muscleGroupFilters, type MuscleGroupFilter } from '../types/muscleGroups';
import type { CircuitType } from '../types/circuit';

interface MuscleGroupSelectorProps {
  selectedMuscleGroups: string[];
  onMuscleGroupsChange: (muscleGroups: string[]) => void;
  excludedMuscleGroups: string[];
  onExcludedMuscleGroupsChange: (excludedGroups: string[]) => void;
  circuitType?: CircuitType;
  exerciseCount?: number;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  selectedMuscleGroups,
  onMuscleGroupsChange,
  excludedMuscleGroups,
  onExcludedMuscleGroupsChange,
  circuitType,
  exerciseCount
}) => {

  const getAvailableMuscleGroups = () => {
    if (circuitType === 'super_sets') {
      // For super sets, only show complementary pairs
      const superSetPairs = ['arms', 'legs_glutes', 'chest_back', 'shoulders_core', 'cardio_core'];
      return muscleGroupFilters.filter(mg => superSetPairs.includes(mg.id));
    } else {
      // For classic circuits, exclude the combined pairs
      const combinedPairs = ['legs_glutes', 'chest_back', 'shoulders_core', 'biceps_triceps', 'cardio_core'];
      return muscleGroupFilters.filter(mg => !combinedPairs.includes(mg.id));
    }
  };

  const availableMuscleGroups = getAvailableMuscleGroups();
  const handleToggleMuscleGroup = (muscleGroupId: string) => {
    const isSelected = selectedMuscleGroups.includes(muscleGroupId);
    const isExcluded = excludedMuscleGroups.includes(muscleGroupId);

    if (!isSelected && !isExcluded) {
      // Default -> Target
      // For super sets, limit selections based on set count (one muscle group per set)
      const maxSelections = circuitType === 'super_sets' ? (exerciseCount ? exerciseCount / 2 : 4) : undefined;
      if (maxSelections && selectedMuscleGroups.length >= maxSelections) {
        return; // Don't allow more selections than stations
      }
      onMuscleGroupsChange([...selectedMuscleGroups, muscleGroupId]);
    } else if (isSelected && !isExcluded) {
      // Target -> Avoid
      onMuscleGroupsChange(selectedMuscleGroups.filter(id => id !== muscleGroupId));
      onExcludedMuscleGroupsChange([...excludedMuscleGroups, muscleGroupId]);
    } else if (!isSelected && isExcluded) {
      // Avoid -> Default
      onExcludedMuscleGroupsChange(excludedMuscleGroups.filter(id => id !== muscleGroupId));
    }
  };

  const handleClearAll = () => {
    // Clear both selections and exclusions
    onMuscleGroupsChange([]);
    onExcludedMuscleGroupsChange([]);
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{
          color: '#22c55e',
          fontSize: '1.25rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0
        }}>
          Body Parts
        </h2>

        <button
          onClick={handleClearAll}
          style={{
            background: 'transparent',
            border: '2px solid #3a3a40',
            borderRadius: '8px',
            color: '#b8bcc8',
            fontSize: '0.75rem',
            padding: '0.375rem 0.75rem',
            cursor: 'pointer',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Clear All
        </button>
      </div>

      <div style={{
        marginBottom: '1.5rem'
      }}>
        <p style={{
          color: '#b8bcc8',
          fontSize: '0.875rem',
          marginBottom: '0.5rem',
          margin: '0 0 0.5rem 0'
        }}>
          Click to cycle: Default → <span style={{color: '#22c55e'}}>Target</span> → <span style={{color: '#ef4444'}}>Avoid</span>
        </p>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
          {selectedMuscleGroups.length > 0 && (
            <span style={{ color: '#22c55e' }}>
              ✓ Targeting {selectedMuscleGroups.length} body part{selectedMuscleGroups.length !== 1 ? 's' : ''}
            </span>
          )}
          {excludedMuscleGroups.length > 0 && (
            <span style={{ color: '#ef4444' }}>
              ✗ Avoiding {excludedMuscleGroups.length} body part{excludedMuscleGroups.length !== 1 ? 's' : ''}
            </span>
          )}
          {selectedMuscleGroups.length === 0 && excludedMuscleGroups.length === 0 && (
            <span style={{ color: '#6c7293' }}>
              No specific targeting or exclusions - all muscle groups included
            </span>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {availableMuscleGroups.map((muscleGroup: MuscleGroupFilter) => {
          const isSelected = selectedMuscleGroups.includes(muscleGroup.id);
          const isExcluded = excludedMuscleGroups.includes(muscleGroup.id);
          const maxSelections = circuitType === 'super_sets' ? (exerciseCount ? exerciseCount / 2 : 4) : undefined;
          const isDisabled = maxSelections ? (!isSelected && selectedMuscleGroups.length >= maxSelections) : false;

          // Determine the state for styling
          let state = 'default';
          if (isSelected) state = 'selected';
          else if (isExcluded) state = 'excluded';

          return (
            <button
              key={muscleGroup.id}
              onClick={() => handleToggleMuscleGroup(muscleGroup.id)}
              disabled={isDisabled}
              style={{
                background: isDisabled ? '#0a0a0b' :
                           state === 'selected' ? 'rgba(34, 197, 94, 0.15)' :
                           state === 'excluded' ? 'rgba(239, 68, 68, 0.15)' :
                           '#131315',
                border: `2px solid ${isDisabled ? '#1a1a1d' :
                        state === 'selected' ? '#22c55e' :
                        state === 'excluded' ? '#ef4444' :
                        '#6b7280'}`,
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                boxShadow: isSelected
                  ? '0 8px 24px rgba(34, 197, 94, 0.25)'
                  : '0 4px 12px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                opacity: isDisabled ? 0.4 : (state === 'default' ? 0.6 : 1)
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.background = 'rgba(156, 163, 175, 0.05)';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.borderColor = '#6b7280';
                  e.currentTarget.style.background = '#131315';
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              <div style={{
                fontSize: '2rem',
                flexShrink: 0
              }}>
                {muscleGroup.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: state === 'selected' ? '#22c55e' :
                         state === 'excluded' ? '#ef4444' :
                         'white',
                  marginBottom: '0.25rem'
                }}>
                  {muscleGroup.name}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#b8bcc8'
                }}>
                  {muscleGroup.description}
                </div>
              </div>

              {(isSelected || isExcluded) && (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isSelected ? '#22c55e' : '#ef4444',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {isSelected ? '✓' : '✗'}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MuscleGroupSelector;