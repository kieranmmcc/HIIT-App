# Better Equipment Icons Request for Gemini

Copy and paste this prompt to Gemini:

---

I need you to find high-quality, recognizable SVG icons for fitness equipment that actually LOOK like the equipment (not abstract representations). Then output them in a specific JSON format.

## Equipment Needed (8 icons):

1. **Bodyweight** - A person exercising or human figure icon
2. **Dumbbells** - Actual dumbbell shape (not barbell)
3. **Resistance Bands** - Recognizable as exercise bands/loops
4. **Kettlebell** - Classic kettlebell shape with handle
5. **Medicine Ball** - Round weighted ball (clearly different from regular ball)
6. **Jump Rope** - Recognizable jump rope with handles
7. **Pull-up Bar** - Horizontal exercise bar (not just a line)
8. **Yoga Mat** - Exercise mat (rolled or flat)

## Icon Quality Requirements:
- **Must be recognizable** - Users should immediately know what equipment it represents
- **No abstract proxies** - Don't use "wave" for jump rope or "line" for pull-up bar
- **Consistent style** - All from same icon library/family if possible
- **SVG format only**
- **Free to use commercially**
- **Clean, modern design**

## Search Strategy:
Look for fitness/sports icon libraries, not generic shape libraries. Try:
- Sport/fitness specific icon sets
- Health & wellness icon libraries
- Gym equipment icon collections
- Exercise app icon sets

## Output Format Required:

Please output the results in this EXACT JSON format:

```json
[
  {
    "id": "bodyweight",
    "name": "Bodyweight Only",
    "description": "No equipment needed",
    "svgUrl": "PUT_ACTUAL_URL_HERE",
    "category": "core",
    "isSelected": true,
    "isRequired": true
  },
  {
    "id": "dumbbells",
    "name": "Dumbbells",
    "description": "Any weight, adjustable preferred",
    "svgUrl": "PUT_ACTUAL_URL_HERE",
    "category": "weights",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "resistance_bands",
    "name": "Resistance Bands",
    "description": "Loop bands or tube bands",
    "svgUrl": "PUT_ACTUAL_URL_HERE",
    "category": "resistance",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "kettlebell",
    "name": "Kettlebell",
    "description": "Any weight kettlebell",
    "svgUrl": "PUT_ACTUAL_URL_HERE",
    "category": "weights",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "medicine_ball",
    "name": "Medicine Ball",
    "description": "Weighted exercise ball",
    "svgUrl": "PUT_ACTUAL_URL_HERE",
    "category": "accessories",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "jump_rope",
    "name": "Jump Rope",
    "description": "Standard jump rope",
    "svgUrl": "PUT_ACTUAL_URL_HERE",
    "category": "cardio",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "pull_up_bar",
    "name": "Pull-up Bar",
    "description": "Doorway or wall-mounted",
    "svgUrl": "PUT_ACTUAL_URL_HERE",
    "category": "accessories",
    "isSelected": false,
    "isRequired": false
  },
  {
    "id": "yoga_mat",
    "name": "Yoga Mat",
    "description": "Exercise mat for floor work",
    "svgUrl": "PUT_ACTUAL_URL_HERE",
    "category": "accessories",
    "isSelected": false,
    "isRequired": false
  }
]
```

## Critical Requirements:
1. **Replace "PUT_ACTUAL_URL_HERE" with real, working SVG download URLs**
2. **Test that the URLs work** before providing them
3. **Keep the exact JSON structure** - don't change field names or structure
4. **Find icons that actually look like the equipment** - no abstract representations
5. **Ensure all 8 equipment types are included**

## Preferred Sources (look for fitness-specific icons):
- Sports/fitness icon libraries on GitHub
- Flaticon fitness collections (free ones)
- Iconify fitness icon sets
- Font Awesome fitness icons (free tier)
- Feather/Lucide fitness-specific icons
- Noun Project fitness collections (free)

## What I DON'T Want:
- ❌ Wave icons for jump rope
- ❌ Lines for pull-up bars
- ❌ Generic circles for medicine balls
- ❌ Abstract shapes that don't look like equipment
- ❌ Icons from different styles/libraries that don't match

## Final Check:
Before providing the JSON, ask yourself: "Would a user immediately recognize what each icon represents?" If not, find better alternatives.

**Output the complete, copy-ready JSON with working URLs.**

---