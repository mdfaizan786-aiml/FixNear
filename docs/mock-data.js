// ==================== SEED / MOCK DATA FOR DEMO & STATIC HOSTING (GITHUB PAGES) ====================
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Plumbing', icon: '🔧', description: 'Leaks, pipe repairs, fittings, drainage', type: 'repair' },
  { id: 2, name: 'Electrical', icon: '⚡', description: 'Wiring, MCB, switches, installations', type: 'repair' },
  { id: 3, name: 'AC & Appliances', icon: '❄️', description: 'AC service, gas refill, fridge, washing machine', type: 'repair' },
  { id: 4, name: 'Carpentry', icon: '🪵', description: 'Furniture, doors, windows, wood work', type: 'repair' },
  { id: 5, name: 'Painting', icon: '🎨', description: 'Interior/exterior painting, waterproofing', type: 'repair' },
  { id: 6, name: 'Cleaning', icon: '🧹', description: 'Deep cleaning, sofa, bathroom, kitchen', type: 'repair' },
  { id: 7, name: 'Roads & Potholes', icon: '🛣️', description: 'Civic road damage reports', type: 'civic' },
  { id: 8, name: 'Streetlights', icon: '💡', description: 'Broken or dim public lighting', type: 'civic' },
  { id: 9, name: 'Sanitation', icon: '🗑️', description: 'Garbage overflow, drainage issues', type: 'civic' },
  { id: 10, name: 'Water Supply', icon: '💧', description: 'Water leaks, main pipe breaks', type: 'civic' }
];

