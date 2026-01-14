
new_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Incozi - Business Services</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app-layout">
    <!-- Sidebar / Cide Menu Bar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <a class="brand" href="index.html">Incozi</a>
      </div>
      
      <nav class="sidebar-nav">
        <!-- Services and Pricing Section -->
        <div class="nav-section">
          <h3 class="nav-title">Services & Pricing</h3>
          <ul>
            <li><a href="#" class="active">All Services</a></li>
            <li><a href="#">Consultation</a></li>
            <li><a href="#">Incorporation</a></li>
            <li><a href="#">Tax and compliance</a></li>
            <li><a href="#">Bookkeeping</a></li>
          </ul>
        </div>

        <!-- About Us Section -->
        <div class="nav-section">
          <h3 class="nav-title">About Us</h3>
          <ul>
            <li><a href="#">Who We Are</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        <!-- Other Sections -->
        <div class="nav-section">
          <ul>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <!-- User & Cart -->
         <div class="nav-section user-section">
          <ul>
            <li><a href="pages/account.html">My Account</a></li>
            <li><a href="#">Cart <span class="badge">0</span></a></li>
          </ul>
        </div>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <header class="content-header">
        <h1>All Services</h1>
        <p class="subtitle">Choose the right services to grow your business.</p>
      </header>

      <div class="services-grid">
        <!-- Consultation -->
        <article class="service-card">
          <div class="card-icon">💡</div>
          <h2>Consultation</h2>
          <p>Expert advice on how to structure and grow your business in the US market.</p>
          <div class="card-footer">
            <span class="price">From $99</span>
            <button class="btn-outline">Learn More</button>
          </div>
        </article>

        <!-- Incorporation -->
        <article class="service-card">
          <div class="card-icon">🏢</div>
          <h2>Incorporation</h2>
          <p>Seamless US company formation. We handle the paperwork so you can focus on building.</p>
          <div class="card-footer">
            <span class="price">From $299</span>
            <button class="btn-outline">Learn More</button>
          </div>
        </article>

        <!-- Tax and Compliance -->
        <article class="service-card">
          <div class="card-icon">📑</div>
          <h2>Tax and Compliance</h2>
          <p>Stay compliant with ease. Annual filings, tax returns, and regulatory support.</p>
          <div class="card-footer">
            <span class="price">Custom Quote</span>
            <button class="btn-outline">Learn More</button>
          </div>
        </article>

        <!-- Bookkeeping -->
        <article class="service-card">
          <div class="card-icon">📊</div>
          <h2>Bookkeeping</h2>
          <p>Accurate financial records kept up to date. Monthly reports and dashboard access.</p>
          <div class="card-footer">
            <span class="price">From $150/mo</span>
            <button class="btn-outline">Learn More</button>
          </div>
        </article>
      </div>
    </main>
  </div>
  
  <script src="script.js"></script>
</body>
</html>
"""

with open('d:\\IncoziProject\\Incozi\\index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
