# ⚡ FixNear – Supabase Cloud Integration Guide

FixNear is fully integrated with **Supabase** for real-time cloud database storage, user profiles, worker listings, booking requests, and civic issue tracking.

---

## 🚀 Quick Setup (Under 3 Minutes)

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **Sign In** (or Sign Up with GitHub).
2. Click **New Project**.
3. Set:
   - **Name**: `FixNear`
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to your users (e.g., `South Asia (Mumbai)` or `Southeast Asia (Singapore)`).
4. Click **Create new project** and wait ~1 minute for provisioning.

---

### Step 2: Run the Database Schema
1. In your Supabase project dashboard, click on **SQL Editor** in the left sidebar (the `>_` icon).
2. Click **New query**.
3. Open the file [`supabase-schema.sql`](./supabase-schema.sql) in this repository.
4. Copy all contents and paste them into the Supabase SQL Editor.
5. Click **RUN** (or press `Ctrl + Enter`).
6. You will see `Success. No rows returned` — all 8 tables, Row Level Security (RLS) policies, and verified providers with rates and availability are now live!

---

### Step 3: Get Your Project URL & Anon Public Key
1. In Supabase, go to **Project Settings** (gear icon at the bottom-left).
2. Click **API** in the sidebar.
3. You will see two values:
   - **Project URL** (e.g., `https://abcdefghijklm.supabase.co`)
   - **Project API Keys** → `anon` `public` (e.g., `eyJhbGciOi...`)
4. Copy both values.

---

### Step 4: Connect to FixNear (Two Easy Options)

#### Option A: Direct from the Live Website (Zero Deploy Required)
1. Open your live site:
   - **GitHub Pages**: [https://mdfaizan786-aiml.github.io/FixNear/](https://mdfaizan786-aiml.github.io/FixNear/)
   - **Vercel**: [https://fixnear.vercel.app/](https://fixnear.vercel.app/)
2. In the top navigation bar, click the **⚡ Supabase** button.
3. Paste your **Project URL** and **Anon Public Key**.
4. Click **Test Connection** (you should see `✅ Connected to Supabase PostgreSQL successfully!`).
5. Click **Save & Connect**.
6. The badge will instantly change to **⚡ Supabase Live** with an animated green pulse!

#### Option B: In Code (`supabase-config.js`)
If you want the connection to be permanent for all visitors:
1. Open [`docs/supabase-config.js`](./docs/supabase-config.js) (and [`public/supabase-config.js`](./public/supabase-config.js)).
2. Fill in:
   ```javascript
   window.FIXNEAR_SUPABASE_CONFIG = {
     url: "https://your-project.supabase.co",
     anonKey: "eyJhbGciOi..."
   };
   ```
3. Commit and push to GitHub. Both GitHub Pages and Vercel will update automatically!

---

## 🗄️ Database Architecture in Supabase

| Table | Purpose |
|---|---|
| `categories` | Service categories (repair + civic) with icons |
| `profiles` | User profiles with role (`customer`, `provider`, `admin`) and location |
| `provider_profiles` | Verified workers, trade, skills, hourly rates, callout fees, live availability status, ratings |
| `bookings` | Customer service bookings & public civic issues |
| `quotes` | Quotes submitted by workers with pricing and ETA |
| `reviews` | Customer ratings (1-5 stars) and feedback |
| `notifications` | In-app alerts for job status and new quotes |
| `upvotes` | Community upvotes on public civic grievances |

---

## 🛡️ Security & Row Level Security (RLS)
- Public read access is granted for active providers, categories, reviews, and civic requests.
- Customer booking creation and worker quotes operate safely with standard Supabase Anon API keys.
