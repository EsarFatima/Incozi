# IMAGE PLACEMENT REFERENCE - Quick Copy-Paste Guide

## 📂 Current Folder Structure Created

```
assets/images/
├── hero/                          ← Homepage hero images
├── pages/                         ← General page images
├── blog/                          ← Blog post images
├── icons/                         ← SVG icons
└── services/                      ← Service-specific images
    ├── incorporation/             ← INCORPORATION IMAGES
    ├── bookkeeping/               ← BOOKKEEPING IMAGES
    ├── tax-compliance/            ← TAX COMPLIANCE IMAGES
    └── consultation/              ← CONSULTATION IMAGES
```

---

## 🎯 WHERE TO PLACE IMAGES - Folder by Folder

### **1. INCORPORATION SERVICE** 
📁 Folder: `assets/images/services/incorporation/`

| File Name | Description | Format | Size | Where It Appears |
|-----------|-------------|--------|------|-----------------|
| `inc-hero.svg` | Main hero illustration | SVG | 600×500px | Hero section (pages/incorporation.html line ~120) |
| `inc-icon-1.svg` | Benefit icon (Speed/Fast) | SVG | 100×100px | Benefits section |
| `inc-icon-2.svg` | Benefit icon (Expert/Support) | SVG | 100×100px | Benefits section |
| `inc-icon-3.svg` | Benefit icon (Compliance/Legal) | SVG | 100×100px | Benefits section |
| `inc-steps.svg` | Process/Steps diagram | SVG | 800×400px | How it works section |

**✅ Already Updated:** `pages/incorporation.html` line 120 now references `inc-hero.svg`

---

### **2. BOOKKEEPING SERVICE**
📁 Folder: `assets/images/services/bookkeeping/`

| File Name | Description | Format | Size | Where It Appears |
|-----------|-------------|--------|------|-----------------|
| `book-dashboard.png` | Dashboard/interface mockup | PNG | 800×600px | First section (pages/bookkeeping.html line ~180) |
| `book-workflow.svg` | Workflow/process illustration | SVG | 600×400px | Second section (pages/bookkeeping.html line ~210) |
| `book-icon-1.svg` | Feature icon (Automation) | SVG | 100×100px | Features grid |
| `book-icon-2.svg` | Feature icon (Reports) | SVG | 100×100px | Features grid |
| `book-team.jpg` | Team photo (optional) | JPG | 600×400px | Team section |

**✅ Already Updated:** `pages/bookkeeping.html` now references `book-dashboard.png` and `book-workflow.svg`

---

### **3. TAX COMPLIANCE SERVICE**
📁 Folder: `assets/images/services/tax-compliance/`

| File Name | Description | Format | Size | Where It Appears |
|-----------|-------------|--------|------|-----------------|
| `tax-hero.svg` | Main hero illustration | SVG | 600×500px | Hero section (pages/tax-compliance.html line ~42) |
| `tax-checklist.svg` | Checklist/requirements visual | SVG | 600×400px | Requirements section |
| `tax-icon-compliance.svg` | Compliance icon | SVG | 100×100px | Benefits grid |
| `tax-icon-filing.svg` | Filing icon | SVG | 100×100px | Benefits grid |

**✅ Already Updated:** `pages/tax-compliance.html` now references `tax-hero.svg`

---

### **4. CONSULTATION SERVICE**
📁 Folder: `assets/images/services/consultation/`

| File Name | Description | Format | Size | Where It Appears |
|-----------|-------------|--------|------|-----------------|
| `cons-calendar.svg` | Calendar/scheduling illustration | SVG | 500×400px | "During consultation" section (pages/consultation.html line ~233) |
| `cons-timeline.svg` | Timeline/next steps illustration | SVG | 500×400px | "After consultation" section (pages/consultation.html line ~266) |
| `cons-expert-1.jpg` | Expert profile photo | JPG | 300×300px | Team/experts section |
| `cons-expert-2.jpg` | Expert profile photo | JPG | 300×300px | Team/experts section |
| `cons-hero.svg` | Hero section image | SVG | 600×500px | Hero section |

**✅ Already Updated:** `pages/consultation.html` now references `cons-calendar.svg` and `cons-timeline.svg`

---

### **5. HOMEPAGE/HERO IMAGES**
📁 Folder: `assets/images/hero/`

