# Weather-Analytics 🌤️

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Jest Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://jestjs.io/)
[![Auth0](https://img.shields.io/badge/Auth0-Enabled-orange.svg)](https://auth0.com/)

> **Fidenz Full Stack Assignment** — A secure, modern weather analytics platform computing a custom human biometeorological **Comfort Index**, ranking cities worldwide, providing two-tier server-side caching with live telemetry, Auth0 authentication, and a responsive glassmorphic dashboard.

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
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

2. **Two-Tier Server-Side Caching (5-Minute TTL)**:
   - **Tier 1 (Raw Cache)**: Caches individual OpenWeatherMap API responses for 5 minutes (`300s`) to prevent rate limits.
   - **Tier 2 (Processed Cache)**: Caches computed analytics and city rankings.
   - Real-time **Cache Telemetry Inspector** (`/api/weather/cache/stats`) with live HIT/MISS indicators and cache flush.

3. **Ultra-Modern Glassmorphic UI**:
   - Dynamic **Dark / Light mode** toggle with persistent local preferences.
   - **Interactive Radar Chart** breaking down biometeorological factors for each city.
   - **Comparative Climate Analytics Chart** (Comfort Score vs. Temperature vs. Humidity).
   - Instant Search, condition filter chips (Clear, Clouds, Rain, Mist, Thunderstorm), and multi-field sorting.
   - Responsive **Card View** and **Analytical Table View**.

4. **Security & Authentication (Auth0)**:
   - JWT validation middleware for Express API routes.
   - Support for Multi-Factor Authentication (MFA via email OTP).
   - Public signup restriction / Whitelist-based access.

---

## 🏗️ Architecture & Tech Stack

```
Weather-Analytics/
├── backend/
│   ├── src/
│   │   ├── config/              # Configuration & default cities.json (12 cities)
│   │   ├── services/
│   │   │   ├── comfortIndexService.js  # Biometeorological scoring engine & ranking
│   │   │   ├── cacheService.js         # Two-tier cache with HIT/MISS tracking
│   │   │   └── weatherService.js       # OpenWeatherMap API fetcher & fallback
│   │   ├── controllers/
│   │   │   └── weatherController.js    # Express route handlers
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # Auth0 JWT check & Dev mode bypass
│   │   │   └── errorHandler.js         # Global error handler
│   │   ├── routes/
│   │   │   └── weatherRoutes.js        # API endpoints
│   │   ├── __tests__/                  # Jest unit test suites
│   │   └── server.js                   # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/                 # UI components (Navbar, HeroStats, Cards, Modals, Charts)
│   │   ├── context/                    # ThemeContext & WeatherContext
│   │   ├── styles/                     # Glassmorphism design tokens & responsive CSS
│   │   ├── App.jsx
│   │   └── main.jsx
└── README.md
```

- **Frontend**: React 18, Vite, Chart.js, Lucide Icons, `@auth0/auth0-react`
- **Backend**: Node.js, Express 4, `node-cache`, `axios`, `express-oauth2-jwt-bearer`, `jest`, `supertest`

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

# (Optional) Add your OpenWeather API Key in backend/.env
# OPENWEATHER_API_KEY=your_key_here

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
- Comfort Index range $[0, 100]$ constraints
- Extreme weather edge cases ($-30^\circ\text{C}$ arctic vs. $+40^\circ\text{C}$ heatwave)
- Exact sorting and ranking validation
- Cache lifecycle, HIT/MISS transitions, and flushing

---

## ⚖️ Trade-offs & Known Limitations

1. **In-Memory Cache vs. Distributed Redis**:
   - *Trade-off*: In-memory `node-cache` was chosen for zero-dependency local evaluation and ultra-low microsecond read latency.
   - *Limitation*: For multi-instance clustered horizontal scaling, a distributed store like Redis would be required.
2. **City Data Fetching Strategy**:
   - Current implementation concurrently fetches individual city endpoints with fallback resilience. OpenWeather's bulk group API requires a paid tier; our resilient fallback ensures seamless evaluation even on free-tier keys.
3. **Biometeorological Model**:
   - The formula provides a balanced human-comfort approximation. Advanced biometric models (such as Universal Thermal Climate Index - UTCI) require Solar Zenith Angle and Mean Radiant Temperature which are not standard in basic API payloads.

---

## 🎥 Screen Recording Guide (Part 3)

For the required **5 to 7 minute unedited video presentation**:

### 1. Design Decision Explanation (2–3 mins)
- Explain the **5-parameter Comfort Index formula** (why Temperature is weighted at 40% while humidity is 25%).
- Explain the **Two-Tier Caching layer** and how the 5-minute TTL optimizes API quotas while keeping data fresh.

### 2. Live-Coding Extension Demonstration (3–4 mins)
To demonstrate adding **Visibility** or adjusting weights live on screen:
1. Open `backend/src/services/comfortIndexService.js`.
2. Update the weights object to incorporate visibility:
   ```javascript
   // Live modification: Add visibility parameter
   const visScore = this.calcVisibilityScore(weather.visibility);
   const weights = { temp: 0.35, humidity: 0.20, wind: 0.15, cloud: 0.10, pressure: 0.10, visibility: 0.10 };
   ```
3. Re-run `npm test` or refresh the frontend dashboard to see the city rankings dynamically recalculate!

---

## 👥 Reviewers Access List

Repository access has been configured for the Fidenz evaluation team:
- `kanishka.d@fidenz.com`
- `srimal.w@fidenz.com`
- `narada.a@fidenz.com`
- `amindu.l@fidenz.com`
- `niroshanan.s@fidenz.com`
