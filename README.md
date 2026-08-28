# Weather-Analytics 🌤️

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-XAMPP%20Ready-orange.svg)](https://www.apachefriends.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Jest Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://jestjs.io/)
[![Auth0](https://img.shields.io/badge/Auth0-Enabled-orange.svg)](https://auth0.com/)

> **Fidenz Full Stack Assignment** — A secure, modern weather analytics platform computing a custom human biometeorological **Comfort Index**, ranking cities worldwide, providing two-tier server-side caching with live telemetry, MySQL database persistence (`Weather-AnalyticsDB`), Auth0 authentication, and a responsive glassmorphic dashboard.

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Database Integration (MySQL / XAMPP)](#-database-integration-mysql--xampp)
- [Comfort Index Formula & Design Reasoning](#-comfort-index-formula--design-reasoning)
- [Server-Side Caching Architecture](#-server-side-caching-architecture)
- [Authentication & Access Control (Auth0)](#-authentication--access-control-auth0)
- [Setup & Installation Instructions](#-setup--installation-instructions)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Trade-offs & Known Limitations](#-trade-offs--known-limitations)
- [Screen Recording Guide (Part 3)](#-screen-recording-guide-part-3)
- [Reviewers Access List](#-reviewers-access-list)

---

## 🌟 Key Features

1. **Custom Human Comfort Index (0 – 100 Score)**:
   - Evaluates **Temperature**, **Relative Humidity**, **Wind Speed**, **Cloudiness**, and **Atmospheric Pressure**.
   - Backend-driven mathematical model ranking cities from **Most Comfortable** to **Least Comfortable**.

2. **MySQL Database Persistence (`Weather-AnalyticsDB`)**:
   - Dynamic city list loaded from the MySQL database (`cities` table).
   - Historical weather snapshots and Comfort Index logs stored into `weather_records` table.
   - Automatic database table creation and auto-seeding on server start.
   - Real-time DB connection telemetry and status monitoring (`/api/weather/db/status`).

3. **Two-Tier Server-Side Caching (5-Minute TTL)**:
   - **Tier 1 (Raw Cache)**: Caches individual OpenWeatherMap API responses for 5 minutes (`300s`) to prevent rate limits.
   - **Tier 2 (Processed Cache)**: Caches computed analytics and city rankings.
   - Real-time **Cache Telemetry Inspector** (`/api/weather/cache/stats`) with live HIT/MISS indicators and cache flush.

4. **Ultra-Modern Glassmorphic UI**:
   - Dynamic **Dark / Light mode** toggle with persistent local preferences.
   - **Interactive Radar Chart** breaking down biometeorological factors for each city.
   - **Comparative Climate Analytics Chart** (Comfort Score vs. Temperature vs. Humidity).
   - Instant Search, condition filter chips (Clear, Clouds, Rain, Mist, Thunderstorm), and multi-field sorting.
   - Responsive **Card View** and **Analytical Table View**.

5. **Security & Authentication (Auth0)**:
   - JWT validation middleware for Express API routes.
   - Support for Multi-Factor Authentication (MFA via email OTP).
   - Public signup restriction / Whitelist-based access.

---

## 🏗️ Architecture & Tech Stack

```
Weather-Analytics/
├── backend/
│   ├── src/
│   │   ├── config/              # MySQL Pool (db.js), Env settings, and cities.json fallback
│   │   ├── services/
│   │   │   ├── comfortIndexService.js  # Biometeorological scoring engine & ranking
│   │   │   ├── cacheService.js         # Two-tier cache with HIT/MISS tracking
│   │   │   └── weatherService.js       # MySQL loader, OpenWeatherMap fetcher & fallback
│   │   ├── controllers/
│   │   │   └── weatherController.js    # Express route handlers & DB/Cache telemetry
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # Auth0 JWT check & Dev mode bypass
│   │   │   └── errorHandler.js         # Global error handler
│   │   ├── routes/
│   │   │   └── weatherRoutes.js        # API endpoints (/all, /city/:id, /db/status, etc.)
│   │   ├── __tests__/                  # Jest unit test suites
│   │   └── server.js                   # Express server entry point & DB Auto-Init
│   ├── schema.sql                      # Standalone MySQL schema and seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                 # UI components (Navbar with DB badge, HeroStats, Cards, Modals, Charts)
│   │   ├── context/                    # ThemeContext, WeatherContext, AuthContext
│   │   ├── styles/                     # Glassmorphism design tokens & responsive CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

- **Frontend**: React 18, Vite, Chart.js, Lucide Icons, `@auth0/auth0-react`
- **Backend**: Node.js, Express 4, `mysql2`, `node-cache`, `axios`, `express-oauth2-jwt-bearer`, `jest`, `supertest`
- **Database**: MySQL (XAMPP) — `Weather-AnalyticsDB`

---

## 🗄️ Database Integration (MySQL / XAMPP)

The application automatically connects to MySQL and creates all necessary tables in `Weather-AnalyticsDB`.

### Tables Created:
1. **`cities`**:
   - `id` (INT AUTO_INCREMENT PRIMARY KEY)
   - `city_code` (VARCHAR UNIQUE) — City ID (e.g. `1248991` for Colombo)
   - `city_name` (VARCHAR)
   - `country` (VARCHAR)
   - `temp` (DECIMAL)
   - `status` (VARCHAR)
   - `is_active` (TINYINT)
   - `created_at`, `updated_at` (TIMESTAMP)

2. **`weather_records`**:
   - `id` (INT AUTO_INCREMENT PRIMARY KEY)
   - `city_code`, `city_name`, `country`
   - `temp_c`, `temp_f`, `feels_like_c`, `feels_like_f`, `temp_min_c`, `temp_max_c`
   - `weather_main`, `weather_description`, `weather_icon`
   - `humidity`, `pressure`, `wind_speed`, `wind_deg`, `cloudiness`, `visibility`
   - `comfort_score`, `comfort_category`, `comfort_breakdown` (JSON)
   - `source`, `recorded_at` (TIMESTAMP)

3. **`cache_telemetry`**:
   - `id` (INT AUTO_INCREMENT PRIMARY KEY)
   - `cache_key`, `action` (HIT/MISS), `tier`, `created_at`

### Auto-Migration & Seeding:
- When starting the backend server, `initDatabase()` ensures the database exists, creates missing tables, and seeds the default 12 cities if `cities` is empty.
- A standalone [`backend/schema.sql`](file:///j:/Weather-Analytics/backend/schema.sql) is also provided for phpMyAdmin manual import.

---

## 🧮 Comfort Index Formula & Design Reasoning

### Mathematical Model

The Comfort Index is calculated on a normalized continuous scale from **0 to 100** by evaluating deviations from optimal human thermal neutrality:

$$\text{Comfort Index Score} = \sum_{i=1}^{n} (S_i \times W_i)$$

Where $S_i \in [0, 100]$ is the sub-score for variable $i$, and $W_i$ is its assigned weight ($\sum W_i = 1.0$).

### Parameter Weights & Optimal Baselines

| Parameter | Weight ($W_i$) | Optimal Baseline | Rationale |
| :--- | :---: | :---: | :--- |
| **Temperature ($T$)** | **40%** | $22.0^\circ\text{C}$ ($71.6^\circ\text{F}$) | Primary driver of thermal regulation. Non-linear penalty applied as temperature diverges from $22^\circ\text{C}$. Extreme cold ($<0^\circ\text{C}$) or extreme heat ($>35^\circ\text{C}$) rapidly diminishes score. |
| **Humidity ($H$)** | **25%** | $45.0\%$ (Range: $35\% - 55\%$) | High humidity inhibits perspiration cooling; low humidity causes respiratory discomfort. |
| **Wind Speed ($W$)** | **15%** | $2.0 - 3.5\text{ m/s}$ | A light refreshing breeze aids comfort. Stagnant air ($<1.0\text{ m/s}$) or gale-force winds ($>10\text{ m/s}$) penalize the score. |
| **Cloudiness ($C$)** | **10%** | $20\% - 40\%$ | Partly cloudy conditions balance solar radiation with daylight illumination. |
| **Pressure ($P$)** | **10%** | $1013.25\text{ hPa}$ | Deviations from standard atmospheric sea-level pressure correlate with storm turbulence or oppressive high-pressure stagnant systems. |

### Comfort Categories

- **85 – 100**: *Ideal* (Emerald Green)
- **70 – 84**: *Pleasant* (Cyan)
- **50 – 69**: *Moderate* (Amber)
- **35 – 49**: *Uncomfortable* (Orange)
- **0 – 34**: *Severe / Extreme* (Rose Red)

---

## ⚡ Server-Side Caching Architecture

To satisfy the 5-minute cache requirement and optimize resource utilization:
1. **Tier 1 (Raw API Responses)**:
   - Key format: `raw:city:{cityCode}`
   - Standard TTL: **300 seconds** (5 minutes).
   - Minimizes third-party OpenWeatherMap API quotas and shields against upstream rate-limiting.
2. **Tier 2 (Processed Analytical Output)**:
   - Key format: `processed:all_ranked_cities`
   - Standard TTL: **300 seconds** (5 minutes).
   - Eliminates redundant multi-city matrix recalculations for concurrent users.
3. **Telemetry & Debug Endpoints**:
   - `GET /api/weather/cache/stats`: Returns hits, misses, hit ratio %, and active key TTLs.
   - `GET /api/weather/db/status`: Returns MySQL database status and table metrics.
   - `POST /api/weather/cache/clear`: Flushes in-memory store for instant cache invalidation testing.

---

## 🔐 Authentication & Access Control (Auth0)

- **Step 1 (Authentication Flow)**: Only authenticated users can access the comfort index analytics. Protected by `authMiddleware.js`.
- **Step 2 (MFA)**: Multi-Factor Authentication enabled with email OTP verification.
- **Step 3 (Restricted Whitelist)**: Public signups disabled; authorized accounts only.

### Pre-Configured Test Credentials for Reviewers:
- **Email**: `careers@fidenz.com`
- **Password**: `Pass#fidenz`

*(For offline local testing without an active Auth0 tenant, `AUTH_REQUIRED=false` is supported in `backend/.env`)*.

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+`
- XAMPP with MySQL running (Default: `localhost:3306`, user `root`, no password)
- (Optional) OpenWeatherMap API Key

### 1. Clone the Repository
```bash
git clone https://github.com/Msahan16/Weather-Analytics.git
cd Weather-Analytics
```

### 2. Backend Setup
```bash
cd backend
npm install

# Start MySQL in XAMPP Control Panel
# (The database 'Weather-AnalyticsDB' and tables are auto-created on startup)

npm run dev
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🧪 Testing & Quality Assurance

Run the automated Jest unit test suite:
```bash
cd backend
npm test
```
**Test Coverage Includes:**
- MySQL DB fallback resilience & entity normalization
- Comfort Index range $[0, 100]$ constraints
- Extreme weather edge cases ($-30^\circ\text{C}$ arctic vs. $+40^\circ\text{C}$ heatwave)
- Exact sorting and ranking validation
- Cache lifecycle, HIT/MISS transitions, and flushing

---

## 👥 Reviewers Access List

Repository access has been configured for the Fidenz evaluation team:
- `kanishka.d@fidenz.com`
- `srimal.w@fidenz.com`
- `narada.a@fidenz.com`
- `amindu.l@fidenz.com`
- `niroshanan.s@fidenz.com`
