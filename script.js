document.addEventListener('DOMContentLoaded', function () {

  /* --- Sidebar Navigation Logic --- */
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar-menu');
  const overlay = document.querySelector('.sidebar-overlay');
  const closeBtn = document.querySelector('.sidebar-close');

  function toggleMenu() {
    if (sidebar && overlay) {
      const isOpen = sidebar.classList.contains('open');
      if (isOpen) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      } else {
        sidebar.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }
  }

  if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
  if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', toggleMenu);
  
  /* --- Sign Out Logic (Universal) --- */
  document.body.addEventListener('click', (e) => {
      // Check if clicked element or parent is a logout link
      const btn = e.target.closest('.logout-link');
      if (btn) {
          e.preventDefault();
          
          if(confirm('Are you sure you want to sign out?')) {
              localStorage.removeItem('incozi_token');
              localStorage.removeItem('incozi_user');
              
              // Redirect to account page (handle path difference)
              if (window.location.pathname.includes('/pages/')) {
                  window.location.href = 'account.html';
              } else {
                  window.location.href = 'pages/account.html';
              }
          }
      }
  });


  /* --- Scroll Animation --- */
  // The service cards start with opacity:0 (in CSS). 
  // This observer adds 'visible' (opacity:1) when they scroll into view.
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    observer.observe(card);
  });


  /* --- Tabs Logic --- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const container = button.closest('.tabs-container');
      const targetId = button.getAttribute('data-target');
      
      if (!container) return; // Guard clause

      // Remove active class from neighbors
      container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Activate clicked
      button.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });


  /* --- Billing Toggle Logic (Bookkeeping) --- */
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.billing-toggle');
      if (!container) return;

      // Update toggle UI
      container.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update Price Visibility
      const period = btn.getAttribute('data-period'); // 'monthly' or 'yearly'
      const serviceCard = btn.closest('.service-card');
      
      if (serviceCard) {
        if (period === 'monthly') {
          // Hide yearly, show monthly
          serviceCard.querySelectorAll('.price-yearly').forEach(el => el.style.display = 'none');
          serviceCard.querySelectorAll('.price-monthly').forEach(el => el.style.display = 'block');
        } else {
          // Hide monthly, show yearly
          serviceCard.querySelectorAll('.price-monthly').forEach(el => el.style.display = 'none');
          serviceCard.querySelectorAll('.price-yearly').forEach(el => el.style.display = 'block');
        }
      }
    });
  });

});

/* --- Cart Logic --- */
function addToCart(itemName, itemPrice) {
    const cart = JSON.parse(localStorage.getItem('incoziCart')) || [];
    cart.push({ item: itemName, price: itemPrice });
    localStorage.setItem('incoziCart', JSON.stringify(cart));
    
    // Redirect
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = 'cart.html';
    } else {
        window.location.href = 'pages/cart.html';
    }
}
window.addToCart = addToCart;

function addBookkeepingToCart(tier) {
    // Find the bookkeeping card
    const card = document.getElementById('bookkeeping-card');
    if (!card) return;

    // Check which period is active
    const activeToggle = card.querySelector('.toggle-btn.active');
    const period = activeToggle ? activeToggle.getAttribute('data-period') : 'yearly'; // Default to yearly

    let price = 0;
    let name = `Bookkeeping - ${tier} (${period})`;

    if (tier === 'Mini') {
        price = (period === 'monthly') ? 179 : 1969; 
    } else if (tier === 'Starter') {
        price = (period === 'monthly') ? 249 : 2739;
    } else if (tier === 'Pro') {
        price = (period === 'monthly') ? 499 : 5489;
    }

    addToCart(name, price);
}
window.addBookkeepingToCart = addBookkeepingToCart;

/* --- Badge Logic --- */
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('incoziCart')) || [];
    const count = cart.length;
    
    // Target all cart links (desktop + mobile sidebar)
    // We look for href ending in cart.html or containing /cart.html
    const cartLinks = document.querySelectorAll('a[href*="cart.html"]');
    
    cartLinks.forEach(link => {
        let badge = link.querySelector('.cart-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                link.appendChild(badge);
            }
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            if (badge) badge.style.display = 'none';
        }
    });
}
window.updateCartBadge = updateCartBadge;

// Initialize badge on load
document.addEventListener('DOMContentLoaded', updateCartBadge);
