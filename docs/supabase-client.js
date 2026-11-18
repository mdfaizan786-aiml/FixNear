// ==============================================================================
// FixNear - Supabase Cloud Database & Authentication Integration
// ==============================================================================

const FixNearSupabase = (function() {
  // Default / saved credentials
  const STORAGE_KEY_URL = 'fixnear_supabase_url';
  const STORAGE_KEY_ANON = 'fixnear_supabase_anon_key';

  let client = null;

  function getConfig() {
    const url = localStorage.getItem(STORAGE_KEY_URL) || (window.FIXNEAR_SUPABASE_CONFIG && window.FIXNEAR_SUPABASE_CONFIG.url) || '';
    const key = localStorage.getItem(STORAGE_KEY_ANON) || (window.FIXNEAR_SUPABASE_CONFIG && window.FIXNEAR_SUPABASE_CONFIG.anonKey) || '';
    return { url, key };
  }

  function isConfigured() {
    const { url, key } = getConfig();
    return Boolean(url && key && url.startsWith('http') && key.length > 20);
  }

  function getClient() {
    if (client) return client;
    const { url, key } = getConfig();
    if (url && key && window.supabase) {
      try {
        client = window.supabase.createClient(url, key);
        return client;
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
      }
    }
    return null;
  }

  function setConfig(url, key) {
    if (!url || !key) return false;
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
    client = null;
    getClient();
    return true;
  }

  function clearConfig() {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    client = null;
  }

  async function testConnection(customUrl, customKey) {
    try {
      const url = customUrl || getConfig().url;
      const key = customKey || getConfig().key;
      if (!url || !key || !window.supabase) return { success: false, message: 'Supabase library or credentials missing' };

      const testClient = window.supabase.createClient(url, key);
      const { data, error } = await testClient.from('categories').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true, count: data };
    } catch (err) {
      return { success: false, message: err.message || 'Connection test failed' };
    }
  }

  // --- Data Access Methods ---
  async function getCategories(type) {
    const c = getClient();
    if (!c) return null;
    let query = c.from('categories').select('*').order('id', { ascending: true });
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) { console.warn('Supabase getCategories error:', error); return null; }
    return data;
  }

  async function getProviders(filter = {}) {
    const c = getClient();
    if (!c) return null;
    let query = c.from('provider_profiles').select(`
      *,
      profile:profiles (name, email, phone, city, latitude, longitude)
    `).order('avg_rating', { ascending: false });

    if (filter.is_available) query = query.eq('is_available', true);
    const { data, error } = await query;
    if (error) { console.warn('Supabase getProviders error:', error); return null; }

    return (data || []).map(p => {
      let skillsArr = [];
      try {
        skillsArr = typeof p.skills === 'string' ? JSON.parse(p.skills) : (p.skills || []);
      } catch {}

      return {
        id: p.id,
        name: p.profile ? p.profile.name : p.business_name,
        business_name: p.business_name,
        trade: p.trade,
        badge: p.badge,
        email: p.profile ? p.profile.email : '',
        phone: p.profile ? p.profile.phone : '',
        city: p.profile ? p.profile.city : 'Delhi NCR',
        location: (p.profile ? p.profile.city : '') || 'Delhi NCR',
        latitude: p.profile ? p.profile.latitude : 28.6139,
        longitude: p.profile ? p.profile.longitude : 77.2090,
        bio: p.bio,
        skills: JSON.stringify(skillsArr),
        hourly_rate: p.hourly_rate,
        rate_unit: p.rate_unit || 'hr',
        callout_fee: p.callout_fee || 150,
        experience_years: p.experience_years || 5,
        avg_rating: p.avg_rating || 5.0,
        total_reviews: p.total_reviews || 0,
        total_jobs: p.total_jobs || 0,
        is_available: p.is_available ? 1 : 0,
        availability_status: p.availability_status || (p.is_available ? 'Available' : 'Busy'),
        is_verified: p.is_verified ? 1 : 0,
        warranty: p.warranty || 'Verified Guarantee',
        role: 'provider'
      };
    });
  }

  async function getBookings(type, status) {
    const c = getClient();
    if (!c) return null;
    let query = c.from('bookings').select(`
      *,
      quotes (*)
    `).order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) { console.warn('Supabase getBookings error:', error); return null; }
    return data;
  }

  async function createBooking(booking) {
    const c = getClient();
    if (!c) return null;
    const { data, error } = await c.from('bookings').insert([booking]).select();
    if (error) { throw error; }
    return data && data[0];
  }

  async function submitQuote(quote) {
    const c = getClient();
    if (!c) return null;
    const { data, error } = await c.from('quotes').insert([quote]).select();
    if (error) { throw error; }
    return data && data[0];
  }

  async function addReview(review) {
    const c = getClient();
    if (!c) return null;
    const { data, error } = await c.from('reviews').insert([review]).select();
    if (error) { throw error; }
    return data && data[0];
  }

  async function upvoteCivicIssue(bookingId) {
    const c = getClient();
    if (!c) return null;
    const { data: booking, error: fetchErr } = await c.from('bookings').select('upvotes').eq('id', bookingId).single();
    if (fetchErr) throw fetchErr;

    const newCount = (booking.upvotes || 0) + 1;
    const { data, error } = await c.from('bookings').update({ upvotes: newCount }).eq('id', bookingId).select();
    if (error) throw error;
    return newCount;
  }

  return {
    getConfig,
    isConfigured,
    getClient,
    setConfig,
    clearConfig,
    testConnection,
    getCategories,
    getProviders,
    getBookings,
    createBooking,
    submitQuote,
    addReview,
    upvoteCivicIssue
  };
})();

// Also expose globally
window.FixNearSupabase = FixNearSupabase;
