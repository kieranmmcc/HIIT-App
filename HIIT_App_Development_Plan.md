# HIIT App Development Plan

## Project Overview

This document outlines the complete development plan for a High-Intensity Interval Training (HIIT) mobile application that auto-generates workouts of a set time and includes a timer function with audio/visual cues for exercise and rest periods.

## Core Features & Requirements

### Essential Features
- **Auto-generate HIIT workouts** with customizable duration (15, 20, 30, 45 minutes)
- **Interactive timer** with exercise/rest intervals
- **Visual and audio cues** for transitions between exercises and rest periods
- **Exercise library** with descriptions and demonstrations
- **Workout customization** (difficulty levels, focus areas, equipment requirements)

### User Experience Goals
- **Simple workout setup** - Duration selection → Difficulty selection → Start workout
- **Clear timer display** showing current exercise and countdown
- **Progress tracking** within workout sessions
- **Pause/resume functionality** for interruptions

## Technology Stack

### Recommended Primary Stack
- **Frontend:** React Native (cross-platform mobile development)
- **State Management:** Context API or Zustand for lightweight state management
- **Timer/Audio:** React Native's built-in timers + expo-av for sound effects
- **Storage:** AsyncStorage for user preferences and workout history
- **Styling:** Styled Components or NativeWind for consistent UI

### Alternative Technology Options
- **Flutter** for cross-platform development
- **Native iOS/Android** for platform-specific optimization

## User Interface Design

### Screen Structure
1. **Home Screen**
   - Quick workout start button
   - Settings access
   - Recent workout history (future enhancement)

2. **Workout Setup Screen**
   - Duration selection (15, 20, 30, 45 minutes)
   - Difficulty level selection
   - Equipment availability selection
   - Focus area selection (optional)

3. **Active Workout Screen**
   - Large, clear timer display (countdown format)
   - Current exercise name and description
   - Progress indicators (time remaining, exercises completed)
   - Prominent pause/play controls
   - Next exercise preview

4. **Workout Complete Screen**
   - Workout summary and statistics
   - Save workout option
   - Option to start another workout

5. **Settings Screen**
   - Sound preferences (volume, voice cues on/off)
   - Timer interval customization
   - Exercise library access

### Key UI Components
- **Timer Display:** Large, clear countdown timer with color coding
- **Exercise Card:** Current exercise name, description, and visual guide
- **Progress Indicators:** Visual representation of workout progress
- **Control Buttons:** Pause, play, skip, and stop functionality
- **Status Bar:** Current phase (work/rest), round number, total progress

## Data Models & Architecture

### Exercise Model
```javascript
{
  id: string,
  name: string,
  description: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  muscleGroups: string[],
  equipment: string[],
  defaultDuration: number // in seconds
}
```

### Workout Generation Logic
- **Duration-based rounds:** Calculate total rounds based on selected duration
  - Example: 20 minutes = 4 rounds of 5 minutes each
- **Round structure:** Each round contains 4 exercises
  - 45 seconds work + 15 seconds rest per exercise
  - 60 seconds break between rounds
- **Smart exercise selection:**
  - Avoid consecutive exercises targeting same muscle groups
  - Balance upper body, lower body, and core exercises
  - Respect equipment availability constraints
- **Difficulty scaling:**
  - Beginner: 30s work, 30s rest
  - Intermediate: 45s work, 15s rest
  - Advanced: 50s work, 10s rest

### Workout State Management
```javascript
{
  exercises: Exercise[],
  currentExerciseIndex: number,
  currentPhase: 'work' | 'rest' | 'round_break',
  timeRemaining: number,
  isActive: boolean,
  isPaused: boolean,
  totalDuration: number,
  completedExercises: number,
  currentRound: number,
  totalRounds: number
}
```

## Timer Implementation & Audio/Visual Cues

### Timer Architecture
- **Core timer:** Use `setInterval` with 100ms updates for smooth display
- **Background support:** Handle app state changes to maintain timer accuracy
- **Auto-progression:** Automatically advance between exercises and rest periods
- **Precision:** Account for JavaScript timer drift with timestamp-based calculations

