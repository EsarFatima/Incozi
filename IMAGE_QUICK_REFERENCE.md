# IMAGE QUICK REFERENCE CHEAT SHEET

## 📁 FOLDER STRUCTURE AT A GLANCE

```
assets/images/
│
├── hero/
│   ├── hero-main.svg          ← Homepage hero image
│   └── hero-bg.jpg            ← Homepage background
│
├── pages/
│   ├── empty-services.svg     ← My Services empty state
│   ├── empty-docs.svg         ← Documents empty state
│   └── empty-billing.svg      ← Billing empty state
│
├── blog/
│   ├── blog-001.jpg           ← Post 1
│   ├── blog-002.jpg           ← Post 2
│   └── blog-003.jpg           ← Post 3
│
├── icons/
│   └── [shared SVG icons]
│
└── services/
    │
    ├── incorporation/         ← /pages/incorporation.html images
    │   ├── inc-hero.svg       ✅ ALREADY INTEGRATED
    │   ├── inc-icon-1.svg
    │   ├── inc-icon-2.svg
    │   ├── inc-icon-3.svg
    │   └── inc-steps.svg
    │
    ├── bookkeeping/           ← /pages/bookkeeping.html images
    │   ├── book-dashboard.png ✅ ALREADY INTEGRATED
    │   ├── book-workflow.svg  ✅ ALREADY INTEGRATED
    │   ├── book-icon-1.svg
    │   ├── book-icon-2.svg
    │   └── book-team.jpg
    │
    ├── tax-compliance/        ← /pages/tax-compliance.html images
    │   ├── tax-hero.svg       ✅ ALREADY INTEGRATED
    │   ├── tax-checklist.svg
    │   ├── tax-icon-compliance.svg
    │   └── tax-icon-filing.svg
    │
    └── consultation/          ← /pages/consultation.html images
        ├── cons-calendar.svg  ✅ ALREADY INTEGRATED
        ├── cons-timeline.svg  ✅ ALREADY INTEGRATED
        ├── cons-hero.svg
        ├── cons-expert-1.jpg
        └── cons-expert-2.jpg
```

---

## 🎯 WHAT TO CREATE - By Service

### **INCORPORATION** (Most Important First)
```
📁 assets/images/services/incorporation/
├── inc-hero.svg (600×500px) - PRIORITY 1
├── inc-icon-1.svg (100×100px)
├── inc-icon-2.svg (100×100px)
├── inc-icon-3.svg (100×100px)
└── inc-steps.svg (800×400px)
```

### **BOOKKEEPING**
```
📁 assets/images/services/bookkeeping/
├── book-dashboard.png (800×600px) - PRIORITY 2
├── book-workflow.svg (600×400px) - PRIORITY 3
├── book-icon-1.svg (100×100px)
├── book-icon-2.svg (100×100px)
└── book-team.jpg (600×400px) - optional
```

### **TAX COMPLIANCE**
```
📁 assets/images/services/tax-compliance/
├── tax-hero.svg (600×500px)
├── tax-checklist.svg (600×400px)
├── tax-icon-compliance.svg (100×100px)
└── tax-icon-filing.svg (100×100px)
```

### **CONSULTATION**
```
📁 assets/images/services/consultation/
├── cons-calendar.svg (500×400px)
├── cons-timeline.svg (500×400px)
├── cons-hero.svg (600×500px)
├── cons-expert-1.jpg (300×300px)
└── cons-expert-2.jpg (300×300px)
```

---

## ✅ WHAT'S ALREADY SET UP

These pages are **ready to receive images** - paths are already correct:

```
✅ pages/incorporation.html (line 120)
   → References: ../assets/images/services/incorporation/inc-hero.svg

✅ pages/bookkeeping.html (line ~180, ~210)
   → References: ../assets/images/services/bookkeeping/book-dashboard.png
   → References: ../assets/images/services/bookkeeping/book-workflow.svg

✅ pages/tax-compliance.html (line 42)
   → References: ../assets/images/services/tax-compliance/tax-hero.svg

✅ pages/consultation.html (line 233, 266)
   → References: ../assets/images/services/consultation/cons-calendar.svg
   → References: ../assets/images/services/consultation/cons-timeline.svg
```

