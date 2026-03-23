(function() {
  const ZONES = [
    { id: 'A', label: 'Antibiotics', color: '#79d6b2', shelves: ['A1-L1', 'A1-L2', 'A2-L1', 'A2-L2'] },
    { id: 'B', label: 'Pain Relief / GI', color: '#5b8cff', shelves: ['B1-L1', 'B2-L1', 'B3-L1', 'B4-L3'] },
    { id: 'C', label: 'Cardiovascular', color: '#ff5f7d', shelves: ['C1-L2', 'C2-L3', 'C3-L2'] },
    { id: 'D', label: 'Diabetes / Hormones', color: '#9b5cff', shelves: ['D1-L2', 'D2-L1'] },
    { id: 'E', label: 'Vitamins & Supplements', color: '#f7b441', shelves: ['E1-L1', 'E2-L1'] },
    { id: 'F', label: 'Refrigerated', color: '#68c7ff', shelves: ['F1-L1', 'F2-L1'] },
    { id: 'G', label: 'Dermatology', color: '#ef63b3', shelves: ['G1-L1', 'G2-L1'] },
    { id: 'H', label: 'Respiratory', color: '#96d63b', shelves: ['H1-L1', 'H2-L2'] },
  ];

  const MAP_GROUPS = [
    ['A', 'B'],
    ['C', 'D'],
    ['E', 'F', 'G', 'H'],
  ];

  let activeZoneFilter = '';
  let selectedShelf = '';
  let activeLegendFilter = 'all';

  function getZoneForShelf(shelf) {
    return ZONES.find((zone) => zone.shelves.includes(shelf)) || null;
  }

  function getShelfItems(shelf) {
    return inventory.filter((medicine) => medicine.shelf === shelf);
  }

  function countZoneMedicines(zoneId) {
    return inventory.filter((medicine) => {
      const zone = String(medicine.zone || '').trim();
      return zone.startsWith(`${zoneId} `) || zone === zoneId || zone.startsWith(`${zoneId} -`);
    }).length;
  }

  function getShelfStatus(items) {
    if (!items.length) return 'empty';
    if (items.some((medicine) => medicine.stock === 0)) return 'critical';
    if (items.some((medicine) => medicine.stock > 0 && medicine.stock <= medicine.reorder)) return 'warning';
    return 'healthy';
  }

  function getSectionStats(zoneIds) {
    const items = inventory.filter((medicine) => zoneIds.some((id) => {
      const zone = String(medicine.zone || '').trim();
      return zone.startsWith(`${id} `) || zone === id || zone.startsWith(`${id} -`);
    }));
    const warning = items.filter((medicine) => medicine.stock > 0 && medicine.stock <= medicine.reorder).length;
    const critical = items.filter((medicine) => medicine.stock === 0).length;
    return {
      total: items.length,
      warning,
      critical,
    };
  }

  function getZoneById(zoneId) {
    return ZONES.find((zone) => zone.id === zoneId) || null;
  }

  function withAlpha(hex, alpha) {
    return `${hex}${alpha}`;
  }

  function isMobileMap() {
    return window.innerWidth <= 768;
  }

  function renderShelfDetailCardMarkup(shelf, items) {
    const zone = getZoneForShelf(shelf);
    const zoneColor = zone ? zone.color : '#f5c96a';
    const detailStyle = `--zone-accent:${zoneColor};--zone-accent-soft:${withAlpha(zoneColor, '16')};--zone-accent-mid:${withAlpha(zoneColor, '2e')};--zone-accent-strong:${withAlpha(zoneColor, '52')};`;
    if (!items.length) {
      return `
        <div class="shelf-detail-card selected" style="${detailStyle}">
          <div class="shelf-detail-topline">Selected shelf</div>
          <div class="shelf-detail-title">${esc(shelf)}</div>
          <div class="shelf-detail-sub">No medicines assigned yet.</div>
        </div>`;
    }

    const summary = items.length === 1 ? '1 medicine' : `${items.length} medicines`;
    return `
      <div class="shelf-detail-card selected" style="${detailStyle}">
        <div class="shelf-detail-topline">Selected shelf</div>
        <div class="shelf-detail-title">${esc(shelf)}</div>
        <div class="shelf-detail-sub">${summary}</div>
        <div class="shelf-detail-list">
          ${items.map((medicine) => {
            const stockClass = medicine.stock === 0
              ? 'critical'
              : medicine.stock <= medicine.reorder
                ? 'warning'
                : 'healthy';
            const unitPrice = medicine.units_per_box ? (medicine.price_box / medicine.units_per_box).toFixed(2) : '0.00';
            return `<div class="shelf-detail-item" onclick="openMapMedicine(${medicine.id})">
              <div class="shelf-detail-item-main">
                <div class="shelf-detail-item-name">${esc(medicine.name)}</div>
                <div class="shelf-detail-item-meta">${esc(medicine.generic) || 'No generic name'}</div>
                <div class="shelf-detail-item-prices">$${Number(medicine.price_box || 0).toFixed(2)} box - $${unitPrice} unit</div>
              </div>
              <div class="shelf-detail-stock ${stockClass}">${medicine.stock} box${medicine.stock === 1 ? '' : 'es'}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function renderInlineShelfPromptMarkup(zoneId) {
    const zone = getZoneById(zoneId);
    const zoneLabel = zone ? zone.label : `Zone ${zoneId}`;
    return `
      <div class="map-inline-detail-empty">
        <div class="map-inline-detail-topline">${esc(zoneLabel)}</div>
        <div class="map-inline-detail-title">Select a shelf</div>
        <div class="map-inline-detail-copy">Choose a shelf in ${esc(zoneLabel)} to inspect stock, prices, expiry, and assigned medicines.</div>
      </div>`;
  }

  function renderZoneItem(zone) {
    const count = countZoneMedicines(zone.id);
    const buttonStyle = `--zone-accent:${zone.color};--zone-accent-soft:${withAlpha(zone.color, '14')};--zone-accent-mid:${withAlpha(zone.color, '30')};--zone-accent-strong:${withAlpha(zone.color, 'e0')};`;
    return `<button class="zone-item" id="zone-${zone.id}" data-zone="${zone.id}" style="${buttonStyle}" onclick="filterZoneMap('${zone.id}')">
      <span class="zone-pill" style="background:${zone.color}22;border-color:${zone.color}55;color:${zone.color}">${zone.id}</span>
      <span class="zone-info">
        <span class="zone-name">${zone.label}</span>
        <span class="zone-count">${count} medicines</span>
      </span>
    </button>`;
  }

  function renderGroupSection(zoneIds) {
    const title = `Zone ${zoneIds.join(' / ')}`;
    const stats = getSectionStats(zoneIds);
    const zones = zoneIds.map((id) => ZONES.find((zone) => zone.id === id)).filter(Boolean);
    const shelvesMarkup = zones.map((zone) => zone.shelves.map((shelf) => renderShelfUnit(shelf, zone.id)).join('')).join('');
    const baseColor = zones[0]?.color || '#f5c96a';

    return `<section class="map-section" data-zone-group="${zoneIds.join(',')}" data-default-title="${title}" data-default-total="${stats.total}" style="--zone-accent:${baseColor};--zone-accent-soft:${withAlpha(baseColor, '14')};--zone-accent-mid:${withAlpha(baseColor, '2e')};--zone-accent-strong:${withAlpha(baseColor, 'e0')};">
      <div class="map-section-header">
        <div class="map-section-title-block">
          <div class="map-room-label">${title}</div>
        </div>
        <div class="map-section-meta">
          <span class="map-stat-pill">${stats.total} medicines</span>
          ${stats.warning ? `<span class="map-stat-pill warning">${stats.warning} low</span>` : ''}
          ${stats.critical ? `<span class="map-stat-pill critical">${stats.critical} problem</span>` : ''}
        </div>
      </div>
      <div class="shelf-grid">
        ${shelvesMarkup}
      </div>
      <div class="map-section-detail-slot" data-zone-detail-slot="${zoneIds.join(',')}"></div>
    </section>`;
  }

  function getMapSectionGroups() {
    return window.innerWidth <= 768 ? ZONES.map((zone) => [zone.id]) : MAP_GROUPS;
  }

  function renderMap() {
    const zoneList = document.getElementById('zone-list');
    if (zoneList) {
      zoneList.innerHTML = ZONES.map(renderZoneItem).join('');
    }

    bindMapControls();

    const mapCanvas = document.getElementById('map-canvas');
    if (mapCanvas) {
      const sectionGroups = getMapSectionGroups();
      mapCanvas.innerHTML = `
        <div class="map-sticky-controls">
          <div class="dispensing-counter">Dispensing Counter</div>
          <div class="map-legend map-legend-inline">
            <button class="legend-item legend-filter-btn ${activeLegendFilter === 'all' ? 'active' : ''}" onclick="filterLegend('all')"><div class="legend-dot healthy"></div>All</button>
            <button class="legend-item legend-filter-btn ${activeLegendFilter === 'healthy' ? 'active' : ''}" onclick="filterLegend('healthy')"><div class="legend-dot healthy"></div>Healthy</button>
            <button class="legend-item legend-filter-btn ${activeLegendFilter === 'warning' ? 'active' : ''}" onclick="filterLegend('warning')"><div class="legend-dot warning"></div>Low stock</button>
            <button class="legend-item legend-filter-btn ${activeLegendFilter === 'critical' ? 'active' : ''}" onclick="filterLegend('critical')"><div class="legend-dot critical"></div>Problem</button>
          </div>
          <div id="map-filter-bar" class="map-filter-bar"></div>
        </div>
        ${sectionGroups.map(renderGroupSection).join('')}
        <div id="map-mobile-detail" class="map-mobile-detail shelf-detail-copy">Tap a shelf to view its medicines.</div>
      `;
    }

    const mapLegend = document.getElementById('map-legend');
    if (mapLegend) {
      mapLegend.innerHTML = '';
    }

    applyZoneFilterUi();

    if (highlightShelf) {
      setTimeout(() => {
        const shelfElement = document.getElementById(`shelf-${highlightShelf.replace(/\W/g, '-')}`);
        if (shelfElement) {
          const zone = getZoneForShelf(highlightShelf);
          if (zone) {
            activeZoneFilter = zone.id;
            applyZoneFilterUi();
          }
          selectedShelf = highlightShelf;
          shelfElement.classList.add('highlighted');
          shelfElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          showShelfDetail(highlightShelf);
        }
        highlightShelf = null;
      }, 100);
    }
  }

  function renderShelfUnit(shelf, zoneId) {
    const zone = ZONES.find((item) => item.id === zoneId);
    const color = zone ? zone.color : '#888';
    const items = getShelfItems(shelf);
    const count = items.length;
    const isHighlighted = highlightShelf === shelf || selectedShelf === shelf;
    const safeId = shelf.replace(/\W/g, '-');
    const status = getShelfStatus(items);
    const tileStyle = `--zone-accent:${color};--zone-accent-soft:${withAlpha(color, '18')};--zone-accent-mid:${withAlpha(color, '2c')};background:${color}16;border-color:${color}44;`;

    return `<button class="shelf-unit shelf-${status}${isHighlighted ? ' highlighted' : ''}" id="shelf-${safeId}" data-zone-id="${zoneId}"
      style="${tileStyle}"
      onclick="showShelfDetail('${esc(shelf)}')">
      <div class="shelf-label" style="color:${color}">${esc(shelf)}</div>
      <div class="shelf-items-inline">
        <span class="shelf-items-count" style="color:${color}">${count}</span>
        <span class="shelf-items-label">${count === 1 && status !== 'empty' ? 'item' : status === 'empty' ? 'empty' : 'items'}</span>
      </div>
    </button>`;
  }

  function showShelfDetail(shelf) {
    const items = getShelfItems(shelf);
    const detail = document.getElementById('shelf-detail');
    const mobileDetail = document.getElementById('map-mobile-detail');

    const zone = getZoneForShelf(shelf);
    if (zone) {
      activeZoneFilter = zone.id;
      applyZoneFilterUi();
    }
    selectedShelf = shelf;
    syncSelectedShelfUi();
    const markup = renderShelfDetailCardMarkup(shelf, items);

    if (detail) {
      detail.innerHTML = markup;
    }

    if (mobileDetail) {
      mobileDetail.innerHTML = markup;
      mobileDetail.classList.add('is-active');
      mobileDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    renderDesktopInlineDetail();
  }

  function applyZoneFilterUi() {
    syncMapSidebarState();

    document.querySelectorAll('.zone-item').forEach((element) => {
      element.classList.toggle('active', element.dataset.zone === activeZoneFilter);
    });

    if (isMobileMap() && activeZoneFilter) {
      const zoneList = document.getElementById('zone-list');
      const activeChip = zoneList?.querySelector(`.zone-item[data-zone="${activeZoneFilter}"]`);
      if (zoneList && activeChip) {
        const targetLeft = activeChip.offsetLeft - ((zoneList.clientWidth - activeChip.clientWidth) / 2);
        const maxLeft = Math.max(0, zoneList.scrollWidth - zoneList.clientWidth);
        zoneList.scrollTo({
          left: Math.max(0, Math.min(targetLeft, maxLeft)),
          behavior: 'smooth',
        });
      }
    }

    const filterBar = document.getElementById('map-filter-bar');
      if (filterBar) {
        if (activeZoneFilter) {
          const activeZone = getZoneById(activeZoneFilter);
          filterBar.innerHTML = `
          <div class="map-filter-summary" style="--zone-accent:${activeZone?.color || '#f5c96a'}">Zone ${activeZoneFilter}${activeZone ? ` - ${esc(activeZone.label)}` : ''}</div>
          <button class="map-filter-chip" onclick="filterZoneMap('${activeZoneFilter}')">Back to all zones</button>`;
        } else {
          filterBar.innerHTML = '';
        }
      }

    document.querySelectorAll('.map-section').forEach((section) => {
      const zoneIds = (section.dataset.zoneGroup || '').split(',').filter(Boolean);
      const matches = !activeZoneFilter || zoneIds.includes(activeZoneFilter);
      const titleEl = section.querySelector('.map-room-label');
      const metaEl = section.querySelector('.map-section-meta');

      if (titleEl) {
        titleEl.textContent = section.dataset.defaultTitle || titleEl.textContent;
      }

      if (matches && activeZoneFilter) {
        const activeZone = getZoneById(activeZoneFilter);
        if (activeZone) {
          section.style.setProperty('--zone-accent', activeZone.color);
          section.style.setProperty('--zone-accent-soft', withAlpha(activeZone.color, '14'));
          section.style.setProperty('--zone-accent-mid', withAlpha(activeZone.color, '2e'));
          section.style.setProperty('--zone-accent-strong', withAlpha(activeZone.color, 'e0'));
        }
      }

        section.classList.toggle('is-selected', !!activeZoneFilter && matches);
      if (isMobileMap()) {
        section.classList.remove('is-muted');
        section.classList.toggle('is-hidden', !!activeZoneFilter && !matches);
      } else {
        section.classList.remove('is-muted');
        section.classList.toggle('is-hidden', !!activeZoneFilter && !matches);
      }

      section.querySelectorAll('.shelf-unit').forEach((unit) => {
        const statusMatch = activeLegendFilter === 'all' || unit.classList.contains(`shelf-${activeLegendFilter}`);
        unit.classList.toggle('is-dimmed', !statusMatch);
      });
    });

    renderDesktopInlineDetail();
  }

  function filterZoneMap(zoneId) {
    activeZoneFilter = activeZoneFilter === zoneId ? '' : zoneId;
    if (!activeZoneFilter) {
      selectedShelf = '';
      clearShelfDetailUi();
    } else {
      const selectedZone = selectedShelf ? getZoneForShelf(selectedShelf) : null;
      if (!selectedZone || selectedZone.id !== activeZoneFilter) {
        selectedShelf = '';
        clearShelfDetailUi();
      }
    }
    applyZoneFilterUi();

    if (activeZoneFilter) {
      const nextSection = document.querySelector(`.map-section[data-zone-group*="${activeZoneFilter}"]`);
      nextSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function goToShelf(shelf) {
    highlightShelf = shelf;
    showPage('map');
  }

  function openMapMedicine(medId) {
    if (typeof openInventoryActions !== 'function') return;
    openInventoryActions(Number(medId));
  }

  function filterLegend(filter) {
    activeLegendFilter = activeLegendFilter === filter ? 'all' : filter;
    renderMap();
    if (selectedShelf) showShelfDetail(selectedShelf);
  }

  function bindMapControls() {
    const searchInput = document.getElementById('map-shelf-search');
    const searchBtn = document.getElementById('map-shelf-search-btn');
    if (searchInput && searchInput.dataset.bound !== '1') {
      searchInput.dataset.bound = '1';
      searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          jumpToShelfFromSearch();
        }
      });
    }
    if (searchBtn && searchBtn.dataset.bound !== '1') {
      searchBtn.dataset.bound = '1';
      searchBtn.addEventListener('click', jumpToShelfFromSearch);
    }
  }

  function jumpToShelfFromSearch() {
    const input = document.getElementById('map-shelf-search');
    if (!input) return;
    const shelf = String(input.value || '').trim().toUpperCase();
    if (!shelf) return;
    const foundZone = getZoneForShelf(shelf);
    if (!foundZone) {
      if (typeof showToast === 'function') showToast(`Shelf ${shelf} not found`, true);
      return;
    }
    activeZoneFilter = foundZone.id;
    applyZoneFilterUi();
    showShelfDetail(shelf);
    const shelfElement = document.getElementById(`shelf-${shelf.replace(/\W/g, '-')}`);
    shelfElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function syncMapSidebarState() {
    return;
  }

  function syncSelectedShelfUi() {
    document.querySelectorAll('.shelf-unit').forEach((unit) => {
      const expectedId = selectedShelf ? `shelf-${selectedShelf.replace(/\W/g, '-')}` : '';
      unit.classList.toggle('highlighted', unit.id === expectedId);
    });
  }

  function clearShelfDetailUi() {
    const detail = document.getElementById('shelf-detail');
    const mobileDetail = document.getElementById('map-mobile-detail');
    const emptyMarkup = `
      <div class="shelf-detail-empty">
        <div class="shelf-detail-empty-title">Select a shelf</div>
        <div class="shelf-detail-empty-copy">Inspect stock, expiry, and assigned medicines from the map.</div>
      </div>`;
    if (detail) detail.innerHTML = emptyMarkup;
    if (mobileDetail) {
      mobileDetail.textContent = 'Tap a shelf to view its medicines.';
      mobileDetail.classList.remove('is-active');
    }
    renderDesktopInlineDetail();
    syncSelectedShelfUi();
  }

  function renderDesktopInlineDetail() {
    const slots = document.querySelectorAll('.map-section-detail-slot');
    if (!slots.length) return;

    if (isMobileMap()) {
      slots.forEach((slot) => {
        slot.innerHTML = '';
      });
      return;
    }

    slots.forEach((slot) => {
      const zoneIds = (slot.dataset.zoneDetailSlot || '').split(',').filter(Boolean);
      const matches = !!activeZoneFilter && zoneIds.includes(activeZoneFilter);
      if (!matches) {
        slot.innerHTML = '';
        return;
      }

      if (selectedShelf) {
        const selectedZone = getZoneForShelf(selectedShelf);
        if (selectedZone && zoneIds.includes(selectedZone.id)) {
          slot.innerHTML = renderShelfDetailCardMarkup(selectedShelf, getShelfItems(selectedShelf));
          return;
        }
      }

      slot.innerHTML = renderInlineShelfPromptMarkup(activeZoneFilter);
    });
  }

  globalThis.ZONES = ZONES;
  globalThis.renderMap = renderMap;
  globalThis.renderShelfUnit = renderShelfUnit;
  globalThis.showShelfDetail = showShelfDetail;
  globalThis.filterZoneMap = filterZoneMap;
  globalThis.goToShelf = goToShelf;
  globalThis.openMapMedicine = openMapMedicine;
  globalThis.filterLegend = filterLegend;
  globalThis.syncSelectedShelfUi = syncSelectedShelfUi;
  globalThis.clearShelfDetailUi = clearShelfDetailUi;
})();

