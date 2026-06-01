import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/index';

export const createApp = (): Application => {
  const app = express();

  // ─── Security ───────────────────────────────────────────────────────────────
  app.set('trust proxy', 1);
  app.use(helmet());

  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    }),
  );

  // ─── Body Parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ─── Compression ────────────────────────────────────────────────────────────
  app.use(compression());

  // ─── Logging ─────────────────────────────────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // ─── Performance Monitoring ──────────────────────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn(`🐢 Slow Request: ${req.method} ${req.url} - ${duration}ms`);
      }
    });
    next();
  });

  // ─── Health Check ────────────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      service: 'sawa-server',
      environment: env.NODE_ENV,
      db: { type: 'postgresql (prisma)' },
      timestamp: new Date().toISOString(),
    });
  });

  // ─── Wakeup Ping ─────────────────────────────────────────────────────────────
  app.get('/wakeup', (_req: Request, res: Response) => {
    res.status(200).json({ 
      success: true, 
      message: 'Server is awake',
      timestamp: new Date().toISOString()
    });
  });

  // ─── Share Deep-Link Redirect Pages ─────────────────────────────────────────
  // /share/community/:id — smart link: opens app if installed, store otherwise.
  app.get('/share/community/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const appScheme   = `sawa://community/${id}`;
    const androidPkg  = 'com.sawa';
    const iosAppId    = '6745446429'; // App Store numeric ID for SAWA
    const playStore   = `https://play.google.com/store/apps/details?id=${androidPkg}`;
    const appStore    = `https://apps.apple.com/app/id${iosAppId}`;

    // Fetch community name for OG preview (best-effort)
    let communityName = 'a community';
    let communityCity = '';
    try {
      const { prisma } = await import('./lib/prisma');
      const community = await prisma.community.findUnique({
        where: { id },
        select: { name: true, city: true },
      });
      if (community) {
        communityName = community.name;
        communityCity = community.city || '';
      }
    } catch { /* non-fatal */ }

    const pageTitle   = `${communityName} — SAWA`;
    const description = `Join ${communityName}${communityCity ? ` in ${communityCity}` : ''} on SAWA, the social circle for couples.`;

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle}</title>
  <!-- Open Graph (WhatsApp / iMessage preview) -->
  <meta property="og:title"       content="${pageTitle}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type"        content="website" />
  <!-- Apple Universal Links / Android App Links (configure AASA / assetlinks later) -->
  <meta name="apple-itunes-app"   content="app-id=${iosAppId}, app-argument=${appScheme}" />
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
         background:#FFFDF8;display:flex;flex-direction:column;align-items:center;
         justify-content:center;min-height:100vh;margin:0;padding:24px;box-sizing:border-box;text-align:center;}
    h1{color:#1C253B;font-size:22px;margin-bottom:8px;}
    p{color:#7A8094;font-size:15px;margin-bottom:32px;}
    .btn{display:inline-block;background:#1C6B4A;color:#fff;border-radius:24px;
         padding:14px 36px;font-size:17px;font-weight:600;text-decoration:none;margin:8px;}
  </style>
</head>
<body>
  <h1>🌿 ${communityName}</h1>
  <p>${description}</p>
  <a class="btn" href="${appScheme}">Open in SAWA</a>

  <script>
    // Try to open the app. After 2 s, fall back to the store based on platform.
    window.location.href = '${appScheme}';
    var isAndroid = /android/i.test(navigator.userAgent);
    var store = isAndroid ? '${playStore}' : '${appStore}';
    setTimeout(function(){
      window.location.href = store;
    }, 2000);
  </script>
</body>
</html>`);
  });

  // ─── API Routes ──────────────────────────────────────────────────────────────
  app.use('/api/v1', apiRouter);

  // ─── 404 Catch-all ───────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 404,
    });
  });

  // ─── Global Error Handler ────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};