### Audio Cue System
- **Exercise transitions:** "3, 2, 1, Go!" countdown for exercise start
- **Rest periods:** "Rest" announcement with calming tone
- **Round completion:** Distinctive sound for round breaks
- **Voice announcements:** Optional exercise name pronunciation
- **Customizable volume:** User-controlled audio levels
- **Sound library:** Pre-recorded professional audio cues

### Visual Cue Design
- **Color-coded timer:**
  - Green: Active exercise period
  - Yellow: Rest period
  - Red: Final 10-second countdown
- **Screen effects:**
  - Flash animation on transitions
  - Haptic feedback/vibration support
  - Progress ring animation around timer
- **Background dynamics:**
  - Color gradients matching current phase
  - Subtle animations to maintain engagement
- **Status indicators:**
  - Clear phase labels ("WORK", "REST", "ROUND BREAK")
  - Progress bars for individual exercises and overall workout

## Implementation Instructions for AI

### Recommended Approach: Progressive Web App (PWA)
**Why PWA:**
- Easy family sharing via URL link
- Free hosting on GitHub Pages/Netlify/Vercel
- Works offline and can be "installed" like mobile app
- No app store approval needed
- Works on all devices (phone, tablet, desktop)

### Technology Stack
```
Frontend: React + TypeScript + Vite
Styling: Tailwind CSS or styled-components
Audio: Web Audio API + HTML5 Audio
Storage: localStorage for persistence
PWA: Service Worker for offline capability
Deployment: GitHub Pages, Netlify, or Vercel (all free)
```

### Core Components to Build

#### 1. Timer Component
```typescript
interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  currentPhase: 'work' | 'rest' | 'roundBreak';
  currentExercise: Exercise;
  currentExerciseIndex: number;
}
```
- Use `setInterval` with 100ms updates
- Play audio cues at transitions
- Visual countdown with color coding
- Auto-advance between exercises

#### 2. Smart Workout Generator
```typescript
interface WorkoutHistory {
  date: string;
  exercises: Exercise[];
  muscleGroupsTargeted: string[];
  equipment: string[];
}

interface UserEquipment {
  available: string[]; // ['bodyweight', 'dumbbells', 'resistance_bands', etc.]
  savedDate: string;
}

function generateWorkout(
  duration: number,
  difficulty: 'easy' | 'medium' | 'hard',
  userEquipment: string[],
  workoutHistory: WorkoutHistory[]
): Workout {
  // Algorithm:
  // 1. Get recent workouts (last 3 days)
  // 2. Identify overworked muscle groups to avoid
  // 3. Filter exercises by available equipment
  // 4. Calculate total exercises needed based on duration
  // 5. Smart selection prioritizing underworked muscle groups
  // 6. Balance workout across body parts
  // 7. Set work/rest intervals based on difficulty

  const recentWorkouts = getRecentWorkouts(workoutHistory, 3);
  const overworkedMuscles = analyzeOverworkedMuscles(recentWorkouts);
  const availableExercises = filterByEquipment(exercises, userEquipment);

  return selectBalancedExercises(
    availableExercises,
    duration,
    overworkedMuscles,
    difficulty
  );
}

// Helper functions for smart generation
function getRecentWorkouts(history: WorkoutHistory[], days: number): WorkoutHistory[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return history.filter(workout =>
    new Date(workout.date) >= cutoffDate
  );
}

function analyzeOverworkedMuscles(recentWorkouts: WorkoutHistory[]): string[] {
  const muscleCount: Record<string, number> = {};

  recentWorkouts.forEach(workout => {
    workout.muscleGroupsTargeted.forEach(muscle => {
      muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
    });
  });

  // Return muscles worked 2+ times in recent workouts
  return Object.keys(muscleCount).filter(muscle => muscleCount[muscle] >= 2);
}
```

