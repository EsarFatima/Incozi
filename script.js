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
