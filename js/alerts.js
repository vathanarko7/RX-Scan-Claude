(function() {
  const tx = (key, params, fallback = '') => (typeof globalThis.t === 'function' ? globalThis.t(key, params, fallback) : (fallback || key));
  const EXPIRING_SOON_DAYS = 90;
  let activeAlertFilter = 'all';

  function buildAlertInfo(med) {
    return [
      med.category,
      med.mfr,
      med.shelf,
      med.expiry || tx('alerts.info.noExpiry', null, 'No expiry'),
    ].filter(Boolean).join(' · ');
  }

  function compareAlertPriority(a, b) {
    const order = {
      expired: 0,
      out: 1,
      low: 2,
      expiring: 3,
    };
    const rankDiff = (order[a.subtype] ?? 99) - (order[b.subtype] ?? 99);
    if (rankDiff !== 0) return rankDiff;

    if (a.subtype === 'expired' || a.subtype === 'expiring') {
      return String(a.time).localeCompare(String(b.time));
    }

    return a.title.localeCompare(b.title);
  }

  function buildAlerts() {
    const now = new Date();
    const alerts = [];

    const out = inventory.filter((med) => med.stock === 0);
    out.forEach((med) => alerts.push({
      type: 'critical',
      subtype: 'out',
      medId: med.id,
      shelf: med.shelf || '',
      icon: '&#8857;',
      title: med.name,
      info: buildAlertInfo(med),
      stock: med.stock,
      reorder: med.reorder,
      time: 'Now',
    }));

    const low = inventory.filter((med) => med.stock > 0 && med.stock <= med.reorder);
    low.forEach((med) => alerts.push({
      type: 'warning',
      subtype: 'low',
      medId: med.id,
      shelf: med.shelf || '',
      icon: '&#9888;',
      title: med.name,
      info: buildAlertInfo(med),
      stock: med.stock,
      reorder: med.reorder,
      time: 'Now',
    }));

    const expired = inventory.filter((med) => new Date(med.expiry + 'T00:00:00') < now);
    expired.forEach((med) => alerts.push({
      type: 'critical',
      subtype: 'expired',
      medId: med.id,
      shelf: med.shelf || '',
      icon: '&#9940;',
      title: med.name,
      info: [med.category, med.mfr, med.shelf, med.expiry].filter(Boolean).join(' · '),
      time: med.expiry,
    }));

    const soonExp = inventory.filter((med) => {
      const date = new Date(med.expiry + 'T00:00:00');
      const diff = Math.round((date - now) / 86400000);
      return diff >= 0 && diff <= EXPIRING_SOON_DAYS;
    });

    soonExp.forEach((med) => {
      const diff = Math.round((new Date(med.expiry + 'T00:00:00') - now) / 86400000);
      alerts.push({
        type: 'warning',
        subtype: 'expiring',
        medId: med.id,
        shelf: med.shelf || '',
        icon: '&#9716;',
        title: med.name,
        info: [med.category, med.mfr, med.shelf, med.expiry].filter(Boolean).join(' · '),
        daysLeft: diff,
        time: med.expiry,
      });
    });

    const sortedAlerts = alerts.sort(compareAlertPriority);
    const dedupedAlerts = [];
    const seenMedicineIds = new Set();

    sortedAlerts.forEach((alert) => {
      if (seenMedicineIds.has(alert.medId)) return;
      seenMedicineIds.add(alert.medId);
      dedupedAlerts.push(alert);
    });

    return dedupedAlerts;
  }

  function getFilteredAlerts(alerts) {
    if (activeAlertFilter === 'all') return alerts;
    if (activeAlertFilter === 'out') {
      return alerts.filter((alert) => alert.subtype === 'expired' || alert.subtype === 'out');
    }
    return alerts.filter((alert) => alert.subtype === activeAlertFilter);
  }

  function getAlertFilterCounts(alerts) {
    return {
      all: alerts.length,
      out: alerts.filter((alert) => alert.subtype === 'expired' || alert.subtype === 'out').length,
      low: alerts.filter((alert) => alert.subtype === 'low').length,
      expiring: alerts.filter((alert) => alert.subtype === 'expiring').length,
    };
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

  function getAlertKicker(alert) {
    if (alert.subtype === 'expired') return tx('alerts.kicker.expired', null, 'Expired');
    if (alert.subtype === 'out') return tx('alerts.kicker.out', null, 'Out of stock');
    if (alert.subtype === 'low') return tx('alerts.kicker.low', null, 'Low stock');
    if (alert.subtype === 'expiring') return tx('alerts.kicker.expiring', null, 'Expiring soon');
    return tx('alerts.kicker.default', null, 'Alert');
  }

  function getAlertMeter(alert) {
    if (alert.subtype === 'low' || alert.subtype === 'out') {
      const reorder = Math.max(Number(alert.reorder) || 0, 1);
      const stock = Math.max(Number(alert.stock) || 0, 0);
      const fill = Math.max(0, Math.min(100, (stock / reorder) * 100));
      return {
        left: tx('alerts.meter.boxes', { count: stock }, `${stock} boxes`),
        right: tx('alerts.meter.reorder', { count: reorder }, `Reorder ${reorder}`),
        fill,
      };
    }

    if (alert.subtype === 'expiring') {
      const daysLeft = Math.max(Number(alert.daysLeft) || 0, 0);
      const fill = Math.max(0, Math.min(100, (daysLeft / EXPIRING_SOON_DAYS) * 100));
      return {
        left: tx('alerts.meter.daysLeft', { count: daysLeft }, `${daysLeft}d left`),
        right: '',
        fill,
      };
    }

    return null;
  }

  function getAlertPopupOptions(alert) {
    if (alert.subtype === 'expired') {
      return {
        visibleActions: ['delete', 'locate'],
        preferredActions: ['delete', 'locate'],
      };
    }

    if (alert.subtype === 'low' || alert.subtype === 'out') {
      return {
        visibleActions: ['stock', 'locate'],
        preferredActions: ['stock', 'locate'],
      };
    }

    if (alert.subtype === 'expiring') {
      return {
        visibleActions: ['locate', 'edit'],
        preferredActions: ['locate', 'edit'],
      };
    }

    return {
      visibleActions: ['stock', 'locate', 'edit', 'delete'],
      preferredActions: ['stock', 'locate', 'edit', 'delete'],
    };
  }

  function renderAlertItem(alert) {
    const meter = getAlertMeter(alert);
    const popupOptions = JSON.stringify(getAlertPopupOptions(alert)).replace(/"/g, '&quot;');
    return `
      <button class="alert-card alert-${alert.type} alert-${alert.subtype}" onclick="openInventoryActions(${alert.medId}, ${popupOptions})">
        <div class="alert-icon">${alert.icon}</div>
        <div class="alert-content">
          <div class="alert-head">
            <div class="alert-title">${esc(alert.title)}</div>
            <div class="alert-kicker">${esc(getAlertKicker(alert))}</div>
          </div>
          <div class="alert-info-line">${esc(alert.info)}</div>
          ${meter ? `
            <div class="alert-meter">
              <div class="alert-meter-top">
                <span>${esc(meter.left)}</span>
                <span>${esc(meter.right)}</span>
              </div>
              <div class="alert-meter-track">
                <div class="alert-meter-fill" style="width:${meter.fill}%;"></div>
              </div>
            </div>
          ` : ''}
        </div>
      </button>`;
  }

  function getAlertGroupDefinitions() {
    return [
      { id: 'critical', title: tx('alerts.group.critical', null, 'Critical'), subtypes: ['expired', 'out'] },
      { id: 'warning', title: tx('alerts.group.warning', null, 'Needs reorder'), subtypes: ['low'] },
      { id: 'expiring', title: tx('alerts.group.expiring', null, 'Expiring soon'), subtypes: ['expiring'] },
    ];
  }

  function renderAlertGroup(group, alerts) {
    if (!alerts.length) return '';
    return `
      <section class="alert-group">
        <div class="alert-group-header">
          <div class="alert-group-title">${group.title}</div>
          <div class="alert-group-count">${alerts.length}</div>
        </div>
        <div class="alert-group-list">
          ${alerts.map(renderAlertItem).join('')}
        </div>
      </section>`;
  }

  function renderAlertFilterChips(alerts) {
    const counts = getAlertFilterCounts(alerts);
    const filters = [
      { id: 'all', label: tx('alerts.filter.all', null, 'All'), count: counts.all, toneClass: 'filter-all' },
      { id: 'low', label: tx('alerts.filter.low', null, 'Low'), count: counts.low, toneClass: 'filter-low' },
      { id: 'out', label: tx('alerts.filter.out', null, 'Out'), count: counts.out, toneClass: 'filter-out' },
      { id: 'expiring', label: tx('alerts.filter.expiring', null, 'Expiring'), count: counts.expiring, toneClass: 'filter-expiring' },
    ];

    return `
      <div class="alerts-toolbar">
        ${filters.map((filter) => `
          <button class="alert-filter-chip ${filter.toneClass} ${activeAlertFilter === filter.id ? 'active' : ''}" onclick="setAlertFilter('${filter.id}')">
            <span>${filter.label}</span>
            <span class="alert-filter-count">${filter.count}</span>
          </button>
        `).join('')}
      </div>`;
  }

  function renderAlertEmptyState(message = tx('alerts.empty.filter', null, 'No alerts in this filter right now.')) {
    return `
      <div class="empty-state alert-empty-state">
        <div class="icon">&#9989;</div>
        <h3>${tx('alerts.empty.title', null, 'All clear')}</h3>
        <p>${esc(message)}</p>
      </div>`;
  }

  function renderAlertsView() {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;

    if (isLoadingData) {
      alertsList.innerHTML = Array.from({ length: 4 }, () => `
        <div class="alert-card">
          <div class="alert-icon skeleton" style="border-radius:10px;"></div>
          <div class="alert-content" style="flex:1;">
            <div class="skeleton skeleton-line" style="height:15px;width:68%;margin-bottom:8px;"></div>
            <div class="skeleton skeleton-line" style="height:12px;width:86%;margin-bottom:8px;"></div>
            <div class="skeleton skeleton-line" style="height:6px;width:100%;"></div>
          </div>
        </div>
      `).join('');
      return;
    }

    const alerts = syncAlertBadges(buildAlerts());
    const filteredAlerts = getFilteredAlerts(alerts);
    if (!alerts.length) {
      alertsList.innerHTML = renderAlertEmptyState(tx('alerts.empty.none', null, 'No active alerts at this time.'));
      return;
    }

    const groups = getAlertGroupDefinitions();
    const groupedMarkup = groups.map((group) => {
      const groupAlerts = filteredAlerts.filter((alert) => group.subtypes.includes(alert.subtype));
      return renderAlertGroup(group, groupAlerts);
    }).join('');

    alertsList.innerHTML = `
      ${renderAlertFilterChips(alerts)}
      ${filteredAlerts.length ? groupedMarkup : renderAlertEmptyState()}
    `;
  }

  function renderAlerts() {
    return renderAlertsView();
  }

  function setAlertFilter(filter) {
    activeAlertFilter = filter;
    renderAlertsView();
  }

  globalThis.buildAlerts = buildAlerts;
  globalThis.syncAlertBadges = syncAlertBadges;
  globalThis.renderAlerts = renderAlerts;
  globalThis.setAlertFilter = setAlertFilter;
})();
