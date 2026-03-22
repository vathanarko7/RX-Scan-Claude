(function() {
  const appState = {
    inventory: {
      items: [],
      editId: null,
      scanHistory: [],
      highlightShelf: null,
      selectedMedicineId: null,
    },
    inventoryUi: {
      currentPage: 1,
      sortCol: 'name',
      sortDir: 1,
      quickFilter: 'all',
      sortPreset: '',
    },
    sync: {
      isLoadingData: false,
      inventoryChannel: null,
      hasSuccessfulSync: false,
      syncInFlight: false,
      lastSuccessfulSyncAt: 0,
      bootstrappedUserId: null,
      hasCheckedSeedData: false,
    },
    session: {
      user: null,
      authTransitionPending: false,
      forceDashboardAfterLogin: false,
    },
    services: {
      supabaseClient: null,
    },
    overlays: {
      active: new Set(),
    },
  };

  function bindStateProperty(name, path) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      get() {
        return path.reduce((target, key) => target[key], appState);
      },
      set(value) {
        const target = path.slice(0, -1).reduce((obj, key) => obj[key], appState);
        target[path[path.length - 1]] = value;
      },
    });
  }

  bindStateProperty('inventory', ['inventory', 'items']);
  bindStateProperty('editId', ['inventory', 'editId']);
  bindStateProperty('scanHistory', ['inventory', 'scanHistory']);
  bindStateProperty('highlightShelf', ['inventory', 'highlightShelf']);
  bindStateProperty('selectedInventoryMedId', ['inventory', 'selectedMedicineId']);
  bindStateProperty('currentPage', ['inventoryUi', 'currentPage']);
  bindStateProperty('sortCol', ['inventoryUi', 'sortCol']);
  bindStateProperty('sortDir', ['inventoryUi', 'sortDir']);
  bindStateProperty('currentQuickFilter', ['inventoryUi', 'quickFilter']);
  bindStateProperty('inventorySortPreset', ['inventoryUi', 'sortPreset']);
  bindStateProperty('isLoadingData', ['sync', 'isLoadingData']);
  bindStateProperty('inventoryChannel', ['sync', 'inventoryChannel']);
  bindStateProperty('hasSuccessfulSync', ['sync', 'hasSuccessfulSync']);
  bindStateProperty('syncInFlight', ['sync', 'syncInFlight']);
  bindStateProperty('lastSuccessfulSyncAt', ['sync', 'lastSuccessfulSyncAt']);
  bindStateProperty('bootstrappedUserId', ['sync', 'bootstrappedUserId']);
  bindStateProperty('hasCheckedSeedData', ['sync', 'hasCheckedSeedData']);
  bindStateProperty('currentUser', ['session', 'user']);
  bindStateProperty('authTransitionPending', ['session', 'authTransitionPending']);
  bindStateProperty('forceDashboardAfterLogin', ['session', 'forceDashboardAfterLogin']);
  bindStateProperty('supabaseClient', ['services', 'supabaseClient']);

  globalThis.appState = appState;
  globalThis.bindStateProperty = bindStateProperty;
})();
