const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8085;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.webmanifest': 'application/manifest+json; charset=UTF-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  try {
    let reqUrl = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(reqUrl.pathname);

    // Route root to admin.html
    if (pathname === '/' || pathname === '/index.html') {
      pathname = '/admin.html';
    }

    // Dynamic Manifest for dedicated Admin root domain
    if (pathname === '/admin.webmanifest' || pathname === '/site.webmanifest' || pathname === '/manifest.json') {
      const manifest = {
        name: "Aheera Admin — Operations Console",
        short_name: "Aheera Admin",
        description: "Aheera Pure Organic Dairy — Unified Operations, Household Dispatch & Partner Console",
        id: "aheera-admin-standalone-v1",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#040D07",
        theme_color: "#040D07",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      };
      res.writeHead(200, {
        'Content-Type': 'application/manifest+json; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify(manifest, null, 2));
    }

    let filePath = path.join(ROOT, pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(ROOT, 'admin.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // High performance caching for static media/images/fonts
    let cacheControl = 'no-cache, must-revalidate';
    if (['.png', '.webp', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.mp4', '.woff2', '.woff', '.ttf'].includes(ext)) {
      cacheControl = 'public, max-age=604800, stale-while-revalidate=86400';
    } else if (['.js', '.css'].includes(ext)) {
      cacheControl = 'public, max-age=86400, stale-while-revalidate=3600';
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error: ' + err.message);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Dedicated Aheera Admin Server running on http://127.0.0.1:${PORT}`);
});
