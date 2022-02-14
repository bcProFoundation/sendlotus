import { clientsClaim } from 'workbox-core';
import { setCacheNameDetails } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin} from 'workbox-cacheable-response';

clientsClaim();
self.skipWaiting();

// cofingure prefix, suffix, and cacheNames
const prefix = 'sendlotus';
const suffix = 'v1.0.1';
const staticAssetsCache = `static-assets`;

// configure prefix and suffix for default cache names
setCacheNameDetails({
    prefix: prefix,
    suffix: suffix,
    precache: staticAssetsCache,
});

// injection point for static assets caching
precacheAndRoute(self.__WB_MANIFEST);

// Tx Data customCacheablePlugin
const txDataCustomCachablePlugin = {
    cacheWillUpdate: async ({response}) => {
        // only cache if Status is OK (200) and blockhash exists - meaning the tx is confirmed
        // caching unconfirmed tx with CacheFirst strategy will cause tx always shown as Today.
        if (response && response.status === 200) {
            const clonedR =  response.clone();
            const data = await clonedR.json();
            if ( data.blockhash ) {
                return response;
            }
        }

        return null;
    },
}

// Caching TX using CacheFirst Strategy
const txDetailsCaches = [
    {
        // lotus tx
        path: '/rawtransactions/getRawTransaction/',
        name: `${prefix}-tx-data-${suffix}`,
    },
];

txDetailsCaches.forEach(cache => {
    registerRoute(
        ({ url }) => url.pathname.includes(cache.path),
        new CacheFirst({
            cacheName: cache.name,
            plugins: [
                txDataCustomCachablePlugin,
                new ExpirationPlugin({
                    maxEntries: 1000,
                    maxAgeSeconds: 365 * 24 * 60 * 60,
                }),
            ],
        }),
    );
});

// Caching api call that retrieves the corresponding public key of an address
const publicKeysCache = {
    path: '/encryption/publickey',
    name: `${prefix}-public-keys-${suffix}`
};
registerRoute(
    ({url}) => url.pathname.includes(publicKeysCache.path),
    new CacheFirst({
        cacheName: publicKeysCache.name,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200]
            }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 365 * 24 * 60 * 60,
            }),
        ]
    })
);