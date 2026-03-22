(function() {
  function syncOverlayUiState() {
    const hasOpenOverlay = appState.overlays.active.size > 0;
    document.body.classList.toggle('overlay-open', hasOpenOverlay);
    if (typeof setMobileNavHidden === 'function') {
      setMobileNavHidden(hasOpenOverlay);
    }
  }

  function openOverlay(id, options = {}) {
    const { openClass = 'open' } = options;
    const overlay = document.getElementById(id);
    if (!overlay) return null;
    if (openClass) overlay.classList.add(openClass);
    appState.overlays.active.add(id);
    syncOverlayUiState();
    return overlay;
  }

  function closeOverlay(id, options = {}) {
    const { openClass = 'open' } = options;
    const overlay = document.getElementById(id);
    if (!overlay) return null;
    if (openClass) overlay.classList.remove(openClass);
    appState.overlays.active.delete(id);
    syncOverlayUiState();
    return overlay;
  }

  globalThis.syncOverlayUiState = syncOverlayUiState;
  globalThis.openOverlay = openOverlay;
  globalThis.closeOverlay = closeOverlay;
})();