#### 3. Equipment Setup & Exercise Database
```typescript
// Equipment options for users to select
const EQUIPMENT_OPTIONS = [
  'bodyweight',
  'dumbbells',
  'resistance_bands',
  'kettlebell',
  'medicine_ball',
  'jump_rope',
  'yoga_mat',
  'pull_up_bar'
];

interface Exercise {
  id: string;
  name: string;
  instructions: string;
  muscleGroups: string[]; // ['chest', 'shoulders', 'legs', 'core', 'back', 'arms']
  difficulty: number; // 1-5 scale
  equipment: string[]; // Required equipment, ['bodyweight'] for none
  primaryMuscle: string; // Main muscle group for smart balancing
}

// Complete Exercise Database (50+ exercises)
const EXERCISE_DATABASE: Exercise[] = [
  // BODYWEIGHT EXERCISES
  // Upper Body
  {
    id: '1',
    name: 'Push-ups',
    instructions: 'Start in plank position, lower chest to floor, push back up',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    primaryMuscle: 'chest',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '2',
    name: 'Pike Push-ups',
    instructions: 'Downward dog position, lower head toward floor, push up',
    muscleGroups: ['shoulders', 'arms'],
    primaryMuscle: 'shoulders',
    difficulty: 3,
    equipment: ['bodyweight']
  },
  {
    id: '3',
    name: 'Tricep Dips',
    instructions: 'Hands on chair/couch, lower body down, push back up',
    muscleGroups: ['arms', 'shoulders'],
    primaryMuscle: 'arms',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '4',
    name: 'Diamond Push-ups',
    instructions: 'Push-ups with hands in diamond shape under chest',
    muscleGroups: ['chest', 'arms'],
    primaryMuscle: 'arms',
    difficulty: 4,
    equipment: ['bodyweight']
  },

  // Lower Body
  {
    id: '5',
    name: 'Squats',
    instructions: 'Feet shoulder-width apart, lower hips back, stand up',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 1,
    equipment: ['bodyweight']
  },
  {
    id: '6',
    name: 'Jump Squats',
    instructions: 'Regular squat, explode up jumping, land softly',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 3,
    equipment: ['bodyweight']
  },
  {
    id: '7',
    name: 'Lunges',
    instructions: 'Step forward, lower back knee, return to standing',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '8',
    name: 'Reverse Lunges',
    instructions: 'Step backward, lower knee, return to standing',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '9',
    name: 'Bulgarian Split Squats',
    instructions: 'Back foot elevated, lower into lunge position',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 4,
    equipment: ['bodyweight']
  },
  {
    id: '10',
    name: 'Single Leg Glute Bridges',
    instructions: 'Lying down, one leg up, lift hips with other leg',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 3,
    equipment: ['bodyweight']
  },

  // Core
  {
    id: '11',
    name: 'Plank',
    instructions: 'Hold push-up position, keep body straight',
    muscleGroups: ['core', 'shoulders'],
    primaryMuscle: 'core',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '12',
    name: 'Mountain Climbers',
    instructions: 'Plank position, alternate bringing knees to chest',
    muscleGroups: ['core', 'shoulders'],
    primaryMuscle: 'core',
    difficulty: 3,
    equipment: ['bodyweight']
  },
  {
    id: '13',
    name: 'Russian Twists',
    instructions: 'Seated, lean back, rotate torso side to side',
    muscleGroups: ['core'],
    primaryMuscle: 'core',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '14',
    name: 'Bicycle Crunches',
    instructions: 'Lying down, alternate elbow to opposite knee',
    muscleGroups: ['core'],
    primaryMuscle: 'core',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '15',
    name: 'Dead Bug',
    instructions: 'Lying down, opposite arm and leg extensions',
    muscleGroups: ['core'],
    primaryMuscle: 'core',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '16',
    name: 'Side Plank',
    instructions: 'Plank on side, hold body straight',
    muscleGroups: ['core'],
    primaryMuscle: 'core',
    difficulty: 3,
    equipment: ['bodyweight']
  },

  // Cardio/Full Body
  {
    id: '17',
    name: 'Burpees',
    instructions: 'Squat, jump back to plank, push-up, jump forward, jump up',
    muscleGroups: ['legs', 'chest', 'shoulders', 'core'],
    primaryMuscle: 'legs',
    difficulty: 4,
    equipment: ['bodyweight']
  },
  {
    id: '18',
    name: 'Jumping Jacks',
    instructions: 'Jump feet apart while raising arms overhead',
    muscleGroups: ['legs', 'shoulders'],
    primaryMuscle: 'legs',
    difficulty: 1,
    equipment: ['bodyweight']
  },
  {
    id: '19',
    name: 'High Knees',
    instructions: 'Run in place, bring knees up to hip level',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '20',
    name: 'Butt Kickers',
    instructions: 'Run in place, kick heels to glutes',
    muscleGroups: ['legs'],
    primaryMuscle: 'legs',
    difficulty: 2,
    equipment: ['bodyweight']
  },
  {
    id: '21',
    name: 'Star Jumps',
    instructions: 'Jump spreading arms and legs into star shape',
    muscleGroups: ['legs', 'shoulders', 'core'],
    primaryMuscle: 'legs',
    difficulty: 2,
    equipment: ['bodyweight']
  },

  // DUMBBELL EXERCISES
  {
    id: '22',
    name: 'Dumbbell Squats',
    instructions: 'Hold dumbbells, squat down, stand back up',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 3,
    equipment: ['dumbbells']
  },
  {
    id: '23',
    name: 'Dumbbell Deadlifts',
    instructions: 'Hold dumbbells, hinge at hips, lower weights, stand up',
    muscleGroups: ['legs', 'back', 'core'],
    primaryMuscle: 'legs',
    difficulty: 3,
    equipment: ['dumbbells']
  },
  {
    id: '24',
    name: 'Dumbbell Chest Press',
    instructions: 'Lying down, press dumbbells up from chest',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    primaryMuscle: 'chest',
    difficulty: 2,
    equipment: ['dumbbells']
  },
  {
    id: '25',
    name: 'Dumbbell Rows',
    instructions: 'Bent over, pull dumbbells to chest',
    muscleGroups: ['back', 'arms'],
    primaryMuscle: 'back',
    difficulty: 3,
    equipment: ['dumbbells']
  },
  {
    id: '26',
    name: 'Dumbbell Shoulder Press',
    instructions: 'Press dumbbells overhead from shoulder height',
    muscleGroups: ['shoulders', 'arms'],
    primaryMuscle: 'shoulders',
    difficulty: 3,
    equipment: ['dumbbells']
  },
  {
    id: '27',
    name: 'Dumbbell Thrusters',
    instructions: 'Squat with dumbbells, stand and press overhead',
    muscleGroups: ['legs', 'shoulders', 'core'],
    primaryMuscle: 'legs',
    difficulty: 4,
    equipment: ['dumbbells']
  },

  // RESISTANCE BAND EXERCISES
  {
    id: '28',
    name: 'Resistance Band Rows',
    instructions: 'Pull band to chest, squeeze shoulder blades',
    muscleGroups: ['back', 'arms'],
    primaryMuscle: 'back',
    difficulty: 2,
    equipment: ['resistance_bands']
  },
  {
    id: '29',
    name: 'Band Pull Aparts',
    instructions: 'Hold band, pull apart at chest level',
    muscleGroups: ['back', 'shoulders'],
    primaryMuscle: 'back',
    difficulty: 1,
    equipment: ['resistance_bands']
  },
  {
    id: '30',
    name: 'Band Squats',
    instructions: 'Step on band, hold handles, squat with resistance',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 2,
    equipment: ['resistance_bands']
  },
  {
    id: '31',
    name: 'Band Chest Press',
    instructions: 'Band around back, press forward',
    muscleGroups: ['chest', 'shoulders'],
    primaryMuscle: 'chest',
    difficulty: 2,
    equipment: ['resistance_bands']
  },

  // KETTLEBELL EXERCISES
  {
    id: '32',
    name: 'Kettlebell Swings',
    instructions: 'Hip hinge movement, swing kettlebell to shoulder height',
    muscleGroups: ['legs', 'back', 'core'],
    primaryMuscle: 'legs',
    difficulty: 3,
    equipment: ['kettlebell']
  },
  {
    id: '33',
    name: 'Kettlebell Goblet Squats',
    instructions: 'Hold kettlebell at chest, squat down',
    muscleGroups: ['legs', 'core'],
    primaryMuscle: 'legs',
    difficulty: 3,
    equipment: ['kettlebell']
  },
  {
    id: '34',
    name: 'Kettlebell Turkish Get-ups',
    instructions: 'Complex movement from lying to standing with kettlebell',
    muscleGroups: ['core', 'shoulders', 'legs'],
    primaryMuscle: 'core',
    difficulty: 5,
    equipment: ['kettlebell']
  },

  // PULL-UP BAR EXERCISES
  {
    id: '35',
    name: 'Pull-ups',
    instructions: 'Hang from bar, pull body up until chin over bar',
    muscleGroups: ['back', 'arms'],
    primaryMuscle: 'back',
    difficulty: 4,
    equipment: ['pull_up_bar']
  },
  {
    id: '36',
    name: 'Chin-ups',
    instructions: 'Underhand grip, pull body up',
    muscleGroups: ['back', 'arms'],
    primaryMuscle: 'back',
    difficulty: 4,
    equipment: ['pull_up_bar']
  },
  {
    id: '37',
    name: 'Hanging Knee Raises',
    instructions: 'Hang from bar, bring knees to chest',
    muscleGroups: ['core'],
    primaryMuscle: 'core',
    difficulty: 3,
    equipment: ['pull_up_bar']
  },

  // JUMP ROPE EXERCISES
  {
    id: '38',
    name: 'Jump Rope',
    instructions: 'Basic jump rope rhythm',
    muscleGroups: ['legs', 'shoulders'],
    primaryMuscle: 'legs',
    difficulty: 2,
    equipment: ['jump_rope']
  },
  {
    id: '39',
    name: 'Jump Rope Double Unders',
    instructions: 'Two rope passes per jump',
    muscleGroups: ['legs', 'shoulders'],
    primaryMuscle: 'legs',
    difficulty: 4,
    equipment: ['jump_rope']
  },

  // MEDICINE BALL EXERCISES
  {
    id: '40',
    name: 'Medicine Ball Slams',
    instructions: 'Lift ball overhead, slam down with force',
    muscleGroups: ['core', 'shoulders', 'back'],
    primaryMuscle: 'core',
    difficulty: 3,
    equipment: ['medicine_ball']
  },
  {
    id: '41',
    name: 'Medicine Ball Russian Twists',
    instructions: 'Seated, hold ball, rotate side to side',
    muscleGroups: ['core'],
    primaryMuscle: 'core',
    difficulty: 3,
    equipment: ['medicine_ball']
  }
];

// EXERCISE SOURCES FOR REFERENCE:
// - Nike Training Club app exercise library
// - 7 Minute Workout app exercises
// - ACE Fitness exercise database (acefitness.org)
// - Bodybuilding.com exercise guide
// - Freeletics bodyweight exercises
// - CrossFit movement library
```

