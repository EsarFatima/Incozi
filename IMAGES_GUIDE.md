# Incozi Images Organization Guide

## 📁 Folder Structure

```
assets/
└── images/
    ├── hero/                          # Homepage hero section
    ├── pages/                         # General page images
    ├── blog/                          # Blog post images
    ├── icons/                         # SVG icons & symbols
    └── services/                      # Service-specific images
        ├── incorporation/
        ├── bookkeeping/
        ├── tax-compliance/
        └── consultation/
```

---

## 📋 Image Naming Convention

**Format:** `{type}-{name}.{ext}`

**Examples:**
- `hero-main.svg` (hero image)
- `inc-hero.svg` (incorporation hero)
- `book-dashboard.png` (bookkeeping dashboard)
- `tax-checklist.svg` (tax compliance checklist)

---

## 🎯 Where to Place Images

### **Homepage (index.html)**

| Location | Image Name | Path | Dimensions | Format |
|----------|-----------|------|-----------|--------|
| Hero Section | `hero-main.svg` | `assets/images/hero/hero-main.svg` | 800×600px | SVG |
| Hero Background | `hero-bg.jpg` | `assets/images/hero/hero-bg.jpg` | 1920×1080px | JPG |

**HTML Reference:**
```html
<!-- Hero image -->
<img src="../../assets/images/hero/hero-main.svg" alt="Incozi Services">

<!-- Hero background -->
<div style="background: url('../../assets/images/hero/hero-bg.jpg') center/cover;"></div>
```

---

### **Incorporation Page (pages/incorporation.html)**

| Section | Image Name | Path | Dimensions | Format |
|---------|-----------|------|-----------|--------|
| Hero Image | `inc-hero.svg` | `../assets/images/services/incorporation/inc-hero.svg` | 600×500px | SVG |
| Steps Diagram | `inc-steps.svg` | `../assets/images/services/incorporation/inc-steps.svg` | 800×400px | SVG |
| Benefits Icon 1 | `inc-icon-1.svg` | `../assets/images/services/incorporation/inc-icon-1.svg` | 100×100px | SVG |
| Benefits Icon 2 | `inc-icon-2.svg` | `../assets/images/services/incorporation/inc-icon-2.svg` | 100×100px | SVG |
| Benefits Icon 3 | `inc-icon-3.svg` | `../assets/images/services/incorporation/inc-icon-3.svg` | 100×100px | SVG |

**HTML Reference:**
```html
<!-- Line ~120: Hero Section -->
<div class="hero-img">
  <img src="../assets/images/services/incorporation/inc-hero.svg" alt="Business Incorporation">
</div>

<!-- Benefits Icons Section -->
<img src="../assets/images/services/incorporation/inc-icon-1.svg" alt="Fast Process" class="benefit-icon">
<img src="../assets/images/services/incorporation/inc-icon-2.svg" alt="Expert Team" class="benefit-icon">
<img src="../assets/images/services/incorporation/inc-icon-3.svg" alt="Legal Compliant" class="benefit-icon">
```

---

### **Bookkeeping Page (pages/bookkeeping.html)**

| Section | Image Name | Path | Dimensions | Format |
|---------|-----------|------|-----------|--------|
| Hero Image | `book-hero.svg` | `../assets/images/services/bookkeeping/book-hero.svg` | 600×500px | SVG |
| Dashboard Mock | `book-dashboard.png` | `../assets/images/services/bookkeeping/book-dashboard.png` | 800×600px | PNG |
| Team Image | `book-team.jpg` | `../assets/images/services/bookkeeping/book-team.jpg` | 600×400px | JPG |
| Feature Icon 1 | `book-icon-1.svg` | `../assets/images/services/bookkeeping/book-icon-1.svg` | 100×100px | SVG |
| Feature Icon 2 | `book-icon-2.svg` | `../assets/images/services/bookkeeping/book-icon-2.svg` | 100×100px | SVG |

**HTML Reference:**
```html
<!-- Replace vector-placeholder with real images -->
<img src="../assets/images/services/bookkeeping/book-dashboard.png" alt="Bookkeeping Dashboard">

<!-- Feature Icons -->
<img src="../assets/images/services/bookkeeping/book-icon-1.svg" alt="Automated Tracking" class="feature-icon">
<img src="../assets/images/services/bookkeeping/book-icon-2.svg" alt="Real-time Reports" class="feature-icon">
```

---

### **Tax Compliance Page (pages/tax-compliance.html)**

| Section | Image Name | Path | Dimensions | Format |
|---------|-----------|------|-----------|--------|
| Hero Image | `tax-hero.svg` | `../assets/images/services/tax-compliance/tax-hero.svg` | 600×500px | SVG |
| Checklist | `tax-checklist.svg` | `../assets/images/services/tax-compliance/tax-checklist.svg` | 600×400px | SVG |
| Compliance Icon | `tax-icon-compliance.svg` | `../assets/images/services/tax-compliance/tax-icon-compliance.svg` | 100×100px | SVG |
| Filing Icon | `tax-icon-filing.svg` | `../assets/images/services/tax-compliance/tax-icon-filing.svg` | 100×100px | SVG |

