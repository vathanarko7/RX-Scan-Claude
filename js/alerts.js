(function() {
  function buildAlerts() {
    const now = new Date();
    const alerts = [];

    const out = inventory.filter((med) => med.stock === 0);
    out.forEach((med) => alerts.push({
      type: 'critical',
      icon: '&#128680;',
      title: `OUT OF STOCK: ${med.name}`,
      desc: `Barcode ${med.barcode} · ${med.zone} · ${med.shelf}`,
      time: 'Now',
    }));

    const low = inventory.filter((med) => med.stock > 0 && med.stock <= med.reorder);
    low.forEach((med) => alerts.push({
      type: 'warning',
      icon: '&#9888;&#65039;',
      title: `Low Stock: ${med.name}`,
      desc: `${med.stock} boxes left (reorder at ${med.reorder}) · ${med.shelf}`,
      time: 'Now',
    }));

    const expired = inventory.filter((med) => new Date(med.expiry + 'T00:00:00') < now);
    expired.forEach((med) => alerts.push({
      type: 'critical',
      icon: '&#9940;',
      title: `EXPIRED: ${med.name}`,
      desc: `Expired on ${med.expiry} · ${med.shelf} · remove from shelf immediately`,
      time: med.expiry,
    }));

    const soonExp = inventory.filter((med) => {
      const date = new Date(med.expiry + 'T00:00:00');
      const diff = Math.round((date - now) / 86400000);
      return diff >= 0 && diff < 30;
    });

    soonExp.forEach((med) => {
      const diff = Math.round((new Date(med.expiry + 'T00:00:00') - now) / 86400000);
      alerts.push({
        type: 'warning',
        icon: '&#128467;',
        title: `Expiring in ${diff} days: ${med.name}`,
        desc: `Expires ${med.expiry} · ${med.shelf}`,
        time: med.expiry,
      });
    });

    return alerts;
  }

  function syncAlertBadges(alerts = buildAlerts()) {
    const count = alerts.length;
    const alertBadge = document.getElementById('alert-badge');
    const headerBadge = document.getElementById('header-alert-badge');
    const mobileBadge = document.getElementById('mn-badge');

    if (alertBadge) {
      alertBadge.textContent = count;
      alertBadge.style.display = count ? '' : 'none';
    }
    if (headerBadge) {
      headerBadge.textContent = count;
      headerBadge.style.display = count ? '' : 'none';
    }
    if (mobileBadge) {
      mobileBadge.textContent = count;
      mobileBadge.style.display = count ? '' : 'none';
    }

    return alerts;
  }

  function renderAlertItem(alert) {
    return `
      <div class="alert-card alert-${alert.type}">
        <div class="alert-icon">${alert.icon}</div>
        <div class="alert-content">
          <div class="alert-title">${esc(alert.title)}</div>
          <div class="alert-desc">${esc(alert.desc)}</div>
        </div>
        <div class="alert-time">${esc(alert.time)}</div>
      </div>`;
  }

  function renderAlertsView() {
    if (isLoadingData) {
      document.getElementById('alerts-list').innerHTML = Array.from({ length: 4 }, () => `
        <div class="alert-card">
          <div class="alert-icon skeleton" style="border-radius:10px;"></div>
          <div class="alert-content" style="flex:1;">
            <div class="skeleton skeleton-line" style="height:14px;width:68%;"></div>
            <div class="skeleton skeleton-line" style="height:12px;width:86%;"></div>
          </div>
          <div class="skeleton skeleton-line" style="height:12px;width:44px;"></div>
        </div>
      `).join('');
      return;
    }

    const alerts = syncAlertBadges(buildAlerts());
    if (!alerts.length) {
      document.getElementById('alerts-list').innerHTML = '<div class="empty-state"><div class="icon">&#9989;</div><h3>All clear!</h3><p>No active alerts at this time</p></div>';
      return;
    }

    document.getElementById('alerts-list').innerHTML = alerts.map(renderAlertItem).join('');
  }

  function renderAlerts() {
    return renderAlertsView();
  }

  globalThis.buildAlerts = buildAlerts;
  globalThis.syncAlertBadges = syncAlertBadges;
  globalThis.renderAlerts = renderAlerts;
})();