#### 4. Audio System
- Use Web Audio API or HTML5 Audio
- Pre-load sound files for transitions
- Text-to-speech for exercise names (optional)
- "3, 2, 1, GO!" countdown
- "Rest" announcements

#### 5. PWA Features
- Add `manifest.json` for installability
- Service worker for offline functionality
- Cache exercise data and audio files

### File Structure
```
src/
├── components/
│   ├── Timer.tsx
│   ├── WorkoutSetup.tsx
│   ├── ExerciseDisplay.tsx
│   └── WorkoutComplete.tsx
├── hooks/
│   ├── useTimer.ts
│   ├── useAudio.ts
│   └── useWorkoutGenerator.ts
├── data/
│   ├── exercises.json
│   └── sounds/
├── types/
│   └── workout.ts
└── App.tsx
```

### Key Implementation Details

#### Timer Logic
```typescript
// Use Date.now() to prevent drift
const startTime = Date.now();
const updateTimer = () => {
  const elapsed = Date.now() - startTime;
  const remaining = totalTime - elapsed;
  setTimeRemaining(remaining);
};
```

#### Visual Equipment Setup (First Time Only)
```typescript
interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  image: string; // Path to equipment image
  category: 'weights' | 'resistance' | 'cardio' | 'accessories';
  isSelected: boolean;
}

const EQUIPMENT_GALLERY: EquipmentItem[] = [
  {
    id: 'bodyweight',
    name: 'Bodyweight Only',
    description: 'No equipment needed',
    image: '/icons/bodyweight.jpg',
    category: 'weights',
    isSelected: true // Always enabled, can't be disabled
  },
  {
    id: 'dumbbells',
    name: 'Dumbbells',
    description: 'Any weight, adjustable preferred',
    image: '/icons/dumbbells.jpg',
    category: 'weights',
    isSelected: false
  },
  {
    id: 'resistance_bands',
    name: 'Resistance Bands',
    description: 'Loop bands or tube bands',
    image: '/icons/resistance_bands.jpg',
    category: 'resistance',
    isSelected: false
  }
  // ... more equipment items
];
```

