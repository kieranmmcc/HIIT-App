import React from 'react';
import type { Equipment } from '../types/equipment';

interface EquipmentCardProps {
  equipment: Equipment;
  onToggle: (id: string) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onToggle }) => {
  const handleClick = () => {
    if (!equipment.isRequired) {
      onToggle(equipment.id);
    }
  };

  const cardStyle = {
    background: equipment.isSelected ? '#1c1c20' : '#131315',
    border: equipment.isSelected
      ? '2px solid #ff4757'
      : equipment.isRequired
      ? '2px solid #2ed573'
      : '2px solid #2a2a2f',
    borderRadius: '16px',
    padding: '1.5rem',
    cursor: equipment.isRequired ? 'default' : 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    minHeight: '300px',
    transition: 'all 0.3s ease',
    boxShadow: equipment.isSelected ? '0 8px 24px rgba(255, 71, 87, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.4)'
  };

  const iconStyle = {
    width: '192px',
    height: '192px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: equipment.isSelected ? 'rgba(255, 71, 87, 0.1)' : equipment.isRequired ? 'rgba(46, 213, 115, 0.1)' : '#252529',
    borderRadius: '16px',
    border: equipment.isSelected ? '3px solid #ff4757' : equipment.isRequired ? '3px solid #2ed573' : '2px solid #2a2a2f',
    flexShrink: 0
  };

  return (
    <div
      className={`equipment-card ${equipment.isSelected ? 'selected' : ''} ${
        equipment.isRequired ? 'required' : ''
      }`}
      onClick={handleClick}
      style={cardStyle}
    >
      <div className="equipment-icon" style={iconStyle}>
        <img
          src={equipment.svgUrl}
          alt={equipment.name}
          style={{
            width: '176px',
            height: '176px',
            borderRadius: '12px',
            objectFit: 'cover',
            opacity: equipment.isSelected || equipment.isRequired ? '1' : '0.85'
          }}
        />
      </div>
      <div className="equipment-info" style={{ textAlign: 'center', width: '100%' }}>
        <h3 className="equipment-name" style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>
          {equipment.name}
        </h3>
        <p className="equipment-description" style={{ fontSize: '0.9rem', color: '#b8bcc8', margin: 0, lineHeight: '1.4' }}>
          {equipment.description}
        </p>
      </div>
      <div className="equipment-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {equipment.isRequired && (
          <span className="required-badge" style={{ background: '#2ed573', color: '#0a0a0b', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Required
          </span>
        )}
        {equipment.isSelected && !equipment.isRequired && (
          <div className="checkmark" style={{ color: '#ff4757', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '50%', border: '2px solid #ff4757' }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentCard;