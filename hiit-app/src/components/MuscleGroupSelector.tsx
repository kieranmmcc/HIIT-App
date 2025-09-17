import React from 'react';
import { muscleGroupFilters, type MuscleGroupFilter } from '../types/muscleGroups';

interface MuscleGroupSelectorProps {
  selectedMuscleGroups: string[];
  onMuscleGroupsChange: (muscleGroups: string[]) => void;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  selectedMuscleGroups,
  onMuscleGroupsChange
}) => {
  const handleToggleMuscleGroup = (muscleGroupId: string) => {
    if (selectedMuscleGroups.includes(muscleGroupId)) {
      onMuscleGroupsChange(selectedMuscleGroups.filter(id => id !== muscleGroupId));
    } else {
      onMuscleGroupsChange([...selectedMuscleGroups, muscleGroupId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMuscleGroups.length === muscleGroupFilters.length) {
      onMuscleGroupsChange([]);
    } else {
      onMuscleGroupsChange(muscleGroupFilters.map(mg => mg.id));
    }
  };

  const isAllSelected = selectedMuscleGroups.length === muscleGroupFilters.length;

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{
          color: '#ff4757',
          fontSize: '1.25rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0
        }}>
          Target Body Parts
        </h2>

        <button
          onClick={handleSelectAll}
          style={{
            background: 'transparent',
            border: `2px solid ${isAllSelected ? '#ff4757' : '#3a3a40'}`,
            borderRadius: '8px',
            color: isAllSelected ? '#ff4757' : '#b8bcc8',
            fontSize: '0.75rem',
            padding: '0.375rem 0.75rem',
            cursor: 'pointer',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {isAllSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <p style={{
        color: '#b8bcc8',
        fontSize: '0.875rem',
        marginBottom: '1.5rem',
        margin: '0 0 1.5rem 0'
      }}>
        {selectedMuscleGroups.length === 0
          ? 'Select which body parts to focus on (or leave empty for all muscle groups)'
          : `Targeting ${selectedMuscleGroups.length} body part${selectedMuscleGroups.length !== 1 ? 's' : ''}`
        }
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {muscleGroupFilters.map((muscleGroup: MuscleGroupFilter) => {
          const isSelected = selectedMuscleGroups.includes(muscleGroup.id);

          return (
            <button
              key={muscleGroup.id}
              onClick={() => handleToggleMuscleGroup(muscleGroup.id)}
              style={{
                background: isSelected ? 'rgba(255, 71, 87, 0.15)' : '#131315',
                border: `2px solid ${isSelected ? '#ff4757' : '#2a2a2f'}`,
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                boxShadow: isSelected
                  ? '0 8px 24px rgba(255, 71, 87, 0.25)'
                  : '0 4px 12px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#ff4757';
                  e.currentTarget.style.background = 'rgba(255, 71, 87, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#2a2a2f';
                  e.currentTarget.style.background = '#131315';
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
                  color: isSelected ? '#ff4757' : 'white',
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

              {isSelected && (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#ff4757',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  ✓
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