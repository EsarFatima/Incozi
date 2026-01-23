# VISUAL FOLDER STRUCTURE & FILE PLACEMENT

## 🎯 COMPLETE DIRECTORY TREE

```
D:\IncoziProject\Incozi\
│
└── assets/
    ├── images/                          ← 📁 All images go here
    │   │
    │   ├── hero/                        ← 📁 Homepage hero section
    │   │   ├── hero-main.svg           (600×500px SVG) - Main hero illustration
    │   │   └── hero-bg.jpg             (1920×1080px JPG) - Background
    │   │
    │   ├── pages/                       ← 📁 General page images
    │   │   ├── empty-services.svg      (300×300px SVG) - My Services empty state
    │   │   ├── empty-docs.svg          (300×300px SVG) - Documents empty state
    │   │   └── empty-billing.svg       (300×300px SVG) - Billing empty state
    │   │
    │   ├── blog/                        ← 📁 Blog post images
    │   │   ├── blog-001.jpg            (600×400px JPG) - Featured image for post 1
    │   │   ├── blog-002.jpg            (600×400px JPG) - Featured image for post 2
    │   │   └── blog-003.jpg            (600×400px JPG) - Featured image for post 3
    │   │
    │   ├── icons/                       ← 📁 Shared SVG icons (future)
    │   │   └── [shared icons here]
    │   │
    │   └── services/                    ← 📁 Service-specific images
    │       │
    │       ├── incorporation/           ← 📁 Incorporation service (/pages/incorporation.html)
    │       │   ├── inc-hero.svg                    (600×500px) ✅ INTEGRATED
    │       │   ├── inc-icon-1.svg                 (100×100px) - Benefit icon 1
    │       │   ├── inc-icon-2.svg                 (100×100px) - Benefit icon 2
    │       │   ├── inc-icon-3.svg                 (100×100px) - Benefit icon 3
    │       │   └── inc-steps.svg                  (800×400px) - Process diagram
    │       │
    │       ├── bookkeeping/             ← 📁 Bookkeeping service (/pages/bookkeeping.html)
    │       │   ├── book-dashboard.png             (800×600px) ✅ INTEGRATED
    │       │   ├── book-workflow.svg              (600×400px) ✅ INTEGRATED
    │       │   ├── book-icon-1.svg               (100×100px) - Feature icon 1
    │       │   ├── book-icon-2.svg               (100×100px) - Feature icon 2
    │       │   └── book-team.jpg                 (600×400px) - Team photo (optional)
    │       │
    │       ├── tax-compliance/          ← 📁 Tax service (/pages/tax-compliance.html)
    │       │   ├── tax-hero.svg                   (600×500px) ✅ INTEGRATED
    │       │   ├── tax-checklist.svg              (600×400px) - Checklist illustration
    │       │   ├── tax-icon-compliance.svg       (100×100px) - Compliance icon
    │       │   └── tax-icon-filing.svg           (100×100px) - Filing icon
    │       │
    │       └── consultation/            ← 📁 Consultation service (/pages/consultation.html)
    │           ├── cons-calendar.svg              (500×400px) ✅ INTEGRATED
    │           ├── cons-timeline.svg              (500×400px) ✅ INTEGRATED
    │           ├── cons-hero.svg                  (600×500px) - Hero illustration
    │           ├── cons-expert-1.jpg              (300×300px) - Expert photo
    │           └── cons-expert-2.jpg              (300×300px) - Expert photo
    │
    ├── (other existing assets - don't touch)
    │
    └── [other folders]
```

---

## 📍 SERVICE PAGES & IMAGE INTEGRATION STATUS

