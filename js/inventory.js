(function() {
  const tx = (key, params, fallback = '') => (typeof globalThis.t === 'function' ? globalThis.t(key, params, fallback) : (fallback || key));

  function translateCategoryLabel(category) {
    if (!category) return '';
    const key = `category.${String(category).toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    return tx(key, null, category);
  }

  function renderDashboard() {
    const dashboardDate = document.getElementById('dashboard-date');
    const dashboardPriorityLine = document.getElementById('dashboard-priority-line');
    const dashboardGreetingPrefix = document.getElementById('dashboard-greeting-prefix');
    const now = new Date();

    if (dashboardGreetingPrefix) {
      const hour = now.getHours();
      let greeting = tx('dashboard.greeting.morning', null, 'Good morning');
      if (hour >= 18) greeting = tx('dashboard.greeting.evening', null, 'Good evening');
      else if (hour >= 12) greeting = tx('dashboard.greeting.afternoon', null, 'Good afternoon');
      dashboardGreetingPrefix.textContent = greeting;
    }

    if (dashboardDate) {
      const locale = typeof globalThis.i18n?.getLanguage === 'function' && globalThis.i18n.getLanguage() === 'km' ? 'km-KH' : 'en-US';
      dashboardDate.textContent = now.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (isLoadingData) {
      const statTotal = document.getElementById('stat-total');
      const statValue = document.getElementById('stat-value');
      const statLow = document.getElementById('stat-low');
      const statExpiry = document.getElementById('stat-expiry');
      const scanHistoryList = document.getElementById('scan-history-list');
      const categoryChart = document.getElementById('category-chart');
      if (statTotal) statTotal.innerHTML = '<div class="skeleton skeleton-stat"></div>';
      if (statValue) statValue.innerHTML = '<div class="skeleton skeleton-stat" style="width:60%;"></div>';
      if (statLow) statLow.innerHTML = '<div class="skeleton skeleton-stat" style="width:35%;"></div>';
      if (statExpiry) statExpiry.innerHTML = '<div class="skeleton skeleton-stat" style="width:35%;"></div>';
      if (scanHistoryList) {
        scanHistoryList.innerHTML = `
          <div style="padding:1.25rem;">
            <div class="skeleton skeleton-line" style="height:14px;width:72%;"></div>
            <div class="skeleton skeleton-line" style="height:14px;width:58%;"></div>
            <div class="skeleton skeleton-line" style="height:14px;width:64%;"></div>
          </div>`;
      }
      if (categoryChart) categoryChart.innerHTML = dashboardSkeletonBars();
      return;
    }

    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.textContent = inventory.length;

    const totalVal = inventory.reduce((sum, med) => sum + med.price_box * med.stock, 0);
    const statValue = document.getElementById('stat-value');
    if (statValue) statValue.textContent = '$' + Math.round(totalVal).toLocaleString();

    const lowCount = inventory.filter(med => med.stock > 0 && med.stock <= med.reorder).length;
    const statLow = document.getElementById('stat-low');
    if (statLow) statLow.textContent = lowCount;

    const in90 = new Date(now);
    in90.setDate(in90.getDate() + 90);
      const expiringCount = inventory.filter(med => {
        if (!med.expiry) return false;
        const expiryDate = new Date(med.expiry + 'T00:00:00');
        return expiryDate >= now && expiryDate <= in90;
      }).length;
      const uniqueAttentionCount = new Set(
        inventory
          .filter(med => {
            if (med.stock > 0 && med.stock <= med.reorder) return true;
            if (!med.expiry) return false;
            const expiryDate = new Date(med.expiry + 'T00:00:00');
            return expiryDate >= now && expiryDate <= in90;
          })
          .map(med => med.id || med.barcode || med.name)
      ).size;
      const statExpiry = document.getElementById('stat-expiry');
      if (statExpiry) statExpiry.textContent = expiringCount;
      if (dashboardPriorityLine) {
        if (lowCount || expiringCount) {
          const parts = [];
          const noun = uniqueAttentionCount === 1 ? tx('dashboard.attention.noun.single', null, 'medicine') : tx('dashboard.attention.noun.plural', null, 'medicines');
          parts.push(tx('dashboard.attention.summary', { count: uniqueAttentionCount, noun }, `${uniqueAttentionCount} ${noun} need attention`));
          if (lowCount) parts.push(tx('dashboard.attention.low', { count: lowCount }, `${lowCount} low stock`));
          if (expiringCount) parts.push(tx('dashboard.attention.expiring', { count: expiringCount }, `${expiringCount} expiring within 90 days`));
          dashboardPriorityLine.innerHTML = `
            <div class="dashboard-attention-copy">
              <span class="dashboard-attention-icon">&#9888;&#65039;</span>
              <span class="dashboard-attention-text dashboard-attention-text-desktop">${parts.join(' &#183; ')}</span>
              <span class="dashboard-attention-text dashboard-attention-text-mobile">${tx('dashboard.attention.summary', { count: uniqueAttentionCount, noun }, `${uniqueAttentionCount} ${noun} need attention`)}</span>
            </div>
            <button class="dashboard-attention-btn" data-page="alerts">${tx('dashboard.attention.review', null, 'Review alerts')}</button>`;
          dashboardPriorityLine.classList.remove('is-clear');
        } else {
          dashboardPriorityLine.innerHTML = `
            <div class="dashboard-attention-copy">
              <span class="dashboard-attention-icon">&#10003;</span>
              <span>${tx('dashboard.attention.clear', null, 'All inventory signals look healthy today')}</span>
            </div>`;
          dashboardPriorityLine.classList.add('is-clear');
        }
      }

    const categories = {};
    inventory.forEach(med => {
      categories[med.category] = (categories[med.category] || 0) + med.stock;
    });
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxCategoryValue = sortedCategories.length ? Math.max(...sortedCategories.map(entry => entry[1])) : 0;
    const categoryChart = document.getElementById('category-chart');
    if (categoryChart) {
      categoryChart.innerHTML = sortedCategories.map(([category, value]) => `
        <div class="bar-row">
          <div class="bar-name" title="${esc(translateCategoryLabel(category))}">${esc(translateCategoryLabel(category))}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${maxCategoryValue ? Math.round(value / maxCategoryValue * 100) : 0}%"></div></div>
          <div class="bar-val">${value}</div>
        </div>`).join('');
    }

    const scanHistoryList = document.getElementById('scan-history-list');
    if (!scanHistoryList) return;
    if (!scanHistory.length) {
      scanHistoryList.innerHTML = `<div style="padding:1.5rem 1.25rem;color:var(--muted);font-size:0.82rem;">${esc(tx('dashboard.recentScans.empty', null, 'No scans yet - use the SCAN button to begin'))}</div>`;
      return;
    }
    scanHistoryList.innerHTML = scanHistory.slice(0, 5).map(scan => `
      <div class="scan-history-item">
        <div class="scan-dot"></div>
        <div class="scan-hist-name">${esc(scan.name)} <span class="tag tag-blue">${esc(scan.barcode)}</span></div>
        <div class="scan-hist-time">${esc(scan.time)}</div>
      </div>`).join('');
  }

  function getInventoryDisplayMeta(m, now = new Date()) {
    const hasExpiry = !!m.expiry;
    const expDate = hasExpiry ? new Date(m.expiry + 'T00:00:00') : null;
    const daysLeft = hasExpiry ? Math.round((expDate - now) / 86400000) : null;
    const expiryClass = !hasExpiry ? '' : daysLeft < 0 ? 'expiry-bad' : daysLeft < 30 ? 'expiry-bad' : daysLeft < 90 ? 'expiry-warn' : 'expiry-ok';
    const expiryLabel = !hasExpiry ? tx('inventory.expiry.none', null, 'No expiry') : daysLeft < 0 ? tx('inventory.expiry.expired', null, 'Expired') : daysLeft < 90 ? `${daysLeft}d` : m.expiry;
    const expiryMobileLabel = !hasExpiry ? tx('inventory.expiry.none', null, 'No expiry') : daysLeft < 0 ? tx('inventory.expiry.expired', null, 'Expired') : daysLeft < 90 ? tx('inventory.expiry.daysLeft', { count: daysLeft }, `${daysLeft}d left`) : `Exp ${m.expiry.slice(0, 7)}`;

    let stockClass = 'stock-ok';
    let stockLabel = '&#10003; ' + m.stock;
    if (m.stock === 0) {
      stockClass = 'stock-out';
      stockLabel = '&#10005; Out';
    } else if (m.stock <= m.reorder) {
      stockClass = 'stock-low';
      stockLabel = '&#9889; ' + m.stock;
    }

    const unitPrice = m.units_per_box ? (m.price_box / m.units_per_box).toFixed(2) : '&mdash;';
    const hasShelf = !!(m.shelf && m.shelf.trim());
    return { expiryClass, expiryLabel, expiryMobileLabel, stockClass, stockLabel, unitPrice, hasShelf };
  }

  function renderInventoryEmptyState() {
    return `<div class="empty-state"><div class="icon">&#128269;</div><h3>${tx('inventory.empty.title', null, 'No results')}</h3><p>${tx('inventory.empty.copy', null, 'Try adjusting your filters')}</p></div>`;
  }

  function renderInventoryRow(m, now = new Date()) {
    const meta = getInventoryDisplayMeta(m, now);
    const locationBadge = meta.hasShelf
      ? `<span class="location-badge" data-action="go-shelf" data-shelf="${esc(m.shelf)}">&#128205; ${esc(m.shelf)}</span>`
      : `<span class="location-badge unassigned" data-action="open-edit-modal" data-med-id="${m.id}">${esc(tx('modal.medication.status.unassigned', null, 'Unassigned'))}</span>`;
    const mapAction = meta.hasShelf
      ? `data-action="go-shelf" data-shelf="${esc(m.shelf)}"`
      : `data-action="open-edit-modal" data-med-id="${m.id}"`;
    const mapLabel = meta.hasShelf ? tx('common.map', null, 'Map') : tx('common.assign', null, 'Assign');

    return `<tr>
      <td class="drug-name-cell">
        <div class="drug-name-line"><span class="status-dot ${meta.stockClass}"></span><div class="drug-name">${esc(m.name)}</div></div>
        <div class="drug-generic">${esc(m.generic) || '&mdash;'}</div>
      </td>
      <td class="barcode-cell"><span class="tag tag-blue inventory-barcode-tag" data-action="fill-scanner" data-barcode="${esc(m.barcode)}">${esc(m.barcode)}</span></td>
      <td>${locationBadge}</td>
      <td><span class="stock-badge clickable ${meta.stockClass}" title="${esc(tx('modal.detail.action.updateStock', null, 'Update stock'))}" data-action="open-stock-modal" data-med-id="${m.id}">${meta.stockLabel}</span></td>
      <td><div class="price-box">$${m.price_box.toFixed(2)}</div></td>
      <td><div class="price-box">$${meta.unitPrice}</div></td>
      <td class="expiry-cell"><span class="${meta.expiryClass}">${meta.expiryLabel}</span></td>
      <td>
        <div class="action-btns">
          <button class="table-action-btn" title="${esc(tx('modal.detail.action.editMedicine', null, 'Edit medicine'))}" data-action="open-edit-modal" data-med-id="${m.id}">${esc(tx('common.edit', null, 'Edit'))}</button>
          <button class="table-action-btn map" title="${esc(meta.hasShelf ? tx('modal.detail.action.locateOnMap', null, 'Locate on map') : tx('modal.detail.action.assignShelf', null, 'Assign shelf'))}" ${mapAction}>${esc(mapLabel)}</button>
          <button class="table-action-btn danger" title="${esc(tx('modal.detail.action.deleteMedicine', null, 'Delete medicine'))}" data-action="delete-med" data-med-id="${m.id}">${esc(tx('common.delete', null, 'Delete'))}</button>
        </div>
      </td>
    </tr>`;
  }

  function renderInventoryCard(m, now = new Date()) {
    const meta = getInventoryDisplayMeta(m, now);
    const mobileLocationMarkup = meta.hasShelf ? `<strong>${esc(m.shelf)}</strong>` : `<strong>${esc(tx('modal.medication.status.unassigned', null, 'Unassigned'))}</strong>`;
    const mobileLocationAction = meta.hasShelf
      ? `data-action="go-shelf" data-shelf="${esc(m.shelf)}"`
      : `data-action="open-edit-modal" data-med-id="${m.id}"`;

    return `<div class="med-card" data-action="open-inventory-actions" data-med-id="${m.id}">
      <div class="med-card-top">
        <div class="med-card-main">
          <div class="med-card-name-line"><span class="status-dot ${meta.stockClass}"></span><div class="med-card-name">${esc(m.name)}</div></div>
          <div class="med-card-generic">${esc(m.generic) || esc(m.category)}</div>
        </div>
        <span class="stock-badge ${meta.stockClass} med-card-stock-badge">${meta.stockLabel}</span>
      </div>
      <div class="med-card-meta">
        <span class="med-card-meta-item meta-location" ${mobileLocationAction}>${mobileLocationMarkup}</span>
        <span class="med-card-meta-item meta-box">&middot; <strong>$${m.price_box.toFixed(2)}</strong> ${esc(tx('inventory.unit.box', null, 'box'))}</span>
        <span class="med-card-meta-item meta-unit">&middot; <strong>$${meta.unitPrice}</strong> ${esc(tx('inventory.unit.unit', null, 'unit'))}</span>
        <span class="med-card-meta-item ${meta.expiryClass}">&middot; ${meta.expiryMobileLabel}</span>
      </div>
    </div>`;
  }

  function handleInventorySearchInput() {
    currentPage = 1;
    saveInventoryUiState();
    renderInventory();
  }

  function getFiltered() {
    const query = (document.getElementById('search-inv')?.value || '').trim().toLowerCase();
    const category = document.getElementById('filter-cat')?.value || '';
    const zone = document.getElementById('filter-zone')?.value || '';
    const now = new Date();

    return inventory.filter(med => {
      const haystack = [med.name, med.generic, med.barcode, med.shelf, med.mfr].filter(Boolean).join(' ').toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (category && med.category !== category) return false;
      if (zone && med.zone !== zone) return false;
      if (currentQuickFilter === 'low' && !(med.stock > 0 && med.stock <= med.reorder)) return false;
      if (currentQuickFilter === 'out' && med.stock !== 0) return false;
      if (currentQuickFilter === 'expired') {
        if (!med.expiry) return false;
        const expiryDate = new Date(med.expiry + 'T00:00:00');
        if (expiryDate >= now) return false;
      }
      if (currentQuickFilter === 'expiring') {
        if (!med.expiry) return false;
        const expiryDate = new Date(med.expiry + 'T00:00:00');
        const diffDays = Math.round((expiryDate - now) / 86400000);
        if (diffDays < 0 || diffDays > 90) return false;
      }
      return true;
    }).sort((a, b) => {
      if (inventorySortPreset === 'low') {
        const aRank = a.stock === 0 ? 0 : a.stock <= a.reorder ? 1 : 2;
        const bRank = b.stock === 0 ? 0 : b.stock <= b.reorder ? 1 : 2;
        if (aRank !== bRank) return aRank - bRank;
        return a.stock - b.stock;
      }
      if (inventorySortPreset === 'expiry') {
        const aExpiry = a.expiry ? new Date(a.expiry + 'T00:00:00').getTime() : Number.MAX_SAFE_INTEGER;
        const bExpiry = b.expiry ? new Date(b.expiry + 'T00:00:00').getTime() : Number.MAX_SAFE_INTEGER;
        return aExpiry - bExpiry;
      }
      if (inventorySortPreset === 'name') return a.name.localeCompare(b.name);
      if (inventorySortPreset === 'value') return (b.price_box * b.stock) - (a.price_box * a.stock);

      let valueA;
      let valueB;
      switch (sortCol) {
        case 'location':
          valueA = `${a.zone} ${a.shelf}`.trim().toLowerCase();
          valueB = `${b.zone} ${b.shelf}`.trim().toLowerCase();
          break;
        case 'stock':
          valueA = a.stock;
          valueB = b.stock;
          break;
        case 'price_unit':
          valueA = a.units_per_box ? a.price_box / a.units_per_box : Number.MAX_SAFE_INTEGER;
          valueB = b.units_per_box ? b.price_box / b.units_per_box : Number.MAX_SAFE_INTEGER;
          break;
        case 'expiry':
          valueA = a.expiry ? new Date(a.expiry + 'T00:00:00').getTime() : Number.MAX_SAFE_INTEGER;
          valueB = b.expiry ? new Date(b.expiry + 'T00:00:00').getTime() : Number.MAX_SAFE_INTEGER;
          break;
        default:
          valueA = a[sortCol];
          valueB = b[sortCol];
      }
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
      if (valueA < valueB) return -sortDir;
      if (valueA > valueB) return sortDir;
      return 0;
    });
  }

  function renderInventorySummaryPill(item) {
    return `<button class="inventory-summary-pill ${item.extraClass} ${currentQuickFilter === item.key ? 'active' : ''}" data-quick-filter="${item.key}">
        <span class="inventory-summary-kicker">${item.label}</span>
        <span class="inventory-summary-value">${item.value}${item.note ? `<span class="inventory-summary-note">${item.note}</span>` : ''}</span>
      </button>`;
  }

  function renderInventoryView() {
    document.querySelectorAll('.quick-filter-chip').forEach(chip => chip.classList.remove('active'));
    const activeChip = document.getElementById(`chip-${currentQuickFilter}`);
    if (activeChip) activeChip.classList.add('active');
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.classList.toggle('show', !!(document.getElementById('search-inv')?.value || ''));

    if (isLoadingData) {
      const summaryStrip = document.getElementById('inventory-summary-strip');
      if (summaryStrip) summaryStrip.innerHTML = '';
      document.getElementById('inventory-tbody').innerHTML = `
        <tr><td colspan="8" style="padding:1rem;">
          <div class="skeleton-card-body">
            <div class="skeleton skeleton-line" style="height:16px;width:100%;"></div>
            <div class="skeleton skeleton-line" style="height:16px;width:100%;"></div>
            <div class="skeleton skeleton-line" style="height:16px;width:100%;"></div>
            <div class="skeleton skeleton-line" style="height:16px;width:100%;"></div>
          </div>
        </td></tr>`;
      document.getElementById('inventory-cards').innerHTML = inventorySkeletonCards();
      document.getElementById('page-info').innerHTML = '<div class="skeleton skeleton-line" style="height:12px;width:140px;"></div>';
      document.getElementById('page-btns').innerHTML = `
        <div class="skeleton" style="height:32px;width:32px;display:inline-block;margin-right:0.35rem;"></div>
        <div class="skeleton" style="height:32px;width:32px;display:inline-block;margin-right:0.35rem;"></div>
        <div class="skeleton" style="height:32px;width:32px;display:inline-block;"></div>`;
      return;
    }

    populateFilters();
    const filtered = getFiltered();
    const perPage = getPerPage();
    const total = filtered.length;
    const pages = Math.ceil(total / perPage);
    if (currentPage > pages) currentPage = 1;

    const slice = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
    const now = new Date();
      const lowItems = inventory.filter(m => m.stock > 0 && m.stock <= m.reorder);
      const outItems = inventory.filter(m => m.stock === 0);
      const expiredItems = inventory.filter(m => {
        if (!m.expiry) return false;
        const expiryDate = new Date(m.expiry + 'T00:00:00');
        return expiryDate < now;
      });
      const expiringItems = inventory.filter(m => {
        if (!m.expiry) return false;
        const expiryDate = new Date(m.expiry + 'T00:00:00');
        const in90 = new Date();
        in90.setDate(in90.getDate() + 90);
        return expiryDate >= now && expiryDate <= in90;
      });

    const summaryEl = document.getElementById('inventory-summary-strip');
      if (summaryEl) {
        summaryEl.innerHTML = [
          { key: 'all', label: tx('inventory.summary.all', null, 'All inventory'), value: inventory.length, note: filtered.length !== inventory.length ? tx('inventory.summary.shown', { count: filtered.length }, `${filtered.length} shown`) : '', extraClass: '' },
          { key: 'low', label: tx('inventory.summary.low', null, 'Low stock'), value: lowItems.length, note: tx('inventory.summary.lowNote', null, 'Needs reorder attention'), extraClass: 'low' },
          { key: 'out', label: tx('inventory.summary.out', null, 'Out of stock'), value: outItems.length, note: tx('inventory.summary.outNote', null, 'Unavailable now'), extraClass: 'out' },
          { key: 'expired', label: tx('inventory.summary.expired', null, 'Expired'), value: expiredItems.length, note: tx('inventory.summary.expiredNote', null, 'Remove from shelf'), extraClass: 'expired' },
          { key: 'expiring', label: tx('inventory.summary.expiring', null, 'Expiring soon'), value: expiringItems.length, note: tx('inventory.summary.expiringNote', null, 'Within 90 days'), extraClass: 'expiring' },
        ].map(renderInventorySummaryPill).join('');
      }

    const tbody = document.getElementById('inventory-tbody');
    if (!slice.length) {
      const emptyState = renderInventoryEmptyState();
      tbody.innerHTML = `<tr><td colspan="8">${emptyState}</td></tr>`;
      document.getElementById('inventory-cards').innerHTML = emptyState;
    } else {
      tbody.innerHTML = slice.map(m => renderInventoryRow(m, now)).join('');
      document.getElementById('inventory-cards').innerHTML = slice.map(m => renderInventoryCard(m, now)).join('');
    }

    const filterSummary = [
      currentQuickFilter !== 'all' ? currentQuickFilter : '',
      document.getElementById('filter-cat')?.value || '',
      document.getElementById('filter-zone')?.value || '',
      inventorySortPreset ? `sort:${inventorySortPreset}` : '',
    ].filter(Boolean).join(' - ');
    saveInventoryUiState();
    document.getElementById("page-info").textContent = tx("inventory.pageInfo", { total, current: currentPage, pages: Math.max(1, pages), filter: filterSummary ? " - " + filterSummary : "" }, `${total} results - page ${currentPage} of ${Math.max(1, pages)}${filterSummary ? ` - ${filterSummary}` : ""}`);
    const pageButtons = document.getElementById('page-btns');
    const button = (i) => `<button class="page-btn${i === currentPage ? ' active' : ''}" data-action="go-page" data-page-number="${i}">${i}</button>`;
    const ellipsis = '<span class="page-ellipsis">...</span>';
    const prevBtn = `<button class="page-btn" data-action="go-page" data-page-number="${currentPage - 1}" ${currentPage <= 1 ? "disabled" : ""}>&lsaquo;</button>`;
    const nextBtn = `<button class="page-btn" data-action="go-page" data-page-number="${currentPage + 1}" ${currentPage >= pages ? "disabled" : ""}>&rsaquo;</button>`;

    if (pages <= 7) {
      let html = prevBtn;
      for (let i = 1; i <= pages; i++) html += button(i);
      pageButtons.innerHTML = html + nextBtn;
      return;
    }

    const showLeft = currentPage > 3;
    const showRight = currentPage < pages - 2;
    let html = prevBtn + button(1);
    if (showLeft) html += ellipsis;
    const lo = Math.max(2, currentPage - 1);
    const hi = Math.min(pages - 1, currentPage + 1);
    for (let i = lo; i <= hi; i++) html += button(i);
    if (showRight) html += ellipsis;
    html += button(pages) + nextBtn;
    pageButtons.innerHTML = html;
  }

  function renderInventory() {
    return renderInventoryView();
  }

  function sortBy(col) {
    inventorySortPreset = '';
    if (sortCol === col) sortDir *= -1;
    else {
      sortCol = col;
      sortDir = 1;
    }
    currentPage = 1;
    saveInventoryUiState();
    renderInventory();
  }

  function goPage(page) {
    currentPage = page;
    renderInventory();
  }

  function populateFilters() {
    const catSel = document.getElementById('filter-cat');
    const zoneSel = document.getElementById('filter-zone');
    const sheetCat = document.getElementById('sheet-filter-cat');
    const sheetZone = document.getElementById('sheet-filter-zone');
    const sheetSort = document.getElementById('sheet-sort-preset');
    if (!catSel || !zoneSel) return;

    const categories = [...new Set(inventory.map(med => med.category).filter(Boolean))].sort();
    const zones = [...new Set(inventory.map(med => med.zone).filter(Boolean))].sort();
    const catVal = catSel.value;
    const zoneVal = zoneSel.value;

    catSel.innerHTML = `<option value="">${esc(tx('inventory.filter.allCategories', null, 'All Categories'))}</option>` + categories.map(cat => `<option value="${esc(cat)}"${cat === catVal ? ' selected' : ''}>${esc(translateCategoryLabel(cat))}</option>`).join('');
    zoneSel.innerHTML = `<option value="">${esc(tx('inventory.filter.allZones', null, 'All Zones'))}</option>` + zones.map(zone => `<option value="${esc(zone)}"${zone === zoneVal ? ' selected' : ''}>${esc(zone)}</option>`).join('');

    if (sheetCat) {
      sheetCat.innerHTML = `<option value="">${esc(tx('inventory.filter.allCategories', null, 'All Categories'))}</option>` + categories.map(cat => `<option value="${esc(cat)}">${esc(translateCategoryLabel(cat))}</option>`).join('');
      sheetCat.value = catVal;
    }
    if (sheetZone) {
      sheetZone.innerHTML = `<option value="">${esc(tx('inventory.filter.allZones', null, 'All Zones'))}</option>` + zones.map(zone => `<option value="${esc(zone)}">${esc(zone)}</option>`).join('');
      sheetZone.value = zoneVal;
    }
    if (sheetSort) sheetSort.value = inventorySortPreset || '';
  }

  function setQuickFilter(key) {
    currentQuickFilter = key;
    currentPage = 1;
    saveInventoryUiState();
    renderInventory();
  }

  function sortInventoryByPreset(preset) {
    inventorySortPreset = preset || '';
    currentPage = 1;
    saveInventoryUiState();
    renderInventory();
  }

  function updateMedicationModalTags() {
    const stock = Number(document.getElementById('f-stock')?.value || 0);
    const reorder = Number(document.getElementById('f-reorder')?.value || 0);
    const shelf = (document.getElementById('f-shelf')?.value || '').trim();
    const expiry = document.getElementById('f-expiry')?.value || '';
    const stockTag = document.getElementById('modal-stock-tag');
    const expiryTag = document.getElementById('modal-expiry-tag');
    const locationTag = document.getElementById('modal-location-tag');

    if (stockTag) {
      stockTag.className = 'modal-status-tag';
      if (stock === 0) {
        stockTag.classList.add('stock-out');
        stockTag.textContent = tx('inventory.status.out', null, 'Out of stock');
      } else if (stock <= reorder) {
        stockTag.classList.add('stock-low');
        stockTag.textContent = tx('inventory.status.low', null, 'Low stock');
      } else {
        stockTag.classList.add('stock-ok');
        stockTag.textContent = tx('inventory.status.ok', null, 'Stock OK');
      }
    }

    if (locationTag) {
      locationTag.className = 'modal-status-tag';
      if (shelf) {
        locationTag.classList.add('location-set');
        locationTag.textContent = shelf;
      } else {
        locationTag.classList.add('location-missing');
        locationTag.textContent = tx('modal.medication.status.unassigned', null, 'Unassigned');
      }
    }

    if (expiryTag) {
      expiryTag.className = 'modal-status-tag';
      if (!expiry) {
        expiryTag.classList.add('expiry-ok');
        expiryTag.textContent = tx('modal.medication.status.noExpiry', null, 'No expiry');
      } else {
        const diffDays = Math.round((new Date(expiry + 'T00:00:00') - new Date()) / 86400000);
        if (diffDays < 0) {
          expiryTag.classList.add('expiry-bad');
          expiryTag.textContent = 'Expired';
        } else if (diffDays < 90) {
          expiryTag.classList.add('expiry-warn');
          expiryTag.textContent = `${diffDays}d left`;
        } else {
          expiryTag.classList.add('expiry-ok');
          expiryTag.textContent = expiry;
        }
      }
    }
  }

  function resetMedicationForm() {
    ['name', 'generic', 'barcode', 'price-box', 'units', 'stock', 'reorder', 'shelf', 'mfr'].forEach(field => {
      const el = document.getElementById('f-' + field);
      if (el) el.value = '';
    });
    const category = document.getElementById('f-category');
    const zone = document.getElementById('f-zone');
    const expiry = document.getElementById('f-expiry');
    if (category) category.selectedIndex = 0;
    if (zone) zone.selectedIndex = 0;
    if (expiry) expiry.value = '';
  }

  function openAddModal() {
    editId = null;
    resetMedicationForm();
    const title = document.getElementById('modal-title');
    if (title) title.textContent = tx('modal.medication.title', null, 'Add Medicine');
    updateMedicationModalTags();
    openOverlay('modal-overlay');
  }

  function openEditModal(id) {
    editId = id;
    const med = inventory.find(item => item.id === id);
    if (!med) return;
    const title = document.getElementById('modal-title');
    if (title) title.textContent = tx('modal.medication.editTitle', null, 'Edit Medicine');
    document.getElementById('f-name').value = med.name;
    document.getElementById('f-generic').value = med.generic || '';
    document.getElementById('f-barcode').value = med.barcode;
    document.getElementById('f-category').value = med.category || 'Other';
    document.getElementById('f-price-box').value = med.price_box;
    document.getElementById('f-units').value = med.units_per_box || '';
    document.getElementById('f-stock').value = med.stock;
    document.getElementById('f-reorder').value = med.reorder;
    document.getElementById('f-zone').value = med.zone || '';
    document.getElementById('f-shelf').value = med.shelf || '';
    document.getElementById('f-expiry').value = med.expiry || '';
    document.getElementById('f-mfr').value = med.mfr || '';
    updateMedicationModalTags();
    openOverlay('modal-overlay');
  }

  function closeModal() {
    closeOverlay('modal-overlay');
  }

  function handleOverlayClick(event) {
    if (event.target === document.getElementById('modal-overlay')) closeModal();
  }

  async function saveMedication() {
    const name = document.getElementById('f-name').value.trim();
    const barcode = document.getElementById('f-barcode').value.trim();
    const priceBox = parseFloat(document.getElementById('f-price-box').value);
    if (!name || !barcode || Number.isNaN(priceBox)) {
      showToast(tx('modal.medication.validation.required', null, 'Please fill in all required fields'), true);
      return;
    }

    const data = {
      name,
      generic: document.getElementById('f-generic').value.trim(),
      barcode,
      category: document.getElementById('f-category').value,
      price_box: priceBox,
      units_per_box: parseInt(document.getElementById('f-units').value, 10) || 1,
      stock: parseInt(document.getElementById('f-stock').value, 10) || 0,
      reorder: parseInt(document.getElementById('f-reorder').value, 10) || 10,
      zone: document.getElementById('f-zone').value,
      shelf: document.getElementById('f-shelf').value.trim(),
      expiry: document.getElementById('f-expiry').value,
      mfr: document.getElementById('f-mfr').value.trim(),
    };

    try {
      if (editId) {
        await runWithSessionRetry(() => supabaseService.updateMedicine(editId, medicationPayload(data)));
        showToast(tx('modal.medication.toast.updated', null, 'Medicine updated'));
      } else {
        await runWithSessionRetry(() => supabaseService.createMedicine(medicationPayload(data)));
        showToast(tx('modal.medication.toast.added', null, 'Medicine added'));
      }
      closeModal();
      await refreshInventory();
    } catch (error) {
      console.error(error);
      showToast(error.message || tx('modal.medication.toast.unableSave', null, 'Unable to save medicine'), true);
    }
  }

  function openConfirmModal(options) {
    const { title, message, sub = '', confirmLabel = tx('common.delete', null, 'Delete'), onConfirm } = options;
    const overlay = openOverlay('confirm-overlay');
    if (!overlay) return;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-sub').textContent = sub;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-ok-btn').textContent = confirmLabel;
    globalThis._confirmCallback = async () => {
      closeConfirmModal();
      if (typeof onConfirm === 'function') await onConfirm();
    };
  }

  function closeConfirmModal() {
    closeOverlay('confirm-overlay');
    globalThis._confirmCallback = null;
  }

  function deleteMed(id) {
    const med = inventory.find(item => item.id === id);
    if (!med) return;
    openConfirmModal({
      title: tx('modal.confirm.deleteTitle', null, 'Delete medicine?'),
      sub: med.barcode || '',
      message: tx('modal.confirm.deleteMessage', { name: med.name }, `Remove ${med.name} from inventory? This cannot be undone.`),
      confirmLabel: tx('common.delete', null, 'Delete'),
      onConfirm: async () => {
        try {
          await runWithSessionRetry(() => supabaseService.deleteMedicine(id));
          showToast(tx('modal.confirm.deleted', null, 'Medicine removed'));
          await refreshInventory();
        } catch (error) {
          console.error(error);
          showToast(error.message || tx('modal.confirm.unableDelete', null, 'Unable to delete medicine'), true);
        }
      },
    });
  }

  function openInventoryStock(id) {
    selectedInventoryMedId = id;
    const med = inventory.find(item => item.id === id);
    if (!med) return;
    document.getElementById('stock-modal-title').textContent = tx('modal.stock.title', null, 'Update stock');
    document.getElementById('stock-modal-sub').textContent = med.name;
    document.getElementById('stock-input').value = med.stock;
    document.getElementById('stock-input-error').textContent = '';
    openOverlay('stock-overlay');
    document.getElementById('stock-input').focus();
  }

  function closeStockModal() {
    closeOverlay('stock-overlay');
    selectedInventoryMedId = null;
  }

  function validateStockInput() {
    const value = document.getElementById('stock-input').value;
    const errorEl = document.getElementById('stock-input-error');
    if (!errorEl) return true;
    if (value === '') {
      errorEl.textContent = tx('modal.stock.error.enterValue', null, 'Enter a stock value.');
      return false;
    }
    if (!/^\d+$/.test(value)) {
      errorEl.textContent = tx('modal.stock.error.wholeNumber', null, 'Stock must be a whole number.');
      return false;
    }
    errorEl.textContent = '';
    return true;
  }

  async function submitStockModal() {
    if (!validateStockInput() || !selectedInventoryMedId) return;
    const med = inventory.find(item => item.id === selectedInventoryMedId);
    if (!med) return;
    const nextStock = parseInt(document.getElementById('stock-input').value, 10);
    try {
      await runWithSessionRetry(() => supabaseService.updateMedicine(selectedInventoryMedId, { stock: nextStock }));
      showToast(tx('modal.stock.toast.updatedFor', { name: med.name }, `Stock updated for ${med.name}`));
      closeStockModal();
      await refreshInventory();
    } catch (error) {
      console.error(error);
      showToast(error.message || tx('modal.stock.toast.unableUpdate', null, 'Unable to update stock'), true);
    }
  }

  function reorderInventoryActionButtons(preferredOrder = []) {
    const list = document.querySelector('.inventory-action-list');
    if (!list) return;
    const buttons = Array.from(list.querySelectorAll('.inventory-action-btn'));
    if (!buttons.length) return;

    const rank = new Map(preferredOrder.map((action, index) => [action, index]));
    buttons
      .sort((a, b) => {
        const aKey = a.dataset.inventoryAction || '';
        const bKey = b.dataset.inventoryAction || '';
        const aRank = rank.has(aKey) ? rank.get(aKey) : preferredOrder.length + buttons.indexOf(a);
        const bRank = rank.has(bKey) ? rank.get(bKey) : preferredOrder.length + buttons.indexOf(b);
        return aRank - bRank;
      })
      .forEach((button) => list.appendChild(button));
  }

  function setVisibleInventoryActionButtons(visibleActions = []) {
    const buttons = Array.from(document.querySelectorAll('.inventory-action-btn'));
    if (!buttons.length) return;
    const allowAll = !Array.isArray(visibleActions) || !visibleActions.length;
    buttons.forEach((button) => {
      const action = button.dataset.inventoryAction || '';
      button.style.display = allowAll || visibleActions.includes(action) ? '' : 'none';
    });
  }

  function openInventoryActions(id, options = {}) {
    selectedInventoryMedId = id;
    const med = inventory.find(item => item.id === id);
    if (!med) return;
    const meta = typeof getInventoryDisplayMeta === 'function' ? getInventoryDisplayMeta(med, new Date()) : null;
    const expiryDate = med.expiry ? new Date(med.expiry + 'T00:00:00') : null;
    const diffDays = expiryDate ? Math.round((expiryDate - new Date()) / 86400000) : null;
    const expiryMain = !med.expiry
      ? tx('inventory.expiry.none', null, 'No expiry')
      : diffDays < 0
        ? tx('inventory.expiry.expired', null, 'Expired')
        : diffDays < 90
          ? `${diffDays}d left`
          : med.expiry;
    const expirySub = !med.expiry ? tx('modal.detail.expiry.noDate', null, 'No expiry date recorded') : med.expiry;
    const unitPrice = med.units_per_box ? `$${(med.price_box / med.units_per_box).toFixed(2)} / unit` : '-';

    document.getElementById('inventory-action-title').textContent = med.name;
    document.getElementById('inventory-action-sub').textContent = med.generic || med.category || '';
    document.getElementById('inventory-action-barcode').textContent = med.barcode || '-';
    document.getElementById('inventory-action-location').textContent = med.shelf || tx('modal.medication.status.unassigned', null, 'Unassigned');
    document.getElementById('inventory-action-price').textContent = `$${med.price_box.toFixed(2)} box`;
    document.getElementById('inventory-action-expiry').textContent = med.expiry || tx('inventory.expiry.none', null, 'No expiry');

    document.getElementById('inventory-action-current-stock').textContent = tx('modal.detail.stockBoxes', { count: med.stock, unit: tx(med.stock === 1 ? 'inventory.unit.box' : 'inventory.unit.boxes', null, med.stock === 1 ? 'box' : 'boxes') }, `${med.stock} ${med.stock === 1 ? 'box' : 'boxes'}`);
    document.getElementById('inventory-action-stock-sub').textContent = tx('modal.detail.reorderAt', { count: med.reorder, unit: tx(med.reorder === 1 ? 'inventory.unit.box' : 'inventory.unit.boxes', null, med.reorder === 1 ? 'box' : 'boxes') }, `Reorder at ${med.reorder} ${med.reorder === 1 ? 'box' : 'boxes'}`);
    document.getElementById('inventory-action-expiry-main').textContent = expiryMain;
    document.getElementById('inventory-action-expiry-sub').textContent = expirySub;
    document.getElementById('inventory-action-price-box').textContent = `$${med.price_box.toFixed(2)} / box`;
    document.getElementById('inventory-action-price-unit').textContent = unitPrice;
    document.getElementById('inventory-action-supplier').textContent = med.mfr || tx('modal.detail.status.unknown', null, 'Unknown');
    document.getElementById('inventory-action-category').textContent = med.category || tx('modal.detail.status.uncategorized', null, 'Uncategorized');

    const stockTag = document.getElementById('inventory-action-stock-tag');
    const expiryTag = document.getElementById('inventory-action-expiry-tag');
    const locationTag = document.getElementById('inventory-action-location-tag');
    const locateBtn = document.getElementById('inventory-action-locate-btn');
    const locateText = locateBtn?.querySelector('.inventory-action-text');

    if (stockTag) {
      stockTag.className = `modal-status-tag ${meta?.stockClass || 'stock-ok'}`;
        stockTag.textContent = med.stock === 0 ? tx('inventory.status.out', null, 'Out of stock') : med.stock <= med.reorder ? tx('inventory.status.low', null, 'Low stock') : tx('inventory.status.in', null, 'In stock');
    }
    if (expiryTag) {
      expiryTag.className = `modal-status-tag ${meta?.expiryClass || 'expiry-ok'}`;
      expiryTag.textContent = med.expiry || tx('inventory.expiry.none', null, 'No expiry');
    }
      if (locationTag) {
        locationTag.className = `modal-status-tag ${med.shelf ? 'location-set' : 'location-missing'}`;
        locationTag.textContent = med.shelf
          ? tx('modal.detail.status.assigned', null, 'Assigned')
          : tx('modal.medication.status.unassigned', null, 'Unassigned');
      }
      if (locateText) {
        locateText.textContent = med.shelf
          ? tx('modal.detail.action.locateOnMap', null, 'Locate on map')
          : tx('modal.detail.action.assignShelf', null, 'Assign shelf');
      }

      setVisibleInventoryActionButtons(Array.isArray(options.visibleActions) ? options.visibleActions : []);
      reorderInventoryActionButtons(Array.isArray(options.preferredActions) && options.preferredActions.length
        ? options.preferredActions
        : ['stock', 'edit', 'locate', 'delete']);

      openOverlay('inventory-action-overlay');
    }

  function closeInventoryActions() {
    closeOverlay('inventory-action-overlay');
  }

  function handleInventoryAction(action) {
    const id = selectedInventoryMedId;
    const med = inventory.find(item => item.id === id);
    closeInventoryActions();
    if (!med) return;
    if (action === 'stock') openInventoryStock(id);
    else if (action === 'edit') openEditModal(id);
    else if (action === 'locate') med.shelf ? goToShelf(med.shelf) : openEditModal(id);
    else if (action === 'delete') deleteMed(id);
  }

  function toggleFilterExportSheet() {
    populateFilters();
    openOverlay('filter-export-overlay');
  }

  function closeFilterExportSheet() {
    closeOverlay('filter-export-overlay');
  }

  function applyFilterSheet() {
    const sheetCat = document.getElementById('sheet-filter-cat');
    const sheetZone = document.getElementById('sheet-filter-zone');
    const sheetSort = document.getElementById('sheet-sort-preset');
    const filterCat = document.getElementById('filter-cat');
    const filterZone = document.getElementById('filter-zone');

    if (filterCat && sheetCat) filterCat.value = sheetCat.value;
    if (filterZone && sheetZone) filterZone.value = sheetZone.value;
    inventorySortPreset = sheetSort?.value || '';
    currentPage = 1;
    saveInventoryUiState();
    renderInventory();
    closeFilterExportSheet();
  }

  function clearAllInventoryFilters() {
    const search = document.getElementById('search-inv');
    const filterCat = document.getElementById('filter-cat');
    const filterZone = document.getElementById('filter-zone');
    const sheetCat = document.getElementById('sheet-filter-cat');
    const sheetZone = document.getElementById('sheet-filter-zone');
    const sheetSort = document.getElementById('sheet-sort-preset');

    if (search) search.value = '';
    if (filterCat) filterCat.value = '';
    if (filterZone) filterZone.value = '';
    if (sheetCat) sheetCat.value = '';
    if (sheetZone) sheetZone.value = '';
    if (sheetSort) sheetSort.value = '';

    currentQuickFilter = 'all';
    inventorySortPreset = '';
    currentPage = 1;
    saveInventoryUiState();
    renderInventory();
  }

  function renderDashboardPolished() {
    renderDashboard();

    const scanHistoryList = document.getElementById('scan-history-list');
    if (!scanHistoryList || isLoadingData || scanHistory.length) return;
    const emptyCopy = tx('dashboard.recentScans.empty', null, 'No scans yet - use the SCAN button to begin');
    const emptyAction = tx('dashboard.recentScans.emptyAction', null, 'Scan');

    scanHistoryList.innerHTML = `
      <div class="dashboard-empty-state">
        <div class="dashboard-empty-copy">${esc(emptyCopy)}</div>
        <button class="dashboard-empty-action" data-action="open-scanner">
          <span class="dashboard-empty-action-icon">&#128247;</span>
          <span>${esc(emptyAction)}</span>
        </button>
      </div>`;
  }

  function renderDashboardEnhanced() {
    renderDashboardPolished();

    const scanHistoryList = document.getElementById('scan-history-list');
    if (!scanHistoryList || isLoadingData || !scanHistory.length) return;

    scanHistoryList.innerHTML = scanHistory.slice(0, 5).map(scan => `
      <div class="scan-history-item">
        <div class="scan-dot"></div>
        <div class="scan-history-main">
          <div class="scan-hist-name">${esc(scan.name)}</div>
          <div class="scan-hist-meta">
            <span class="tag tag-blue scan-hist-barcode">${esc(scan.barcode)}</span>
            <span class="scan-hist-separator">&#183;</span>
            <span class="scan-hist-time">${esc(scan.time)}</span>
          </div>
        </div>
      </div>`).join('');
  }

  globalThis.renderDashboard = renderDashboardEnhanced;
  globalThis.handleInventorySearchInput = handleInventorySearchInput;
  globalThis.getFiltered = getFiltered;
  globalThis.renderInventory = renderInventory;
  globalThis.sortBy = sortBy;
  globalThis.goPage = goPage;
  globalThis.populateFilters = populateFilters;
  globalThis.setQuickFilter = setQuickFilter;
  globalThis.sortInventoryByPreset = sortInventoryByPreset;
  globalThis.updateMedicationModalTags = updateMedicationModalTags;
  globalThis.openAddModal = openAddModal;
  globalThis.openEditModal = openEditModal;
  globalThis.closeModal = closeModal;
  globalThis.handleOverlayClick = handleOverlayClick;
  globalThis.saveMedication = saveMedication;
  globalThis.openConfirmModal = openConfirmModal;
  globalThis.closeConfirmModal = closeConfirmModal;
  globalThis.deleteMed = deleteMed;
  globalThis.openInventoryStock = openInventoryStock;
  globalThis.closeStockModal = closeStockModal;
  globalThis.validateStockInput = validateStockInput;
  globalThis.submitStockModal = submitStockModal;
  globalThis.openInventoryActions = openInventoryActions;
  globalThis.closeInventoryActions = closeInventoryActions;
  globalThis.handleInventoryAction = handleInventoryAction;
  globalThis.toggleFilterExportSheet = toggleFilterExportSheet;
  globalThis.closeFilterExportSheet = closeFilterExportSheet;
  globalThis.applyFilterSheet = applyFilterSheet;
  globalThis.clearAllInventoryFilters = clearAllInventoryFilters;
})();




