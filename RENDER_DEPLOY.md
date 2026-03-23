# Get Talent — Render Deployment Guide

## Backend (Web Service)

| Setting        | Value                              |
|----------------|------------------------------------|
| Root Directory | `backend`                          |
| Build Command  | `npm install && npx nest build`    |
| Start Command  | `node dist/main`                   |

### Environment Variables (Backend)
```
DATABASE_URL    = postgresql://get_talent_db_user:...@.../get_talent_db
JWT_SECRET      = gt-secret-2024
PORT            = 3001
FRONTEND_URL    = https://get-talent.onrender.com
VAPID_EMAIL     = mailto:admin@gettalent.pk
```

---

## Frontend (Static Site)

| Setting          | Value                             |
|------------------|-----------------------------------|
| Root Directory   | `frontend`                        |
| Build Command    | `npm install && npm run build`    |
| Publish Directory| `dist`                            |

### Environment Variables (Frontend — REQUIRED)
```
VITE_API_URL = https://get-talent-api.onrender.com/api
```
> ⚠️ Replace `get-talent-api.onrender.com` with your actual backend service URL.
> This must be set in Render dashboard → Static Site → Environment BEFORE building.

---

## Admin Credentials
- Password: `umer0895`
- URL: `https://get-talent.onrender.com/admin/login`

## To Enable Captain Bidding (after captain registration)
1. Login as admin
2. Go to Captains → find captain → Approve
3. Click "⚡ Enable Bidding" on the approved captain
4. Captain can now place bids

## Common Issues

### Players not loading
- Check `VITE_API_URL` is set in Render frontend env vars
- Verify backend is running (check Render logs)

### Captain can't bid
- Admin must: Approve captain → Enable Bidding
- Captain must be in an active bidding session

### 401 errors logging users out
- Only affects protected endpoints
- Public endpoints (feed, players, tournaments) do not trigger logout
