# SVG URL Verification Prompt for Claude

Please use the WebFetch tool to systematically verify each of these Tabler Icons SVG URLs from the Gemini research and identify which ones work vs which ones are broken:

## URLs to Test (from Gemini's Table 1):

1. **Bodyweight/Stretching:**
   - URL: https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/stretching.svg
   - Backup: https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/stretching.svg

2. **Dumbbells:**
   - URL: https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/dumbbell.svg
   - Backup: https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/dumbbell.svg

3. **Resistance Bands (Oval Vertical):**
   - URL: https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/oval-vertical.svg
   - Backup: https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/oval-vertical.svg

4. **Kettlebell:**
   - URL: https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/kettlebell.svg
   - Backup: https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/kettlebell.svg

5. **Medicine Ball (Volleyball):**
   - URL: https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/ball-volleyball.svg
   - Backup: https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/ball-volleyball.svg

6. **Jump Rope (Wave Sine):**
   - URL: https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/wave-sine.svg
   - Backup: https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/wave-sine.svg

7. **Pull-up Bar (Separator Horizontal):**
   - URL: https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/separator-horizontal.svg
   - Backup: https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/separator-horizontal.svg

8. **Yoga Mat (Yoga):**
   - URL: https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/yoga.svg
   - Backup: https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/yoga.svg

## Task Instructions:

1. **Test each primary URL first** (the `master` branch versions)
2. **If 404 error, try the backup URL** (the `main` branch versions)
3. **For broken URLs, suggest alternatives** by testing similar icon names like:
   - For dumbbell: Try `barbell.svg`, `weight.svg`, `fitness.svg`
   - For kettlebell: Try `ball-football.svg`, `circle-filled.svg`
   - For any others that fail: suggest logical alternatives from Tabler

## Expected Output Format:

```
✅ WORKING: Equipment Name
   - URL: [working URL]
   - Status: Successfully fetched

❌ BROKEN: Equipment Name
   - Primary URL: [failed URL]
   - Backup URL: [failed URL]
   - Suggested Alternative: [alternative URL to test]

🔄 NEEDS REPLACEMENT: Equipment Name
   - Original failed, but found: [working alternative URL]
   - Icon name: [alternative icon name]
```

## Final Task:
After testing all URLs, create an updated `equipment-gallery-data.json` file with only working SVG URLs, using the best available alternatives for any broken links.

Please test these systematically and provide a comprehensive report of what works vs what needs replacement.