### **1️⃣ INCORPORATION PAGE** ✅ Ready
**File:** `pages/incorporation.html`
**Status:** Images paths integrated
**Images Needed:**
```
📁 assets/images/services/incorporation/
├── ✅ inc-hero.svg          - Line ~120 (already integrated)
├── ⏳ inc-icon-1.svg        - Lines ~250s (placeholder exists)
├── ⏳ inc-icon-2.svg        - Lines ~250s (placeholder exists)
├── ⏳ inc-icon-3.svg        - Lines ~250s (placeholder exists)
└── ⏳ inc-steps.svg         - Lines ~300s (placeholder exists)
```

### **2️⃣ BOOKKEEPING PAGE** ✅ Ready
**File:** `pages/bookkeeping.html`
**Status:** Images paths integrated
**Images Needed:**
```
📁 assets/images/services/bookkeeping/
├── ✅ book-dashboard.png    - Line ~180 (already integrated)
├── ✅ book-workflow.svg     - Line ~210 (already integrated)
├── ⏳ book-icon-1.svg       - Lines ~300s (placeholder exists)
├── ⏳ book-icon-2.svg       - Lines ~300s (placeholder exists)
└── ⏳ book-team.jpg         - Lines ~400s (optional)
```

### **3️⃣ TAX COMPLIANCE PAGE** ✅ Ready
**File:** `pages/tax-compliance.html`
**Status:** Images paths integrated
**Images Needed:**
```
📁 assets/images/services/tax-compliance/
├── ✅ tax-hero.svg          - Line ~42 (already integrated)
├── ⏳ tax-checklist.svg     - Lines ~200s (placeholder exists)
├── ⏳ tax-icon-compliance.svg - Lines ~300s (placeholder exists)
└── ⏳ tax-icon-filing.svg   - Lines ~300s (placeholder exists)
```

### **4️⃣ CONSULTATION PAGE** ✅ Ready
**File:** `pages/consultation.html`
**Status:** Images paths integrated
**Images Needed:**
```
📁 assets/images/services/consultation/
├── ✅ cons-calendar.svg     - Line ~233 (already integrated)
├── ✅ cons-timeline.svg     - Line ~266 (already integrated)
├── ⏳ cons-hero.svg         - Hero section (placeholder exists)
├── ⏳ cons-expert-1.jpg     - Team section (placeholder exists)
└── ⏳ cons-expert-2.jpg     - Team section (placeholder exists)
```

---

## 🎨 FILE FORMAT & SIZE GUIDE

```
SVG Files (Illustrations & Icons)
├── Size on disk: 10-100KB
├── Best for: Icons, logos, diagrams, illustrations
├── Dimensions: As needed, will scale responsively
├── Extension: .svg
└── Examples: inc-hero.svg, book-icon-1.svg, tax-checklist.svg

PNG Files (Screenshots & Mockups)
├── Size on disk: 100-300KB
├── Best for: UI mockups, dashboard screenshots
├── Dimensions: Use exact sizes (800×600px)
├── Extension: .png
└── Examples: book-dashboard.png

JPG Files (Photos)
├── Size on disk: 50-150KB
├── Best for: Photos, team images, real-world images
├── Dimensions: Use exact sizes (300×300px, 600×400px)
├── Extension: .jpg
└── Examples: cons-expert-1.jpg, blog-001.jpg
```

---

## 📝 FILE NAMING RULES

### Format: `{prefix}-{name}-{number}.{extension}`

**Prefix Codes:**
```
inc-     = Incorporation
book-    = Bookkeeping
tax-     = Tax Compliance
cons-    = Consultation
blog-    = Blog
hero-    = Homepage hero
empty-   = Empty states
```

**Examples:**
```
✅ CORRECT:
   inc-hero.svg
   book-dashboard.png
   cons-calendar.svg
   tax-icon-filing.svg
   blog-001.jpg

❌ WRONG:
   Inc_Hero.svg (capitalization, underscores)
   book dashboard.png (spaces)
   Cons-Calendar.SVG (capitalization)
   tax icon filing.svg (spaces)
   Blog 001.jpg (space)
```

---

## 🚀 STEP-BY-STEP: HOW TO ADD AN IMAGE

### Example: Adding Incorporation Hero Image

