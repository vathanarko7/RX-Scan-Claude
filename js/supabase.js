(function() {
  const supabaseService = {
    createClient() {
      return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    },
    getInventoryCount() {
      return supabaseClient
        .from('medications')
        .select('id', { count: 'exact', head: true });
    },
    seedMedications(rows) {
      return supabaseClient.from('medications').insert(rows);
    },
    fetchMedicines() {
      return supabaseClient
        .from('medications')
        .select(MEDICATION_COLUMNS)
        .order('name', { ascending: true });
    },
    createMedicine(payload) {
      return supabaseClient.from('medications').insert(payload);
    },
    updateMedicine(id, payload) {
      return supabaseClient.from('medications').update(payload).eq('id', id);
    },
    deleteMedicine(id) {
      return supabaseClient.from('medications').delete().eq('id', id);
    },
    signInWithPassword(credentials) {
      return supabaseClient.auth.signInWithPassword(credentials);
    },
    signUp(credentials) {
      return supabaseClient.auth.signUp(credentials);
    },
    signOut() {
      return supabaseClient.auth.signOut();
    },
    getSession() {
      return supabaseClient.auth.getSession();
    },
    refreshSession() {
      return supabaseClient.auth.refreshSession();
    },
    onAuthStateChange(listener) {
      return supabaseClient.auth.onAuthStateChange(listener);
    },
    createInventoryChannel(onInventoryChange, onStatusChange) {
      return supabaseClient
        .channel('rxscan-medications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, onInventoryChange)
        .subscribe(onStatusChange);
    },
    removeChannel(channel) {
      return supabaseClient.removeChannel(channel);
    },
  };

  globalThis.supabaseService = supabaseService;
})();
