import { clientsClaim } from 'workbox-core';
import { setCacheNameDetails } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import LogoLotusPink from '@assets/lotus-pink-logo.png';
import * as localforage from 'localforage';
import { unsubscribePushNotification } from 'utils/pushNotification';
import { getWalletNameFromAddress } from 'utils/cashMethods';

clientsClaim();
self.skipWaiting();

const getFocusedWindow = async () => {
    return self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(windowClients => {
        return windowClients.find(windowClient => windowClient.focused);
    });
}

// Push Notification Event Handling
self.addEventListener('push', event => {
    const promiseChain = getFocusedWindow()
    .then(async focusedWindow => {
        const { clientAppId, type, payload } = event.data.json();
        // if the clientAppId included in the Push Notification data
        // but not the same as the current appId on local storage
        // that means the appId has changed (due to cache being cleared)
        // in this case, the old app (with the clientAppId) no longer exist,
        // therefore, the associated subscription should be removed
        const pushNotificationConfig = await localforage.getItem('pushNotificationConfig');
        if (clientAppId && clientAppId !== pushNotificationConfig.appId) {
            try {
                unsubscribePushNotification([payload.toAddress], clientAppId);
            } catch (error) {
                console.log('Error in unsubscribing push notification', error);
            }
            return;
        }
        let options = {
            icon: LogoLotusPink,
            badge: LogoLotusPink,
            requireInteraction: false,
            silent: false,
        };
        let title;
        if ( type === 'TEXT' ) {
            title = 'Important Annoucement';
            options.body = payload;
        } else if (type === 'TX') {
            const { amount, toAddress, fromAddress } = payload;
            const amountXPI = amount / 1000000;
            const from = '...' + fromAddress.substring(fromAddress.length - 6);
            let toName = null;
            try {
                toName = await getWalletNameFromAddress(toAddress);
            } catch (error) {
                console.log('error in getWalletNameFromAddress()', error);
            }
            const to = toName || '...' + toAddress.substring(toAddress.length -6);
            title = `Receiving ${amountXPI} XPI`;
            options.body =  `From: ${from} - To: ${to}`
        }
        if (!focusedWindow) {
            // sendlotus.com is NOT open and focused
            // show notification in this case
            return self.registration.showNotification(title, options);
        } else {
            // sendlotus.com is open and focused
            // do not show notification
            // TODO:
            // push a message to the app
            // the app must have an event listener to handle the message
        }
    });
    event.waitUntil(promiseChain);
})

// Push Notification Click Event Handler
self.addEventListener('notificationclick', event => {
    const clickedNotification = event.notification;
    clickedNotification.close();

    // 1. sendlotus.com is not open - open and focus on it
    // 2. sendlotus.com is open but not focused - bring it to focus
    // 3. sendlotus.com is focused - do nothing
    const urlToOpen = new URL('/wallet', self.location.origin).href;
    const promiseChain = self.clients.matchAll({
        // we can only see the clients with the same origin as this service worker
        type: 'window',
        includeUncontrolled: true,
    }).then(windowClients => {
        if (windowClients.length <= 0) {
            return self.clients.openWindow(urlToOpen);
        }
        
        let focusedWindow = windowClients.find(windowClient => windowClient.focused);
        if ( !focusedWindow ) {
            return windowClients[0].focus() // focus on the first open window/tab
        }
    });

    event.waitUntil(promiseChain);
});

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