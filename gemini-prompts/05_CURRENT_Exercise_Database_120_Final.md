# Expanded HIIT Exercise Database Prompt for Gemini

Copy and paste this prompt to Gemini:

---

I need you to create an expanded JSON database of exactly 120 HIGH-INTENSITY exercises suitable for HIIT workouts, including new equipment types that are commonly available in home gyms.

## UPDATED EQUIPMENT LIST (16 types total):

**Core Equipment (original 8):**
- bodyweight, dumbbells, resistance_bands, kettlebell, medicine_ball, jump_rope, pull_up_bar, yoga_mat

**New Equipment (8 additional):**
- foam_roller, stability_ball, bosu_ball, suspension_trainer, ankle_weights, weight_plates, bench_step, resistance_loops, battle_ropes, slam_ball, parallette_bars, ab_wheel

## EXERCISE DISTRIBUTION (120 exercises total):
- **Bodyweight:** 40 exercises
- **Dumbbells:** 20 exercises
- **Weight Plates:** 8 exercises (using plates independently)
- **Kettlebell:** 12 exercises
- **Resistance Bands:** 10 exercises
- **Resistance Loops:** 6 exercises (mini bands)
- **Medicine Ball:** 8 exercises
- **Slam Ball:** 4 exercises (non-bouncing exercises)
- **Stability Ball:** 6 exercises
- **Bosu Ball:** 4 exercises
- **Suspension Trainer:** 8 exercises (TRX-style)
- **Battle Ropes:** 4 exercises
- **Bench/Step Platform:** 6 exercises
- **Parallette Bars:** 2 exercises
- **Ab Wheel:** 2 exercises
- **Ankle Weights:** 4 exercises
- **Jump Rope:** 3 exercises
- **Pull-up Bar:** 3 exercises

## CRITICAL INTENSITY REQUIREMENTS (same as before):
- **Medium to High Intensity only** (difficulty 2-5)
- **Heart rate elevating exercises**
- **NO warm-ups, stretches, or mobility work**
- **NO gentle movements** (foam rolling, light stretching)
- **Focus on explosive, dynamic, challenging movements**

## JSON FORMAT (EXACT):
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

## NEW EQUIPMENT EXERCISE EXAMPLES:

**Stability Ball:**
- Stability Ball Pike Push-ups, Wall Ball Squats, Ball Burpees, Stability Ball Mountain Climbers

**Suspension Trainer:**
- TRX Jump Squats, Suspension Burpees, TRX Pike Push-ups, Suspended Mountain Climbers

**Battle Ropes:**
- Battle Rope Waves, Alternating Waves, Spiral Waves, Battle Rope Slams

**Bosu Ball:**
- Bosu Burpees, Bosu Jump Squats, Bosu Mountain Climbers, Bosu Push-ups

**Weight Plates:**
- Plate Thrusters, Plate Slams, Russian Twists with Plate, Overhead Plate Lunges

**Slam Ball:**
- Slam Ball Burpees, Overhead Slams, Rotational Slams, Slam Ball Squats

**Bench/Step:**
- Box Jump Burpees, Step-up Jumps, Decline Push-ups, Bench Jump-overs

## MUSCLE GROUPS:
- legs, glutes, chest, back, shoulders, arms, core, full_body

## QUALITY STANDARDS:
- Every exercise must make you sweat in 45 seconds
- Focus on compound, multi-joint movements
- Include plyometric and explosive variations
- Ensure exercises are challenging enough for fit individuals

## RESEARCH SOURCES:
- CrossFit WODs with equipment variations
- Functional fitness training programs
- HIIT bootcamp exercises
- Athletic performance training
- Competition fitness movements

## FINAL OUTPUT:
Provide complete JSON array starting with `[` and ending with `]`. Ensure:
- Exactly 120 exercises total
- All exercises meet intensity requirements (2-5 difficulty)
- Equipment distribution matches requirements above
- JSON is properly formatted and complete
- No exercises are cut off

**Start your response with the opening bracket `[` for easy copying.**

---