# Fix Broken Equipment Images - Gemini Prompt

Copy and paste this prompt to Gemini:

---

I need you to find replacement images for fitness equipment. The previous URLs you provided are mostly broken (404 errors). I need NEW, WORKING image URLs that I can actually download.

## CRITICAL REQUIREMENTS:

### URL Testing:
- **Test each URL before providing it** - Make sure it actually loads
- **Use current, active image URLs** - Not outdated ones
- **Provide direct image file URLs** - Should end in .jpg, .png, etc.
- **Verify the image actually shows the correct equipment**

### Search Strategy:
1. **Go directly to Unsplash.com and Pexels.com**
2. **Search each equipment name individually**
3. **Copy the DIRECT download URL** (not the page URL)
4. **Test that the URL works** before providing it

## EQUIPMENT NEEDING REPLACEMENT (16 items):

1. **KETTLEBELL** - Need: Single black iron kettlebell, clean background
2. **RESISTANCE BANDS** - Need: Set of colorful exercise bands with handles
3. **WEIGHT PLATES** - Need: Olympic or standard weight plates
4. **SUSPENSION TRAINER** - Need: TRX-style straps with handles and anchors
5. **MEDICINE BALL** - Need: Leather or rubber medicine ball
6. **STABILITY BALL** - Need: Large exercise/Swiss ball
7. **RESISTANCE LOOPS** - Need: Set of mini loop bands in different colors
8. **BENCH/STEP** - Need: Exercise bench or step platform
9. **SLAM BALL** - Need: Heavy slam ball with textured surface
10. **PULL-UP BAR** - Need: Doorway or wall-mounted pull-up bar
11. **BOSU BALL** - Need: Half-dome balance trainer (blue dome on black base)
12. **BATTLE ROPES** - Need: Heavy training ropes
13. **ANKLE WEIGHTS** - Need: Adjustable ankle/wrist weights
14. **PARALLETTE BARS** - Need: Small parallel calisthenics bars
15. **JUMP ROPE** - Need: Speed rope or basic jump rope with handles
16. **AB WHEEL** - Need: Ab roller with dual handles

## CORRECT URL FORMATS:

**Unsplash direct download:**
```
https://images.unsplash.com/photo-[PHOTO-ID]?auto=format&fit=crop&w=800&h=800&q=80
```

**Pexels direct download:**
```
https://images.pexels.com/photos/[PHOTO-ID]/pexels-photo-[PHOTO-ID].jpeg?auto=compress&cs=tinysrgb&w=800&h=800
```

## WHAT WENT WRONG BEFORE:
- Many photo IDs were invalid/outdated
- URLs had complex parameters that broke
- Some images weren't actually the right equipment
- Jump rope URL was completely malformed

## OUTPUT FORMAT:
For each equipment, provide:

```
KETTLEBELL
✅ Tested URL: [WORKING direct download link]
Source: Unsplash
Photographer: [name]
Description: [what the image shows]
Status: VERIFIED WORKING

RESISTANCE BANDS
✅ Tested URL: [WORKING direct download link]
Source: Pexels
Photographer: [name]
Description: [what the image shows]
Status: VERIFIED WORKING
```

## TESTING INSTRUCTIONS:
1. Find the image on Unsplash/Pexels
2. Get the direct download URL
3. **Actually visit the URL to confirm it loads the image**
4. Only provide URLs that you've confirmed work
5. If you can't find a good image for any equipment, tell me which ones

## QUALITY STANDARDS:
- Equipment must be clearly visible and recognizable
- Clean, professional photography
- Neutral/white background preferred
- High enough resolution (at least 800x800)
- Actually shows the equipment (not just people using it)

**Please find working replacement URLs for all 16 equipment types. Only provide URLs you've actually tested and confirmed work.**

---