**Setup Flow:**
1. **Welcome Screen:** "Let's personalize your workouts!"
2. **Equipment Gallery:** Grid of equipment cards with images
   - Tap to select/deselect (visual feedback with checkmarks)
   - "Bodyweight Only" always selected and grayed out
   - Categories: Weights, Resistance, Cardio, Accessories
3. **Confirmation:** "Great! We'll create workouts using: [selected items]"
4. **Save & Continue:** Stored permanently, can change in settings

#### Workout Flow
1. **Quick Start:** Duration (15/20/30/45 min) and difficulty selection
2. **Workout Generation:** Uses saved equipment preferences
3. **Countdown:** 3-2-1 preparation with first exercise preview
4. **Exercise Loop:** Work → Rest → Next Exercise with smart progression
5. **Round Breaks:** Longer rest between exercise sets with progress update
6. **Completion:** Summary, save workout, option to restart

#### Responsive Design
- Large timer display (mobile-first)
- Clear exercise names and instructions
- Prominent pause/play buttons
- Progress indicators
- Works in portrait and landscape

### How Users Install the App on Their Phones

**iPhone (Safari):**
1. Open the website link in Safari browser
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Choose a name for the app and tap "Add"
5. The HIIT app icon will appear on your home screen like any other app

**Android (Chrome):**
1. Open the website link in Chrome browser
2. Tap the three-dot menu (⋮) in the top right
3. Tap "Add to Home Screen" or "Install App"
4. Confirm the installation
5. The app will appear in your app drawer and home screen