---

## 🎨 FILE FORMATS & SIZING

| Type | Format | Resolution | File Size | Best For |
|------|--------|-----------|-----------|----------|
| **Hero Images** | SVG | 600×500px | <100KB | Main service illustrations |
| **Icons** | SVG | 100×100px | <20KB | Benefit/feature icons |
| **Diagrams** | SVG | 800×400px | <100KB | Process flows, steps |
| **Mockups** | PNG | 800×600px | <300KB | UI/Dashboard screenshots |
| **Photos** | JPG | 600×400px | <150KB | Team, testimonials |
| **Backgrounds** | JPG | 1920×1080px | <300KB | Full-width backgrounds |

---

## 📍 WHERE EACH IMAGE APPEARS ON WEBSITE

```
INCORPORATION PAGE
├── Hero Section (Top)
│   └── inc-hero.svg ← Put here!
├── Benefits Grid
│   ├── inc-icon-1.svg
│   ├── inc-icon-2.svg
│   └── inc-icon-3.svg
└── How It Works
    └── inc-steps.svg

BOOKKEEPING PAGE
├── First Section
│   └── book-dashboard.png ← Put here!
├── Second Section
│   └── book-workflow.svg ← Put here!
└── Features Grid
    ├── book-icon-1.svg
    └── book-icon-2.svg

TAX COMPLIANCE PAGE
├── Hero Section
│   └── tax-hero.svg ← Put here!
├── Requirements
│   └── tax-checklist.svg
└── Benefits Grid
    ├── tax-icon-compliance.svg
    └── tax-icon-filing.svg

CONSULTATION PAGE
├── During Consultation Section
│   └── cons-calendar.svg ← Put here!
└── After Consultation Section
    └── cons-timeline.svg ← Put here!
```

---

## 🚀 IMMEDIATE ACTION STEPS

### **TODAY:**
1. ✅ Folder structure created (already done!)
2. Gather/design your images (use dimensions from table above)
3. Place images in correct folders using exact file names

### **TOMORROW:**
4. Test website - images should appear automatically
5. Check for any visual issues or sizing problems
6. Adjust images if needed

### **NAMING RULE - MOST IMPORTANT:**
```
✅ Correct (lowercase + hyphens):
   inc-hero.svg
   book-dashboard.png
   tax-icon-filing.svg

❌ Wrong (spaces, capitals, underscores):
   Inc Hero.svg
   book_dashboard.png
   TAX-Icon-Filing.svg
```

---

## 🎯 PRIORITY ORDER (Do First)

If you can only do some images, prioritize:

1. **MUST HAVE:**
   - inc-hero.svg
   - book-dashboard.png
   - cons-calendar.svg

2. **SHOULD HAVE:**
   - tax-hero.svg
   - cons-timeline.svg
   - inc-icon-1.svg, inc-icon-2.svg

3. **NICE TO HAVE:**
   - blog-00X.jpg
   - cons-expert photos
   - other icons/diagrams

---

## 💡 PRO TIPS

✅ Use consistent colors across icons
✅ Keep file names SHORT but descriptive
✅ Use SVG for illustrations (looks crisp, small file size)
✅ Use PNG for UI mockups/screenshots
✅ Use JPG for photos
✅ Test on mobile - images should be responsive
✅ Alt text is already in place - no need to add

---

## 📞 QUESTIONS?

**"Where should I put X image?"**
→ Find your page in the guide above

**"What should the file name be?"**
→ Use the exact name from the folder structure

**"What size should my image be?"**
→ Check the table above (e.g., 600×500px)

**"Is SVG or PNG better?"**
→ SVG for icons/illustrations, PNG for mockups/screenshots, JPG for photos

---

**✅ Ready? Start placing images in the folders now!**
