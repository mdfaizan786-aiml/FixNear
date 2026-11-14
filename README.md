# FixNear 📍
> **"Find trusted services, Book without hassle"**

**FixNear** is a hyperlocal platform connecting local citizens, verified service professionals, and municipal teams. It supports both home repair tasks (plumbing, electrical, AC, carpentry, etc.) and neighborhood civic issues (potholes, streetlights, garbage dumps).

---

## 🌟 Core Features by Role

### 1. 👤 Customer Features
- **Browse & Search Services**: Discover nearby repair professionals with skill tags, ratings, reviews, and hourly rates.
- **Interactive Map & Near-Me Filtering**: Leaflet OpenStreetMap view with GPS radius filtering (2 km, 5 km, 10 km, 25 km).
- **Post a Request**: Submit repair requests with description, category, preferred date/time slot, budget estimate, and photo upload.
- **Compare & Accept Quotes**: View competitive bids from nearby service providers and accept or reject with a single click.
- **Track Status & Reviews**: Track workflow status in real time (`Pending` ➔ `Confirmed` ➔ `In Progress` ➔ `Completed`), mark satisfaction, and leave 1–5 star ratings and reviews.
- **Civic Grievance Reporting**: Report neighborhood issues (potholes, streetlights, drainage) with community upvotes ("I have this issue too").

---

### 2. 🛠️ Service Provider Features
- **Provider Registration & Profile Management**: Add business name, bio, skills, hourly rate, years of experience, and service radius.
- **Availability Toggle**: Mark yourself online/available to accept new local job leads.
- **Available Jobs Feed**: Discover pending repair requests near your service radius.
- **Quote / Bid Submission**: Send formal price quotes (amount in ₹, arrival message, and ETA in days) directly to customers.
- **Job Workflow Management**: Update job state from confirmed to `In Progress` to `Completed`.
- **Earnings & Reviews**: Overview of completed jobs, total revenue earned, and customer feedback.

---

### 3. 🛡️ Admin & Operations Features
- **System Overview & Analytics**: Live dashboard showing total users, customers, verified providers, active bookings, pending cases, and revenue.
- **Booking & Case Triage**: Manage all customer bookings and civic issues, change priority (`Low`, `Normal`, `High`, `Urgent`), update status, and attach official resolution notes.
- **Provider Verification & Trust Shield**: Inspect provider applications and grant the verified badge (✓).
- **User Management**: Activate or suspend accounts in one click to maintain platform safety.

---

## 🔑 Demo Accounts

Use these pre-configured accounts to test each role right away:

| Role | Email | Password | Features |
|---|---|---|---|
| **Customer** | `priya@example.com` | `pass123` | Post requests, review quotes, track bookings |
| **Service Provider** | `ramesh@fixnear.com` | `pass123` | Submit quotes, manage jobs, view earnings |
| **Admin / Ops** | `admin@fixnear.com` | `admin123` | Platform analytics, user management, provider verification |

---

## 🚀 Running Locally

The server is already running and accessible at:
👉 **[http://localhost:3000](http://localhost:3000)**

To run or restart the server manually:

```bash
# Using agy-node or node
agy-node server.js
```