**Step 1: Prepare the image**
```
- Design/export as: inc-hero.svg
- Size: 600×500px
- Format: SVG (vector illustration)
```

**Step 2: Open folder**
```
Windows: Open File Explorer
Path: D:\IncoziProject\Incozi\assets\images\services\incorporation\
```

**Step 3: Place file**
```
Drag and drop inc-hero.svg into the incorporation folder
Verify it's there: D:\...\incorporation\inc-hero.svg
```

**Step 4: Test in website**
```
Browser: http://localhost:3000/pages/incorporation.html
Result: Hero image should appear at top of page
If not showing:
  - Press F12 (DevTools)
  - Check Console for 404 error
  - Verify file name spelling
  - Clear cache (Ctrl+Shift+Del)
```

---

## 📊 PRIORITY ORDER - WHAT TO DO FIRST

**TIER 1 - CRITICAL (Do These First)**
```
1. inc-hero.svg (600×500px SVG)
2. book-dashboard.png (800×600px PNG)
3. cons-calendar.svg (500×400px SVG)
4. cons-timeline.svg (500×400px SVG)

These are the main hero/showcase images
```

**TIER 2 - IMPORTANT (Do These Second)**
```
5. tax-hero.svg (600×500px SVG)
6. inc-icon-1.svg, inc-icon-2.svg, inc-icon-3.svg
7. book-workflow.svg (600×400px SVG)
8. tax-checklist.svg (600×400px SVG)
```

**TIER 3 - NICE TO HAVE (Do When You Have Time)**
```
9. Feature icons (book-icon-1.svg, etc.)
10. Blog featured images (blog-001.jpg, etc.)
11. Team photos (cons-expert-1.jpg, etc.)
12. Other optional images
```

---

## ✅ VERIFICATION CHECKLIST

After placing each image:

- [ ] File is in correct folder
- [ ] File name matches exactly (case-sensitive)
- [ ] File format is correct (SVG/PNG/JPG)
- [ ] File size is reasonable (<500KB)
- [ ] Image appears on website when loaded
- [ ] No 404 errors in DevTools (F12)
- [ ] Image looks good on desktop and mobile
- [ ] No broken image icon visible

---

## 🔍 TROUBLESHOOTING

**Problem: Image not showing**
```
❌ Solution:
1. Check file exists: D:\...\images\services\[service]\[filename]
2. Check spelling: File names are case-sensitive
3. Check format: Is it .svg, .png, or .jpg?
4. Check size: Is file > 500KB? May need compression
5. Refresh browser: Ctrl+R or Cmd+R
6. Clear cache: Ctrl+Shift+Delete
7. Check DevTools: F12 → Console for 404 errors
```

**Problem: Image looks stretched/blurry**
```
❌ Solution:
1. Check dimensions match spec (e.g., 600×500px)
2. Check format (SVG for illustrations, PNG for mockups)
3. Check CSS: May need `max-width: 100%; height: auto;`
```

**Problem: File won't upload to folder**
```
❌ Solution:
1. Check folder exists
2. Check file name is valid (no special chars except hyphens)
3. Try different format
4. Check disk space
```

---

## 📖 WHERE TO FIND HELP

**For complete image specifications:**
→ Read: `IMAGES_GUIDE.md`

**For exact HTML line numbers:**
→ Read: `IMAGE_PLACEMENT_GUIDE.md`

**For quick reference/cheatsheet:**
→ Read: `IMAGE_QUICK_REFERENCE.md`

**For getting started:**
→ Read: `README_IMAGES.md` (this file)

---

## 🎯 NEXT STEPS

1. **Prepare 3 images** (Tier 1 above)
2. **Place in correct folders** with exact names
3. **Test on website** (http://localhost:3000)
4. **Check DevTools** for any errors
5. **Repeat for remaining images**

**Total estimated time:** 30-60 minutes per image design + testing

---

**Ready to start? Pick the incorporation hero image first!** 🚀
