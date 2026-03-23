# 🏏 Get Talent – Talent Gets Hired

> Pakistan's premier cricket player bidding platform.

---

## 📦 Project Structure

```
get-talent/
├── backend/          NestJS REST API + WebSockets
│   ├── src/
│   │   ├── auth/           JWT auth, login, registration
│   │   ├── users/          User entity
│   │   ├── players/        Player CRUD, file uploads
│   │   ├── captains/       Captain management
│   │   ├── tournaments/    Tournament CRUD
│   │   ├── bids/           Bidding logic
│   │   ├── bidding/        WebSocket gateway + sessions
│   │   ├── admin/          Admin dashboard, approvals, broadcast
│   │   └── notifications/  In-app + Web Push notifications
│   └── uploads/            Uploaded files (gitignored)
│
└── frontend/         React PWA
    ├── public/
    │   ├── icons/           PWA icons (GT logo, all sizes)
    │   └── sw-push.js       Push notification service worker
    └── src/
        ├── pages/           All app pages
        │   └── admin/       Admin panel pages
        ├── components/
        │   ├── common/      TopBar, BottomNav, Avatar, GTLogo, PaymentModal
        │   ├── player/      PlayerCard
        │   └── admin/       AdminLayout
        ├── store/           Zustand auth store
        ├── utils/           API client, push notification utils
        └── styles/          Global CSS design system
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed
npm run start:dev
# → Runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → Runs on http://localhost:5173
```

### Admin Login
- URL: http://localhost:5173/admin/login
- Username: `umer1993`
- Password: `umer0895`

### User Login
- Phone number is used as username
- Default password = phone number

---

## 🔔 Push Notifications (VAPID Setup)

Generate VAPID keys:

```bash
cd backend
npx web-push generate-vapid-keys
```

Add to `.env`:
```
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:admin@gettalent.pk
```

Add to frontend `.env`:
```
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

---

## 🌐 Render Deployment

### Backend (Web Service)

1. Create **New Web Service** on Render
2. Connect your GitHub repo
3. **Root Directory**: `backend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm run start:prod`
6. **Environment Variables**:
   ```
   PORT=3001
   JWT_SECRET=<strong-random-secret>
   FRONTEND_URL=https://your-app.onrender.com
   VAPID_PUBLIC_KEY=<your-vapid-public>
   VAPID_PRIVATE_KEY=<your-vapid-private>
   VAPID_EMAIL=mailto:admin@gettalent.pk
   DB_PATH=/var/data/get-talent.db
   ```
7. Add a **Persistent Disk** at `/var/data` (for SQLite)

### Frontend (Static Site)

1. Create **New Static Site** on Render
2. Connect your GitHub repo
3. **Root Directory**: `frontend`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

> **For production**, switch from SQLite to PostgreSQL by updating `app.module.ts`:
> ```ts
> type: 'postgres',
> url: process.env.DATABASE_URL,
> ssl: { rejectUnauthorized: false }
> ```

---

## 🏗️ Key Features

| Feature | Details |
|---|---|
| Player Registration | Paid registration with receipt upload |
| Captain Registration | Free sign-up, paid subscription for bidding |
| Admin Panel | Full approval workflow, remarks, ban system |
| Live Bidding | WebSocket real-time bidding with countdown timer |
| Push Notifications | Web Push API (VAPID) + in-app notifications |
| Broadcast | Admin can push messages to all users |
| Tournament Management | Create tournaments with full details |
| Player Feed | Paginated, filterable player cards |
| PWA | Installable, offline-capable, mobile-first |

---

## 🎨 Design System

- **Fonts**: Bebas Neue (display) + Outfit (body)
- **Theme**: Deep navy dark with gold accents
- **Logo**: GT text logo with gold gradient
- **Default Avatar**: GT initials (shown when no profile picture)

---

## 📋 Category & Fee Structure

| Category | Registration Fee | Minimum Bid |
|---|---|---|
| Diamond | Rs. 10,000 | Rs. 20,000 |
| Gold | Rs. 7,000 | Rs. 10,000 |
| Silver | Rs. 5,000 | Rs. 8,000 |
| Emerging | Rs. 3,000 | Rs. 6,000 |

---

## 🔐 Admin Credentials
- **Username**: `umer1993`
- **Password**: `umer0895`

---

## 📱 PWA Installation

On mobile (Chrome/Safari):
1. Open the app URL
2. Tap "Add to Home Screen"
3. App installs with GT icon and "Get Talent" name

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, Socket.io-client |
| PWA | vite-plugin-pwa, Web Push API |
| Styling | Pure CSS variables, Framer Motion |
| Backend | NestJS 10, TypeORM, Passport JWT |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Realtime | Socket.io WebSockets |
| Push | web-push (VAPID) |
| Deployment | Render (Static + Web Service) |
