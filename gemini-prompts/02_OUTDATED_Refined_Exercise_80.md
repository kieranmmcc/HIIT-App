# Refined HIIT Exercise Database Prompt for Gemini

Copy and paste this prompt to Gemini:

---

I need you to create a refined JSON database of exactly 80 HIGH-INTENSITY exercises suitable for HIIT (High-Intensity Interval Training) workouts.

## CRITICAL REQUIREMENTS:

### Intensity Level - ONLY Include:
- **Medium to High Intensity exercises** (difficulty 2-5 on a 1-5 scale)
- Exercises that **elevate heart rate quickly**
- Movements that are **explosive, dynamic, or challenging**
- **NO warm-up, cool-down, or stretching exercises**
- **NO basic mobility moves** (arm circles, leg swings, cat-cow, child's pose)
- **NO static holds under 30 seconds** (unless very challenging like wall sits)

### Exercise Types to PRIORITIZE:
- **Explosive movements:** Burpees, jump squats, mountain climbers, thrusters
- **Compound movements:** Exercises working multiple muscle groups
- **Plyometric exercises:** Jump-based movements
- **High-rep bodyweight:** Push-ups, squats, lunges (but challenging variations)
- **Dynamic strength:** Kettlebell swings, medicine ball slams
- **Cardio-strength hybrids:** Man makers, devil's press, bear crawls

### Equipment Distribution (80 exercises total):
- **Bodyweight:** 35 exercises (high-intensity only)
- **Dumbbells:** 18 exercises
- **Kettlebell:** 10 exercises
- **Resistance Bands:** 8 exercises
- **Medicine Ball:** 5 exercises
- **Jump Rope:** 2 exercises
- **Pull-up Bar:** 2 exercises

### JSON Format (EXACT):
```json
[
  {
    "id": 1,
    "name": "Exercise Name",
    "instructions": "Clear, concise instructions (1-2 sentences max)",
    "muscleGroups": ["array", "of", "muscle", "groups"],
    "primaryMuscle": "main_muscle_group",
    "difficulty": 2-5,
    "equipment": ["required_equipment"]
  }
]
```

### Muscle Groups to Use:
- **legs** (quads, hamstrings, calves)
- **glutes**
- **chest**
- **back**
- **shoulders**
- **arms** (biceps/triceps)
- **core** (abs, obliques)
- **full_body** (compound movements)

### Examples of GOOD HIIT Exercises:
- Burpees, Jump Squats, Mountain Climbers
- Thrusters, Man Makers, Devil's Press
- Kettlebell Swings, Turkish Get-ups
- Plyometric Push-ups, Jump Lunges
- Medicine Ball Slams, Wall Balls
- High Knees, Tuck Jumps, Plank Jacks

### Examples of BAD Exercises (DO NOT INCLUDE):
- ❌ Arm Circles, Leg Swings (too easy)
- ❌ Child's Pose, Cat-Cow (stretches)
- ❌ Standing stretches of any kind
- ❌ Basic calf raises (unless jump calf raises)
- ❌ Simple bicep curls (unless explosive/high rep)
- ❌ Any "gentle" or "relaxation" movements

### Difficulty Scale:
- **2 = Medium:** Push-ups, basic squats, lunges
- **3 = Challenging:** Burpees, jump squats, mountain climbers
- **4 = Hard:** Pistol squats, handstand push-ups, muscle-ups
- **5 = Expert:** Turkish get-ups, one-arm push-ups, advanced plyometrics

### Quality Check:
Before including any exercise, ask yourself:
1. **Will this significantly elevate heart rate?**
2. **Is this challenging enough for a HIIT workout?**
3. **Would a fit person break a sweat doing this for 45 seconds?**

If the answer to any is "no", don't include it.

### Research Sources:
Pull from these high-intensity sources:
- CrossFit WOD exercises
- P90X/Insanity exercise lists
- Military fitness training exercises
- Bootcamp/circuit training workouts
- Competition fitness exercises
- Athletic performance training moves

### Final Output:
Provide the complete JSON array with all 80 exercises. Make sure:
- JSON is properly formatted and complete
- No exercises are cut off or incomplete
- Every exercise meets the high-intensity criteria
- Equipment distribution matches the requirements above

**Start the response with the opening bracket `[` and end with closing bracket `]` so I can copy the complete JSON directly.**

---