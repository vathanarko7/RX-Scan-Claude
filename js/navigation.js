(function() {
  function syncNavigationState(name) {
    const pageNames = ['dashboard', 'inventory', 'map', 'alerts', 'analytics'];
    const idx = pageNames.indexOf(name);

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const desktopNavButtons = document.querySelectorAll('.nav-btn');
    if (idx >= 0 && desktopNavButtons[idx]) desktopNavButtons[idx].classList.add('active');

    pageNames.forEach(page => {
      const mobileBtn = document.getElementById(`mn-${page}`);
      if (mobileBtn) mobileBtn.classList.toggle('active', page === name);
    });

    const headerAlert = document.getElementById('mobile-header-alert');
    if (headerAlert) headerAlert.classList.toggle('active', name === 'alerts');
  }

  function showPage(name) {
    try {
      sessionStorage.setItem(LAST_PAGE_KEY, name);
    } catch (error) {
      console.warn('Unable to persist current page', error);
    }
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');
    syncNavigationState(name);

    if (name === 'dashboard') renderDashboard();
    if (name === 'inventory') renderInventory();
    if (name === 'map') renderMap();
    if (name === 'alerts') renderAlerts();
    if (name === 'analytics') renderAnalytics();
  }

  function updateMobileNav() {
    const primaryNav = document.getElementById('mobile-nav');
    if (!primaryNav) return;
    primaryNav.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
  }

  function setMobileNavHidden(hidden) {
    const primaryNav = document.getElementById('mobile-nav');
    const display = hidden ? 'none' : (window.innerWidth <= 768 ? 'flex' : 'none');
    if (primaryNav) primaryNav.style.display = display;
  }

  globalThis.syncNavigationState = syncNavigationState;
  globalThis.showPage = showPage;
  globalThis.updateMobileNav = updateMobileNav;
  globalThis.setMobileNavHidden = setMobileNavHidden;
})();
