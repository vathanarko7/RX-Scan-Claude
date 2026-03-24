    // ============================
    // XSS SAFETY HELPER
    // All user-supplied strings MUST be passed through esc() before
    // being interpolated into innerHTML. This prevents stored XSS via
    // medication names, barcodes, shelf codes, zones, etc.
    // ============================
    function esc(s) {
      if (s === null || s === undefined) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    const tx = (...args) => {
      if (typeof globalThis.t === 'function') return globalThis.t(...args);
      const [key, params, fallback] = args;
      let text = fallback || key || '';
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([name, value]) => {
          text = text.replace(new RegExp(`{{${name}}}`, 'g'), value);
        });
      }
      return text;
    };

    // ============================
    // DATA STORE
    // ============================
    const SUPABASE_CONFIG = {
      url: 'https://ijxhkluwesjilhwxfvjf.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqeGhrbHV3ZXNqaWxod3hmdmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTIyODEsImV4cCI6MjA4OTYyODI4MX0.YkPvsa3pn_BpQVHXWc-JnGIH9dthYubmKduLH_MBOVw',
    };
    const LAST_PAGE_KEY = 'rxscan_last_page';
    const INVENTORY_UI_KEY = 'rxscan_inventory_ui';

    const MEDICATION_COLUMNS = 'id,name,generic,barcode,category,price_box,units_per_box,stock,reorder,zone,shelf,expiry,mfr,created_at,updated_at';

    const SAMPLE_DATA = [
      { id: 1, name: 'Amoxil', generic: 'Amoxicillin', barcode: '3400936345507', category: 'Antibiotics', price_box: 12.50, units_per_box: 21, stock: 45, reorder: 10, zone: 'A - Antibiotics', shelf: 'A1-L2', expiry: '2026-08-15', mfr: 'GSK' },
      { id: 2, name: 'Doliprane', generic: 'Paracetamol', barcode: '3400935851218', category: 'Analgesics', price_box: 2.80, units_per_box: 16, stock: 120, reorder: 30, zone: 'B - Pain Relief', shelf: 'B3-L1', expiry: '2027-03-20', mfr: 'Sanofi' },
      { id: 3, name: 'Kardegic', generic: 'Aspirin 75mg', barcode: '3400936123456', category: 'Cardiovascular', price_box: 6.20, units_per_box: 30, stock: 8, reorder: 15, zone: 'C - Cardio', shelf: 'C2-L3', expiry: '2025-12-01', mfr: 'Sanofi' },
      { id: 4, name: 'Metformine', generic: 'Metformin 850mg', barcode: '3400937654321', category: 'Diabetes', price_box: 4.10, units_per_box: 30, stock: 0, reorder: 20, zone: 'D - Diabetes', shelf: 'D1-L2', expiry: '2026-06-30', mfr: 'Biogaran' },
      { id: 5, name: 'Ventoline', generic: 'Salbutamol', barcode: '3400934567890', category: 'Respiratory', price_box: 7.90, units_per_box: 1, stock: 28, reorder: 8, zone: 'H - Respiratory', shelf: 'H1-L1', expiry: '2026-09-15', mfr: 'GSK' },
      { id: 6, name: 'Atorvastatine', generic: 'Atorvastatin 20mg', barcode: '3400930012345', category: 'Cardiovascular', price_box: 16.40, units_per_box: 30, stock: 5, reorder: 10, zone: 'C - Cardio', shelf: 'C1-L2', expiry: '2026-11-20', mfr: 'Pfizer' },
      { id: 7, name: 'Omeprazole', generic: 'Omeprazole 20mg', barcode: '3400935098765', category: 'Gastrointestinal', price_box: 3.60, units_per_box: 28, stock: 62, reorder: 15, zone: 'B - Pain Relief', shelf: 'B2-L1', expiry: '2027-01-10', mfr: 'Mylan' },
      { id: 8, name: 'Vitamine D3', generic: 'Cholecalciferol 2000UI', barcode: '3400931122334', category: 'Vitamins & Supplements', price_box: 5.20, units_per_box: 60, stock: 88, reorder: 20, zone: 'E - Vitamins', shelf: 'E1-L1', expiry: '2026-05-15', mfr: 'Lescuyer' },
      { id: 9, name: 'Augmentin', generic: 'Amoxicillin+Clavulanate', barcode: '3400932233445', category: 'Antibiotics', price_box: 18.90, units_per_box: 12, stock: 3, reorder: 8, zone: 'A - Antibiotics', shelf: 'A2-L1', expiry: '2025-11-30', mfr: 'GSK' },
      { id: 10, name: 'Bisoprolol', generic: 'Bisoprolol 5mg', barcode: '3400933344556', category: 'Cardiovascular', price_box: 9.30, units_per_box: 30, stock: 34, reorder: 10, zone: 'C - Cardio', shelf: 'C3-L2', expiry: '2026-07-18', mfr: 'Teva' },
      { id: 11, name: 'Fluoxetine', generic: 'Fluoxetine 20mg', barcode: '3400934455667', category: 'Neurology', price_box: 11.50, units_per_box: 28, stock: 18, reorder: 5, zone: 'B - Pain Relief', shelf: 'B4-L3', expiry: '2026-10-22', mfr: 'Eli Lilly' },
      { id: 12, name: 'Cetirizine', generic: 'Cetirizine 10mg', barcode: '3400935566778', category: 'Respiratory', price_box: 3.90, units_per_box: 7, stock: 71, reorder: 15, zone: 'H - Respiratory', shelf: 'H2-L2', expiry: '2027-02-28', mfr: 'Zentiva' },
      { id: 13, name: 'Insuline Glargine', generic: 'Insulin Glargine', barcode: '3400936677889', category: 'Diabetes', price_box: 48.70, units_per_box: 5, stock: 12, reorder: 4, zone: 'F - Refrigerated', shelf: 'F1-L1', expiry: '2026-04-10', mfr: 'Sanofi' },
      { id: 14, name: 'Hydrocortisone 1%', generic: 'Hydrocortisone', barcode: '3400937788990', category: 'Dermatology', price_box: 4.80, units_per_box: 1, stock: 22, reorder: 6, zone: 'G - Dermatology', shelf: 'G1-L1', expiry: '2026-12-15', mfr: 'Biogaran' },
      { id: 15, name: 'Levothyrox', generic: 'Levothyroxine 50mcg', barcode: '3400938899001', category: 'Hormones', price_box: 5.50, units_per_box: 30, stock: 41, reorder: 10, zone: 'D - Diabetes', shelf: 'D2-L1', expiry: '2026-08-30', mfr: 'Merck' },
    ];

    function getPerPage() {
      return window.innerWidth <= 768 ? 8 : 12;
    }

    function clearInventorySearch() {
      const input = document.getElementById('search-inv');
      if (!input) return;
      input.value = '';
      currentPage = 1;
      saveInventoryUiState();
      renderInventory();
      input.focus();
    }

    function saveInventoryUiState() {
      try {
        sessionStorage.setItem(INVENTORY_UI_KEY, JSON.stringify({
          search: document.getElementById('search-inv')?.value || '',
          category: document.getElementById('filter-cat')?.value || '',
          zone: document.getElementById('filter-zone')?.value || '',
          quick: currentQuickFilter,
          sortPreset: inventorySortPreset,
        }));
      } catch (error) {
        console.warn('Unable to save inventory ui state', error);
      }
    }

    function restoreInventoryUiState() {
      try {
        const raw = sessionStorage.getItem(INVENTORY_UI_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        if (document.getElementById('search-inv')) document.getElementById('search-inv').value = state.search || '';
        if (document.getElementById('filter-cat')) document.getElementById('filter-cat').value = state.category || '';
        if (document.getElementById('filter-zone')) document.getElementById('filter-zone').value = state.zone || '';
        currentQuickFilter = state.quick || 'all';
        inventorySortPreset = state.sortPreset || '';
      } catch (error) {
        console.warn('Unable to restore inventory ui state', error);
      }
    }

    function isSupabaseConfigured() {
      return SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey &&
        !SUPABASE_CONFIG.url.startsWith('YOUR_') &&
        !SUPABASE_CONFIG.anonKey.startsWith('YOUR_');
    }

    function normalizeMedication(row) {
      return {
        id: row.id,
        name: row.name || '',
        generic: row.generic || '',
        barcode: row.barcode || '',
        category: row.category || 'Other',
        price_box: Number(row.price_box || 0),
        units_per_box: Number(row.units_per_box || 1),
        stock: Number(row.stock || 0),
        reorder: Number(row.reorder || 0),
        zone: row.zone || '',
        shelf: row.shelf || '',
        expiry: row.expiry || '',
        mfr: row.mfr || '',
      };
    }

    function getUserDisplayName(user) {
      if (!user) return 'Pharmacist';
      const metaName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name;
      if (metaName && String(metaName).trim()) return String(metaName).trim();
      const email = user.email || '';
      const base = email.split('@')[0] || 'Pharmacist';
      return base
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    function setConnectionState(state) {
      const pill = document.getElementById('connection-pill');
      const label = document.getElementById('connection-label');
      const logoDot = document.getElementById('logo-connection-dot');
      if (!pill || !label) return;
      pill.classList.remove('online', 'connecting', 'offline');
      pill.classList.add(state);
      if (logoDot) {
        const dotColor = state === 'online' ? 'var(--success)' : state === 'offline' ? 'var(--danger)' : '#f5c96a';
        logoDot.style.color = dotColor;
        logoDot.style.backgroundColor = dotColor;
        logoDot.style.boxShadow = `0 0 10px ${dotColor}`;
        logoDot.style.animation = state === 'connecting' ? 'pulse-connection 1.1s infinite ease-in-out' : 'none';
      }
      if (state === 'online') {
        label.setAttribute('data-i18n', 'connection.online');
        label.textContent = tx('connection.online', null, 'Online');
      } else if (state === 'offline') {
        label.setAttribute('data-i18n', 'connection.offline');
        label.textContent = tx('connection.offline', null, 'Offline');
      } else {
        label.setAttribute('data-i18n', 'connection.connecting');
        label.textContent = tx('connection.connecting', null, 'Connecting...');
      }
    }

    function refreshConnectionIndicator() {
      if (!navigator.onLine) {
        setConnectionState('offline');
        return;
      }
      if (!hasSuccessfulSync && syncInFlight) {
        setConnectionState('connecting');
        return;
      }
      if (hasSuccessfulSync || lastSuccessfulSyncAt > 0) {
        setConnectionState('online');
        return;
      }
      setConnectionState('connecting');
    }

    function medicationPayload(data) {
      return {
        name: data.name,
        generic: data.generic || '',
        barcode: data.barcode,
        category: data.category || 'Other',
        price_box: Number(data.price_box || 0),
        units_per_box: Number(data.units_per_box || 1),
        stock: Number(data.stock || 0),
        reorder: Number(data.reorder || 0),
        zone: data.zone || '',
        shelf: data.shelf || '',
        expiry: data.expiry || null,
        mfr: data.mfr || '',
      };
    }

    function dashboardSkeletonBars() {
      return Array.from({ length: 6 }, () => `
        <div class="bar-row">
          <div class="bar-name skeleton skeleton-line" style="width:96px;height:12px;"></div>
          <div class="bar-track"><div class="bar-fill" style="width:55%;opacity:0.35;"></div></div>
          <div class="bar-val skeleton skeleton-line" style="height:12px;width:28px;"></div>
        </div>
      `).join('');
    }

    function inventorySkeletonCards() {
      return Array.from({ length: 4 }, () => `
        <div class="med-card">
          <div class="med-card-top">
            <div style="flex:1;">
              <div class="skeleton skeleton-line" style="height:16px;width:52%;"></div>
              <div class="skeleton skeleton-line" style="height:11px;width:38%;"></div>
            </div>
            <div class="skeleton" style="height:28px;width:78px;border-radius:999px;"></div>
          </div>
          <div class="med-card-grid">
            <div class="med-card-stat"><div class="skeleton skeleton-line" style="height:10px;width:54%;"></div><div class="skeleton skeleton-line" style="height:16px;width:68%;"></div></div>
            <div class="med-card-stat"><div class="skeleton skeleton-line" style="height:10px;width:54%;"></div><div class="skeleton skeleton-line" style="height:16px;width:68%;"></div></div>
            <div class="med-card-stat"><div class="skeleton skeleton-line" style="height:10px;width:54%;"></div><div class="skeleton skeleton-line" style="height:16px;width:68%;"></div></div>
          </div>
          <div class="med-card-bottom">
            <div class="skeleton" style="height:28px;flex:1;border-radius:6px;"></div>
            <div class="med-card-actions">
              <div class="skeleton" style="height:34px;width:34px;"></div>
              <div class="skeleton" style="height:34px;width:34px;"></div>
              <div class="skeleton" style="height:34px;width:34px;"></div>
            </div>
          </div>
        </div>
      `).join('');
    }



    async function loadData() {
      const { data, error } = await supabaseService.fetchMedicines();
      if (error) throw error;
      inventory = (data || []).map(normalizeMedication);
      return inventory;
    }

    async function ensureSeedData() {
      if (hasCheckedSeedData) return;
      const currentRows = await loadData();
      if (currentRows.length > 0) {
        hasCheckedSeedData = true;
        return;
      }

      const seedRows = SAMPLE_DATA.map(({ id, ...rest }) => medicationPayload(rest));
      const { error: seedError } = await supabaseService.seedMedications(seedRows);
      if (seedError) throw seedError;
      await loadData();
      hasCheckedSeedData = true;
    }

    async function refreshInventory(showLoader = false) {
      if (syncInFlight) return;
      const shouldShowSkeleton = inventory.length === 0;
      syncInFlight = true;
      isLoadingData = shouldShowSkeleton;
      refreshConnectionIndicator();
      if (shouldShowSkeleton) {
        renderActivePage();
      }
      try {
        if (showLoader) showToast('Syncing inventory...');
        if (!hasCheckedSeedData) {
          await ensureSeedData();
        } else {
          await loadData();
        }
        hasSuccessfulSync = true;
        lastSuccessfulSyncAt = Date.now();
        syncInFlight = false;
        isLoadingData = false;
        refreshConnectionIndicator();
        refreshGlobalUi();
        renderActivePage();
      } catch (error) {
        syncInFlight = false;
        isLoadingData = false;
        refreshConnectionIndicator();
        console.error(error);
        showToast(error.message || 'Failed to load inventory', true);
        refreshGlobalUi();
        renderActivePage();
      }
    }

    function showAuthError(message = '') {
      const el = document.getElementById('auth-error');
      if (!el) return;
      el.textContent = message;
      el.style.display = message ? 'block' : 'none';
    }

    function setAuthSetupNote(message = '') {
      const note = document.getElementById('auth-note');
      if (!note) return;
      note.textContent = message;
      note.classList.toggle('show', !!message);
    }

    function setAuthSubmitState(mode = 'idle', isLoading = false) {
      const signInBtn = document.getElementById('auth-signin-btn');
      const signUpBtn = document.getElementById('auth-signup-btn');
      const toggleBtn = document.getElementById('auth-toggle');
      const emailInput = document.getElementById('auth-email');
      const passwordInput = document.getElementById('auth-password');
      if (signInBtn) {
        signInBtn.disabled = isLoading;
        signInBtn.textContent = isLoading && mode === 'signin' ? tx('auth.signingIn', null, 'Signing in...') : tx('auth.signin', null, 'Sign In');
      }
      if (signUpBtn) {
        signUpBtn.disabled = isLoading;
        signUpBtn.textContent = isLoading && mode === 'signup' ? tx('auth.creating', null, 'Creating...') : tx('auth.createStaff', null, 'Create Staff Account');
      }
      if (toggleBtn) toggleBtn.disabled = isLoading;
      if (emailInput) emailInput.disabled = isLoading;
      if (passwordInput) passwordInput.disabled = isLoading;
    }

    function updateSessionChrome() {
      const dashboardName = document.getElementById('dashboard-user-name');
      const logoutBtnHeader = document.getElementById('logout-btn-header');
      const sessionPillHeader = document.getElementById('session-pill-header');
      const sessionEmailHeader = document.getElementById('session-email-header');
      const displayName = getUserDisplayName(currentUser);
      const dashboardShortName = displayName.split(/\s+/).filter(Boolean)[0] || displayName;

      if (dashboardName) dashboardName.textContent = dashboardShortName;

      if (currentUser) {
        if (sessionPillHeader && sessionEmailHeader) {
          sessionEmailHeader.textContent = displayName;
          sessionPillHeader.style.display = 'none';
        }
        if (logoutBtnHeader) logoutBtnHeader.style.display = 'inline-flex';
      } else {
        if (sessionPillHeader) sessionPillHeader.style.display = 'none';
        if (logoutBtnHeader) logoutBtnHeader.style.display = 'none';
      }
    }

    function setAuthMode(isAuthMode) {
      document.body.classList.remove('booting');
      document.body.classList.toggle('auth-mode', isAuthMode);
      if (isAuthMode) {
        syncInFlight = false;
        refreshConnectionIndicator();
      }
      updateSessionChrome();
    }

    async function handleAuthSignIn() {
      if (!supabaseClient) return;
      showAuthError('');
      setAuthSubmitState('signin', true);
      try {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        authTransitionPending = true;
        forceDashboardAfterLogin = true;
        const { data, error } = await supabaseService.signInWithPassword({ email, password });
        if (error) {
          authTransitionPending = false;
          forceDashboardAfterLogin = false;
          showAuthError(error.message || 'Unable to sign in');
          return;
        }
        currentUser = data?.user || data?.session?.user || currentUser;
        showAuthError('');
      } finally {
        authTransitionPending = false;
        setAuthSubmitState('signin', false);
      }
    }

    async function handleAuthSignUp() {
      if (!supabaseClient) return;
      showAuthError('');
      setAuthSubmitState('signup', true);
      try {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const { data, error } = await supabaseService.signUp({ email, password });
        if (error) {
          showAuthError(error.message || 'Unable to create account');
          return;
        }
        if (!data.session) {
          showAuthError('Account created. Check your email for the confirmation link, then sign in.');
        }
      } finally {
        setAuthSubmitState('signup', false);
      }
    }

    async function handleSignOut() {
      if (!supabaseClient) return;
      await supabaseService.signOut();
    }

    function subscribeToInventory() {
      if (!supabaseClient || inventoryChannel) return;
      inventoryChannel = supabaseService.createInventoryChannel(async () => {
          await refreshInventory();
        }, (status) => {
          if (status === 'SUBSCRIBED') refreshConnectionIndicator();
          else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            refreshConnectionIndicator();
          }
        });
    }

    function unsubscribeFromInventory() {
      if (!supabaseClient || !inventoryChannel) return;
      supabaseService.removeChannel(inventoryChannel);
      inventoryChannel = null;
      hasSuccessfulSync = false;
      syncInFlight = false;
      lastSuccessfulSyncAt = 0;
      refreshConnectionIndicator();
    }

    async function bootstrapAuthenticatedApp() {
      const targetPage = forceDashboardAfterLogin ? 'dashboard' : getSavedPage();
      forceDashboardAfterLogin = false;
      const shouldShowSkeleton = inventory.length === 0;
      try {
        if (shouldShowSkeleton) {
          isLoadingData = true;
        }
        document.body.classList.add('shell-loading');
        document.body.classList.remove('booting');
        document.body.classList.remove('auth-mode');
        showPage(targetPage);
        setAuthMode(false);
        subscribeToInventory();
        await refreshInventory();
        bootstrappedUserId = currentUser?.id || null;
        document.body.classList.remove('shell-loading');
      } catch (error) {
        document.body.classList.remove('shell-loading');
        setAuthMode(true);
        showAuthError(error.message || 'Unable to load inventory');
        throw error;
      }
    }

    let bootstrapPromise = null;

    function ensureBootstrappedApp() {
      if (bootstrapPromise) return bootstrapPromise;
      bootstrapPromise = bootstrapAuthenticatedApp().finally(() => {
        bootstrapPromise = null;
      });
      return bootstrapPromise;
    }

    function scheduleAuthStateWork(work) {
      window.setTimeout(() => {
        Promise.resolve()
          .then(work)
          .catch((error) => {
            console.error('Auth state handling failed', error);
          });
      }, 0);
    }

    async function handleSupabaseAuthChange(event, sessionNow) {
      currentUser = sessionNow?.user || null;
      updateSessionChrome();
      if (currentUser) {
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          refreshConnectionIndicator();
          return;
        }
        if (bootstrappedUserId === currentUser.id) {
          refreshConnectionIndicator();
          return;
        }
        showAuthError('');
        await ensureBootstrappedApp();
        return;
      }

      document.body.classList.remove('shell-loading');
      unsubscribeFromInventory();
      inventory = [];
      bootstrappedUserId = null;
      setAuthMode(true);
      refreshGlobalUi();
      renderDashboard();
    }

    function getSavedPage() {
      try {
        const savedPage = sessionStorage.getItem(LAST_PAGE_KEY);
        if (['dashboard', 'inventory', 'map', 'alerts', 'analytics'].includes(savedPage)) {
          return savedPage;
        }
      } catch (error) {
        console.warn('Unable to restore last page', error);
      }
      return 'dashboard';
    }

    async function ensureActiveSession(forceRefresh = false) {
      if (!supabaseClient) throw new Error('Supabase is not ready yet');

      let session = null;
      if (!forceRefresh) {
        const { data, error } = await supabaseService.getSession();
        if (error) throw error;
        session = data?.session || null;
      }

      if (!session) {
        const { data, error } = await supabaseService.refreshSession();
        if (error) throw error;
        session = data?.session || null;
      }

      currentUser = session?.user || null;
      updateSessionChrome();
      if (!session) {
        throw new Error('Your session expired. Please sign in again.');
      }
      return session;
    }

    async function runWithSessionRetry(action) {
      await ensureActiveSession();
      let result = await action();
      let message = result?.error?.message || '';
      if (result?.error && /jwt|token|session|auth/i.test(message)) {
        await ensureActiveSession(true);
        result = await action();
      }
      if (result?.error) throw result.error;
      return result;
    }

    async function initSupabase() {
      if (!isSupabaseConfigured()) {
        setAuthMode(true);
        showAuthError('Supabase is not configured yet. Add your project URL and anon key in SUPABASE_CONFIG before deploying.');
        setAuthSetupNote('Configure Supabase in the app config before deploying this screen.');
        return;
      }

      supabaseClient = supabaseService.createClient();

      const { data: { session } } = await supabaseService.getSession();
      currentUser = session?.user || null;

      supabaseService.onAuthStateChange((event, sessionNow) => {
        scheduleAuthStateWork(() => handleSupabaseAuthChange(event, sessionNow));
      });

      if (currentUser) await ensureBootstrappedApp();
      else {
        setAuthSetupNote('');
        setAuthMode(true);
      }

    }


    // ============================
    // STORE MAP
    // ============================

    // ============================
    // ALERTS
    // ============================

    // ============================

    // ============================
    // EXPORT CSV
    // ============================
    function exportCSV(scope = 'all') {
      const headers = ['Name', 'Generic', 'Barcode', 'Category', 'Box Price', 'Unit Price', 'Stock', 'Reorder', 'Zone', 'Shelf', 'Expiry', 'Manufacturer'];
      const source = scope === 'filtered' ? getFiltered() : inventory;
      const rows = source.map(m => [
        m.name, m.generic || '', m.barcode, m.category,
        m.price_box, m.units_per_box ? (m.price_box / m.units_per_box).toFixed(2) : '',
        m.stock, m.reorder, m.zone, m.shelf, m.expiry, m.mfr || ''
      ]);
      const csvQuote = v => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
      const csv = [headers, ...rows].map(r => r.map(csvQuote).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const datePart = new Date().toISOString().slice(0, 10);
      a.href = url; a.download = `rxscan_inventory_${scope}_${datePart}.csv`; a.click();
      showToast(`Exported ${source.length} medicine(s)`);
      if (scope === 'filtered') closeFilterExportSheet();
    }

    // ============================
    // TOAST
    // ============================
    function showToast(msg, error = false) {
      const t = document.getElementById('toast');
      document.getElementById('toast-msg').textContent = msg;
      t.className = 'toast show' + (error ? ' error' : '');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    async function copyTextToClipboard(text) {
      if (!text) return false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (_) {
        // fall through to manual copy fallback
      }

      try {
        const helper = document.createElement('input');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        helper.style.pointerEvents = 'none';
        document.body.appendChild(helper);
        helper.select();
        helper.setSelectionRange(0, helper.value.length);
        const copied = document.execCommand('copy');
        document.body.removeChild(helper);
        return copied;
      } catch (_) {
        return false;
      }
    }

    function getActivePageName() {
      const activePage = document.querySelector('.page.active');
      return activePage?.id?.replace(/^page-/, '') || getSavedPage();
    }

    function renderActivePage() {
      const activePage = getActivePageName();
      if (activePage === 'dashboard') renderDashboard();
      if (activePage === 'inventory') renderInventory();
      if (activePage === 'map') renderMap();
      if (activePage === 'alerts') renderAlerts();
      if (activePage === 'analytics') renderAnalytics();
    }

    function refreshGlobalUi() {
      if (typeof syncAlertBadges === 'function') syncAlertBadges();
    }

    window.addEventListener('rxscan:languagechange', () => {
      renderActivePage();
      if (globalThis.i18n?.apply) globalThis.i18n.apply(document);
      refreshGlobalUi();
    });

    function handleDeclarativeClick(event) {
      const target = event.target.closest('[data-page],[data-action],[data-sort-col],[data-quick-filter]');
      if (!target) return;

      if (target.dataset.page) {
        showPage(target.dataset.page);
        return;
      }

      if (target.dataset.quickFilter) {
        setQuickFilter(target.dataset.quickFilter);
        return;
      }

      if (target.dataset.sortCol) {
        sortBy(target.dataset.sortCol);
        return;
      }

      switch (target.dataset.action) {
        case 'auth-signin':
          handleAuthSignIn();
          break;
        case 'auth-signup':
          handleAuthSignUp();
          break;
        case 'open-scanner':
          openScanner();
          break;
        case 'sign-out':
          handleSignOut();
          break;
        case 'open-add-modal':
          openAddModal();
          break;
        case 'inventory-add':
          showPage('inventory');
          openAddModal();
          break;
        case 'inventory-filter':
          showPage('inventory');
          currentQuickFilter = target.dataset.filter || 'all';
          currentPage = 1;
          renderInventory();
          break;
        case 'go-shelf':
          goToShelf(target.dataset.shelf || '');
          break;
        case 'open-edit-modal':
          openEditModal(Number(target.dataset.medId));
          break;
        case 'fill-scanner':
          {
            const barcode = target.dataset.barcode || '';
            if (window.innerWidth <= 768) {
              fillScannerWith(barcode);
            } else {
              copyTextToClipboard(barcode).then((copied) => {
                showToast(copied ? `Copied barcode ${barcode}` : 'Unable to copy barcode', !copied);
              });
            }
          }
          break;
        case 'open-stock-modal':
          openInventoryStock(Number(target.dataset.medId));
          break;
        case 'delete-med':
          deleteMed(Number(target.dataset.medId));
          break;
        case 'open-inventory-actions':
          openInventoryActions(Number(target.dataset.medId));
          break;
        case 'go-page':
          goPage(Number(target.dataset.pageNumber));
          break;
        case 'inventory-action':
          handleInventoryAction(target.dataset.inventoryAction);
          break;
        case 'close-inventory-actions':
          closeInventoryActions();
          break;
        case 'apply-filter-sheet':
          applyFilterSheet();
          break;
        case 'export-all':
          exportCSV('all');
          break;
        case 'clear-all-filters':
          clearAllInventoryFilters();
          break;
        case 'close-filter-sheet':
          closeFilterExportSheet();
          break;
        case 'clear-search':
          clearInventorySearch();
          break;
        case 'export-filtered':
          exportCSV('filtered');
          break;
        case 'close-modal':
          closeModal();
          break;
        case 'save-medication':
          saveMedication();
          break;
        case 'close-scanner':
          closeScanner();
          break;
        case 'lookup-barcode':
          lookupBarcode();
          break;
        case 'highlight-on-map':
          highlightOnMap();
          break;
        case 'quick-update-stock':
          quickUpdateStock();
          break;
        case 'scan-again':
          scanAgain();
          break;
        case 'open-add-from-scan':
          openAddFromScan();
          break;
        case 'close-confirm':
          closeConfirmModal();
          break;
        case 'confirm-ok':
          if (_confirmCallback) _confirmCallback();
          break;
        case 'close-stock':
          closeStockModal();
          break;
        case 'submit-stock':
          submitStockModal();
          break;
        default:
          break;
      }
    }

    function initDeclarativeUi() {
      document.addEventListener('click', handleDeclarativeClick);

      const authPasswordInput = document.getElementById('auth-password');
      if (authPasswordInput) {
        authPasswordInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') handleAuthSignIn();
        });
      }

      const inventorySearchInput = document.getElementById('search-inv');
      if (inventorySearchInput) {
        inventorySearchInput.addEventListener('input', handleInventorySearchInput);
      }

      ['filter-cat', 'filter-zone'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('change', renderInventory);
        }
      });

      ['f-stock', 'f-reorder', 'f-shelf'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', updateMedicationModalTags);
        }
      });

      const expiryInput = document.getElementById('f-expiry');
      if (expiryInput) {
        expiryInput.addEventListener('change', updateMedicationModalTags);
      }

      const modalOverlay = document.getElementById('modal-overlay');
      if (modalOverlay) {
        modalOverlay.addEventListener('click', handleOverlayClick);
      }

      const scannerManualInput = document.getElementById('manual-barcode');
      if (scannerManualInput) {
        scannerManualInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') lookupBarcode();
        });
      }

      const confirmOverlay = document.getElementById('confirm-overlay');
      if (confirmOverlay) {
        confirmOverlay.addEventListener('click', (event) => {
          if (event.target === confirmOverlay) closeConfirmModal();
        });
      }

      const stockOverlay = document.getElementById('stock-overlay');
      if (stockOverlay) {
        stockOverlay.addEventListener('click', (event) => {
          if (event.target === stockOverlay) closeStockModal();
        });
      }

      const stockInput = document.getElementById('stock-input');
      if (stockInput) {
        stockInput.addEventListener('input', validateStockInput);
        stockInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submitStockModal();
          }
          if (event.key === 'Escape') {
            closeStockModal();
          }
        });
      }

      const inventoryActionOverlay = document.getElementById('inventory-action-overlay');
      if (inventoryActionOverlay) {
        inventoryActionOverlay.addEventListener('click', (event) => {
          if (event.target === inventoryActionOverlay) closeInventoryActions();
        });
      }

      const filterExportOverlay = document.getElementById('filter-export-overlay');
      if (filterExportOverlay) {
        filterExportOverlay.addEventListener('click', (event) => {
          if (event.target === filterExportOverlay) closeFilterExportSheet();
        });
      }
    }

    // ============================
    // INIT
    // ============================
    window.addEventListener('online', () => refreshConnectionIndicator());
    window.addEventListener('offline', () => refreshConnectionIndicator());
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState !== 'visible' || !supabaseClient || !currentUser) return;
      try {
        await ensureActiveSession();
        if (!inventoryChannel) subscribeToInventory();
        refreshConnectionIndicator();
      } catch (error) {
        console.error('Session resume failed', error);
        refreshConnectionIndicator();
      }
    });
    initDeclarativeUi();
    restoreInventoryUiState();
    initSupabase();

    // Single authoritative showPage wrapper replaces the previous double monkey-patch.
    // All mobile nav sync happens here in one place.
    updateMobileNav();
    window.addEventListener('resize', updateMobileNav);
    syncNavigationState(getSavedPage());
