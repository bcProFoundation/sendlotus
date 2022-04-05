import React, {useState} from 'react';
import { BellFilled, CheckOutlined, CloseOutlined, ExclamationCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { Switch, Tag, Modal } from 'antd';
import { askPermission, getPlatformPermissionState, subscribeAllWalletsToPushNotification, unsubscribeAllWalletsFromPushNotification } from 'utils/pushNotification';
import { GeneralSettingsItem } from 'components/Common/Atoms';
import { ThemedQuerstionCircleOutlinedFaded } from 'components/Common/CustomIcons';

// Help (?) Icon that shows info
const helpInfoIcon = (
    <ThemedQuerstionCircleOutlinedFaded
        onClick={() => {
            Modal.info({
                centered: true,
                okText: 'Got It',
                title: 'How to enable notification',
                maskClosable: 'true',
                content: (
                    <div>
                        <p>This feature works best with Chrome or Brave on Android device</p>
                        <p>This feature does not work on IOS and Safari on MacOS</p>
                        <div className='heading'>2 steps to enable notification</div>
                        <ul>
                            <li>Allow notification for the <em>browser on your device</em>.</li>
                            <li>Then allow notification for <em>sendlotus.com on your browser</em>.</li>
                        </ul>
                    </div>
                ),
            })
        }}
    />
)

const PushNotificationSetting = ({pushNotificationConfig}) => {
    const [permission, setPermission] = useState(() => getPlatformPermissionState());

    const showModal = () => {
        Modal.confirm({
            centered: true,
            title: 'Enable Notification',
            icon: <ExclamationCircleOutlined />,
            content: 'You will be prompted to grant permisson for notification, Please click "Allow"',
            okText: 'OK',
            async onOk() {
                // get user permissioin
                try {
                    await askPermission();
                } catch (error) {
                    Modal.error({
                        title: 'Error - Permision Error',
                        content: error.message
                    })
                    return;
                }
    
                // subscribe all wallets to Push Notification in interactive mode
                subscribeAllWalletsToPushNotification(pushNotificationConfig,true);
                pushNotificationConfig.turnOnPushNotification();
                setPermission(getPlatformPermissionState());

            },
        });
    }

    const handleNotificationToggle = (checked, event) => {
        if (checked) {
            if ( permission === 'granted' ) {
                subscribeAllWalletsToPushNotification(pushNotificationConfig,false);
                pushNotificationConfig.turnOnPushNotification();
            }
            else {
                showModal();
            }
        } else {
            // unsubscribe
            unsubscribeAllWalletsFromPushNotification(pushNotificationConfig);
            pushNotificationConfig.turnOffPushNotification();
        }
    }

    return (
        <GeneralSettingsItem>
            <div className="title">
                <BellFilled/> Notification
            </div>
            { pushNotificationConfig ? (
                (permission !== 'denied') ? (
                    <Switch
                        size="small"
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        checked={ pushNotificationConfig.allowPushNotification ? true : false }
                        onChange={handleNotificationToggle}
                    />
                ) : (
                    <div>
                        <Tag color="warning" icon={<ExclamationCircleFilled />}>
                            Blocked by device
                        </Tag>
                        {helpInfoIcon}
                    </div>
                )
            ) : (
                <Tag color="warning" icon={<ExclamationCircleFilled />}>
                    Not Supported
                </Tag>
            )}
        </GeneralSettingsItem>
    )
}

export default PushNotificationSetting;