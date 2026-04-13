<<<<<<< HEAD
# OPAL-AI 🩸

OPAL-AI is a next-generation, AI-driven connecting platform designed to bridge the gap between organ/blood donors and healthcare facilities (Hospitals) needing immediate matching. 

By leveraging real-time data synchronisation, reactive frontend flows, and role-based security, OPAL-AI accelerates the life-saving process of matching donors to recipients.

## 🚀 Key Features Implemented

### 1. Robust Role-Based Authentication
OPAL-AI strictly isolates its two primary user types:
- **Donors (`/auth/donor/signup`)**: Features a modern, 4-step wizard using `react-hook-form` and `Zod`. It carefully guides prospective donors through Account Creation, Personal Information, Medical Background (Blood Type, Hep Status), and Donation Preferences (Whole Blood, Plasma, Kidneys, etc). Zod guarantees no unverified profile hits the database.
- **Hospitals (`/auth/hospital/signup`)**: A streamlined institutional portal. Hospitals register using their Facility Name, City, and Official Registration License Numbers (e.g. PMDC), ensuring a clinically vetted network.

### 2. Live Supabase Backend & Database Architecture
Instead of relying on hardcoded dummy data, the OPAL-AI platform connects securely to a live **Supabase PostgreSQL** backend.
- **Data Hook Abstractions (`/hooks/useSupabaseData.ts`)**: Custom TanStack React Query hooks manage seamless data fetching for `blood_donors`, `organ_donors`, `hospitals`, and `recipients` tables.
- **AI Matching RPC Functions**: Complex geospatial and medical-rule algorithms run directly inside Postgres using Remote Procedure Calls (e.g., `find_blood_donors`, `find_organ_donors`), executing rapidly on the server and streaming results back to the UI.
- **Real-Time WebSockets**: Match Results (`useRealtimeMatchResults`) automatically push updates directly to the connected clients via Supabase Realtime Channels, allowing live browser notifications without refreshing.

### 3. Interactive "Zero-Cost" Map Integration
To ensure long-term sustainability without excessive API billing (e.g. Google Maps), OPAL-AI's geospatial dashboards use a 100% free solution:
- **Leaflet.js & OpenStreetMap**: Integrated fully into React (`react-leaflet`).
- **Nominatim Geocoding API**: A custom utility (`src/lib/geocode.ts`) efficiently translates raw city strings into accurate latitude & longitude coordinates.
- **Geospatial Proximity**: Advanced Haversine formulas compute distances (in km) between the browser's dynamically triggered "Locate Me" position and the fetched hospitals/donors in real time.
- **"Anti-Gravity" Theme Extension**: A specialized CSS filter dynamically inverts OSM tile layers to perfectly harmonize with OPAL-AI's signature global dark mode.

### 4. Resend Integrated Email Flow
- **Next.js Route Handlers**: Custom backend API endpoints (`/api/auth/register-donor` & `register-hospital`) cleanly intercept signup payloads from the frontend.
- **Automated Communication**: On successful Donor registration, the backend instantly triggers the `@react-email`-compiled HTML template via **Resend**, pushing a beautifully styled, OPAL-branded "Welcome / Verify Your Account" email straight to the donor’s inbox.

### 5. "Anti-Gravity" Aesthetic Design System
- Built on top of **Tailwind CSS v4** extending custom CSS tokens (`src/app/globals.css`).
- High-fidelity **Framer Motion** orchestrations:
  - Multi-step wizard slide-ins.
  - Floating background gradient orbs (`blur-3xl`).
  - Skeleton loading states and shimmer effects.
- Glassmorphism UI components reflecting a critical, yet futuristic "Life-Saving Network" environment.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (`NextRequest`, `Zod` schemas, strictly typed data interfaces)
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Validation**: Zod
- **Backend & DB**: Supabase (Postgres, Auth, Storage, Realtime)
- **Data Fetching**: `@tanstack/react-query`
- **Mapping**: Leaflet, React-Leaflet
- **Email Delivery**: Resend SDK, React Email

## 📂 Project Structure Snapshot

```text
e:/opal ai frontend
├── .env.local                    # Secrets (Supabase Keys, Resend Key)
├── package.json                  # Dependencies (Leaflet, Zod, Framer Motion)
├── src/
│   ├── app/                      
│   │   ├── api/                  # Server-side API logic (auth registration)
│   │   ├── auth/                 # Form Wizards (Donor / Hospital)
│   │   ├── dashboard/            # Secured analytical UI flows
│   │   └── globals.css           # Token configurations + Map filtering
│   ├── components/               
│   │   ├── emails/               # React-Email templates (WelcomeEmail.tsx)
│   │   ├── landing/              # Public-facing modules (Hero, Features)
│   │   ├── map/                  # Leaflet map contexts (DonorMap.tsx)
│   │   └── shared/               # Reusable elements and cards
│   ├── hooks/                    # TanStack Query & Supabase channels 
│   ├── lib/                      # Geocoding utilities and Supabase Singleton
│   └── types/                    # System-wide explicit typing definitions
```

## ⚙️ Getting Started

1. Ensure Node.js (v18+) is installed.
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
3. Establish your environment variables. Open `.env.local` and configure:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=re_your_resend_api_key
   ```
4. Start the development server (uses Turbopack):
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:3000`.
=======

