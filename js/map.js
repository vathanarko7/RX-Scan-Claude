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

  function renderZoneItem(zone) {
    const count = countZoneMedicines(zone.id);
    return `<button class="zone-item" id="zone-${zone.id}" data-zone="${zone.id}" onclick="filterZoneMap('${zone.id}')">
      <span class="zone-pill" style="background:${zone.color}22;border-color:${zone.color}55;color:${zone.color}">${zone.id}</span>
      <span class="zone-info">
        <span class="zone-name">${zone.label}</span>
        <span class="zone-count">${count} medicines</span>
      </span>
    </button>`;
  }

  function renderGroupSection(zoneIds) {
    const zones = zoneIds.map((id) => ZONES.find((zone) => zone.id === id)).filter(Boolean);
    const title = `Zone ${zoneIds.join(' / ')}`;
    const totalItems = zones.reduce((sum, zone) => sum + countZoneMedicines(zone.id), 0);
    const shelvesMarkup = zones.map((zone) => zone.shelves.map((shelf) => renderShelfUnit(shelf, zone.id)).join('')).join('');

    return `<section class="map-section" data-zone-group="${zoneIds.join(',')}" data-default-title="${title}" data-default-total="${totalItems}">
      <div class="map-section-header">
        <div class="map-room-label">${title}</div>
        <div class="map-section-meta">${totalItems} medicines</div>
      </div>
      <div class="shelf-grid">
        ${shelvesMarkup}
      </div>
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

    const mapCanvas = document.getElementById('map-canvas');
    if (mapCanvas) {
      const sectionGroups = getMapSectionGroups();
      mapCanvas.innerHTML = `
        <div class="dispensing-counter">Dispensing Counter</div>
        <div class="map-legend map-legend-inline">
          <div class="legend-item"><div class="legend-dot healthy"></div>Healthy</div>
          <div class="legend-item"><div class="legend-dot warning"></div>Low stock</div>
          <div class="legend-item"><div class="legend-dot critical"></div>Problem</div>
        </div>
        <div id="map-filter-bar" class="map-filter-bar"></div>
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

    return `<button class="shelf-unit shelf-${status}${isHighlighted ? ' highlighted' : ''}" id="shelf-${safeId}" data-zone-id="${zoneId}"
      style="background:${color}16;border-color:${color}44;"
      onclick="showShelfDetail('${esc(shelf)}')">
      <div class="shelf-label" style="color:${color}">${esc(shelf)}</div>
      <div class="shelf-items-count" style="color:${color}">${count}</div>
      <div class="shelf-items-label">${status === 'empty' ? 'empty' : 'items'}</div>
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

    let markup = '';
    if (!items.length) {
      markup = `
        <div class="shelf-detail-card selected">
          <div class="shelf-detail-topline">Selected shelf</div>
          <div class="shelf-detail-title">${esc(shelf)}</div>
          <div class="shelf-detail-sub">No medicines assigned yet.</div>
        </div>`;
    } else {
      const summary = items.length === 1 ? '1 medicine' : `${items.length} medicines`;
      markup = `
        <div class="shelf-detail-card selected">
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

    if (detail) {
      detail.innerHTML = markup;
    }

    if (mobileDetail) {
      mobileDetail.innerHTML = markup;
      mobileDetail.classList.add('is-active');
      mobileDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function applyZoneFilterUi() {
    syncMapSidebarState();

    document.querySelectorAll('.zone-item').forEach((element) => {
      element.classList.toggle('active', element.dataset.zone === activeZoneFilter);
    });

    const filterBar = document.getElementById('map-filter-bar');
    if (filterBar) {
      filterBar.innerHTML = window.innerWidth <= 768 && activeZoneFilter
        ? `<button class="map-filter-chip" onclick="filterZoneMap('${activeZoneFilter}')">Back to all zones</button>`
        : '';
    }

    document.querySelectorAll('.map-section').forEach((section) => {
      const zoneIds = (section.dataset.zoneGroup || '').split(',').filter(Boolean);
      const matches = !activeZoneFilter || zoneIds.includes(activeZoneFilter);
      const titleEl = section.querySelector('.map-room-label');
      const metaEl = section.querySelector('.map-section-meta');

      if (titleEl) {
        titleEl.textContent = section.dataset.defaultTitle || titleEl.textContent;
      }

      if (metaEl) {
        metaEl.textContent = `${section.dataset.defaultTotal || '0'} medicines`;
      }

      section.classList.toggle('is-selected', !!activeZoneFilter && matches);
      if (window.innerWidth <= 768) {
        section.classList.remove('is-muted');
        section.classList.toggle('is-hidden', !!activeZoneFilter && !matches);
      } else {
        section.classList.remove('is-hidden');
        section.classList.remove('is-muted');
      }
    });
  }

  function filterZoneMap(zoneId) {
    activeZoneFilter = activeZoneFilter === zoneId ? '' : zoneId;
    if (!activeZoneFilter) {
      selectedShelf = '';
      clearShelfDetailUi();
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
    const emptyText = 'Tap a shelf to view its medicines.';
    if (detail) detail.textContent = emptyText;
    if (mobileDetail) {
      mobileDetail.textContent = emptyText;
      mobileDetail.classList.remove('is-active');
    }
    syncSelectedShelfUi();
  }

  globalThis.ZONES = ZONES;
  globalThis.renderMap = renderMap;
  globalThis.renderShelfUnit = renderShelfUnit;
  globalThis.showShelfDetail = showShelfDetail;
  globalThis.filterZoneMap = filterZoneMap;
  globalThis.goToShelf = goToShelf;
  globalThis.openMapMedicine = openMapMedicine;
  globalThis.syncSelectedShelfUi = syncSelectedShelfUi;
  globalThis.clearShelfDetailUi = clearShelfDetailUi;
})();

