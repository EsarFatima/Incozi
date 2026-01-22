import os
import re

# Template for the new header (for pages inside /pages directory)
# Uses ../index.html for logo, and relative adjustments for links.
NEW_HEADER = """<header class="site-header">
    <div class="container header-inner">
      <a href="../index.html" class="logo">incozi.</a>
      
      <!-- Navbar Links (Desktop) -->
      <nav class="main-nav" style="display: none;">
          <ul class="nav-list" style="display: flex; gap: 1.5rem; list-style: none; align-items: center; margin: 0;">
              <li class="nav-item">
                  <a href="#" class="nav-link">Services & Pricing <i class="fa-solid fa-chevron-down"></i></a>
                  <ul class="dropdown-menu">
                      <li><a href="incorporation.html">Incorporation</a></li>
                      <li><a href="tax-compliance.html">Tax & Compliance</a></li>
                      <li><a href="bookkeeping.html">Bookkeeping</a></li>
                      <li><a href="consultation.html">Consultation</a></li>
                  </ul>
              </li>
              <li><a href="blog.html" class="nav-link">Blog</a></li>
              <li><a href="my-services.html" class="nav-link">My Services</a></li>
              <li><a href="account.html" class="nav-link" aria-label="My Account"><i class="fa-regular fa-user"></i></a></li>
              <li><a href="cart.html" class="nav-link" aria-label="Cart"><i class="fa-solid fa-cart-shopping"></i></a></li>
          </ul>
      </nav>

      <!-- Menu Toggle (Hamburger) -->
      <button class="menu-toggle custom-toggle" aria-label="Open Menu"><i class="fa-solid fa-bars"></i></button>
    </div>
  </header>"""

PAGES_DIR = r"d:\IncoziProject\Incozi\pages"

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the header block
    # Matches <header ... </header> possibly across multiple lines
    pattern = re.compile(r'<header.*?>.*?</header>', re.DOTALL)
    
    if pattern.search(content):
        new_content = pattern.sub(NEW_HEADER, content)
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
        else:
            print(f"No changes needed for {filepath}")
    else:
        print(f"Warning: No header found in {filepath}")

def main():
    if not os.path.exists(PAGES_DIR):
        print(f"Directory not found: {PAGES_DIR}")
        return

    for filename in os.listdir(PAGES_DIR):
        if filename.endswith(".html"):
            update_file(os.path.join(PAGES_DIR, filename))

if __name__ == "__main__":
    main()