**HTML Reference:**
```html
<!-- Replace external image (line 42) -->
<img src="../assets/images/services/tax-compliance/tax-hero.svg" alt="Tax Compliance Services">

<!-- Checklist Section -->
<img src="../assets/images/services/tax-compliance/tax-checklist.svg" alt="Tax Compliance Checklist">
```

---

### **Consultation Page (pages/consultation.html)**

| Section | Image Name | Path | Dimensions | Format |
|---------|-----------|------|-----------|--------|
| Hero Image | `cons-hero.svg` | `../assets/images/services/consultation/cons-hero.svg` | 600×500px | SVG |
| Calendar Icon | `cons-calendar.svg` | `../assets/images/services/consultation/cons-calendar.svg` | 400×400px | SVG |
| Expert Profile 1 | `cons-expert-1.jpg` | `../assets/images/services/consultation/cons-expert-1.jpg` | 300×300px | JPG |
| Expert Profile 2 | `cons-expert-2.jpg` | `../assets/images/services/consultation/cons-expert-2.jpg` | 300×300px | JPG |

**HTML Reference:**
```html
<!-- Scheduling section -->
<img src="../assets/images/services/consultation/cons-calendar.svg" alt="Schedule Consultation">

<!-- Expert profiles -->
<img src="../assets/images/services/consultation/cons-expert-1.jpg" alt="Expert Name" class="expert-profile">
```

---

### **Blog Page (pages/blog.html)**

| Section | Image Name | Path | Dimensions | Format |
|---------|-----------|------|-----------|--------|
| Post 1 Featured | `blog-001.jpg` | `../assets/images/blog/blog-001.jpg` | 600×400px | JPG |
| Post 2 Featured | `blog-002.jpg` | `../assets/images/blog/blog-002.jpg` | 600×400px | JPG |
| Post 3 Featured | `blog-003.jpg` | `../assets/images/blog/blog-003.jpg` | 600×400px | JPG |

**HTML Reference:**
```html
<!-- Blog card -->
<img src="../assets/images/blog/blog-001.jpg" alt="Blog Post Title" class="blog-featured">
```

---

### **My Services Page (pages/my-services.html)**

| Section | Image Name | Path | Dimensions | Format |
|---------|-----------|------|-----------|--------|
| Empty State | `empty-services.svg` | `../assets/images/pages/empty-services.svg` | 300×300px | SVG |
| Empty Documents | `empty-docs.svg` | `../assets/images/pages/empty-docs.svg` | 300×300px | SVG |
| Empty Billing | `empty-billing.svg` | `../assets/images/pages/empty-billing.svg` | 300×300px | SVG |

---

## 📝 Quick Reference

### Short Name Mapping
```
inc-    = Incorporation
book-   = Bookkeeping
tax-    = Tax Compliance
cons-   = Consultation
blog-   = Blog
hero-   = Homepage Hero
```

### Image Formats
- **SVG** - Illustrations, icons, diagrams (scalable, lightweight)
- **PNG** - Complex graphics, UI mockups (transparency support)
- **JPG** - Photos, team images (smaller file size)

### File Size Guidelines
- SVG: < 100KB
- PNG: < 500KB
- JPG: < 300KB

---

## 🚀 Steps to Add Images

1. **Choose the correct folder** based on the table above
2. **Name your image** using the short naming convention
3. **Place the image** in the appropriate subfolder
4. **Update the HTML** file with the correct path
5. **Test** the website to verify images appear

### Example: Adding Incorporation Hero Image

```bash
# 1. Save your image as: inc-hero.svg
# 2. Place in: assets/images/services/incorporation/
# 3. Update HTML (line ~120 in incorporation.html):

<div class="hero-img">
  <img src="../assets/images/services/incorporation/inc-hero.svg" alt="Business Incorporation">
</div>

# 4. Save and test!
```

---

## 📊 Current Status

| Page | Images Ready | Location |
|------|--------------|----------|
| Homepage | ✓ Partial | `assets/images/hero/` |
| Incorporation | ⚠️ Needs | `assets/images/services/incorporation/` |
| Bookkeeping | ⚠️ Needs | `assets/images/services/bookkeeping/` |
| Tax Compliance | ⚠️ Needs | `assets/images/services/tax-compliance/` |
| Consultation | ⚠️ Needs | `assets/images/services/consultation/` |
| Blog | ⚠️ Needs | `assets/images/blog/` |
| My Services | ✓ Icons | `assets/images/pages/` |

---

**Total Folders Created:** 8  
**Ready for:** Images to be added!