| File Name | Description | Format | Size | Where It Appears |
|-----------|-------------|--------|------|-----------------|
| `hero-main.svg` | Main hero illustration | SVG | 800×600px | Homepage hero section |
| `hero-bg.jpg` | Background image | JPG | 1920×1080px | Hero background |

---

### **6. BLOG IMAGES**
📁 Folder: `assets/images/blog/`

| File Name | Description | Format | Size | Where It Appears |
|-----------|-------------|--------|------|-----------------|
| `blog-001.jpg` | Featured image for post #1 | JPG | 600×400px | Blog card |
| `blog-002.jpg` | Featured image for post #2 | JPG | 600×400px | Blog card |
| `blog-003.jpg` | Featured image for post #3 | JPG | 600×400px | Blog card |

---

### **7. GENERAL PAGE IMAGES**
📁 Folder: `assets/images/pages/`

| File Name | Description | Format | Size | Where It Appears |
|-----------|-------------|--------|------|-----------------|
| `empty-services.svg` | Empty state - no services | SVG | 300×300px | My Services page |
| `empty-docs.svg` | Empty state - no documents | SVG | 300×300px | My Services page |
| `empty-billing.svg` | Empty state - no billing | SVG | 300×300px | My Services page |

---

## 🚀 QUICK START - Add Images Now

### Step 1: Choose Your Service
Pick one service (e.g., Incorporation, Bookkeeping, etc.)

### Step 2: Prepare Your Images
Gather your design assets matching the table above. Example for Incorporation:
- `inc-hero.svg` (600×500px)
- `inc-icon-1.svg` (100×100px)
- `inc-icon-2.svg` (100×100px)
- etc.

### Step 3: Place in Correct Folder
```
Assets → images → services → incorporation → [paste files here]
```

### Step 4: Verify It Works
Open the page in browser: `http://localhost:3000/pages/incorporation.html`
- The hero image should appear in the top section
- All icons should be visible in benefits grid

### Step 5: Repeat for Other Services
Follow the same process for Bookkeeping, Tax Compliance, etc.

---

## 📝 File Naming Cheatsheet

**Always use lowercase + hyphens:**
```
✅ CORRECT:     inc-hero.svg, book-dashboard.png
❌ WRONG:       inc-hero.SVG, bookDashboard.png, Inc Hero.svg
```

**Service Prefixes:**
```
inc-    = Incorporation Service
book-   = Bookkeeping Service
tax-    = Tax Compliance Service
cons-   = Consultation Service
blog-   = Blog Posts
hero-   = Homepage Hero
empty-  = Empty States
```

---

## 🎨 Image Format Guide

**Use SVG for:**
- Icons (benefit icons, feature icons)
- Illustrations (hero images, diagrams, workflows)
- Logos and symbols
- *Reason: Scalable, small file size, crisp on all screens*

**Use PNG for:**
- Screenshots/mockups (dashboard images)
- Images with transparency
- Complex graphics with gradients
- *Reason: Supports transparency, good for UI mockups*

**Use JPG for:**
- Photos (team members, real-world images)
- Blog featured images
- *Reason: Smaller file size, best for photos*

---

## 🔍 How to Verify Images Are Showing

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Look for 404 errors** - these indicate missing images
4. **Check Network tab** - see which images loaded
5. **If image doesn't show:**
   - Check file path is correct
   - Verify file exists in folder
   - Check file name spelling (case-sensitive on some servers)

---

## 📋 Checklist - Have You Done This?

- [ ] Created all 8 folders in `assets/images/`
- [ ] Read the guide above for your service
- [ ] Prepared/designed images with correct dimensions
- [ ] Placed images in correct folders with correct names
- [ ] Tested website to verify images appear
- [ ] Checked for any 404 errors in DevTools
- [ ] All pages look good and complete

---

## 🆘 Troubleshooting

**Image not showing?**
```
1. Check browser console for 404 errors
2. Verify path is correct: ../assets/images/services/[service]/[file].svg
3. Check file name spelling and case
4. Verify file exists in the folder
5. Clear browser cache (Ctrl+Shift+Del)
```

**Weird formatting/sizing?**
```
1. Check dimensions match recommendations
2. Verify format (SVG vs PNG vs JPG)
3. Use `max-width: 100%; height: auto;` in img tags
```

**Folder structure unclear?**
```
Use Windows Explorer to navigate:
D:\IncoziProject\Incozi\assets\images\
You should see: hero, pages, blog, icons, services folders
```

---

**✅ Ready to add your images! Start with any service folder above.**
