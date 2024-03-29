import React from 'react';
import { LockFilled, CheckOutlined, CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Switch, Tag } from 'antd';
import { GeneralSettingsItem } from 'components/Common/Atoms';
import intl from 'react-intl-universal';

const LockAppSetting = ({authentication}) => {

    const handleAppLockToggle = (checked, e) => {
        if (checked) {
            // if there is an existing credential, that means user has registered
            // simply turn on the Authentication Required flag
            if (authentication.credentialId) {
                authentication.turnOnAuthentication();
            } else {
                // there is no existing credential, that means user has not registered
                // user need to register
                authentication.signUp();
            }
        } else {
            authentication.turnOffAuthentication();
        }
    };

    return (
        <GeneralSettingsItem>
            <div className="title">
                <LockFilled /> {intl.get('setting.LockApp')}
            </div>
            {authentication ? (
                <Switch
                    size="small"
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={
                        authentication.isAuthenticationRequired &&
                        authentication.credentialId
                            ? true
                            : false
                    }
                    // checked={false}
                    onChange={handleAppLockToggle}
                />
            ) : (
                <Tag color="warning" icon={<ExclamationCircleFilled />}>
                    {intl.get('setting.NotSupported')}
                </Tag>
            )}
        </GeneralSettingsItem>
    )
}

export default LockAppSetting;