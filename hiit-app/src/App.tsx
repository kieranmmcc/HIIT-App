import React, { useState, useEffect } from 'react'
import EquipmentSelection from './components/EquipmentSelection'
import WorkoutSetup from './components/WorkoutSetup'
import WorkoutPreview from './components/WorkoutPreview'
import ActiveWorkout from './components/ActiveWorkout'
import type { Equipment } from './types/equipment'
import type { WorkoutSettings } from './types/workout'
import type { GeneratedWorkout } from './types/exercise'
import { equipmentData } from './data/equipment'
import { EquipmentStorage } from './utils/equipmentStorage'
import './styles/EquipmentSelection.css'

type AppScreen = 'equipment' | 'workout-setup' | 'workout-preview' | 'workout-active'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('equipment')
  const [equipment, setEquipment] = useState<Equipment[]>(equipmentData)
  const [currentWorkoutSettings, setCurrentWorkoutSettings] = useState<WorkoutSettings | null>(null)
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null)

  // Check for saved equipment preferences on app startup
  useEffect(() => {
    const preferences = EquipmentStorage.getPreferences();

    // Check if user has completed the initial equipment setup
    if (preferences.hasCompletedSetup) {
      // User has previously configured equipment, load it and go to workout setup
      const updatedEquipment = equipmentData.map(item => ({
        ...item,
        isSelected: preferences.selectedForWorkout.includes(item.id)
      }));

      setEquipment(updatedEquipment);
      setCurrentScreen('workout-setup');
    }
    // If hasCompletedSetup is false/undefined, stay on equipment selection screen
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEquipmentContinue = (selectedEquipment: Equipment[]) => {
    setEquipment(selectedEquipment)
    setCurrentScreen('workout-setup')
    setTimeout(scrollToTop, 50) // Small delay to ensure screen change renders first
  }

  const handleBackToEquipment = () => {
    // When explicitly going back to equipment, we want to show the current state
    // The equipment selection component will handle its own state
    setCurrentScreen('equipment')
    setTimeout(scrollToTop, 50)
  }

  const handleStartWorkout = (settings: WorkoutSettings) => {
    setCurrentWorkoutSettings(settings)
    setCurrentScreen('workout-preview')
    setTimeout(scrollToTop, 50)
  }

  const handlePreviewToActive = (workout: GeneratedWorkout) => {
    setGeneratedWorkout(workout)
    setCurrentScreen('workout-active')
    setTimeout(scrollToTop, 50)
  }

  const handleBackToSetup = () => {
    setGeneratedWorkout(null) // Clear saved workout when going back to setup
    setCurrentScreen('workout-setup')
    setTimeout(scrollToTop, 50)
  }

  const handleWorkoutComplete = () => {
    setGeneratedWorkout(null) // Clear saved workout when workout is complete
    setCurrentScreen('workout-setup')
    setTimeout(scrollToTop, 50)
  }

  const handleWorkoutExit = () => {
    setCurrentScreen('workout-preview')
    setTimeout(scrollToTop, 50)
  }

  const handleEquipmentUpdate = (updatedEquipment: Equipment[]) => {
    setEquipment(updatedEquipment)
  }

  return (
    <div className="app" style={{ minHeight: '100vh', background: '#0a0a0b' }}>
      {currentScreen === 'equipment' && (
        <EquipmentSelection
          equipment={equipment}
          onEquipmentUpdate={handleEquipmentUpdate}
          onContinue={handleEquipmentContinue}
        />
      )}

      {currentScreen === 'workout-setup' && (
        <WorkoutSetup
          selectedEquipment={equipment}
          onBack={handleBackToEquipment}
          onStartWorkout={handleStartWorkout}
        />
      )}

      {currentScreen === 'workout-preview' && currentWorkoutSettings && (
        <WorkoutPreview
          workoutSettings={currentWorkoutSettings}
          existingWorkout={generatedWorkout}
          onStartWorkout={handlePreviewToActive}
          onBack={handleBackToSetup}
        />
      )}

      {currentScreen === 'workout-active' && generatedWorkout && (
        <ActiveWorkout
          workout={generatedWorkout}
          onComplete={handleWorkoutComplete}
          onExit={handleWorkoutExit}
        />
      )}
    </div>
  )
}

export default App
