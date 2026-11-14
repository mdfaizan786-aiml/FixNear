const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db', 'fixnear.sqlite');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(path.join(__dirname, 'db'))) fs.mkdirSync(path.join(__dirname, 'db'), { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer', -- customer | provider | admin
    avatar TEXT,
    address TEXT,
    city TEXT,
    latitude REAL DEFAULT 28.6139,
    longitude REAL DEFAULT 77.2090,
    is_active INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS provider_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    business_name TEXT,
    bio TEXT,
    skills TEXT, -- JSON array
    service_radius_km REAL DEFAULT 10,
    hourly_rate REAL,
    experience_years INTEGER DEFAULT 0,
    portfolio_images TEXT, -- JSON array of paths
    is_available INTEGER DEFAULT 1,
    total_jobs INTEGER DEFAULT 0,
    avg_rating REAL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'repair' -- repair | civic
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    provider_id INTEGER,
    category_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'repair', -- repair | civic
    address TEXT NOT NULL,
    city TEXT,
    latitude REAL,
    longitude REAL,
    scheduled_date TEXT,
    scheduled_time TEXT,
    budget_min REAL,
    budget_max REAL,
    image_before TEXT,
    image_after TEXT,
    status TEXT DEFAULT 'pending', -- pending | confirmed | in_progress | completed | cancelled | disputed
    priority TEXT DEFAULT 'normal', -- low | normal | high | urgent
    final_price REAL,
    payment_status TEXT DEFAULT 'unpaid', -- unpaid | paid
    upvotes INTEGER DEFAULT 0,
    admin_notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    message TEXT,
    eta_days INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending', -- pending | accepted | rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info | success | warning | error
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, user_id)
  );
