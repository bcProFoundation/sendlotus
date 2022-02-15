import { clientsClaim } from 'workbox-core';
import { setCacheNameDetails } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

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

// Caching TX using CacheFirst Strategy
const txDetailsCache = {
    path: '/rawtransactions/getRawTransaction/',
    name: `${prefix}-tx-data-${suffix}`,
}

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

registerRoute(
    ({ url }) => url.pathname.includes(txDetailsCache.path),
    new CacheFirst({
        cacheName: txDetailsCache.name,
        plugins: [
            txDataCustomCachablePlugin,
            new ExpirationPlugin({
                maxEntries: 1000,
                maxAgeSeconds: 365 * 24 * 60 * 60,
            }),
        ],
    }),
);

// Caching api call that retrieves the corresponding public key of an address
const publicKeysCache = {
    path: '/encryption/publickey',
    name: `${prefix}-public-keys-${suffix}`
};
// public key customCacheablePlugin
const publicKeyCustomCachablePlugin = {
    cacheWillUpdate: async ({response}) => {
        // only cache if Status is OK (200) and success === true
        if (response && response.status === 200) {
            const clonedR =  response.clone();
            const data = await clonedR.json();
            if ( data.success ) {
                return response;
            }
        }

        return null;
    },
}
registerRoute(
    ({url}) => url.pathname.includes(publicKeysCache.path),
    new CacheFirst({
        cacheName: publicKeysCache.name,
        plugins: [
            publicKeyCustomCachablePlugin,
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 365 * 24 * 60 * 60,
            }),
        ]
    })
);