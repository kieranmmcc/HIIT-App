import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'secondary',
  size = 'medium'
}) => {
  const { isInstallable, isInstalled, installApp, getInstallInstructions } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled) return null; // Don't show if already installed

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await installApp();
      if (!success) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const instructions = getInstallInstructions();

  const getButtonStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      textAlign: 'center' as const
    };

    const sizeStyles = {
      small: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      medium: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
      large: { padding: '1rem 2rem', fontSize: '1.125rem' }
    };

    const variantStyles = variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, #2ed573 0%, #20bf6b 100%)',
          color: 'black',
          boxShadow: '0 4px 16px rgba(46, 213, 115, 0.3)'
        }
      : {
          background: 'transparent',
          border: '2px solid #ff4757',
          color: '#ff4757'
        };

    return { ...baseStyles, ...sizeStyles[size], ...variantStyles };
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        style={getButtonStyles()}
        onMouseEnter={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(46, 213, 115, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          } else {
            e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(46, 213, 115, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          } else {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {isInstallable ? 'Install App' : 'Get App'}
      </button>

      {/* Instructions Modal */}
      {showInstructions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#131315',
            border: '2px solid #2a2a2f',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            color: 'white'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: '#ff4757',
                fontSize: '1.25rem',
                fontWeight: '600',
                margin: 0
              }}>
                Install HIIT App
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#b8bcc8',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#b8bcc8', marginBottom: '1rem' }}>
                Install the app for quick access and offline workouts!
              </p>

              <div style={{
                background: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid #ff4757',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  color: '#ff4757',
                  fontSize: '1rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0'
                }}>
                  On {instructions.platform}:
                </h4>
                <ol style={{ color: '#b8bcc8', margin: 0, paddingLeft: '1.25rem' }}>
                  {instructions.steps.map((step, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowInstructions(false)}
                style={{
                  background: 'transparent',
                  border: '2px solid #3a3a40',
                  borderRadius: '8px',
                  color: '#b8bcc8',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>
              <button
                onClick={() => setShowInstructions(false)}
                style={{
                  background: 'linear-gradient(135deg, #ff4757 0%, #ff6b35 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'black',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;