**What Happens After Installation:**
- Opens like a native mobile app (no browser bars)
- Works completely offline after first visit
- Saves all your preferences and workout history
- Updates automatically when you visit
- Can send workout reminders (if enabled)

### Data Storage & Persistence
The app will save locally on each device:
- **Equipment Setup:** Available equipment selection (saved permanently)
- **Workout History:** Last 30 workouts with dates, exercises, and muscle groups worked
- **User Preferences:** Difficulty level, workout duration defaults
- **Smart Generation Data:** Muscle group usage tracking for balanced workouts
- **Custom Timer Settings:** Work/rest interval preferences
- **Audio/Sound Preferences:** Volume levels and voice cue settings

**Smart Features Enabled by Data Storage:**
- Equipment-based exercise filtering
- Muscle group balancing (avoids overworking same muscles if worked 2+ times in last 3 days)
- Personalized workout difficulty progression
- Workout history analytics

**Note:** Data stays on each individual device. If someone wants to use it on multiple devices, they'll need to install it on each one separately.

### Deployment Instructions for Developer
1. Build with `npm run build`
2. Deploy to GitHub Pages, Netlify, or Vercel
3. Enable HTTPS for PWA features
4. Test on multiple devices
5. Share URL with family members

### Essential Features List
- [✓] Workout duration selection (15, 20, 30, 45 minutes)
- [✓] Difficulty levels (easy, medium, hard)
- [✓] **Smart workout generation with equipment filtering**
- [✓] **Visual equipment setup gallery with high-quality images**
- [✓] **Equipment setup and preferences (saved permanently)**
- [✓] **Comprehensive exercise database (120 high-intensity exercises)**
- [✓] **Workout history tracking with muscle group analysis**
- [✓] **Smart muscle group balancing (avoids overworked muscles from last 3 days)**
- [✓] Visual countdown timer with color coding
- [✓] Audio cues for exercise transitions
- [✓] Pause/resume functionality
- [✓] Exercise instructions display
- [✓] Workout progress tracking
- [✓] PWA installability
- [✓] Offline functionality
- [✓] Responsive design for all devices

