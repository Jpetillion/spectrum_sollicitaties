# Vercel Deployment Guide - Het Spectrum Sollicitaties App

## ✅ Vercel-Ready Checklist

The application is now fully configured for Vercel deployment with the following:

- ✅ **bcryptjs** instead of bcrypt (Vercel compatible)
- ✅ **Relative API URLs** (`/api/*`) - works on any domain
- ✅ **Environment variables** ready for Vercel
- ✅ **Catch-all routing** configured in vercel.json
- ✅ **SSR build** working correctly
- ✅ **Hybrid storage** (local dev + Vercel Blob for production)

---

## 🚀 Deployment Steps

### 1. Prerequisites

- GitHub repository with your code
- Vercel account (free tier works)
- Turso database already set up

### 2. Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the settings

### 4. Configure Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

#### Required Variables

```bash
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Session Secret (generate a strong random string)
SESSION_SECRET=your-super-secret-session-key-change-this

# Node Environment
NODE_ENV=production

# Base URL (your Vercel deployment URL)
BASE_URL=https://your-app.vercel.app
```

#### Optional Variables

```bash
# Vercel Blob Storage (for file uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxx

# If you want custom port (usually not needed on Vercel)
PORT=3000
```

### 5. Deploy

Click "Deploy" and wait for the build to complete.

---

## 🔧 Configuration Details

### vercel.json

Our [vercel.json](vercel.json) is configured with:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*\\.(js|jsx|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**What this does:**
- API routes go to Express server
- Static assets are served through Express
- All other routes (SPA navigation) go to Express for SSR
- Sets NODE_ENV to production

### Build Process

```bash
npm run build
```

This creates:
- `dist/client/` - Client-side assets
- `dist/server/` - SSR bundle

### API Client

The [src/lib/apiClient.js](src/lib/apiClient.js) uses relative URLs:

```js
const API_BASE = '/api';
```

This works perfectly on Vercel because it's relative to the domain.

---

## 📦 File Storage on Vercel

### Development
Files are stored locally in `/uploads` folder.

### Production (Vercel)
Use Vercel Blob Storage:

1. Install Vercel Blob (already in package.json):
   ```bash
   npm install @vercel/blob
   ```

2. Enable Blob Storage in Vercel dashboard:
   - Go to Storage → Blob
   - Create a new store
   - Copy the token

3. Add to environment variables:
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_xxxx
   ```

4. Update [server/storage/blob-storage.js](server/storage/blob-storage.js) if needed.

---

## 🧪 Testing After Deployment

### 1. Smoke Test

Visit your deployment URL and test:

- ✅ Login page loads
- ✅ Can login with test credentials
- ✅ Dashboard loads
- ✅ Can navigate between pages
- ✅ API calls work

### 2. Test Credentials

Use the seeded test users:

| Email | Password | Role |
|-------|----------|------|
| admin@hetspectrum.be | Welcome123! | admin |
| directie@hetspectrum.be | Welcome123! | directie |
| staf@hetspectrum.be | Welcome123! | staf |

### 3. Check Console

Open browser console (F12) and check for errors.

### 4. Test API

Check that API routes work:
```bash
curl https://your-app.vercel.app/api/auth/me
# Should return 401 (Unauthorized) if not logged in
```

---

## 🔍 Troubleshooting

### Build Fails

**Error:** "Module not found"
- Check package.json dependencies
- Run `npm install` locally first
- Make sure all imports use relative paths

**Error:** "bcrypt" related
- We switched to bcryptjs - check [server/auth/password.js](server/auth/password.js) uses `bcryptjs`

### Runtime Errors

**Error:** 500 Internal Server Error
- Check Vercel logs: Dashboard → Deployments → Click deployment → Runtime Logs
- Check environment variables are set correctly

**Error:** Database connection fails
- Verify TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are correct
- Check Turso database is accessible from Vercel

**Error:** Session not working
- Make sure SESSION_SECRET is set
- Check cookies are enabled in browser

### SSR Issues

**Error:** "Cannot find module './dist/server/entry-server.js'"
- Check build completed successfully
- Verify `dist/server/entry-server.js` exists after build

---

## 📊 Monitoring & Logs

### View Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on a deployment
5. View "Runtime Logs" or "Build Logs"

### Performance

- Vercel automatically monitors performance
- Check "Analytics" tab for metrics
- Enable "Web Analytics" for detailed insights

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Updated feature X"
git push origin main
```

Vercel will:
1. Detect the push
2. Run `npm run build`
3. Deploy the new version
4. Give you a preview URL

---

## 🌐 Custom Domain

### Add Custom Domain

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., sollicitaties.hetspectrum.be)
4. Follow DNS configuration instructions

### Update Environment Variables

After adding custom domain, update:

```bash
BASE_URL=https://sollicitaties.hetspectrum.be
```

---

## 💾 Database Migration on Vercel

### Run Migrations

Migrations need to be run manually after deployment:

#### Option 1: Run locally pointing to production DB

```bash
# Temporarily use production DB credentials
TURSO_DATABASE_URL=your-prod-url \
TURSO_AUTH_TOKEN=your-prod-token \
npm run migrate
```

#### Option 2: Create a serverless function

Create `api/migrate.js`:

```js
import { runMigrations } from '../server/db/migrations/run.js';

export default async function handler(req, res) {
  // Add authentication check here!
  if (req.headers['x-migration-secret'] !== process.env.MIGRATION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await runMigrations();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Then call:
```bash
curl -H "x-migration-secret: YOUR_SECRET" https://your-app.vercel.app/api/migrate
```

---

## 🎯 Production Checklist

Before going live, ensure:

- ✅ All environment variables set in Vercel
- ✅ Database migrations run on production DB
- ✅ Test users can login
- ✅ All critical flows tested (create job, add candidate, etc.)
- ✅ File uploads work (Vercel Blob configured)
- ✅ No console errors in browser
- ✅ API responses are fast (< 500ms)
- ✅ SSL certificate active (automatic on Vercel)
- ✅ Custom domain configured (if applicable)
- ✅ Error monitoring set up (Sentry optional)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Turso Documentation](https://docs.turso.tech)

---

## 🆘 Need Help?

If deployment fails:

1. Check Vercel build logs
2. Check runtime logs
3. Verify environment variables
4. Test build locally: `npm run build && npm run preview`
5. Review this guide again

---

**Last updated:** 2026-01-17
**Status:** ✅ Vercel-ready and tested
