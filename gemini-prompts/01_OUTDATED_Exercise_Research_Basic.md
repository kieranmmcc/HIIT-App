# Exercise Research Prompt for Gemini

Copy and paste this prompt to Gemini:

---

I need you to research and compile a comprehensive exercise database for a HIIT (High-Intensity Interval Training) app. Please create a JSON file with 80-100 exercises that covers all equipment types and muscle groups.

## Required Format

For each exercise, provide this exact JSON structure:

```json
{
  "id": "unique_number",
  "name": "Exercise Name",
  "instructions": "Clear, concise instructions (1-2 sentences)",
  "muscleGroups": ["array", "of", "muscle", "groups"],
  "primaryMuscle": "main_muscle_group",
  "difficulty": 1-5,
  "equipment": ["required", "equipment"]
}
```

## Equipment Categories to Include
- **bodyweight** (no equipment needed) - 35+ exercises
- **dumbbells** - 15+ exercises
- **resistance_bands** - 10+ exercises
- **kettlebell** - 8+ exercises
- **medicine_ball** - 6+ exercises
- **jump_rope** - 4+ exercises
- **pull_up_bar** - 5+ exercises
- **yoga_mat** (mat-specific exercises) - 5+ exercises

## Muscle Groups to Use
- **chest** - pushing movements
- **back** - pulling movements
- **shoulders** - overhead movements
- **arms** - biceps/triceps focused
- **legs** - squats, lunges, jumps
- **core** - abs, obliques, stability
- **full_body** - compound movements

## Difficulty Scale
- **1** = Beginner (jumping jacks, basic squats)
- **2** = Easy (push-ups, lunges)
- **3** = Moderate (burpees, mountain climbers)
- **4** = Hard (pistol squats, handstand push-ups)
- **5** = Expert (muscle-ups, turkish get-ups)

## Exercise Distribution Requirements
Ensure good balance across:
- **Upper body** (25+ exercises): chest, back, shoulders, arms
- **Lower body** (25+ exercises): quads, hamstrings, glutes, calves
- **Core** (15+ exercises): abs, obliques, full core
- **Cardio/Full body** (15+ exercises): compound movements
- **Flexibility/Recovery** (10+ exercises): stretches, mobility

## Research Sources
Pull exercises from reputable fitness sources like:
- Nike Training Club
- 7 Minute Workout
- P90X/Insanity workout lists
- CrossFit movement library
- ACE Fitness exercise database
- Bodybuilding.com
- Fitness YouTube channels (Athlean-X, Fitness Blender)
- Military fitness tests (Navy SEALs, Army PT)

## Quality Requirements
- Instructions must be clear enough to perform without video
- Include exercise variations (beginner/advanced modifications)
- Focus on HIIT-appropriate exercises (high intensity, time-based)
- Avoid exercises requiring complex setup or multiple pieces of equipment
- Include both static holds (planks) and dynamic movements (burpees)

## Final Output
Please provide:
1. **Complete JSON file** with all exercises in the specified format
2. **Summary stats** showing count by equipment type and muscle group
3. **Source attribution** listing where you found each exercise

Create the JSON as a properly formatted code block that I can copy directly into a .json file for the HIIT app development.

Make sure every exercise is realistic for home workouts and can be performed in a small space (living room sized area).

---

This prompt should get Gemini to create a comprehensive exercise database that your AI developer can use directly in the HIIT app!