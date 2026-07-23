# Deploy MediTrack EMS — MongoDB Atlas + Railway + Vercel

Stack:
- **MongoDB Atlas** → database
- **Railway** → Express API (`backend/`)
- **Vercel** → React admin (`src/`)

---

## 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → create a user (username + password).
3. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for testing (tighten later).
4. **Connect** → Drivers → copy the URI, e.g.

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/ems_admin?retryWrites=true&w=majority
```

Replace `PASSWORD` with the real password (URL-encode special characters).

---

## 2. Railway (backend)

1. Push this repo to GitHub (if not already).
2. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
3. Select the repo. Set **Root Directory** to `backend`.
4. Variables (Settings → Variables):

| Variable | Value |
|----------|--------|
| `MONGO_URI` | Atlas URI from step 1 |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | your Vercel URL (add after step 3; can update later) |
| `ADMIN_SECRET` | strong secret for forgot-password admin header |

5. Generate a public domain: Settings → Networking → **Generate Domain**.  
   Example: `https://ems-api-production-xxxx.up.railway.app`
6. Confirm health: open `https://YOUR-RAILWAY-URL/api/health` → `{ "success": true, ... }`.

### Seed production data (once)

From your PC (with Atlas URI):

```powershell
cd "d:\EMS - Admin Frontend\backend"
$env:MONGO_URI="mongodb+srv://USER:PASS@cluster.mongodb.net/ems_admin?retryWrites=true&w=majority"
npm run seed
```

Demo login after seed: `owner@adilagencies.com` / `admin123`

---

## 3. Vercel (frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import the same GitHub repo.
2. Framework: **Vite**. Root directory: **`.`** (repo root, not `backend`).
3. Environment variables:

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL/api` |

4. Deploy. Copy the Vercel URL (e.g. `https://ems-admin.vercel.app`).
5. Go back to Railway → set `CLIENT_URL` to that Vercel URL → redeploy if needed.

---

## 4. Test live

1. Open Vercel URL → login with seed credentials.
2. Generate a branch device secret.
3. Postman against Railway:

```http
GET https://YOUR-RAILWAY-URL/api/device/me
X-Device-Secret: ems_dev_...
```

4. Branch agent config:

```text
apiUrl: https://YOUR-RAILWAY-URL/api
deviceSecret: ems_dev_...
```

---

## Checklist

- [ ] Atlas network allows Railway (`0.0.0.0/0` for test)
- [ ] Railway `/api/health` works
- [ ] Seeded Atlas DB
- [ ] Vercel `VITE_API_URL` points to Railway `/api`
- [ ] Railway `CLIENT_URL` matches Vercel origin
- [ ] Login works on production URL

---

## Notes

- Never commit real `.env` files (root `.gitignore` ignores them).
- `VITE_*` vars are baked in at **build** time — change `VITE_API_URL` → redeploy Vercel.
- Branch agent must use the **Railway** API URL, not localhost.