`);

// --- Seed Data ---
function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'fixnear_salt').digest('hex');
}

const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const insUser = db.prepare(`INSERT INTO users (name, email, phone, password_hash, role, city, latitude, longitude, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  // Admin
  insUser.run('Admin User', 'admin@fixnear.com', '9999900000', hashPassword('admin123'), 'admin', 'Delhi', 28.6139, 77.2090, 1);
  // Customers
  insUser.run('Priya Sharma', 'priya@example.com', '9876543210', hashPassword('pass123'), 'customer', 'Delhi', 28.6160, 77.2080, 1);
  insUser.run('Rahul Verma', 'rahul@example.com', '9876543211', hashPassword('pass123'), 'customer', 'Delhi', 28.6190, 77.2140, 1);
  // Providers
  insUser.run('Ramesh Plumbing Co.', 'ramesh@fixnear.com', '9123456789', hashPassword('pass123'), 'provider', 'Delhi', 28.6110, 77.2060, 1);
  insUser.run('Suresh Electric Works', 'suresh@fixnear.com', '9123456790', hashPassword('pass123'), 'provider', 'Delhi', 28.6080, 77.2100, 1);
  insUser.run('CoolAir AC Services', 'coolair@fixnear.com', '9123456791', hashPassword('pass123'), 'provider', 'Delhi', 28.6050, 77.2150, 1);
  insUser.run('QuickFix Handyman', 'quickfix@fixnear.com', '9123456792', hashPassword('pass123'), 'provider', 'Delhi', 28.6200, 77.2050, 1);

  // Provider Profiles
  const insProfile = db.prepare(`INSERT INTO provider_profiles (user_id, business_name, bio, skills, service_radius_km, hourly_rate, experience_years, avg_rating, total_reviews, total_jobs, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insProfile.run(4, 'Ramesh Plumbing Co.', 'Expert plumber with 12+ years of experience in residential and commercial plumbing.', JSON.stringify(['Plumbing', 'Pipe Repair', 'Bathroom Fitting', 'Drainage']), 15, 350, 12, 4.8, 127, 342, 1);
  insProfile.run(5, 'Suresh Electric Works', 'Certified electrician handling all electrical needs safely and quickly.', JSON.stringify(['Electrical', 'Wiring', 'Panel Repair', 'Appliance Installation']), 10, 400, 8, 4.6, 89, 201, 1);
  insProfile.run(6, 'CoolAir AC Services', 'Specialised in all major AC brands – installation, servicing, gas refill & repairs.', JSON.stringify(['AC Repair', 'AC Installation', 'AC Gas Refill', 'Appliance Repair']), 20, 500, 10, 4.9, 203, 487, 1);
  insProfile.run(7, 'QuickFix Handyman', 'Multi-skill handyman for all domestic repairs – carpentry, painting, assembling.', JSON.stringify(['Carpentry', 'Painting', 'Furniture Assembly', 'General Repair']), 12, 300, 5, 4.4, 56, 134, 1);

  // Categories
  const insCat = db.prepare(`INSERT INTO categories (name, icon, description, type) VALUES (?, ?, ?, ?)`);
  insCat.run('Plumbing', '🔧', 'Leaks, pipe repairs, fittings, drainage', 'repair');
  insCat.run('Electrical', '⚡', 'Wiring, MCB, switches, installations', 'repair');
  insCat.run('AC & Appliances', '❄️', 'AC service, gas refill, fridge, washing machine', 'repair');
  insCat.run('Carpentry', '🪵', 'Furniture, doors, windows, wood work', 'repair');
  insCat.run('Painting', '🎨', 'Interior/exterior painting, waterproofing', 'repair');
  insCat.run('Cleaning', '🧹', 'Deep cleaning, sofa, bathroom, kitchen', 'repair');
  insCat.run('Roads & Potholes', '🛣️', 'Civic road damage reports', 'civic');
  insCat.run('Streetlights', '💡', 'Broken or dim public lighting', 'civic');
  insCat.run('Sanitation', '🗑️', 'Garbage overflow, drainage issues', 'civic');
  insCat.run('Water Supply', '💧', 'Water leaks, main pipe breaks', 'civic');

  // Bookings
  const insBk = db.prepare(`INSERT INTO bookings (customer_id, provider_id, category_id, title, description, type, address, city, latitude, longitude, scheduled_date, scheduled_time, budget_min, budget_max, status, priority, upvotes, admin_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insBk.run(2, 4, 1, 'Bathroom pipe burst – urgent fix needed', 'Main supply pipe burst in master bathroom. Water flooding. Need emergency plumber.', 'repair', 'Flat 12B, Sector 7', 'Delhi', 28.6160, 77.2080, '2026-11-16', '10:00 AM', 500, 1500, 'confirmed', 'urgent', 3, '');
  insBk.run(3, 6, 3, 'Split AC not cooling – gas refill needed', '1.5T Samsung inverter AC not cooling. Last serviced 1 year ago.', 'repair', 'Block C, Green Apartments', 'Delhi', 28.6190, 77.2140, '2026-11-17', '02:00 PM', 1000, 2000, 'in_progress', 'normal', 1, '');
  insBk.run(2, null, 7, 'Dangerous pothole on Main Chowk', 'Very deep pothole causing accidents near the main chowk roundabout.', 'civic', 'Main Chowk, Sector 9', 'Delhi', 28.6110, 77.2050, null, null, null, null, 'pending', 'high', 15, 'Inspection ordered from PWD.');
  insBk.run(3, null, 9, 'Garbage dump overflowing near Gate 2', 'Community dustbin overflowing for 3 days. Stray animals gathering.', 'civic', 'Gate 2, Civic Colony', 'Delhi', 28.6080, 77.2100, null, null, null, null, 'completed', 'normal', 22, 'Sanitation crew deployed. Resolved.');
  insBk.run(2, 5, 2, 'Electrical short circuit – board damaged', 'Main MCB keeps tripping. Electrical board partially damaged. Need certified electrician.', 'repair', 'Block A, Rose Heights', 'Delhi', 28.6050, 77.2150, '2026-11-18', '11:00 AM', 800, 2000, 'pending', 'high', 0, '');

  // Quotes
  const insQuote = db.prepare(`INSERT INTO quotes (booking_id, provider_id, amount, message, eta_days, status) VALUES (?, ?, ?, ?, ?, ?)`);
  insQuote.run(1, 4, 950, 'Can reach in 30 mins. Will bring all required fittings.', 1, 'accepted');
  insQuote.run(5, 5, 1200, 'Will inspect and provide exact cost after diagnosis. ETA 2 hours.', 1, 'pending');
  insQuote.run(5, 7, 850, 'Basic MCB replacement included. Additional charges if wiring needed.', 2, 'pending');

  // Reviews
  const insRev = db.prepare(`INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?)`);
  insRev.run(2, 3, 6, 5, 'Excellent service! AC was fixed perfectly. Highly recommended CoolAir!');
  insRev.run(1, 2, 4, 5, 'Ramesh arrived on time and fixed the burst pipe quickly. Very professional.');

  // Notifications
  const insNotif = db.prepare(`INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`);
  insNotif.run(2, 'Booking Confirmed!', 'Your plumbing request #1 has been confirmed. Provider arrives Nov 16 at 10 AM.', 'success');
  insNotif.run(4, 'New Job Request!', 'A new urgent plumbing job has been posted near Sector 7. Check it out!', 'info');
  insNotif.run(1, 'New Provider Signup', 'QuickFix Handyman has registered. Review and verify their profile.', 'info');

  console.log('✅ FixNear database seeded successfully.');
}

// ==================== HELPERS ====================
function parseMultipart(buffer, boundary) {
  const result = { fields: {}, files: {} };
  const boundaryBuffer = Buffer.from('--' + boundary);
  let start = 0;
  while ((start = buffer.indexOf(boundaryBuffer, start)) !== -1) {
    start += boundaryBuffer.length;
    if (buffer[start] === 45 && buffer[start + 1] === 45) break;
    if (buffer[start] === 13 && buffer[start + 1] === 10) start += 2;
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), start);
    if (headerEnd === -1) break;
    const headerText = buffer.slice(start, headerEnd).toString('utf8');
    const contentStart = headerEnd + 4;
    const contentEnd = buffer.indexOf(boundaryBuffer, contentStart) - 2;
    if (contentEnd < contentStart) break;
    const partContent = buffer.slice(contentStart, contentEnd);
    const dispMatch = headerText.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/i);
    if (dispMatch) {
      const fieldName = dispMatch[1];
      const filename = dispMatch[2];
      if (filename) {
        const typeMatch = headerText.match(/Content-Type: ([^\r\n]+)/i);
        result.files[fieldName] = { filename, contentType: typeMatch ? typeMatch[1] : 'application/octet-stream', data: partContent };
      } else {
        result.fields[fieldName] = partContent.toString('utf8');
      }
    }
    start = contentEnd;
  }
  return result;
}

