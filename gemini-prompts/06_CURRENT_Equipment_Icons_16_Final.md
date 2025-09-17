# Complete Equipment Icons Request for Gemini

Copy and paste this prompt to Gemini:

---

I need you to find high-quality, recognizable SVG icons for ALL 16 pieces of fitness equipment used in a comprehensive HIIT workout app. The icons must be visually consistent and actually look like the equipment (no abstract representations).

## ALL EQUIPMENT NEEDED (16 icons):

**Core Equipment (8):**
1. **Bodyweight** - Person exercising or human figure
2. **Dumbbells** - Actual dumbbell shape (not barbell)
3. **Resistance Bands** - Exercise bands/tubes with handles
4. **Kettlebell** - Classic kettlebell with handle
5. **Medicine Ball** - Weighted exercise ball
6. **Jump Rope** - Jump rope with handles
7. **Pull-up Bar** - Horizontal exercise bar
8. **Yoga Mat** - Exercise mat (rolled or flat)

**Additional Equipment (8):**
9. **Foam Roller** - Cylindrical foam roller for recovery
10. **Stability Ball** - Large exercise ball (Swiss ball)
11. **Bosu Ball** - Half-dome balance trainer
12. **Suspension Trainer** - TRX-style straps with handles
13. **Ankle Weights** - Weighted straps for ankles/wrists
14. **Weight Plates** - Round weight plates (separate from dumbbells)
15. **Bench/Step Platform** - Exercise bench or step platform
16. **Resistance Loops** - Small loop bands (mini bands)

**Optional Advanced Equipment (if you find good icons):**
17. **Battle Ropes** - Heavy training ropes
18. **Slam Ball** - Non-bouncing weighted ball
19. **Parallette Bars** - Small parallel bars/push-up handles
20. **Ab Wheel** - Abdominal exercise wheel

## ICON REQUIREMENTS:
- **Instantly recognizable** - Users must immediately identify the equipment
- **Consistent visual style** - All from same icon family/library
- **SVG format only**
- **Free commercial use**
- **Modern, clean design**
- **No abstract shapes** - Must look like actual equipment

## REQUIRED JSON OUTPUT FORMAT:

```json
[
  {
    "id": "bodyweight",
    "name": "Bodyweight Only",
    "description": "No equipment needed",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "core",
    "isSelected": true,
    "isRequired": true
  },
  {
    "id": "dumbbells",
    "name": "Dumbbells",
    "description": "Any weight, adjustable preferred",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "weights",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "resistance_bands",
    "name": "Resistance Bands",
    "description": "Tube bands with handles",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "resistance",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "kettlebell",
    "name": "Kettlebell",
    "description": "Any weight kettlebell",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "weights",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "medicine_ball",
    "name": "Medicine Ball",
    "description": "Weighted exercise ball",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "accessories",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "jump_rope",
    "name": "Jump Rope",
    "description": "Standard jump rope",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "cardio",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "pull_up_bar",
    "name": "Pull-up Bar",
    "description": "Doorway or wall-mounted",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "accessories",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "yoga_mat",
    "name": "Yoga Mat",
    "description": "Exercise mat for floor work",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "accessories",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "foam_roller",
    "name": "Foam Roller",
    "description": "Recovery and mobility tool",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "recovery",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "stability_ball",
    "name": "Stability Ball",
    "description": "Large exercise ball (Swiss ball)",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "accessories",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "bosu_ball",
    "name": "Bosu Ball",
    "description": "Half-dome balance trainer",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "balance",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "suspension_trainer",
    "name": "Suspension Trainer",
    "description": "TRX-style suspension straps",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "resistance",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "ankle_weights",
    "name": "Ankle Weights",
    "description": "Weighted straps for ankles/wrists",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "weights",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "weight_plates",
    "name": "Weight Plates",
    "description": "Round weight plates",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "weights",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "bench_step",
    "name": "Bench/Step Platform",
    "description": "Exercise bench or step platform",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "accessories",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "resistance_loops",
    "name": "Resistance Loops",
    "description": "Small loop bands (mini bands)",
    "svgUrl": "PUT_WORKING_URL_HERE",
    "category": "resistance",
    "isSelected": false,
    "isRequired": false
  }
]
```

## SEARCH STRATEGY:
1. **Look for fitness/sports icon libraries first** - Not generic shape libraries
2. **Find consistent icon families** - All icons should look like they belong together
3. **Test URLs before providing** - Ensure all SVG links actually work
4. **Prioritize recognizability** - Each icon should be immediately identifiable

## PREFERRED SOURCES:
- Sports/fitness icon collections on GitHub
- Health & wellness SVG libraries
- Exercise equipment icon sets
- Fitness app icon libraries
- Gym/workout themed icon collections

## WHAT TO AVOID:
- ❌ Abstract shapes that don't look like equipment
- ❌ Icons from different styles that don't match
- ❌ Broken or non-working URLs
- ❌ Generic shapes (circles, lines, etc.) as equipment representations

## FINAL REQUIREMENTS:
1. **Replace all "PUT_WORKING_URL_HERE" with actual working SVG URLs**
2. **Keep the exact JSON structure** - Don't change field names
3. **Include all 16 equipment types minimum**
4. **Test that URLs work** before providing them
5. **Ensure visual consistency** across all icons

**Output the complete, copy-ready JSON with working SVG URLs for all equipment.**

---