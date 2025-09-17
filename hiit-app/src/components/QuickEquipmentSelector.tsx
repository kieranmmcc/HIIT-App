import React, { useState, useEffect } from 'react';
import type { Equipment } from '../types/equipment';
import type { EquipmentPreset } from '../types/equipmentPreferences';
import { equipmentData } from '../data/equipment';
import { EquipmentStorage } from '../utils/equipmentStorage';

interface QuickEquipmentSelectorProps {
  selectedEquipment: string[];
  onEquipmentChange: (equipmentIds: string[]) => void;
  onEditAllEquipment: () => void;
}

const QuickEquipmentSelector: React.FC<QuickEquipmentSelectorProps> = ({
  selectedEquipment,
  onEquipmentChange,
  onEditAllEquipment
}) => {
  const [ownedEquipment, setOwnedEquipment] = useState<string[]>([]);
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    const preferences = EquipmentStorage.getPreferences();
    setOwnedEquipment(preferences.ownedEquipment);
    setPresets(preferences.presets);
  }, []);

  const getEquipmentInfo = (id: string): Equipment | undefined => {
    return equipmentData.find(eq => eq.id === id);
  };

  const handleEquipmentToggle = (equipmentId: string) => {
    if (equipmentId === 'bodyweight') return; // Can't deselect bodyweight

    const newSelection = selectedEquipment.includes(equipmentId)
      ? selectedEquipment.filter(id => id !== equipmentId)
      : [...selectedEquipment, equipmentId];

    onEquipmentChange(newSelection);
    EquipmentStorage.updateWorkoutSelection(newSelection);
  };

  const applyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    // Filter to only owned equipment
    const validEquipment = preset.equipmentIds.filter(id => ownedEquipment.includes(id));
    const finalSelection = validEquipment.length > 0 ? validEquipment : ['bodyweight'];

    onEquipmentChange(finalSelection);
    EquipmentStorage.updateWorkoutSelection(finalSelection);
    setShowPresets(false);
  };

  const ownedEquipmentItems = ownedEquipment
    .map(id => getEquipmentInfo(id))
    .filter(Boolean);

  return (
    <div style={{
      background: '#131315',
      border: '2px solid #2a2a2f',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          color: '#ff4757',
          fontSize: '1.125rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: 0
        }}>
          Equipment for This Workout
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowPresets(!showPresets)}
            style={{
              background: 'transparent',
              border: '1px solid #3a3a40',
              borderRadius: '8px',
              color: '#b8bcc8',
              fontSize: '0.75rem',
              padding: '0.375rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9l-9-9-9 9h9z" />
            </svg>
            Presets
          </button>

          <button
            onClick={onEditAllEquipment}
            style={{
              background: 'transparent',
              border: '1px solid #3a3a40',
              borderRadius: '8px',
              color: '#b8bcc8',
              fontSize: '0.75rem',
              padding: '0.375rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit All
          </button>
        </div>
      </div>

      {/* Preset Dropdown */}
      {showPresets && (
        <div style={{
          background: '#1c1c20',
          border: '1px solid #3a3a40',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          animation: 'slideUp 0.3s ease'
        }}>
          <div style={{
            color: '#b8bcc8',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
            fontWeight: '500'
          }}>
            Quick Presets:
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem'
          }}>
            {presets.map(preset => {
              const hasAllEquipment = preset.equipmentIds.every(equipId =>
                ownedEquipment.includes(equipId)
              );
              const missingEquipment = preset.equipmentIds.filter(equipId =>
                !ownedEquipment.includes(equipId)
              );

              return (
                <button
                  key={preset.id}
                  onClick={() => hasAllEquipment ? applyPreset(preset.id) : undefined}
                  disabled={!hasAllEquipment}
                  style={{
                    background: hasAllEquipment ? 'transparent' : 'rgba(108, 114, 147, 0.1)',
                    border: `1px solid ${hasAllEquipment ? '#3a3a40' : '#6c7293'}`,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    textAlign: 'left',
                    cursor: hasAllEquipment ? 'pointer' : 'not-allowed',
                    opacity: hasAllEquipment ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (hasAllEquipment) {
                      e.currentTarget.style.borderColor = '#ff4757';
                      e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasAllEquipment) {
                      e.currentTarget.style.borderColor = '#3a3a40';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  title={!hasAllEquipment ? `Missing: ${missingEquipment.map(id => getEquipmentInfo(id)?.name || id).join(', ')}` : ''}
                >
                  <div style={{
                    color: hasAllEquipment ? 'white' : '#6c7293',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    {preset.name}
                    {!hasAllEquipment && (
                      <span style={{
                        fontSize: '0.75rem',
                        marginLeft: '0.5rem',
                        color: '#ff6b6b'
                      }}>
                        (Missing Equipment)
                      </span>
                    )}
                  </div>
                  <div style={{
                    color: '#6c7293',
                    fontSize: '0.75rem'
                  }}>
                    {preset.description}
                  </div>
                  {!hasAllEquipment && missingEquipment.length > 0 && (
                    <div style={{
                      color: '#ff6b6b',
                      fontSize: '0.625rem',
                      marginTop: '0.25rem',
                      fontStyle: 'italic'
                    }}>
                      Need: {missingEquipment.map(id => getEquipmentInfo(id)?.name || id).join(', ')}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Equipment Selection */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {ownedEquipmentItems.map(equipment => {
          if (!equipment) return null;

          const isSelected = selectedEquipment.includes(equipment.id);
          const isRequired = equipment.isRequired;

          return (
            <button
              key={equipment.id}
              onClick={() => handleEquipmentToggle(equipment.id)}
              disabled={isRequired}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: isSelected
                  ? (isRequired ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 71, 87, 0.2)')
                  : 'transparent',
                border: isSelected
                  ? `2px solid ${isRequired ? '#2ed573' : '#ff4757'}`
                  : '2px solid #3a3a40',
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: isSelected ? 'white' : '#b8bcc8',
                cursor: isRequired ? 'default' : 'pointer',
                opacity: isRequired ? 0.8 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isRequired) {
                  e.currentTarget.style.borderColor = isSelected ? '#ff6b35' : '#ff4757';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRequired) {
                  e.currentTarget.style.borderColor = isSelected
                    ? '#ff4757'
                    : '#3a3a40';
                }
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
              {isRequired && (
                <span style={{
                  background: '#2ed573',
                  color: 'black',
                  fontSize: '0.625rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Required
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: 'rgba(108, 114, 147, 0.1)',
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: '#b8bcc8',
        textAlign: 'center'
      }}>
        💡 <strong>{selectedEquipment.length}</strong> equipment selected •
        Workouts will only use these items •
        Click "Edit All" to add more equipment to your collection
      </div>
    </div>
  );
};

export default QuickEquipmentSelector;