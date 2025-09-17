import React from 'react';
import type { Equipment } from '../types/equipment';
import EquipmentCard from './EquipmentCard';
import { EquipmentStorage } from '../utils/equipmentStorage';
import PWAInstallButton from './PWAInstallButton';

interface EquipmentSelectionProps {
  equipment: Equipment[];
  onEquipmentUpdate: (equipment: Equipment[]) => void;
  onContinue: (equipment: Equipment[]) => void;
}

const EquipmentSelection: React.FC<EquipmentSelectionProps> = ({
  equipment,
  onEquipmentUpdate,
  onContinue
}) => {
  const handleEquipmentToggle = (id: string) => {
    const updatedEquipment = equipment.map(item =>
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    );
    onEquipmentUpdate(updatedEquipment);
  };

  const handleContinue = () => {
    // Save owned equipment to storage
    const ownedEquipmentIds = equipment.filter(eq => eq.isSelected).map(eq => eq.id);
    EquipmentStorage.updateOwnedEquipment(ownedEquipmentIds);

    // Also save as workout selection so it persists on refresh
    EquipmentStorage.updateWorkoutSelection(ownedEquipmentIds);

    onContinue(equipment);
  };

  const selectedCount = equipment.filter(item => item.isSelected).length;

  // Group equipment by category
  const groupedEquipment = equipment.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, Equipment[]>);

  const categoryNames = {
    core: 'Essential',
    weights: 'Weights',
    resistance: 'Resistance',
    cardio: 'Cardio',
    accessories: 'Equipment & Accessories'
  };

  const categoryOrder = ['core', 'weights', 'resistance', 'cardio', 'accessories'];

  return (
    <div className="equipment-selection fade-in" style={{ minHeight: '100vh', color: 'white' }}>
      <div className="container">
        <header className="equipment-header" style={{ padding: '2rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ color: 'white', marginBottom: '1rem' }}>Set Up Your Home Gym</h1>
              <p style={{ color: '#b8bcc8' }}>Select all the equipment you own. You can choose which to use for each workout later.</p>
            </div>
            <PWAInstallButton size="small" />
          </div>
          <div className="selection-counter" style={{ background: '#131315', padding: '0.75rem 1.5rem', borderRadius: '16px', border: '2px solid #2a2a2f', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <span className="count" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4757' }}>{selectedCount}</span>
            <span className="label" style={{ color: '#b8bcc8' }}>of {equipment.length} equipment selected</span>
          </div>
        </header>

        {categoryOrder.map(categoryKey => {
          const categoryEquipment = groupedEquipment[categoryKey];
          if (!categoryEquipment) return null;

          return (
            <div key={categoryKey} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                color: '#ff4757',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {categoryNames[categoryKey as keyof typeof categoryNames]}
              </h2>
              <div className="equipment-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {categoryEquipment.map(item => (
                  <EquipmentCard
                    key={item.id}
                    equipment={item}
                    onToggle={handleEquipmentToggle}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div className="equipment-actions" style={{ textAlign: 'center' }}>
          <button className="btn-primary" onClick={handleContinue} style={{ background: 'linear-gradient(135deg, #ff4757 0%, #ff6b35 100%)', color: 'black', padding: '0.875rem 2rem', fontSize: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Save & Continue
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
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
          <p className="help-text" style={{ fontSize: '0.875rem', color: '#6c7293', margin: '1rem 0 0 0' }}>
            This saves your equipment collection. For each workout, you can choose which items to use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSelection;