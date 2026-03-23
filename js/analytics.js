(function() {
  function renderAnalytics() {
    if (isLoadingData) {
      document.getElementById('an-avg-price').innerHTML = '<div class="skeleton skeleton-stat" style="width:58%;"></div>';
      document.getElementById('an-total-units').innerHTML = '<div class="skeleton skeleton-stat" style="width:52%;"></div>';
      document.getElementById('an-cats').innerHTML = '<div class="skeleton skeleton-stat" style="width:36%;"></div>';
      document.getElementById('an-top-stock-name').innerHTML = '<div class="skeleton skeleton-stat" style="width:62%;"></div>';
      document.getElementById('an-top-stock-meta').innerHTML = '<div class="skeleton skeleton-line" style="width:46%;"></div>';
      document.getElementById('an-nearest-expiry-name').innerHTML = '<div class="skeleton skeleton-stat" style="width:58%;"></div>';
      document.getElementById('an-nearest-expiry-meta').innerHTML = '<div class="skeleton skeleton-line" style="width:48%;"></div>';
      document.getElementById('an-health-value').innerHTML = '<div class="skeleton skeleton-stat" style="width:54%;"></div>';
      document.getElementById('an-health-meta').innerHTML = '<div class="skeleton skeleton-line" style="width:60%;"></div>';
      document.getElementById('an-stock-chart').innerHTML = dashboardSkeletonBars();
      document.getElementById('an-value-chart').innerHTML = dashboardSkeletonBars();
      document.getElementById('an-cat-pills').innerHTML = `
        <div class="skeleton" style="height:30px;width:120px;border-radius:999px;display:inline-block;margin-right:0.5rem;"></div>
        <div class="skeleton" style="height:30px;width:150px;border-radius:999px;display:inline-block;margin-right:0.5rem;"></div>
        <div class="skeleton" style="height:30px;width:100px;border-radius:999px;display:inline-block;"></div>`;
      return;
    }

    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);

    const avgPrice = inventory.length ? (inventory.reduce((sum, med) => sum + med.price_box, 0) / inventory.length) : 0;
    document.getElementById('an-avg-price').textContent = '$' + avgPrice.toFixed(2);

    const totalUnits = inventory.reduce((sum, med) => sum + med.stock * (med.units_per_box || 1), 0);
    document.getElementById('an-total-units').textContent = totalUnits.toLocaleString();

    const cats = [...new Set(inventory.map(med => med.category))];
    document.getElementById('an-cats').textContent = cats.length;

    const byStock = [...inventory].sort((a, b) => b.stock - a.stock).slice(0, 8);
    const maxS = byStock.length ? Math.max(...byStock.map(med => med.stock)) : 0;
    document.getElementById('an-stock-chart').innerHTML = byStock.map(med =>
      `<div class="bar-row">
        <div class="bar-name" title="${esc(med.name)}">${esc(med.name)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${maxS ? Math.round(med.stock / maxS * 100) : 0}%"></div></div>
        <div class="bar-val">${med.stock}</div>
      </div>`
    ).join('');

    const byValue = [...inventory].sort((a, b) => (b.price_box * b.stock) - (a.price_box * a.stock)).slice(0, 8);
    const maxV = byValue.length ? Math.max(...byValue.map(med => med.price_box * med.stock)) : 0;
    document.getElementById('an-value-chart').innerHTML = byValue.map(med => {
      const value = (med.price_box * med.stock).toFixed(0);
      return `<div class="bar-row">
        <div class="bar-name" title="${esc(med.name)}">${esc(med.name)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${maxV ? Math.round(med.price_box * med.stock / maxV * 100) : 0}%;background:linear-gradient(90deg,var(--warn),#ff6b35cc)"></div></div>
        <div class="bar-val">$${value}</div>
      </div>`;
      }).join('');

    const catCounts = {};
    inventory.forEach(med => { catCounts[med.category] = (catCounts[med.category] || 0) + 1; });
    const catColors = ['#00d4aa', '#0088ff', '#ff3b5c', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16', '#ff6b35', '#e11d48', '#14b8a6', '#6366f1'];
    document.getElementById('an-cat-pills').innerHTML = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, cnt], i) =>
      `<div class="cat-pill">
        <div class="cat-dot" style="background:${catColors[i % catColors.length]}"></div>
        ${esc(cat)} <span style="font-size:0.65rem;opacity:0.7">(${cnt})</span>
      </div>`
    ).join('');

    const topStock = byStock[0];
    const topValue = byValue[0];
    const highestPriced = [...inventory].sort((a, b) => b.price_box - a.price_box)[0];
    const nearestExpiry = [...inventory]
      .filter(med => med.expiry && new Date(med.expiry + 'T00:00:00') >= now)
      .sort((a, b) => new Date(a.expiry + 'T00:00:00') - new Date(b.expiry + 'T00:00:00'))[0];
    const healthyCount = inventory.filter(med => med.stock > med.reorder).length;
    const inStockRate = inventory.length ? Math.round((healthyCount / inventory.length) * 100) : 0;

    document.getElementById('an-top-stock-name').textContent = highestPriced ? highestPriced.name : 'No inventory yet';
    document.getElementById('an-top-stock-meta').textContent = highestPriced
      ? `$${highestPriced.price_box.toFixed(2)} per box in ${highestPriced.category}`
      : 'Add medicines to see leaders';

    if (nearestExpiry) {
      const daysLeft = Math.ceil((new Date(nearestExpiry.expiry + 'T00:00:00') - now) / 86400000);
      document.getElementById('an-nearest-expiry-name').textContent = nearestExpiry.name;
      document.getElementById('an-nearest-expiry-meta').textContent = `${Math.max(daysLeft, 0)}d left · ${nearestExpiry.expiry}`;
    } else {
      document.getElementById('an-nearest-expiry-name').textContent = 'All clear';
      document.getElementById('an-nearest-expiry-meta').textContent = 'No upcoming expiry';
    }

    if (!inventory.length) {
      document.getElementById('an-health-value').textContent = 'No data';
      document.getElementById('an-health-meta').textContent = 'Add medicines to see stock coverage';
    } else {
      document.getElementById('an-health-value').textContent = `${inStockRate}%`;
      document.getElementById('an-health-meta').textContent = `${healthyCount} of ${inventory.length} medicines above reorder point`;
    }
  }

  globalThis.renderAnalytics = renderAnalytics;
})();