function saveUpload(file, prefix = 'img') {
  const ext = path.extname(file.filename) || '.jpg';
  const fileName = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, fileName), file.data);
  return `/uploads/${fileName}`;
}

function sendJSON(res, statusCode, data) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function getSession(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  const now = new Date().toISOString();
  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?').get(token, now);
  if (!session) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id);
}

function requireAuth(req, res, roles = []) {
  const user = getSession(req);
  if (!user) { sendJSON(res, 401, { error: 'Authentication required' }); return null; }
  if (roles.length && !roles.includes(user.role)) { sendJSON(res, 403, { error: 'Access denied' }); return null; }
  return user;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ==================== ROUTER ====================
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://localhost`);
  const p = urlObj.pathname;
  const method = req.method;

  if (method === 'OPTIONS') { sendJSON(res, 204, {}); return; }

  // ---- AUTH ----
  if (method === 'POST' && p === '/api/auth/register') {
    const buf = await readBody(req);
    const payload = JSON.parse(buf.toString());
    const { name, email, phone, password, role = 'customer', city, latitude, longitude } = payload;
    if (!name || !email || !password) return sendJSON(res, 400, { error: 'Name, email, and password are required.' });
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return sendJSON(res, 409, { error: 'Email already registered.' });
    const hash = hashPassword(password);
    const result = db.prepare('INSERT INTO users (name, email, phone, password_hash, role, city, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(name, email, phone || '', hash, role, city || '', latitude || 28.6139, longitude || 77.2090);
    const userId = Number(result.lastInsertRowid);
    if (role === 'provider') {
      db.prepare('INSERT INTO provider_profiles (user_id, business_name, bio, skills) VALUES (?, ?, ?, ?)').run(userId, name, '', JSON.stringify([]));
    }
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expires);
    db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)').run(1, `New ${role} signup`, `${name} joined as ${role}.`, 'info');
    return sendJSON(res, 201, { token, user: { id: userId, name, email, role } });
  }

  if (method === 'POST' && p === '/api/auth/login') {
    const buf = await readBody(req);
    const { email, password } = JSON.parse(buf.toString());
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || user.password_hash !== hashPassword(password)) return sendJSON(res, 401, { error: 'Invalid email or password.' });
    if (!user.is_active) return sendJSON(res, 403, { error: 'Account suspended. Contact support.' });
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expires);
    return sendJSON(res, 200, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city } });
  }

  if (method === 'POST' && p === '/api/auth/logout') {
    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '').trim();
    if (token) db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
    return sendJSON(res, 200, { success: true });
  }

  if (method === 'GET' && p === '/api/auth/me') {
    const user = requireAuth(req, res);
    if (!user) return;
    const safe = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city, avatar: user.avatar, address: user.address, latitude: user.latitude, longitude: user.longitude, is_verified: user.is_verified };
    if (user.role === 'provider') {
      const profile = db.prepare('SELECT * FROM provider_profiles WHERE user_id = ?').get(user.id);
      return sendJSON(res, 200, { ...safe, profile });
    }
    return sendJSON(res, 200, safe);
  }

  // ---- CATEGORIES ----
  if (method === 'GET' && p === '/api/categories') {
    const type = urlObj.searchParams.get('type');
    let cats;
    if (type) cats = db.prepare('SELECT * FROM categories WHERE type = ?').all(type);
    else cats = db.prepare('SELECT * FROM categories').all();
    return sendJSON(res, 200, cats);
  }

  // ---- PROVIDERS ----
  if (method === 'GET' && p === '/api/providers') {
    const skill = urlObj.searchParams.get('skill');
    const city = urlObj.searchParams.get('city');
    const lat = parseFloat(urlObj.searchParams.get('lat'));
    const lon = parseFloat(urlObj.searchParams.get('lon'));
    const radius = parseFloat(urlObj.searchParams.get('radius')) || 20;

    let providers = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.city, u.avatar, u.latitude, u.longitude, u.is_verified as user_verified,
             pp.business_name, pp.bio, pp.skills, pp.hourly_rate, pp.experience_years, pp.avg_rating, pp.total_reviews, pp.total_jobs, pp.is_available, pp.is_verified
      FROM users u JOIN provider_profiles pp ON u.id = pp.user_id
      WHERE u.role = 'provider' AND u.is_active = 1 AND pp.is_available = 1
    `).all();

    if (skill) providers = providers.filter(p => { try { return JSON.parse(p.skills || '[]').some(s => s.toLowerCase().includes(skill.toLowerCase())); } catch { return false; } });
    if (city) providers = providers.filter(p => p.city && p.city.toLowerCase().includes(city.toLowerCase()));
    if (!isNaN(lat) && !isNaN(lon)) {
      providers = providers.map(p => ({ ...p, distance_km: parseFloat(haversine(lat, lon, p.latitude, p.longitude).toFixed(2)) })).filter(p => p.distance_km <= radius).sort((a, b) => a.distance_km - b.distance_km);
    }

    return sendJSON(res, 200, providers);
  }

  if (method === 'GET' && p.startsWith('/api/providers/')) {
    const uid = parseInt(p.split('/')[3]);
    const provider = db.prepare(`SELECT u.id, u.name, u.email, u.phone, u.city, u.avatar, u.latitude, u.longitude, u.is_verified as user_verified, u.created_at, pp.* FROM users u JOIN provider_profiles pp ON u.id = pp.user_id WHERE u.id = ?`).get(uid);
    if (!provider) return sendJSON(res, 404, { error: 'Provider not found' });
    const reviews = db.prepare('SELECT r.*, u.name as customer_name FROM reviews r JOIN users u ON r.customer_id = u.id WHERE r.provider_id = ? ORDER BY r.id DESC LIMIT 10').all(uid);
    return sendJSON(res, 200, { ...provider, reviews });
  }

  // Provider profile update
  if (method === 'PATCH' && p === '/api/provider/profile') {
    const user = requireAuth(req, res, ['provider']);
    if (!user) return;
    const buf = await readBody(req);
    const payload = JSON.parse(buf.toString());
    const { business_name, bio, skills, service_radius_km, hourly_rate, experience_years, is_available } = payload;
    db.prepare(`UPDATE provider_profiles SET business_name=COALESCE(?,business_name), bio=COALESCE(?,bio), skills=COALESCE(?,skills), service_radius_km=COALESCE(?,service_radius_km), hourly_rate=COALESCE(?,hourly_rate), experience_years=COALESCE(?,experience_years), is_available=COALESCE(?,is_available) WHERE user_id=?`)
      .run(business_name || null, bio || null, skills ? JSON.stringify(skills) : null, service_radius_km || null, hourly_rate || null, experience_years || null, is_available !== undefined ? (is_available ? 1 : 0) : null, user.id);
    return sendJSON(res, 200, { success: true });
  }

  // ---- BOOKINGS ----
  if (method === 'GET' && p === '/api/bookings') {
    const user = requireAuth(req, res);
    if (!user) return;

    const lat = parseFloat(urlObj.searchParams.get('lat'));
    const lon = parseFloat(urlObj.searchParams.get('lon'));
    const radius = parseFloat(urlObj.searchParams.get('radius'));
    const status = urlObj.searchParams.get('status');
    const type = urlObj.searchParams.get('type');
    const search = urlObj.searchParams.get('search');

    let query = `SELECT b.*, c.name as category_name, c.icon as category_icon, u.name as customer_name, p.name as provider_name FROM bookings b LEFT JOIN categories c ON b.category_id = c.id LEFT JOIN users u ON b.customer_id = u.id LEFT JOIN users p ON b.provider_id = p.id WHERE 1=1`;
    const params = [];

    if (user.role === 'customer') { query += ' AND b.customer_id = ?'; params.push(user.id); }
    else if (user.role === 'provider') { query += ' AND b.provider_id = ?'; params.push(user.id); }

    if (status && status !== 'all') { query += ' AND b.status = ?'; params.push(status); }
    if (type && type !== 'all') { query += ' AND b.type = ?'; params.push(type); }
    if (search) { query += ' AND (b.title LIKE ? OR b.description LIKE ? OR b.address LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }

    query += ' ORDER BY b.id DESC';
    let bookings = db.prepare(query).all(...params);

    if (!isNaN(lat) && !isNaN(lon)) {
      bookings = bookings.map(b => ({ ...b, distance_km: parseFloat(haversine(lat, lon, b.latitude || 28.6139, b.longitude || 77.2090).toFixed(2)) }));
      if (!isNaN(radius) && radius > 0) bookings = bookings.filter(b => b.distance_km <= radius);
      bookings.sort((a, b) => a.distance_km - b.distance_km);
    }

    return sendJSON(res, 200, bookings);
  }

  // Public civic jobs feed
  if (method === 'GET' && p === '/api/jobs/public') {
    const lat = parseFloat(urlObj.searchParams.get('lat'));
    const lon = parseFloat(urlObj.searchParams.get('lon'));
    const radius = parseFloat(urlObj.searchParams.get('radius'));
    const type = urlObj.searchParams.get('type');
    const status = urlObj.searchParams.get('status');

    let query = `SELECT b.*, c.name as category_name, c.icon as category_icon, u.name as customer_name FROM bookings b LEFT JOIN categories c ON b.category_id = c.id LEFT JOIN users u ON b.customer_id = u.id WHERE 1=1`;
    const params = [];
    if (type && type !== 'all') { query += ' AND b.type = ?'; params.push(type); }
    if (status && status !== 'all') { query += ' AND b.status = ?'; params.push(status); }
    query += ' ORDER BY b.id DESC LIMIT 50';

    let jobs = db.prepare(query).all(...params);

    if (!isNaN(lat) && !isNaN(lon)) {
      jobs = jobs.map(j => ({ ...j, distance_km: parseFloat(haversine(lat, lon, j.latitude || 28.6139, j.longitude || 77.2090).toFixed(2)) }));
      if (!isNaN(radius) && radius > 0) jobs = jobs.filter(j => j.distance_km <= radius);
      jobs.sort((a, b) => a.distance_km - b.distance_km);
    }

    return sendJSON(res, 200, jobs);
  }

  if (method === 'GET' && p.startsWith('/api/bookings/')) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = parseInt(p.split('/')[3]);
    const booking = db.prepare(`SELECT b.*, c.name as category_name, c.icon as category_icon, u.name as customer_name, u.phone as customer_phone, p.name as provider_name FROM bookings b LEFT JOIN categories c ON b.category_id = c.id LEFT JOIN users u ON b.customer_id = u.id LEFT JOIN users p ON b.provider_id = p.id WHERE b.id = ?`).get(id);
    if (!booking) return sendJSON(res, 404, { error: 'Booking not found' });
    const quotes = db.prepare(`SELECT q.*, u.name as provider_name, pp.avg_rating, pp.total_reviews FROM quotes q JOIN users u ON q.provider_id = u.id JOIN provider_profiles pp ON q.provider_id = pp.user_id WHERE q.booking_id = ?`).all(id);
    const review = db.prepare('SELECT * FROM reviews WHERE booking_id = ?').get(id);
    return sendJSON(res, 200, { ...booking, quotes, review });
  }

  if (method === 'POST' && p === '/api/bookings') {
    const user = requireAuth(req, res, ['customer']);
    if (!user) return;

    const contentType = req.headers['content-type'] || '';
    const buf = await readBody(req);
    let title, description, type, category_id, address, city, latitude, longitude, scheduled_date, scheduled_time, budget_min, budget_max, priority, image_before = '';

    if (contentType.includes('multipart/form-data')) {
      const boundary = contentType.split('boundary=')[1];
      const parsed = parseMultipart(buf, boundary.trim());
      ({ title, description, type, address, city, scheduled_date, scheduled_time, priority } = parsed.fields);
      category_id = parseInt(parsed.fields.category_id);
      budget_min = parseFloat(parsed.fields.budget_min) || null;
      budget_max = parseFloat(parsed.fields.budget_max) || null;
      latitude = parseFloat(parsed.fields.latitude) || null;
      longitude = parseFloat(parsed.fields.longitude) || null;
      if (parsed.files.photo && parsed.files.photo.data.length > 0) image_before = saveUpload(parsed.files.photo, 'before');
    } else {
      const payload = JSON.parse(buf.toString());
      ({ title, description, type, category_id, address, city, latitude, longitude, scheduled_date, scheduled_time, budget_min, budget_max, priority, image_before } = payload);
    }

    if (!title || !description || !address) return sendJSON(res, 400, { error: 'Title, description, and address are required.' });

    const result = db.prepare(`INSERT INTO bookings (customer_id, category_id, title, description, type, address, city, latitude, longitude, scheduled_date, scheduled_time, budget_min, budget_max, priority, image_before) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(user.id, category_id || null, title, description, type || 'repair', address, city || user.city, latitude || user.latitude, longitude || user.longitude, scheduled_date || null, scheduled_time || null, budget_min || null, budget_max || null, priority || 'normal', image_before);
    const newId = Number(result.lastInsertRowid);

    // Notify nearby providers
    db.prepare(`INSERT INTO notifications (user_id, title, message, type) SELECT u.id, 'New Job Near You!', 'A new job "' || ? || '" was posted nearby. Submit your quote!', 'info' FROM users u JOIN provider_profiles pp ON u.id = pp.user_id WHERE u.role = 'provider' AND u.is_active = 1`).run(title);

    return sendJSON(res, 201, { success: true, id: newId });
  }

  if (method === 'PATCH' && p.startsWith('/api/bookings/')) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = parseInt(p.split('/')[3]);
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) return sendJSON(res, 404, { error: 'Booking not found' });

    const buf = await readBody(req);
    const payload = JSON.parse(buf.toString());

    if (user.role === 'customer' && booking.customer_id !== user.id) return sendJSON(res, 403, { error: 'Not authorized' });
    if (user.role === 'provider' && booking.provider_id !== user.id) return sendJSON(res, 403, { error: 'Not authorized' });

    const fields = [];
    const vals = [];
    for (const [k, v] of Object.entries(payload)) {
      if (['status', 'final_price', 'payment_status', 'admin_notes', 'image_after', 'priority', 'assigned_to', 'provider_id'].includes(k)) {
        fields.push(`${k} = ?`);
        vals.push(v);
      }
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(id);
    db.prepare(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`).run(...vals);

    // Notify customer on status change
    if (payload.status) {
      db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)').run(booking.customer_id, 'Booking Updated', `Your booking "${booking.title}" status changed to: ${payload.status}`, 'info');
    }

    return sendJSON(res, 200, { success: true });
  }

  // Upvote
  if (method === 'POST' && p.match(/^\/api\/bookings\/\d+\/upvote$/)) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = parseInt(p.split('/')[3]);
    try {
      db.prepare('INSERT INTO upvotes (booking_id, user_id) VALUES (?, ?)').run(id, user.id);
      db.prepare('UPDATE bookings SET upvotes = upvotes + 1 WHERE id = ?').run(id);
      const updated = db.prepare('SELECT upvotes FROM bookings WHERE id = ?').get(id);
      return sendJSON(res, 200, { success: true, upvotes: updated.upvotes });
    } catch (e) {
      db.prepare('DELETE FROM upvotes WHERE booking_id = ? AND user_id = ?').run(id, user.id);
      db.prepare('UPDATE bookings SET upvotes = MAX(0, upvotes - 1) WHERE id = ?').run(id);
      const updated = db.prepare('SELECT upvotes FROM bookings WHERE id = ?').get(id);
      return sendJSON(res, 200, { success: true, upvotes: updated.upvotes, removed: true });
    }
  }

  // ---- QUOTES ----
  if (method === 'POST' && p.match(/^\/api\/bookings\/\d+\/quotes$/)) {
    const user = requireAuth(req, res, ['provider']);
    if (!user) return;
    const booking_id = parseInt(p.split('/')[3]);
    const buf = await readBody(req);
    const { amount, message, eta_days } = JSON.parse(buf.toString());
    if (!amount) return sendJSON(res, 400, { error: 'Quote amount required' });
    const existing = db.prepare('SELECT id FROM quotes WHERE booking_id = ? AND provider_id = ?').get(booking_id, user.id);
    if (existing) return sendJSON(res, 409, { error: 'You have already submitted a quote for this booking.' });
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) return sendJSON(res, 404, { error: 'Booking not found' });
    db.prepare('INSERT INTO quotes (booking_id, provider_id, amount, message, eta_days) VALUES (?, ?, ?, ?, ?)').run(booking_id, user.id, amount, message || '', eta_days || 1);
    db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)').run(booking.customer_id, 'New Quote Received!', `${user.name} submitted a quote of ₹${amount} for "${booking.title}"`, 'success');
    return sendJSON(res, 201, { success: true });
  }

  if (method === 'PATCH' && p.match(/^\/api\/quotes\/\d+$/)) {
    const user = requireAuth(req, res, ['customer', 'admin']);
    if (!user) return;
    const id = parseInt(p.split('/')[3]);
    const buf = await readBody(req);
    const { status } = JSON.parse(buf.toString());
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    if (!quote) return sendJSON(res, 404, { error: 'Quote not found' });
    db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, id);
    if (status === 'accepted') {
      db.prepare('UPDATE bookings SET provider_id = ?, status = ?, final_price = ? WHERE id = ?').run(quote.provider_id, 'confirmed', quote.amount, quote.booking_id);
      db.prepare("UPDATE quotes SET status = 'rejected' WHERE booking_id = ? AND id != ?").run(quote.booking_id, id);
      db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)').run(quote.provider_id, '🎉 Quote Accepted!', `Your quote was accepted! You have a confirmed job.`, 'success');
    }
    return sendJSON(res, 200, { success: true });
  }

  // ---- REVIEWS ----
  if (method === 'POST' && p === '/api/reviews') {
    const user = requireAuth(req, res, ['customer']);
    if (!user) return;
    const buf = await readBody(req);
    const { booking_id, rating, comment } = JSON.parse(buf.toString());
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND customer_id = ? AND status = 'completed'").get(booking_id, user.id);
    if (!booking) return sendJSON(res, 400, { error: 'Can only review completed bookings.' });
    const existing = db.prepare('SELECT id FROM reviews WHERE booking_id = ?').get(booking_id);
    if (existing) return sendJSON(res, 409, { error: 'Already reviewed.' });
    db.prepare('INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?)').run(booking_id, user.id, booking.provider_id, rating, comment || '');
    // Update provider avg rating
    const stats = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE provider_id = ?').get(booking.provider_id);
    db.prepare('UPDATE provider_profiles SET avg_rating = ?, total_reviews = ? WHERE user_id = ?').run(parseFloat(stats.avg.toFixed(1)), stats.cnt, booking.provider_id);
    db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)').run(booking.provider_id, 'New Review!', `You received a ${rating}⭐ review!`, 'success');
    return sendJSON(res, 201, { success: true });
  }

  // ---- NOTIFICATIONS ----
  if (method === 'GET' && p === '/api/notifications') {
    const user = requireAuth(req, res);
    if (!user) return;
    const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20').all(user.id);
    return sendJSON(res, 200, notifs);
  }

  if (method === 'PATCH' && p === '/api/notifications/read-all') {
    const user = requireAuth(req, res);
    if (!user) return;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(user.id);
    return sendJSON(res, 200, { success: true });
  }

  // ---- ADMIN ----
  if (method === 'GET' && p === '/api/admin/stats') {
    const user = requireAuth(req, res, ['admin']);
    if (!user) return;
    const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role != 'admin'").get().c;
    const customers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get().c;
    const providers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'provider'").get().c;
    const totalBookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
    const pendingBookings = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'").get().c;
    const completedBookings = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'completed'").get().c;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(final_price),0) as s FROM bookings WHERE payment_status = 'paid'").get().s;
    const unverifiedProviders = db.prepare("SELECT COUNT(*) as c FROM provider_profiles WHERE is_verified = 0").get().c;
    return sendJSON(res, 200, { totalUsers, customers, providers, totalBookings, pendingBookings, completedBookings, totalRevenue, unverifiedProviders });
  }

  if (method === 'GET' && p === '/api/admin/users') {
    const user = requireAuth(req, res, ['admin']);
    if (!user) return;
    const role = urlObj.searchParams.get('role');
    let query = "SELECT u.*, pp.avg_rating, pp.total_jobs, pp.is_verified as provider_verified FROM users u LEFT JOIN provider_profiles pp ON u.id = pp.user_id WHERE u.role != 'admin'";
    const params = [];
    if (role) { query += ' AND u.role = ?'; params.push(role); }
    query += ' ORDER BY u.id DESC';
    return sendJSON(res, 200, db.prepare(query).all(...params));
  }

  if (method === 'PATCH' && p.match(/^\/api\/admin\/users\/\d+$/)) {
    const user = requireAuth(req, res, ['admin']);
    if (!user) return;
    const id = parseInt(p.split('/')[4]);
    const buf = await readBody(req);
    const payload = JSON.parse(buf.toString());
    if (payload.is_active !== undefined) db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(payload.is_active ? 1 : 0, id);
    if (payload.provider_verified !== undefined) db.prepare('UPDATE provider_profiles SET is_verified = ? WHERE user_id = ?').run(payload.provider_verified ? 1 : 0, id);
    return sendJSON(res, 200, { success: true });
  }

  if (method === 'GET' && p === '/api/admin/bookings') {
    const user = requireAuth(req, res, ['admin']);
    if (!user) return;
    const bookings = db.prepare(`SELECT b.*, c.name as category_name, u.name as customer_name, p.name as provider_name FROM bookings b LEFT JOIN categories c ON b.category_id = c.id LEFT JOIN users u ON b.customer_id = u.id LEFT JOIN users p ON b.provider_id = p.id ORDER BY b.id DESC`).all();
    return sendJSON(res, 200, bookings);
  }

  if (method === 'PATCH' && p.match(/^\/api\/admin\/bookings\/\d+$/)) {
    const user = requireAuth(req, res, ['admin']);
    if (!user) return;
    const id = parseInt(p.split('/')[4]);
    const buf = await readBody(req);
    const payload = JSON.parse(buf.toString());
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) return sendJSON(res, 404, { error: 'Not found' });
    db.prepare('UPDATE bookings SET status = COALESCE(?,status), priority = COALESCE(?,priority), admin_notes = COALESCE(?,admin_notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(payload.status || null, payload.priority || null, payload.admin_notes || null, id);
    if (payload.status) db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)').run(booking.customer_id, 'Case Updated', `Your case "${booking.title}" has been updated to: ${payload.status}`, 'info');
    return sendJSON(res, 200, { success: true });
  }

  // --- Static Files ---
  if (pathname_match(p)) {
    const fname = p === '/' ? 'index.html' : p.slice(1);
    const fpath = path.join(PUBLIC_DIR, fname);
    if (fs.existsSync(fpath) && fs.statSync(fpath).isFile()) {
      const ext = path.extname(fpath).toLowerCase();
      const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
      return sendFile(res, fpath, mime[ext] || 'text/plain');
    }
  }

  if (p.startsWith('/uploads/')) {
    const fname = path.basename(p);
    const fpath = path.join(UPLOADS_DIR, fname);
    const ext = path.extname(fname).toLowerCase();
    const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
    return sendFile(res, fpath, mime[ext] || 'application/octet-stream');
  }

  // SPA fallback
  return sendFile(res, path.join(PUBLIC_DIR, 'index.html'), 'text/html');
});

function pathname_match(p) {
  return p === '/' || p.endsWith('.html') || p.endsWith('.css') || p.endsWith('.js') || p.endsWith('.svg') || p.endsWith('.png') || p.endsWith('.ico');
}

server.listen(PORT, () => console.log(`🚀 FixNear server running at http://localhost:${PORT}`));
