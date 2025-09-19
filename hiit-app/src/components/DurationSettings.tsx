import { useState, useEffect } from 'react';
import { DurationPreferencesStorage, type DurationPreferences } from '../utils/durationPreferences';

interface DurationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (preferences: DurationPreferences) => void;
}

export default function DurationSettings({ isOpen, onClose, onSave }: DurationSettingsProps) {
  const [warmupDuration, setWarmupDuration] = useState(20);
  const [cooldownDuration, setCooldownDuration] = useState(20);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const preferences = DurationPreferencesStorage.getPreferences();
      setWarmupDuration(preferences.warmupDuration);
      setCooldownDuration(preferences.cooldownDuration);
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleWarmupDurationChange = (duration: number) => {
    setWarmupDuration(duration);
    setHasChanges(true);
  };

  const handleCooldownDurationChange = (duration: number) => {
    setCooldownDuration(duration);
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      const newPreferences: DurationPreferences = {
        warmupDuration,
        cooldownDuration,
        lastUpdated: new Date().toISOString()
      };

      DurationPreferencesStorage.savePreferences(newPreferences);
      onSave?.(newPreferences);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save duration preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleReset = () => {
    setWarmupDuration(20);
    setCooldownDuration(20);
    setHasChanges(true);
  };

  const getDurationOptions = () => DurationPreferencesStorage.getDurationOptions();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#131315',
        border: '1px solid #2a2a2f',
        borderRadius: '12px',
        padding: '1.5rem',
        maxWidth: '400px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            Duration Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6c7293',
              cursor: 'pointer',
              fontSize: '1.5rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Warmup Duration Setting */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            marginBottom: '0.75rem',
            display: 'block'
          }}>
            Warmup Exercise Duration
          </label>
          <p style={{
            color: '#6c7293',
            fontSize: '0.875rem',
            margin: '0 0 1rem 0'
          }}>
            How long should each warmup exercise last?
          </p>

          {/* Mobile-friendly duration selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {getDurationOptions().slice(0, 12).map(duration => (
              <button
                key={`warmup-${duration}`}
                onClick={() => handleWarmupDurationChange(duration)}
                style={{
                  background: warmupDuration === duration ? '#fd79a8' : 'transparent',
                  border: warmupDuration === duration ? '1px solid #fd79a8' : '1px solid #3a3a40',
                  borderRadius: '6px',
                  color: warmupDuration === duration ? 'white' : '#b8bcc8',
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {DurationPreferencesStorage.formatDuration(duration)}
              </button>
            ))}
          </div>

          {/* Custom duration input for advanced users */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#6c7293', fontSize: '0.875rem', minWidth: 'fit-content' }}>
              Custom:
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={warmupDuration}
              onChange={(e) => handleWarmupDurationChange(Math.max(10, Math.min(300, parseInt(e.target.value) || 20)))}
              style={{
                background: '#1a1a1c',
                border: '1px solid #3a3a40',
                borderRadius: '4px',
                color: 'white',
                padding: '0.5rem',
                fontSize: '0.875rem',
                width: '80px'
              }}
            />
            <span style={{ color: '#6c7293', fontSize: '0.875rem' }}>seconds</span>
          </div>
        </div>

        {/* Cooldown Duration Setting */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            marginBottom: '0.75rem',
            display: 'block'
          }}>
            Cooldown Exercise Duration
          </label>
          <p style={{
            color: '#6c7293',
            fontSize: '0.875rem',
            margin: '0 0 1rem 0'
          }}>
            How long should each cooldown stretch last?
          </p>

          {/* Mobile-friendly duration selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {getDurationOptions().slice(0, 12).map(duration => (
              <button
                key={`cooldown-${duration}`}
                onClick={() => handleCooldownDurationChange(duration)}
                style={{
                  background: cooldownDuration === duration ? '#74b9ff' : 'transparent',
                  border: cooldownDuration === duration ? '1px solid #74b9ff' : '1px solid #3a3a40',
                  borderRadius: '6px',
                  color: cooldownDuration === duration ? 'white' : '#b8bcc8',
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {DurationPreferencesStorage.formatDuration(duration)}
              </button>
            ))}
          </div>

          {/* Custom duration input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#6c7293', fontSize: '0.875rem', minWidth: 'fit-content' }}>
              Custom:
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={cooldownDuration}
              onChange={(e) => handleCooldownDurationChange(Math.max(10, Math.min(300, parseInt(e.target.value) || 20)))}
              style={{
                background: '#1a1a1c',
                border: '1px solid #3a3a40',
                borderRadius: '4px',
                color: 'white',
                padding: '0.5rem',
                fontSize: '0.875rem',
                width: '80px'
              }}
            />
            <span style={{ color: '#6c7293', fontSize: '0.875rem' }}>seconds</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: '1px solid #3a3a40',
              borderRadius: '6px',
              color: '#6c7293',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Reset to 20s
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #3a3a40',
              borderRadius: '6px',
              color: '#b8bcc8',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              background: hasChanges ? '#2ed573' : '#2a2a2f',
              border: hasChanges ? '1px solid #2ed573' : '1px solid #3a3a40',
              borderRadius: '6px',
              color: hasChanges ? 'white' : '#6c7293',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              cursor: hasChanges ? 'pointer' : 'not-allowed'
            }}
          >
            Save Changes
          </button>
        </div>

        {/* Current Summary */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#1a1a1c',
          border: '1px solid #2a2a2f',
          borderRadius: '8px'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            margin: '0 0 0.5rem 0'
          }}>
            Current Settings
          </h3>
          <div style={{ color: '#6c7293', fontSize: '0.875rem' }}>
            <div>Warmup: {DurationPreferencesStorage.formatDuration(warmupDuration)} per exercise</div>
            <div>Cooldown: {DurationPreferencesStorage.formatDuration(cooldownDuration)} per stretch</div>
          </div>
        </div>
      </div>
    </div>
  );
}