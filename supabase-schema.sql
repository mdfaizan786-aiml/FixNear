-- ==============================================================================
-- FixNear - Supabase Database Schema & Seed Data
-- Hyperlocal Service Booking & Civic Issue Resolution Platform
-- ==============================================================================

-- 1. Enable UUID Extension (standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'repair' CHECK (type IN ('repair', 'civic')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
    avatar TEXT,
    address TEXT,
    city TEXT DEFAULT 'Delhi NCR',
    latitude DOUBLE PRECISION DEFAULT 28.6139,
    longitude DOUBLE PRECISION DEFAULT 77.2090,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROVIDER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.provider_profiles (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    trade TEXT NOT NULL,
    badge TEXT,
    bio TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    service_radius_km DOUBLE PRECISION DEFAULT 15,
    hourly_rate DOUBLE PRECISION DEFAULT 350,
    rate_unit TEXT DEFAULT 'hr',
    callout_fee DOUBLE PRECISION DEFAULT 150,
    experience_years INTEGER DEFAULT 5,
    portfolio_images JSONB DEFAULT '[]'::jsonb,
    is_available BOOLEAN DEFAULT TRUE,
    availability_status TEXT DEFAULT 'Available Today',
    total_jobs INTEGER DEFAULT 0,
    avg_rating DOUBLE PRECISION DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT TRUE,
    warranty TEXT DEFAULT '30-Day Work Guarantee',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKINGS / SERVICE REQUESTS & CIVIC ISSUES TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    provider_id BIGINT REFERENCES public.provider_profiles(id) ON DELETE SET NULL,
    provider_name TEXT,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT,
    category_icon TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'repair' CHECK (type IN ('repair', 'civic')),
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Delhi NCR',
    latitude DOUBLE PRECISION DEFAULT 28.6139,
    longitude DOUBLE PRECISION DEFAULT 77.2090,
    scheduled_date TEXT,
    scheduled_time TEXT,
    budget_min DOUBLE PRECISION,
    budget_max DOUBLE PRECISION,
    image_before TEXT,
    image_after TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    final_price DOUBLE PRECISION,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
    upvotes INTEGER DEFAULT 0,
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUOTES TABLE
CREATE TABLE IF NOT EXISTS public.quotes (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES public.bookings(id) ON DELETE CASCADE,
    provider_id BIGINT REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    provider_name TEXT,
    amount DOUBLE PRECISION NOT NULL,
    message TEXT,
    eta_days INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    avg_rating DOUBLE PRECISION DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    provider_id BIGINT REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CIVIC UPVOTES TABLE
CREATE TABLE IF NOT EXISTS public.upvotes (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES public.bookings(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id, profile_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

-- Allow public read access on catalog & verified listings
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public provider profiles are viewable by everyone" ON public.provider_profiles FOR SELECT USING (true);
CREATE POLICY "Public bookings are viewable by everyone" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public quotes are viewable by everyone" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public upvotes are viewable by everyone" ON public.upvotes FOR SELECT USING (true);

-- Allow inserting and updating for public / anon (for seamless demo & web app operations)
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Anyone can create quotes" ON public.quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quotes" ON public.quotes FOR UPDATE USING (true);
CREATE POLICY "Anyone can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Anyone can upvote" ON public.upvotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove upvote" ON public.upvotes FOR DELETE USING (true);

-- ==============================================================================
-- SEED DATA (Categories, Verified Workers with Rates & Availability)
-- ==============================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, icon, description, type) VALUES
(1, 'Plumbing', '🔧', 'Leaks, pipe repairs, fittings, drainage', 'repair'),
(2, 'Electrical', '⚡', 'Wiring, MCB, switches, installations', 'repair'),
(3, 'AC & Appliances', '❄️', 'AC service, gas refill, fridge, washing machine', 'repair'),
(4, 'Carpentry', '🪵', 'Furniture, doors, windows, wood work', 'repair'),
(5, 'Painting', '🎨', 'Interior/exterior painting, waterproofing', 'repair'),
(6, 'Cleaning', '🧹', 'Deep cleaning, sofa, bathroom, kitchen', 'repair'),
(7, 'Roads & Potholes', '🛣️', 'Civic road damage reports', 'civic'),
(8, 'Streetlights', '💡', 'Broken or dim public lighting', 'civic'),
(9, 'Sanitation', '🗑️', 'Garbage overflow, drainage issues', 'civic'),
(10, 'Water Supply', '💧', 'Water leaks, main pipe breaks', 'civic')
ON CONFLICT (id) DO NOTHING;

-- Seed Provider Profiles (Fixed UUIDs for consistent relationship)
DO $$
DECLARE
    ramesh_id UUID := '11111111-1111-1111-1111-111111111111';
    suresh_id UUID := '22222222-2222-2222-2222-222222222222';
    vikram_id UUID := '33333333-3333-3333-3333-333333333333';
    arif_id UUID   := '44444444-4444-4444-4444-444444444444';
    sunil_id UUID  := '55555555-5555-5555-5555-555555555555';
    anil_id UUID   := '66666666-6666-6666-6666-666666666666';
BEGIN
    -- Insert Base User Profiles
    INSERT INTO public.profiles (id, name, email, phone, role, city, latitude, longitude, is_verified) VALUES
    (ramesh_id, 'Ramesh Sharma', 'ramesh@fixnear.com', '+91 98711 23456', 'provider', 'Delhi NCR', 28.6110, 77.2060, true),
    (suresh_id, 'Suresh Kumar', 'suresh@fixnear.com', '+91 98102 34567', 'provider', 'Delhi NCR', 28.6080, 77.2100, true),
    (vikram_id, 'Vikram Singh', 'coolair@fixnear.com', '+91 98113 45678', 'provider', 'Delhi NCR', 28.6050, 77.2150, true),
    (arif_id,   'Mohd Arif', 'quickfix@fixnear.com', '+91 98224 56789', 'provider', 'Delhi NCR', 28.6200, 77.2050, true),
    (sunil_id,  'Sunil Yadav', 'sunil@fixnear.com', '+91 98335 67890', 'provider', 'Delhi NCR', 28.6140, 77.2120, true),
    (anil_id,   'Anil Painter', 'anil@fixnear.com', '+91 98446 78901', 'provider', 'Delhi NCR', 28.6180, 77.2080, true)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Detailed Provider Profiles
    INSERT INTO public.provider_profiles 
    (id, profile_id, business_name, trade, badge, bio, skills, hourly_rate, rate_unit, callout_fee, experience_years, avg_rating, total_reviews, total_jobs, is_available, availability_status, is_verified, warranty) VALUES
    (1, ramesh_id, 'Ramesh Plumbing & Sanitary Works', 'Licensed Master Plumber', 'Top Rated Plumber', '12+ years experience. Specialist in rapid pipe leak fixes, bathroom fittings, motor installation, geyser line repair, and sewage blockage clearance.', '["Plumbing", "Pipe Repair", "Bathroom Fitting", "Drainage", "Water Motor", "Geyser Piping"]'::jsonb, 350, 'hr', 150, 12, 4.8, 142, 380, true, 'Available Today (Arrives in 25-35 min)', true, '30-Day Service Guarantee'),
    (2, suresh_id, 'Suresh Quick Electrical Works', 'Government Certified Electrician', 'Quick Response Specialist', '8+ years expert in house wiring, tripping MCB replacement, chandelier & fan fitting, emergency short circuit diagnosis, and inverter maintenance.', '["Electrical", "Wiring", "Panel Repair", "Appliance Installation", "Inverter Setup", "LED Lighting"]'::jsonb, 400, 'hr', 199, 8, 4.7, 98, 215, true, 'Available Now (Ready to visit)', true, 'Safety Certified & Tested'),
    (3, vikram_id, 'CoolAir AC & Refrigeration Care', 'HVAC & Appliance Specialist', 'Super Pro Technician', '10+ years background servicing all major AC brands (Daikin, Voltas, LG, Samsung). Jet pump cleaning, leak detection, and gas recharge with pressure check.', '["AC Repair", "AC Installation", "AC Gas Refill", "Jet Foam Cleaning", "Refrigerator Repair"]'::jsonb, 499, 'service', 199, 10, 4.9, 210, 512, true, 'Available Today (Booking slots open)', true, '90-Day Compressor & Gas Warranty'),
    (4, arif_id,   'QuickFix Handyman & Carpentry', 'Master Carpenter & Woodcraft', 'Multi-Skilled Craftsman', 'Custom woodwork repair, modular kitchen hinge and drawer alignments, door lock & latch fixes, furniture assembly, and waterproofing.', '["Carpentry", "Door Locks", "Furniture Assembly", "Kitchen Modular Fittings", "Wood Polish"]'::jsonb, 300, 'hr', 150, 6, 4.5, 62, 148, true, 'Available Today', true, 'Quality Hardware Guaranteed'),
    (5, sunil_id,  'SparkleClean Deep Cleaning Crew', 'Home Hygiene & Sanitation Pro', 'Eco-Friendly Equipment', 'Deep scrubbing, bathroom stain removal, kitchen chimney degreasing, sofa shampooing, and post-renovation cleanup using hospital-grade disinfectants.', '["Deep Cleaning", "Bathroom Scrubbing", "Kitchen Degreasing", "Sofa Shampoo", "Floor Buffing"]'::jsonb, 399, 'room', 99, 7, 4.8, 115, 290, true, 'Available Tomorrow Morning', true, '100% Spotless Assurance'),
    (6, anil_id,   'ProCoat Wall Painting & Waterproofing', 'Professional Wall Finisher', 'Asian Paints Certified', 'Dampness treatment, wall putty finish, interior aesthetic colors, exterior weather-coat, texture design, and drywall crack patching.', '["Painting", "Waterproofing", "Wall Putty", "Texture Paint", "Crack Filling"]'::jsonb, 450, 'hr', 150, 11, 4.7, 84, 195, true, 'Available for Site Visits Today', true, '1-Year Waterproofing Warranty')
    ON CONFLICT (id) DO NOTHING;

    -- Insert Seed Bookings
    INSERT INTO public.bookings
    (id, customer_name, provider_id, provider_name, category_id, category_name, category_icon, title, description, type, address, city, latitude, longitude, scheduled_date, scheduled_time, budget_min, budget_max, status, priority, upvotes, admin_notes) VALUES
    (1, 'Priya Sharma', 1, 'Ramesh Plumbing & Sanitary Works', 1, 'Plumbing', '🔧', 'Bathroom main pipe burst – urgent repair needed', 'Main concealed supply pipe leaking through ceiling into master bathroom. Water shut off temporarily. Need immediate fix.', 'repair', 'Flat 12B, Sector 7, Central Enclave', 'Delhi NCR', 28.6160, 77.2080, '2026-11-16', '10:00 AM', 500, 1500, 'confirmed', 'urgent', 8, 'Technician dispatched for Monday morning.'),
    (2, 'Rahul Verma', 3, 'CoolAir AC & Refrigeration Care', 3, 'AC & Appliances', '❄️', 'Split AC not cooling – gas refill & filter service', '1.5 Ton Inverter AC blowing normal fan air. Requires pressure test, leak check, and R32 refrigerant top-up.', 'repair', 'Block C, Green Apartments, Main Road', 'Delhi NCR', 28.6190, 77.2140, '2026-11-17', '02:00 PM', 1000, 2000, 'in_progress', 'normal', 3, ''),
    (3, 'Priya Sharma', NULL, NULL, 7, 'Roads & Potholes', '🛣️', 'Dangerous deep pothole on Main Chowk Roundabout', 'Huge crater near sector 9 roundabout causing regular two-wheeler accidents and severe bottleneck during peak hours.', 'civic', 'Main Chowk Roundabout, Sector 9', 'Delhi NCR', 28.6110, 77.2050, NULL, NULL, NULL, NULL, 'pending', 'high', 27, 'Inspection team notified from Municipal Road Authority.'),
    (4, 'Rahul Verma', NULL, NULL, 9, 'Sanitation', '🗑️', 'Municipal waste bin overflowing for 4 consecutive days', 'Community garbage dumpster overflowing onto pedestrian walkway. Stray animals scattering litter across the street.', 'civic', 'Gate 2, Civic Welfare Colony', 'Delhi NCR', 28.6080, 77.2100, NULL, NULL, NULL, NULL, 'completed', 'normal', 42, 'Sanitation compaction truck deployed. Area disinfected.'),
    (5, 'Priya Sharma', 2, 'Suresh Quick Electrical Works', 2, 'Electrical', '⚡', 'Main distribution board MCB tripping repeatedly', 'Heavy spark sound in main junction box. Sub-circuit trips every time geyser or AC turns on.', 'repair', 'Block A, Rose Heights, 3rd Floor', 'Delhi NCR', 28.6050, 77.2150, '2026-11-18', '11:00 AM', 800, 2000, 'pending', 'high', 1, '')
    ON CONFLICT (id) DO NOTHING;

    -- Reset sequences
    PERFORM setval('public.categories_id_seq', (SELECT MAX(id) FROM public.categories));
    PERFORM setval('public.provider_profiles_id_seq', (SELECT MAX(id) FROM public.provider_profiles));
    PERFORM setval('public.bookings_id_seq', (SELECT MAX(id) FROM public.bookings));
END $$;
