// Aheera Store — Progressive Web App Service Worker v264.0
const CACHE_NAME = 'aheera-cache-v264';
const STATIC_ASSETS = [
  './',
  './index.html',
  './admin.html',
  './invoice.html',
  './html2pdf.bundle.min.js',
  './manifest.json',
  './site.webmanifest',
  './admin.webmanifest',
  './favicon.ico',
  './favicon.svg',
  './favicon-96x96.png',
  './favicon.png',
  './apple-touch-icon.png',
  './web-app-manifest-192x192.png',
  './web-app-manifest-512x512.png',
  './logo_app_192.png',
  './logo_app_512.png',
  './aheera_icon_header.png',
  './fonts/PlusJakartaSans-SemiBold.ttf',
  './fonts/PlusJakartaSans-Bold.ttf',
  './lottie.min.js',
  './aheera_lottie_data.js',
  './aheera_welcome_lottie.json',
  './logo.png',
  './logo_old.png',
  './Full_Cream_Milk.png',
  './Pure_Desi_Ghee.png',
  './Fresh_Paneer.png',
  './Fresh_Chhena.png',
  './Homestyle_Dahi.png',
  './Sweet_Lassi.png',
  './Honey.png',
  './Full_Cream_Milk.webp',
  './Pure_Desi_Ghee.webp',
  './Fresh_Paneer.webp',
  './Fresh_Chhena.webp',
  './Homestyle_Dahi.webp',
  './Sweet_Lassi.webp',
  './Honey.webp',
  './hero_farm.jpg',
  './cat_farm.png',
  './cat_sample.png',
  './free_sample_hero.png',
  './cat_honey.png',
  './cat_milk.png',
  './cat_ghee.png',
  './cat_paneer.png',
  './cat_chhena.png',
  './cat_dahi.png',
  './cat_lassi.png'
];

// Install: Cache core assets and skip waiting
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: Delete all older caches and claim clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-First for static media/images/fonts (0ms instant load), Network-First for HTML
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isImageOrMedia = /\.(png|webp|jpg|jpeg|svg|gif|ico|woff2|woff|ttf|mp4)$/i.test(url.pathname);

  if (isImageOrMedia) {
    // Stale-While-Revalidate / Cache-First for instant visual rendering
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(cached => {
        const fetchPromise = fetch(req).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
          }
          return res;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network-First for HTML documents & API routes
  event.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
      }
      return res;
    }).catch(() => {
      return caches.match(req, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Push notification receiver
self.addEventListener('push', event => {
  let data = { title: 'Aheera Fresh Delivery', body: 'Your fresh morning harvest is ready!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message,
    icon: './logo.png',
    badge: './logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || './index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes('aheera') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
