import React, { useState } from 'react'
import EquipmentSelection from './components/EquipmentSelection'
import WorkoutSetup from './components/WorkoutSetup'
import WorkoutPreview from './components/WorkoutPreview'
import ActiveWorkout from './components/ActiveWorkout'
import type { Equipment } from './types/equipment'
import type { WorkoutSettings } from './types/workout'
import { equipmentData } from './data/equipment'
import './styles/EquipmentSelection.css'

type AppScreen = 'equipment' | 'workout-setup' | 'workout-preview' | 'workout-active'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('equipment')
  const [equipment, setEquipment] = useState<Equipment[]>(equipmentData)
  const [currentWorkoutSettings, setCurrentWorkoutSettings] = useState<WorkoutSettings | null>(null)

  const handleEquipmentContinue = (selectedEquipment: Equipment[]) => {
    setEquipment(selectedEquipment)
    setCurrentScreen('workout-setup')
  }

  const handleBackToEquipment = () => {
    setCurrentScreen('equipment')
  }

  const handleStartWorkout = (settings: WorkoutSettings) => {
    setCurrentWorkoutSettings(settings)
    setCurrentScreen('workout-preview')
  }

  const handlePreviewToActive = () => {
    setCurrentScreen('workout-active')
  }

  const handleBackToSetup = () => {
    setCurrentScreen('workout-setup')
  }

  const handleWorkoutComplete = () => {
    setCurrentScreen('workout-setup')
  }

  const handleWorkoutExit = () => {
    setCurrentScreen('workout-preview')
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
          onStartWorkout={handlePreviewToActive}
          onBack={handleBackToSetup}
        />
      )}

      {currentScreen === 'workout-active' && currentWorkoutSettings && (
        <ActiveWorkout
          workoutSettings={currentWorkoutSettings}
          onComplete={handleWorkoutComplete}
          onExit={handleWorkoutExit}
        />
      )}
    </div>
  )
}

export default App
