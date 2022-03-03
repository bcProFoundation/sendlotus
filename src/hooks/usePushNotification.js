import * as localforage from "localforage";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

const KEY = 'pushNotificationConfig';

const usePushNotification = () => {
    const [isPushNotificationSupported, setIsPushNotificationSupported] = useState(false);
    const [allowPushNotification, setAllowPushNotification] = useState(undefined);
    const [appId, setAppId] = useState(undefined);
    const [lastPushMessageTimestamp, setLastPushMessageTimestamp] = useState(undefined);

    const loadPushNotificationConfigFromStorage = async () => {
        try {
            return await localforage.getItem(KEY);
        } catch (error) {
            console.error('ERROR in loadPushNotificationConfigFromStorage() in usePushNotification()');
            // TODO: log the error
            throw error;
        }
    }

    const savePushNotificationConfigToStorage = async () => {
        try {
            return await localforage.setItem(
                KEY,
                {
                    allowPushNotification,
                    appId,
                    lastPushMessageTimestamp
                }
            )
        } catch (error) {
            console.error('ERROR in savePushNotificationConfigFromStorage() in usePushNotification()');
            // TODO: log the error
            throw error;
        }
    }

    // Run Once
    // Load the configuration from local storage
    useEffect( async ()=> {
        // check if PushNotification is supported
        // then load the configuration from local storage
        if ( ('serviceWorker' in navigator) && ('PushManager' in window) ) {
            const pushConfiguration = await loadPushNotificationConfigFromStorage();
            if ( !pushConfiguration ) {
                // no configuration saved on the local storage
                // generate a new id and set it as app state
                // this will trigger another useEffect() and save the configuration
               setAppId(uuidv4());
            } else {
                setAllowPushNotification(pushConfiguration.allowPushNotification);
                setAppId(pushConfiguration.appId);
                setLastPushMessageTimestamp(pushConfiguration.lastPushMessageTimestamp);
            }
            setIsPushNotificationSupported(true);
        }
    }, []);

    // save the configuration to local storage whenever it is changed
    useEffect(async () => {
        await savePushNotificationConfigToStorage();
    }, [appId, allowPushNotification, lastPushMessageTimestamp]);

    const pushNotification =  {
        appId,
        allowPushNotification,
        lastPushMessageTimestamp,
        turnOffPushNotification: () => { setAllowPushNotification(false) },
        turnOnPushNotification: () => { setAllowPushNotification(true) }
    }

    return isPushNotificationSupported ? pushNotification : null;
}

export default usePushNotification;