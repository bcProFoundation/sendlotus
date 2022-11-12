import React, {useState} from 'react';
import { BellFilled, CheckOutlined, CloseOutlined, ExclamationCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { Switch, Tag, Modal } from 'antd';
import { askPermission, getPlatformPermissionState, subscribeAllWalletsToPushNotification, unsubscribeAllWalletsFromPushNotification } from 'utils/pushNotification';
import { GeneralSettingsItem } from 'components/Common/Atoms';
import { ThemedQuerstionCircleOutlinedFaded } from 'components/Common/CustomIcons';
import intl from 'react-intl-universal';

// Help (?) Icon that shows info
const helpInfoIcon = (
    <ThemedQuerstionCircleOutlinedFaded
        onClick={() => {
            Modal.info({
                centered: true,
                okText: intl.get('setting.GotIt'),
                title: intl.get('setting.HowEnableNotification'),
                maskClosable: 'true',
                content: (
                    <div>
                        <p>{intl.get('setting.DeviceSupport')}</p>
                        <p>{intl.get('setting.NotSupportIos')}</p>
                        <div className='heading'>{intl.get('setting.TwoStepEnableNotification')}</div>
                        <ul>
                            <li>{intl.get('setting.AllowNotification')}<em>{intl.get('setting.ForBrowser')}</em>.</li>
                            <li>{intl.get('setting.ThenAllowNotification')}<em>{intl.get('setting.SendlotusOnBrower')}</em>.</li>
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
            title: intl.get('setting.EnableNotification'),
            icon: <ExclamationCircleOutlined />,
            content: intl.get('setting.GrantPermisson'),
            okText: intl.get('setting.OK'),
            async onOk() {
                // get user permissioin
                try {
                    await askPermission();
                } catch (error) {
                    Modal.error({
                        title: intl.get('setting.PermisionError'),
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
                <BellFilled/> {intl.get('setting.Notification')}
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
                        {intl.get('setting.BlockedDevice')}
                        </Tag>
                        {helpInfoIcon}
                    </div>
                )
            ) : (
                <Tag color="warning" icon={<ExclamationCircleFilled />}>
                    {intl.get('setting.NotSupported')}
                </Tag>
            )}
        </GeneralSettingsItem>
    )
}

export default PushNotificationSetting;