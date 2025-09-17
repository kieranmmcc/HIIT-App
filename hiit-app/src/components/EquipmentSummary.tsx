import React from 'react';
import type { Equipment } from '../types/equipment';

interface EquipmentSummaryProps {
  selectedEquipment: Equipment[];
  onEdit: () => void;
}

const EquipmentSummary: React.FC<EquipmentSummaryProps> = ({ selectedEquipment, onEdit }) => {
  const displayedEquipment = selectedEquipment.slice(0, 4); // Show first 4
  const remainingCount = selectedEquipment.length - 4;

  return (
    <div style={{
      background: '#131315',
      border: '2px solid #2a2a2f',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <h3 style={{
          color: '#ff4757',
          fontSize: '0.875rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: 0
        }}>
          Your Equipment ({selectedEquipment.length})
        </h3>
        <button
          onClick={onEdit}
          style={{
            background: 'transparent',
            border: '1px solid #3a3a40',
            borderRadius: '6px',
            color: '#b8bcc8',
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ff4757';
            e.currentTarget.style.color = '#ff4757';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#3a3a40';
            e.currentTarget.style.color = '#b8bcc8';
          }}
        >
          Edit
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {displayedEquipment.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: item.isRequired ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
              border: `1px solid ${item.isRequired ? '#2ed573' : '#ff4757'}`,
              borderRadius: '20px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              color: 'white'
            }}
          >
            <img
              src={item.svgUrl}
              alt={item.name}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '3px',
                objectFit: 'cover'
              }}
            />
            <span>{item.name}</span>
          </div>
        ))}

        {remainingCount > 0 && (
          <div style={{
            background: 'rgba(184, 188, 200, 0.1)',
            border: '1px solid #6c7293',
            borderRadius: '20px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            color: '#b8bcc8'
          }}>
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentSummary;