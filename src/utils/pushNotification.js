import { Modal } from 'antd';
import { getAddressesOfSavedWallets, getAddressesOfWallet } from './cashMethods';

export const askPermission = () => {
    return new Promise(function(resolve, reject) {
        const permissionResult = Notification.requestPermission(function(result) {
            resolve(result);
        });
  
        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    })
    .then(function(permissionResult) {
        if (permissionResult === 'denied') {
            throw new Error('permission denied - Notification is blocked');
        } else if ( permissionResult === 'default') {
            throw new Error('permission not granted - Notification permission is neither granted nor blocked this time');
        }
    });
}

export const getPlatformPermissionState = () => {
    return Notification.permission;
}

// subscribe all wallets
export const subscribeAllWalletsToPushNotification = async (pushNotificationConfig, interactiveMode) => {
    // get the PushSubscription Object from browser
    let pushSubscription;
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_PUSH_SERVER_PUBLIC_KEY
        }
        pushSubscription = await registration.pushManager.subscribe(subscribeOptions);

        // get addresses of all the saved wallets
        const addresses = await getAddressesOfSavedWallets();

        // send the subscription details to backend server
        const subscribeURL = process.env.REACT_APP_PUSH_SERVER_API + 'subscribe';
        const subscriptionObject = {
            ids: addresses,
            clientAppId: pushNotificationConfig.appId,
            pushSubscription
        }
        console.log(JSON.stringify(subscriptionObject));
        const res = await fetch( subscribeURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(subscriptionObject)
        });
        const resData = await res.json();
        if ( resData.error ) {
            throw new Error(resData.error);
        }
        pushNotificationConfig.turnOnPushNotification();
        if (interactiveMode) {
            Modal.success({content: 'Success! you will receive notification of new transaction'})
        }
    } catch (error) {
        console.log("Error in subscribeAllWalletsToPushNotification()", error);
        if (interactiveMode) { // show an error modal in interactive mode
            Modal.error({
                title: 'Error - Push Notification Subscription',
                content: error.message
            });
        }
        return;
    }
  }

// unsubscribe a single wallet
export const unsubscribeWalletFromPushNotification = async (pushNotificationConfig, wallet) => {
    if (!pushNotificationConfig || !wallet) return;

    const addresses = getAddressesOfWallet(wallet);
    unsubscribePushNotification(addresses, pushNotificationConfig.appId);
}

export const unsubscribePushNotification = async ( addresses, appId) => {
    const unsubscriptionObject = { ids: addresses, clientAppId: appId};
    const unsubscribeURL = process.env.REACT_APP_PUSH_SERVER_API + 'unsubscribe';
    const res = await fetch( unsubscribeURL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(unsubscriptionObject)
    });
    res.json().then(data => {
        if (data.success) {
            console.log("Successfully unsubscribe Push Notification");
        } else {
            console.log(data.error);
        }
    });
}

export const checkInWithPushNotificationServer = async (pushNotificationConfig) => {
    if (!pushNotificationConfig || !pushNotificationConfig.allowPushNotification) return;

    try {
        const addresses = await getAddressesOfSavedWallets();
        const checkInURL = process.env.REACT_APP_PUSH_SERVER_API + 'checkin';
        const checkinObj = {
            ids: addresses,
            clientAppId: pushNotificationConfig.appId,
        }
        const res = await fetch(checkInURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(checkinObj)
        });
        res.json().then(data => {
            if (data.success) {
                console.log("Push Notification Server checkin OK");
            } else {
                console.log('Push Notification Server checkin Failed');
            }
        })
    } catch (error) {
        console.log('Error in checkInWithPushNotificationServer', error);
    }
}