const DEFAULT_PROVIDERS = [
  {
    id: 4,
    name: 'Ramesh Sharma',
    business_name: 'Ramesh Plumbing Co.',
    email: 'ramesh@fixnear.com',
    phone: '9123456789',
    city: 'Delhi',
    latitude: 28.6110,
    longitude: 77.2060,
    bio: 'Expert licensed plumber with 12+ years experience in bathroom installations, leaks, pipe bursts, and sanitary fittings.',
    skills: JSON.stringify(['Plumbing', 'Pipe Repair', 'Bathroom Fitting', 'Drainage']),
    hourly_rate: 350,
    experience_years: 12,
    avg_rating: 4.8,
    total_reviews: 127,
    total_jobs: 342,
    is_available: 1,
    is_verified: 1,
    role: 'provider'
  },
  {
    id: 5,
    name: 'Suresh Kumar',
    business_name: 'Suresh Electric Works',
    email: 'suresh@fixnear.com',
    phone: '9123456790',
    city: 'Delhi',
    latitude: 28.6080,
    longitude: 77.2100,
    bio: 'Certified master electrician handling domestic wiring, MCB replacements, short circuit repairs, and inverter setups.',
    skills: JSON.stringify(['Electrical', 'Wiring', 'Panel Repair', 'Appliance Installation']),
    hourly_rate: 400,
    experience_years: 8,
    avg_rating: 4.6,
    total_reviews: 89,
    total_jobs: 201,
    is_available: 1,
    is_verified: 1,
    role: 'provider'
  },
  {
    id: 6,
    name: 'Vikram Singh',
    business_name: 'CoolAir AC & Appliance Services',
    email: 'coolair@fixnear.com',
    phone: '9123456791',
    city: 'Delhi',
    latitude: 28.6050,
    longitude: 77.2150,
    bio: 'Specialized in split and window AC repair, deep jet pump cleaning, refrigerant gas recharge, and compressor diagnostics.',
    skills: JSON.stringify(['AC Repair', 'AC Installation', 'AC Gas Refill', 'Appliance Repair']),
    hourly_rate: 500,
    experience_years: 10,
    avg_rating: 4.9,
    total_reviews: 203,
    total_jobs: 487,
    is_available: 1,
    is_verified: 1,
    role: 'provider'
  },
  {
    id: 7,
    name: 'Mohd Arif',
    business_name: 'QuickFix Handyman & Carpentry',
    email: 'quickfix@fixnear.com',
    phone: '9123456792',
    city: 'Delhi',
    latitude: 28.6200,
    longitude: 77.2050,
    bio: 'Versatile craftsman for furniture repair, modular kitchen installations, door locks, wooden polish, and general home fixes.',
    skills: JSON.stringify(['Carpentry', 'Painting', 'Furniture Assembly', 'General Repair']),
    hourly_rate: 300,
    experience_years: 5,
    avg_rating: 4.4,
    total_reviews: 56,
    total_jobs: 134,
    is_available: 1,
    is_verified: 1,
    role: 'provider'
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: 1,
    customer_id: 2,
    customer_name: 'Priya Sharma',
    provider_id: 4,
    provider_name: 'Ramesh Plumbing Co.',
    category_id: 1,
    category_name: 'Plumbing',
    category_icon: '🔧',
    title: 'Bathroom main pipe burst – urgent repair needed',
    description: 'Main concealed supply pipe leaking through ceiling into master bathroom. Water shut off temporarily. Need immediate fix.',
    type: 'repair',
    address: 'Flat 12B, Sector 7, Central Enclave',
    city: 'Delhi',
    latitude: 28.6160,
    longitude: 77.2080,
    scheduled_date: '2026-11-16',
    scheduled_time: '10:00 AM',
    budget_min: 500,
    budget_max: 1500,
    status: 'confirmed',
    priority: 'urgent',
    upvotes: 8,
    admin_notes: 'Technician dispatched for Monday morning.',
    quotes: [
      { id: 101, booking_id: 1, provider_id: 4, provider_name: 'Ramesh Plumbing Co.', amount: 950, message: 'Can reach in 30 mins with heavy duty coupling and replacement valve.', eta_days: 1, status: 'accepted', avg_rating: 4.8, total_reviews: 127 }
    ]
  },
  {
    id: 2,
    customer_id: 3,
    customer_name: 'Rahul Verma',
    provider_id: 6,
    provider_name: 'CoolAir AC & Appliance Services',
    category_id: 3,
    category_name: 'AC & Appliances',
    category_icon: '❄️',
    title: 'Split AC not cooling – gas refill & filter service',
    description: '1.5 Ton Inverter AC blowing normal fan air. Requires pressure test, leak check, and R32 refrigerant top-up.',
    type: 'repair',
    address: 'Block C, Green Apartments, Main Road',
    city: 'Delhi',
    latitude: 28.6190,
    longitude: 77.2140,
    scheduled_date: '2026-11-17',
    scheduled_time: '02:00 PM',
    budget_min: 1000,
    budget_max: 2000,
    status: 'in_progress',
    priority: 'normal',
    upvotes: 3,
    admin_notes: '',
    quotes: [
      { id: 102, booking_id: 2, provider_id: 6, provider_name: 'CoolAir AC & Appliance Services', amount: 1400, message: 'Includes gas charge + chemical foam condenser wash.', eta_days: 1, status: 'accepted', avg_rating: 4.9, total_reviews: 203 }
    ]
  },
  {
    id: 3,
    customer_id: 2,
    customer_name: 'Priya Sharma',
    provider_id: null,
    provider_name: null,
    category_id: 7,
    category_name: 'Roads & Potholes',
    category_icon: '🛣️',
    title: 'Dangerous deep pothole on Main Chowk Roundabout',
    description: 'Huge crater near sector 9 roundabout causing regular two-wheeler accidents and severe bottleneck during peak hours.',
    type: 'civic',
    address: 'Main Chowk Roundabout, Sector 9',
    city: 'Delhi',
    latitude: 28.6110,
    longitude: 77.2050,
    status: 'pending',
    priority: 'high',
    upvotes: 27,
    admin_notes: 'Inspection team notified from Municipal Road Authority.',
    quotes: []
  },
  {
    id: 4,
    customer_id: 3,
    customer_name: 'Rahul Verma',
    provider_id: null,
    provider_name: null,
    category_id: 9,
    category_name: 'Sanitation',
    category_icon: '🗑️',
    title: 'Municipal waste bin overflowing for 4 consecutive days',
    description: 'Community garbage dumpster overflowing onto pedestrian walkway. Stray animals scattering litter across the street.',
    type: 'civic',
    address: 'Gate 2, Civic Welfare Colony',
    city: 'Delhi',
    latitude: 28.6080,
    longitude: 77.2100,
    status: 'completed',
    priority: 'normal',
    upvotes: 42,
    admin_notes: 'Sanitation compaction truck deployed. Area disinfected.',
    quotes: []
  },
  {
    id: 5,
    customer_id: 2,
    customer_name: 'Priya Sharma',
    provider_id: 5,
    provider_name: 'Suresh Electric Works',
    category_id: 2,
    category_name: 'Electrical',
    category_icon: '⚡',
    title: 'Main distribution board MCB tripping repeatedly',
    description: 'Heavy spark sound in main junction box. Sub-circuit trips every time geyser or AC turns on.',
    type: 'repair',
    address: 'Block A, Rose Heights, 3rd Floor',
    city: 'Delhi',
    latitude: 28.6050,
    longitude: 77.2150,
    scheduled_date: '2026-11-18',
    scheduled_time: '11:00 AM',
    budget_min: 800,
    budget_max: 2000,
    status: 'pending',
    priority: 'high',
    upvotes: 1,
    admin_notes: '',
    quotes: [
      { id: 103, booking_id: 5, provider_id: 5, provider_name: 'Suresh Electric Works', amount: 1100, message: 'Diagnosis + replacement 32A C-curve MCB included.', eta_days: 1, status: 'pending', avg_rating: 4.6, total_reviews: 89 },
      { id: 104, booking_id: 5, provider_id: 7, provider_name: 'QuickFix Handyman & Carpentry', amount: 850, message: 'Basic inspection and breaker replacement.', eta_days: 2, status: 'pending', avg_rating: 4.4, total_reviews: 56 }
    ]
  }
];

function getLocalStore(key, defaultVal) {
  try {
    const val = localStorage.getItem('fixnear_' + key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalStore(key, val) {
  try {
    localStorage.setItem('fixnear_' + key, JSON.stringify(val));
  } catch {}
}

// Distance helper
function haversineDist(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
