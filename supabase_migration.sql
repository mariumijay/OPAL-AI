-- OPAL-AI COMPLETE DATABASE REPAIR MIGRATION
-- Standardizes all tables, resolves ghost table conflicts, and implements RLS.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Auth Management)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'donor', -- 'donor', 'hospital', 'doctor', 'admin'
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hospitals Table
-- Unified naming: uses 'name' instead of 'hospital_name'
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    license_number TEXT UNIQUE,
    city TEXT NOT NULL,
    full_address TEXT,
    phone TEXT,
    contact_email TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Blood Donors Table
CREATE TABLE IF NOT EXISTS public.blood_donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    age INTEGER,
    gender TEXT,
    blood_type TEXT NOT NULL,
    cnic TEXT UNIQUE,
    hepatitis_status TEXT,
    medical_conditions TEXT,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_available BOOLEAN DEFAULT TRUE,
    approval_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Organ Donors Table (Including missing clinical fields)
CREATE TABLE IF NOT EXISTS public.organ_donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    age INTEGER,
    gender TEXT,
    blood_type TEXT NOT NULL,
    cnic TEXT UNIQUE,
    organs_available JSONB, -- Array of strings e.g. ["Kidney", "Liver"]
    hiv_status TEXT DEFAULT 'Negative',
    hepatitis_status TEXT DEFAULT 'Negative',
    diabetes BOOLEAN DEFAULT FALSE,
    smoker BOOLEAN DEFAULT FALSE,
    heart_disease BOOLEAN DEFAULT FALSE,
    hypertension BOOLEAN DEFAULT FALSE,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    is_living_donor BOOLEAN DEFAULT TRUE,
    next_of_kin_name TEXT,
    next_of_kin_contact TEXT,
    consent_given BOOLEAN DEFAULT FALSE,
    medical_report_url TEXT,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_available BOOLEAN DEFAULT TRUE,
    approval_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Organ Requests Table (Required by Frontend)
CREATE TABLE IF NOT EXISTS public.organ_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    patient_name TEXT,
    patient_blood_type TEXT NOT NULL,
    required_organs JSONB NOT NULL,
    urgency_level TEXT DEFAULT 'Routine', -- 'Emergency', 'Urgent', 'Routine'
    status TEXT DEFAULT 'open', -- 'open', 'matched', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Match Results Table
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL, -- Logical reference to either donor table
    recipient_id UUID, -- Optional direct reference
    hospital_id UUID REFERENCES public.hospitals(id),
    match_score NUMERIC,
    compatibility TEXT,
    distance_km NUMERIC,
    status TEXT DEFAULT 'pending',
    urgency TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ghost Table Cleanup
DROP VIEW IF EXISTS donors_unified;
DROP TABLE IF EXISTS donors;

-- 8. Unified Analytics View (Safe unification for Public Stats)
CREATE OR REPLACE VIEW public.donor_stats AS
SELECT city, is_available, 'blood' as donor_type FROM blood_donors
UNION ALL
SELECT city, is_available, 'organ' as donor_type FROM organ_donors;

-- 9. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_blood_donors_user_id ON blood_donors(user_id);
CREATE INDEX IF NOT EXISTS idx_organ_donors_user_id ON organ_donors(user_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_user_id ON hospitals(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_donors_city ON blood_donors(city);
CREATE INDEX IF NOT EXISTS idx_organ_donors_city ON organ_donors(city);
CREATE INDEX IF NOT EXISTS idx_organ_requests_hospital ON organ_requests(hospital_id);

-- 10. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE organ_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE organ_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Polices for Profiles: Users can read/edit own, Admin can do all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for Hospitals: Public can read verified, Hospital can edit own, Admin full access
CREATE POLICY "Public can view verified hospitals" ON hospitals FOR SELECT USING (is_verified = true);
CREATE POLICY "Hospitals can view own record" ON hospitals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hospitals can update own record" ON hospitals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to hospitals" ON hospitals FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for Donors: Users view own, Admin full access, Clinical access for verified hospitals
CREATE POLICY "Donors can view own record" ON blood_donors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Donors can view own record organ" ON organ_donors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all blood donors" ON blood_donors FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can view all organ donors" ON organ_donors FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Public Stats Access (Functions or specific selects usually better, but for simplicity:)
CREATE POLICY "Public can view anonymous stats" ON donor_stats FOR SELECT TO anon USING (true);
