(function () {
  const cfg = window.APP_CONFIG || {};
  const valid = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("YOUR-PROJECT") &&
    !cfg.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
  if (window.supabase && valid) {
    window.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    window.supabaseConfigured = true;
  } else {
    window.supabaseConfigured = false;
  }
})();
