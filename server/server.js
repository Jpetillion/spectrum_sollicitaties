import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Import middleware
import { createSessionMiddleware, attachUserToRequest } from './auth/session.js';

// Import API routes
import authRoutes from './routes-api/auth.js';
import mfaRoutes from './routes-api/mfa.js';
import jobsRoutes from './routes-api/jobs.js';
import candidatesRoutes from './routes-api/candidates.js';
import applicationsRoutes from './routes-api/applications.js';
import evaluationsRoutes from './routes-api/evaluations.js';
import notificationsRoutes from './routes-api/notifications.js';
import mailRoutes from './routes-api/mail.js';
import documentsRoutes from './routes-api/documents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Initialize Vite dev server in development
let vite;
if (isDev) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  app.use(vite.middlewares);
}

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(createSessionMiddleware());
app.use(attachUserToRequest);

// Static files
const uploadsPath = join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

if (!isDev) {
  const distPath = join(__dirname, '..', 'dist', 'client');
  app.use(express.static(distPath));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/documents', documentsRoutes);

// Serve HTML (only in development or non-Vercel production)
if (isDev) {
  // Development: Use Vite to transform and serve HTML
  app.get('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;

      // Read and transform index.html with Vite
      const templatePath = join(__dirname, '..', 'index.html');
      let template = readFileSync(templatePath, 'utf-8');
      template = await vite.transformIndexHtml(url, template);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error('Dev server error:', e);
      next(e);
    }
  });
} else if (!process.env.VERCEL) {
  // Local production: Serve static HTML (SPA)
  app.get('*', (req, res) => {
    try {
      const templatePath = join(__dirname, '..', 'dist', 'client', 'index.html');
      res.sendFile(templatePath);
    } catch (e) {
      console.error('Error serving HTML:', e);
      res.status(500).end('Internal Server Error');
    }
  });
}
// On Vercel, static files are served by Vercel itself, not by this server

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Er is een serverfout opgetreden' });
});

// Only listen when not in Vercel (for local development)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🎓 Het Spectrum - Sollicitaties App        ║
║                                               ║
║   Server draait op: http://localhost:${PORT}   ║
║   Environment: ${isDev ? 'development' : 'production'}              ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
  });
}

export default app;
