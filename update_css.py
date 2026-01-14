
new_css = """
:root{
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --max-width:1200px;
  --bg:#f9fafb; /* Lighter gray background for main */
  --sidebar-bg: #ffffff;
  --sidebar-width: 260px;
  --text:#111827;
  --text-muted: #6b7280;
  --primary:#0b66ff;
  --primary-hover: #0052cc;
  --border-color: #e5e7eb;
}

* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; padding: 0; }

body {
  font-family: var(--font-family);
  font-size: 16px;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
}

a { text-decoration: none; color: inherit; }
ul { list-style: none; padding: 0; margin: 0; }

/* Layout Structure */
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar Styling */
.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  display: block;
}

.sidebar-nav {
  padding: 1rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid transparent; /* Spacer */
}

.nav-section:last-child {
  margin-top: auto; /* Push user/cart to bottom if desired, or just list them */
  border-top: 1px solid var(--border-color);
}

.nav-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.nav-section ul li {
  margin-bottom: 0.5rem;
}

.nav-section a {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  color: var(--text);
  font-weight: 500;
  transition: all 0.2s;
  margin: 0 -0.75rem; /* Negative margin to alignment with padding */
}

.nav-section a:hover, .nav-section a.active {
  background-color: #f3f4f6;
  color: var(--primary);
}

.badge {
  background: var(--primary);
  color: white;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  margin-left: 0.5rem;
}

/* Main Content Styling */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width); /* Offset for fixed sidebar */
  padding: 2rem 3rem;
  max-width: 1400px; /* Limit width on huge screens */
}

.content-header {
  margin-bottom: 2.5rem;
}

.content-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.service-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.service-card p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  flex: 1; /* Pushes footer down */
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.price {
  font-weight: 600;
  font-size: 0.9rem;
}

/* Buttons */
.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: #f0f7ff;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 100;
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    padding: 1.5rem;
  }
  
  /* Add a hamburger menu capability if needed, or keeping it simple for now */
}
"""

with open('d:\\IncoziProject\\Incozi\\style.css', 'w', encoding='utf-8') as f:
    f.write(new_css)
