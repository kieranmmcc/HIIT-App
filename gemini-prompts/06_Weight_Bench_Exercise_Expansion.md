# Weight Bench Exercise Expansion Prompt for Gemini

Copy and paste this prompt to Gemini:

---

I need you to create an expanded JSON database of exactly 150 HIGH-INTENSITY exercises suitable for HIIT workouts, including the new WEIGHT BENCH equipment and combination exercises that use the bench with other equipment.

## UPDATED EQUIPMENT LIST (20 types total):

**Original Equipment (19 types):**
- bodyweight, dumbbells, resistance_bands, kettlebell, medicine_ball, jump_rope, pull_up_bar, yoga_mat, resistance_loops, stability_ball, bosu_ball, suspension_trainer, ankle_weights, weight_plates, bench_step, battle_ropes, slam_ball, parallette_bars, ab_wheel

**NEW EQUIPMENT:**
- weight_bench (flat/adjustable weight bench)

## EXERCISE DISTRIBUTION (150 exercises total):

**Expanded for Weight Bench Integration:**
- **Bodyweight Only:** 20 exercises (no equipment)
- **Bodyweight + Weight Bench:** 25 exercises (bench as platform/elevation)
- **Weight Bench Only:** 15 exercises (bench-specific movements)
- **Dumbbells + Weight Bench:** 20 exercises (bench press variations, rows, etc.)
- **Weight Plates + Weight Bench:** 8 exercises (plate bench exercises)
- **Kettlebell + Weight Bench:** 8 exercises (bench + kettlebell combos)
- **Medicine Ball + Weight Bench:** 6 exercises (bench + ball combinations)
- **Resistance Bands + Weight Bench:** 6 exercises (bench anchor exercises)
- **Other Single Equipment:** 42 exercises (distributed among remaining equipment)

## WEIGHT BENCH EXERCISE CATEGORIES:

**Bench-Only Exercises (15 total):**
- Bench Burpees, Bench Jump-Overs, Decline Push-ups, Incline Mountain Climbers, Bench Step-ups with Knee Drive, Single Leg Bench Squats, Bench Pike Push-ups, Bench Dips, Lateral Bench Jumps, Bench Bulgarian Split Squats, Bench Reverse Lunges, Bench Single-Leg Hip Thrusts, Bench Plank Up-Downs, Bench Bear Crawls, Bench Jump Squats

**Bodyweight + Bench Combinations (25 total):**
- Elevated Push-up Variations (hands/feet on bench), Bench Plyometric Jumps, Incline/Decline Planks, Bench Assisted Pistol Squats, Bench Tricep Dips Variations, Step-up to Knee Drive Variations, Bench Supported Single-Leg Deadlifts, Incline Burpee Variations, Bench Lateral Bounds, Decline Mountain Climber Variations, Bench Box Jump Variations, Incline Pike Walks, Bench Supported Jump Lunges, Bench Plank Variations, Decline Bear Crawls, Bench Jump Squats with Rotation, Incline Plank Jacks, Bench Supported Calf Raise Jumps, Bench Crawl-Unders, Decline Plank Up-Downs, Bench Lateral Step-ups, Incline Push-up to T, Bench Reverse Plank Pulses, Bench Supported Single-Leg Glute Bridges, Decline Burpee Variations

**Dumbbells + Bench Combinations:**
- Bench Press Burpees, Dumbbell Bench Press to Stand, Incline Dumbbell Thrusters, Decline Dumbbell Push-ups, Bench Dumbbell Rows, Single-Arm Bench Row to Burpee, Dumbbell Bench Step-ups, Bench Dumbbell Chest Flyes to Jump, Incline Dumbbell Mountain Climbers, Bench Dumbbell Pullovers to Crunch, Dumbbell Bench Bulgarian Lunges, Alternating Bench Press to Jump, Bench Dumbbell Renegade Rows, Incline Dumbbell Burpees, Decline Dumbbell Chest Press, Bench Single-Arm Row Explosions, Dumbbell Bench Jump-Overs, Incline Dumbbell Plank Rows, Bench Press to Tuck Jump, Dumbbell Bench Lateral Raises

**Weight Plates + Bench:**
- Plate Bench Press Explosions, Bench Plate Slams, Incline Plate Push-ups, Bench Plate Russian Twists, Decline Plate Mountain Climbers, Bench Plate Chest Press to Jump, Plate Bench Step-ups, Incline Plate Burpees

**Other Equipment + Bench Combinations:**
- Kettlebell Bench Press Burpees, Medicine Ball Bench Slams, Resistance Band Bench Chest Press, Bench Battle Rope Waves (if space allows)

## CRITICAL INTENSITY REQUIREMENTS:
- **Medium to High Intensity only** (difficulty 2-5)
- **Heart rate elevating exercises**
- **NO warm-ups, stretches, or mobility work**
- **Focus on explosive, compound movements**
- **Every exercise must make you sweat in 45 seconds**
- **Emphasize combination movements that use bench functionally**

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

## EQUIPMENT COMBINATION EXAMPLES:

**Example - Dumbbell Bench Press Burpees:**
- Equipment: ["dumbbells", "weight_bench"]
- Instructions: "Lie on bench, press dumbbells up, jump off bench into burpee position, complete burpee, jump back onto bench"

**Example - Bench Plate Slams:**
- Equipment: ["weight_plates", "weight_bench"]
- Instructions: "Stand on bench holding weight plate, slam plate down beside bench, jump down, pick up plate, jump back onto bench"

## MUSCLE GROUPS:
- legs, glutes, chest, back, shoulders, arms, core, full_body

## QUALITY STANDARDS:
- Integrate the bench as a functional training tool, not just for lying exercises
- Use bench for elevation, stability challenges, and plyometric platforms
- Create dynamic movements that flow between bench and floor
- Ensure all exercises are challenging and compound in nature
- Focus on movements that couldn't be done as effectively without the bench
- **IMPORTANT: Ensure 40 exercises total work with ONLY bodyweight + bench (no other equipment needed)**
- These 40 exercises should provide full-body workout variety for bench-only users

## RESEARCH SOURCES:
- CrossFit bench WODs
- Functional bench training programs
- Powerlifting conditioning exercises
- Athletic bench training variations
- Plyometric bench exercises

## FINAL OUTPUT:
Provide complete JSON array starting with `[` and ending with `]`. Ensure:
- Exactly 150 exercises total
- All exercises meet intensity requirements (2-5 difficulty)
- Equipment distribution matches requirements above
- Include creative bench combinations with other equipment
- JSON is properly formatted and complete
- No exercises are cut off

**Start your response with the opening bracket `[` for easy copying.**

---