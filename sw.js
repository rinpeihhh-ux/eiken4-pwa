const CACHE_NAME = 'eiken4-v5';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/utils/storage.js',
    '/utils/audio.js',
    '/utils/validate.js',
    '/modules/vocabulary.js',
    '/modules/grammar.js',
    '/modules/listening.js',
    '/modules/reading.js',
    '/modules/mock-exam.js',
    '/modules/prestudy.js',
    '/modules/reference.js',
    '/data/curriculum.json',
    '/data/vocabulary.json',
    '/data/grammar.json',
    '/data/prestudy.json',
    '/data/frequent_words.json',
    '/data/rankA_words.json',
    '/data/rankB_words.json',
    '/data/rankC_words.json',
    '/data/validation_rank_words.json',
    '/data/frequent_phrases.json',
    '/data/listening.json',
    '/data/reading.json'
];

// Install event - cache all resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
            )
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