### Smart Workout Logic Summary
1. **Visual equipment setup:** User selects available equipment using image-based gallery
2. **Equipment filtering:** Only shows exercises user can actually do (from 120 exercise database)
3. **High-intensity focus:** All exercises are medium to high intensity (no warm-ups/stretches)
4. **History tracking:** Saves last 30 workouts with dates and muscle groups worked
5. **Smart balancing:** If chest was worked 2+ times in last 3 days, prioritize legs/back/core instead
6. **Balanced generation:** Ensures each workout hits different muscle groups evenly
7. **Progressive difficulty:** Tracks user's completed workouts to suggest appropriate difficulty

### Exercise Database Details
- **120 exercises total** covering all 19 equipment types
- **High-intensity focus:** Difficulty levels 2-5 (no basic stretches or warm-ups)
- **Equipment distribution:** Bodyweight (32), Dumbbells (16), Kettlebell (10), Resistance Bands (8), Resistance Loops (5), Medicine Ball (6), Slam Ball (3), Stability Ball (5), Bosu Ball (3), Suspension Trainer (6), Battle Ropes (3), Bench/Step (5), Parallette Bars (2), Jump Rope (2), Pull-up Bar (3), Ab Wheel (2), Ankle Weights (3), Weight Plates (6)
- **Muscle group balance:** Upper body, lower body, core, and full-body compound movements
- **Clear instructions:** 1-2 sentence exercise descriptions for easy understanding

## Technical Implementation Notes

### Performance Considerations
- **Timer accuracy:** Use `Date.now()` timestamps to prevent drift
- **Memory management:** Properly cleanup intervals and audio resources
- **Battery optimization:** Minimize background processing
- **Responsive design:** Support various screen sizes and orientations

### Data Storage Strategy
- **Local storage:** AsyncStorage for user preferences and workout history
- **Exercise database:** Static JSON file for exercise library
- **User progress:** Local SQLite database for detailed analytics
- **Backup strategy:** Export/import functionality for data portability

### Testing Strategy
- **Unit tests:** Timer logic, workout generation algorithms
- **Integration tests:** User flow validation, data persistence
- **Performance tests:** Memory usage, battery consumption
- **Usability testing:** Real user feedback on timer visibility and audio cues

## Exercise Library Structure

### Exercise Categories
- **Upper Body:** Push-ups, arm circles, tricep dips, mountain climbers
- **Lower Body:** Squats, lunges, calf raises, wall sits
- **Core:** Planks, crunches, bicycle crunches, leg raises
- **Cardio:** Jumping jacks, high knees, burpees, running in place
- **Full Body:** Burpees, squat jumps, plank jacks, bear crawls

### Exercise Data Structure
Each exercise should include:
- Clear, concise name
- Step-by-step instructions
- Difficulty rating
- Muscle groups targeted
- Equipment requirements (bodyweight, dumbbells, resistance bands, etc.)
- Common modifications for different fitness levels
- Safety notes and contraindications

## Success Metrics & Goals

### User Engagement Metrics
- Daily active users
- Average workout completion rate
- Session duration and frequency
- User retention over time

### Technical Performance Metrics
- App load time and responsiveness
- Timer accuracy and reliability
- Crash rate and error frequency
- Battery usage optimization

### Business Objectives
- App store rating and reviews
- Download and installation rates
- User feedback and feature requests
- Potential monetization opportunities

## Risk Assessment & Mitigation

### Technical Risks
- **Timer accuracy issues:** Implement timestamp-based timing system
- **Audio playback problems:** Test across multiple devices and OS versions
- **Performance degradation:** Regular performance monitoring and optimization
- **Cross-platform compatibility:** Thorough testing on iOS and Android

### User Experience Risks
- **Complex interface:** Focus on simplicity and intuitive design
- **Overwhelming options:** Progressive disclosure of advanced features
- **Accessibility concerns:** Ensure proper contrast, font sizes, and screen reader support

## Conclusion

This development plan provides a structured approach to creating a comprehensive HIIT workout application. The phased development strategy allows for iterative improvement and user feedback integration while maintaining focus on core functionality. The emphasis on timer accuracy, clear visual/audio cues, and user-friendly workout generation will create a valuable fitness tool for users of all levels.

The technical stack recommendations balance development speed with performance requirements, while the detailed feature specifications provide clear implementation guidance for the development team.