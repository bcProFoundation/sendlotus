/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Collapse, Form, Input, Modal, Alert } from 'antd';
import {
    PlusSquareOutlined,
    WalletFilled,
    ImportOutlined,
    LockOutlined,
} from '@ant-design/icons';
import { WalletContext, AuthenticationContext } from '@utils/context';
import { StyledCollapse } from '@components/Common/StyledCollapse';
import {
    AntdFormWrapper,
    LanguageSelectDropdown
} from '@components/Common/EnhancedInputs';
import PrimaryButton, {
    SecondaryButton,
    SmartButton,
} from '@components/Common/PrimaryButton';
import {
    ThemedCopyOutlined,
    ThemedWalletOutlined,
    ThemedSettingOutlined,
} from '@components/Common/CustomIcons';
import { ReactComponent as Trashcan } from '@assets/trashcan.svg';
import { ReactComponent as Edit } from '@assets/edit.svg';
import { Event } from '@utils/GoogleAnalytics';
import ApiError from '@components/Common/ApiError';
import ResponsiveIframe from '@components/Common/ResponsiveIframe';
import { PushNotificationContext } from 'utils/context';
import { getPlatformPermissionState, subscribeAllWalletsToPushNotification, unsubscribeWalletFromPushNotification } from 'utils/pushNotification';
import PushNotificationSetting from './PushNotificationSetting';
import LockAppSetting from './LockAppSetting';
import intl from 'react-intl-universal';

const { Panel } = Collapse;

const SWRow = styled.div`
    border-radius: 3px;
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    @media (max-width: 500px) {
        flex-direction: column;
        margin-bottom: 12px;
    }
`;

const SWName = styled.div`
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    word-wrap: break-word;
    hyphens: auto;

    @media (max-width: 500px) {
        width: 100%;
        justify-content: center;
        margin-bottom: 15px;
    }

    h3 {
        font-size: 16px;
        color: ${props => props.theme.wallet.text.secondary};
        margin: 0;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const SWButtonCtn = styled.div`
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    @media (max-width: 500px) {
        width: 100%;
        justify-content: center;
    }

    button {
        cursor: pointer;

        @media (max-width: 768px) {
            font-size: 14px;
        }
    }

    svg {
        stroke: ${props => props.theme.wallet.text.secondary};
        fill: ${props => props.theme.wallet.text.secondary};
        width: 25px;
        height: 25px;
        margin-right: 20px;
        cursor: pointer;

        :first-child:hover {
            stroke: ${props => props.theme.primary};
            fill: ${props => props.theme.primary};
        }
        :hover {
            stroke: ${props => props.theme.settings.delete};
            fill: ${props => props.theme.settings.delete};
        }
    }
`;

const AWRow = styled.div`
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    h3 {
        font-size: 16px;
        display: inline-block;
        color: ${props => props.theme.wallet.text.secondary};
        margin: 0;
        text-align: left;
        font-weight: bold;
        @media (max-width: 500px) {
            font-size: 14px;
        }
    }
    h4 {
        font-size: 16px;
        display: inline-block;
        color: ${props => props.theme.primary} !important;
        margin: 0;
        text-align: right;
    }
    @media (max-width: 500px) {
        flex-direction: column;
        margin-bottom: 12px;
    }
`;

const StyledConfigure = styled.div`
    h2 {
        color: ${props => props.theme.wallet.text.primary};
        font-size: 25px;
    }
    p {
        color: ${props => props.theme.wallet.text.secondary};
    }
`;

const StyledSpacer = styled.div`
    height: 1px;
    width: 100%;
    background-color: ${props => props.theme.wallet.borders.color};
    margin: 60px 0 50px;
`;

const GeneralSettings = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    .title {
        color: ${props => props.theme.generalSettings.item.title};
    }
    .anticon {
        color: ${props => props.theme.generalSettings.item.icon};
    }
    .ant-switch {
        background-color: ${props => props.theme.generalSettings.item.icon};
        .anticon {
            color: ${props => props.theme.generalSettings.background};
        }
    }
    .ant-switch-checked {
        background-color: ${props => props.theme.primary};
    }
`;

const StyledEmbeddedQRIframeCtn = styled.div`
    height: 100%;
    width: 80%;
    margin: auto;
`;

const Configure = () => {
    const ContextValue = React.useContext(WalletContext);
    const authentication = React.useContext(AuthenticationContext);
    const pushNotificationConfig = React.useContext(PushNotificationContext);
    const { wallet, apiError } = ContextValue;

    const {
        addNewSavedWallet,
        activateWallet,
        renameWallet,
        deleteWallet,
        validateMnemonic,
        getSavedWallets,
        cashtabSettings,
        changeCashtabSettings,
    } = ContextValue;
    const [savedWallets, setSavedWallets] = useState([]);
    const [formData, setFormData] = useState({
        dirty: true,
        mnemonic: '',
    });
    const [showRenameWalletModal, setShowRenameWalletModal] = useState(false);
    const [showDeleteWalletModal, setShowDeleteWalletModal] = useState(false);
    const [walletToBeRenamed, setWalletToBeRenamed] = useState(null);
    const [walletToBeDeleted, setWalletToBeDeleted] = useState(null);
    const [newWalletName, setNewWalletName] = useState('');
    const [
        confirmationOfWalletToBeDeleted,
        setConfirmationOfWalletToBeDeleted,
    ] = useState('');
    const [newWalletNameIsValid, setNewWalletNameIsValid] = useState(null);
    const [walletDeleteValid, setWalletDeleteValid] = useState(null);
    const [seedInput, openSeedInput] = useState(false);

    const showPopulatedDeleteWalletModal = walletInfo => {
        setWalletToBeDeleted(walletInfo);
        setShowDeleteWalletModal(true);
    };

    const showPopulatedRenameWalletModal = walletInfo => {
        setWalletToBeRenamed(walletInfo);
        setShowRenameWalletModal(true);
    };
    const cancelRenameWallet = () => {
        // Delete form value
        setNewWalletName('');
        setShowRenameWalletModal(false);
    };
    const cancelDeleteWallet = () => {
        setWalletToBeDeleted(null);
        setConfirmationOfWalletToBeDeleted('');
        setShowDeleteWalletModal(false);
    };
    const updateSavedWallets = async activeWallet => {
        if (activeWallet) {
            let savedWallets;
            try {
                savedWallets = await getSavedWallets(activeWallet);
                setSavedWallets(savedWallets);
            } catch (err) {
                console.log(`Error in getSavedWallets()`);
                console.log(err);
            }
        }
    };

    const [isValidMnemonic, setIsValidMnemonic] = useState(null);

    useEffect(() => {
        // Update savedWallets every time the active wallet changes
        updateSavedWallets(wallet);
    }, [wallet]);

    // Need this function to ensure that savedWallets are updated on new wallet creation
    const updateSavedWalletsOnCreate = async importMnemonic => {
        // Event("Category", "Action", "Label")
        // Track number of times a different wallet is activated
        Event('Configure.js', 'Create Wallet', 'New');
        const walletAdded = await addNewSavedWallet(importMnemonic);
        if (!walletAdded) {
            Modal.error({
                title: 'This wallet already exists!',
                content: 'Wallet not added',
            });
        } else {
            Modal.success({
                content: 'Wallet added to your saved wallets',
            });
            
            // subscribe the new wallet to push notification if neccessary
            // in non-interactive mode
            if ( pushNotificationConfig && pushNotificationConfig.allowPushNotification && getPlatformPermissionState() === 'granted') {
                subscribeAllWalletsToPushNotification(pushNotificationConfig,false);
            }
        }
        await updateSavedWallets(wallet);
    };
    // Same here
    // TODO you need to lock UI here until this is complete
    // Otherwise user may try to load an already-loading wallet, wreak havoc with indexedDB
    const updateSavedWalletsOnLoad = async walletToActivate => {
        // Event("Category", "Action", "Label")
        // Track number of times a different wallet is activated
        Event('Configure.js', 'Activate', '');
        await activateWallet(walletToActivate);
    };

    async function submit() {
        setFormData({
            ...formData,
            dirty: false,
        });

        // Exit if no user input
        if (!formData.mnemonic) {
            return;
        }

        // Exit if mnemonic is invalid
        if (!isValidMnemonic) {
            return;
        }
        // Event("Category", "Action", "Label")
        // Track number of times a different wallet is activated
        Event('Configure.js', 'Create Wallet', 'Imported');
        updateSavedWalletsOnCreate(formData.mnemonic);
    }

    const handleChange = e => {
        const { value, name } = e.target;

        // Validate mnemonic on change
        // Import button should be disabled unless mnemonic is valid
        setIsValidMnemonic(validateMnemonic(value));

        setFormData(p => ({ ...p, [name]: value }));
    };

    const changeWalletName = async () => {
        if (newWalletName === '' || newWalletName.length > 24) {
            setNewWalletNameIsValid(false);
            return;
        }
        // Hide modal
        setShowRenameWalletModal(false);
        // Change wallet name
        console.log(
            `Changing wallet ${walletToBeRenamed.name} name to ${newWalletName}`,
        );
        const renameSuccess = await renameWallet(
            walletToBeRenamed.name,
            newWalletName,
        );

        if (renameSuccess) {
            Modal.success({
                content: intl.get('setting.RenameWalletSuccess', { walletToBeRenamed: walletToBeRenamed.name, newWalletName: newWalletName})
            });
        } else {
            Modal.error({
                content: intl.get('setting.RenameWalletFailed'),
            });
        }
        await updateSavedWallets(wallet);
        // Clear wallet name for form
        setNewWalletName('');
    };

    const deleteSelectedWallet = async () => {
        if (!walletDeleteValid && walletDeleteValid !== null) {
            return;
        }
        if (
            confirmationOfWalletToBeDeleted !== 
            `delete ${walletToBeDeleted.name}`
        ) {
            setWalletDeleteValid(false);
            return;
        }

        // Hide modal
        setShowDeleteWalletModal(false);
        // Delete wallet
        console.log(`Deleting wallet "${walletToBeDeleted.name}"`);
        const walletDeletedSuccess = await deleteWallet(walletToBeDeleted);

        if (walletDeletedSuccess) {
            Modal.success({
                content: intl.get('setting.DeleteWalletSuccess', { walletToBeDeleted: walletToBeDeleted.name })
            });
            // unsubscribe the deleted wallet from Push Notification
            unsubscribeWalletFromPushNotification(pushNotificationConfig, walletToBeDeleted);
        } else {
            Modal.error({
                content: intl.get('setting.DeleteWalletFailed', { walletToBeDeleted: walletToBeDeleted.name })
            });
        }
        await updateSavedWallets(wallet);
        // Clear wallet delete confirmation from form
        setConfirmationOfWalletToBeDeleted('');
    };

    const handleWalletNameInput = e => {
        const { value } = e.target;
        // validation
        if (value && value.length && value.length < 24) {
            setNewWalletNameIsValid(true);
        } else {
            setNewWalletNameIsValid(false);
        }

        setNewWalletName(value);
    };

    const handleWalletToDeleteInput = e => {
        const { value } = e.target;

        if (value && value === `delete ${walletToBeDeleted.name}`) {
            setWalletDeleteValid(true);
        } else {
            setWalletDeleteValid(false);
        }
        setConfirmationOfWalletToBeDeleted(value);
    };

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
        <StyledConfigure>
            {walletToBeRenamed !== null && (
                <Modal
                    title={intl.get('setting.RenameWalletTitle', { walletName: walletToBeRenamed.name })}
                    open={showRenameWalletModal}
                    onOk={changeWalletName}
                    onCancel={() => cancelRenameWallet()}
                >
                    <AntdFormWrapper>
                        <Form style={{ width: 'auto' }}>
                            <Form.Item
                                validateStatus={
                                    newWalletNameIsValid === null ||
                                    newWalletNameIsValid
                                        ? ''
                                        : 'error'
                                }
                                help={
                                    newWalletNameIsValid === null ||
                                    newWalletNameIsValid
                                        ? ''
                                        : intl.get('setting.InvalidWalletError')
                                }
                            >
                                <Input
                                    prefix={<WalletFilled />}
                                    placeholder={intl.get('setting.EnterWalletName')}
                                    name="newName"
                                    value={newWalletName}
                                    onChange={e => handleWalletNameInput(e)}
                                />
                            </Form.Item>
                        </Form>
                    </AntdFormWrapper>
                </Modal>
            )}
            {walletToBeDeleted !== null && (
                <Modal
                    title={intl.get('setting.DeleteWalletConfirmation', { walletToBeDeleted: walletToBeDeleted.name })}
                    open={showDeleteWalletModal}
                    onOk={deleteSelectedWallet}
                    onCancel={() => cancelDeleteWallet()}
                >
                    <AntdFormWrapper>
                        <Form style={{ width: 'auto' }}>
                            <Form.Item
                                validateStatus={
                                    walletDeleteValid === null ||
                                    walletDeleteValid
                                        ? ''
                                        : 'error'
                                }
                                help={
                                    walletDeleteValid === null ||
                                    walletDeleteValid
                                        ? ''
                                        : intl.get('setting.ConfirmNotMatchError')
                                }
                            >
                                <Input
                                    prefix={<WalletFilled />}
                                    placeholder={intl.get('setting.DeleteWalletConfirmation', { walletToBeDeleted: walletToBeDeleted.name })}
                                    name="walletToBeDeletedInput"
                                    value={confirmationOfWalletToBeDeleted}
                                    onChange={e => handleWalletToDeleteInput(e)}
                                />
                            </Form.Item>
                        </Form>
                    </AntdFormWrapper>
                </Modal>
            )}
            <h2>
                <ThemedCopyOutlined /> {intl.get('setting.BackupYourWallet')}
            </h2>
            <Alert
                style={{ marginBottom: '12px' }}
                description={intl.get('setting.KeepSeedPhraseWarning')}
                type="warning"
                showIcon
            />
            {wallet && wallet.mnemonic && (
                <>
                    <StyledCollapse>
                        <Panel header={intl.get('setting.SeeSeedPhrase')} key="1">
                            <p className="notranslate">
                                {wallet && wallet.mnemonic
                                    ? wallet.mnemonic
                                    : ''}
                            </p>
                        </Panel>
                    </StyledCollapse>
                    <StyledCollapse>
                        <Panel header={intl.get('setting.DownloadQRCode')} key="2">
                            <StyledEmbeddedQRIframeCtn>
                                <ResponsiveIframe
                                    src={`https://qr.sendlotus.com/embed/${wallet.Path10605.xAddress}/${wallet.name}`}
                                    ratioHeightToWidth={1.25}
                                />
                            </StyledEmbeddedQRIframeCtn>
                        </Panel>
                    </StyledCollapse>
                </>
            )}
            <StyledSpacer />
            <h2>
                <ThemedWalletOutlined /> {intl.get('setting.ManageWallets')}
            </h2>
            {apiError ? (
                <ApiError />
            ) : (
                <>
                    <PrimaryButton onClick={() => updateSavedWalletsOnCreate()}>
                        <PlusSquareOutlined /> {intl.get('setting.NewWallet')}
                    </PrimaryButton>
                    <SecondaryButton onClick={() => openSeedInput(!seedInput)}>
                        <ImportOutlined /> {intl.get('setting.ImportWallet')}
                    </SecondaryButton>
                    {seedInput && (
                        <>
                            <p>
                                {intl.get('setting.ImportMessage')}
                            </p>
                            <AntdFormWrapper>
                                <Form style={{ width: 'auto' }}>
                                    <Form.Item
                                        validateStatus={
                                            isValidMnemonic === null ||
                                            isValidMnemonic
                                                ? ''
                                                : 'error'
                                        }
                                        help={
                                            isValidMnemonic === null ||
                                            isValidMnemonic
                                                ? ''
                                                : intl.get('setting.ValidSeedPhraseRequired')
                                        }
                                    >
                                        <Input
                                            prefix={<LockOutlined />}
                                            type="email"
                                            placeholder={intl.get('setting.ImportMessage')}
                                            name="mnemonic"
                                            autoComplete="off"
                                            onChange={e => handleChange(e)}
                                            required
                                        />
                                    </Form.Item>
                                    <SmartButton
                                        disabled={!isValidMnemonic}
                                        onClick={() => submit()}
                                    >
                                        {intl.get('setting.Import')}
                                    </SmartButton>
                                </Form>
                            </AntdFormWrapper>
                        </>
                    )}
                </>
            )}
            {savedWallets && savedWallets.length > 0 && (
                <>
                    <StyledCollapse>
                        <Panel header="Saved wallets" key="3">
                            <AWRow>
                                <h3>{wallet.name}</h3>
                                <h4>{intl.get('setting.CurrentlActive')}</h4>
                            </AWRow>
                            <div>
                                {savedWallets.map(sw => (
                                    <SWRow key={sw.name}>
                                        <SWName>
                                            <h3>{sw.name}</h3>
                                        </SWName>

                                        <SWButtonCtn>
                                            <Edit
                                                onClick={() =>
                                                    showPopulatedRenameWalletModal(
                                                        sw,
                                                    )
                                                }
                                            />
                                            <Trashcan
                                                onClick={() =>
                                                    showPopulatedDeleteWalletModal(
                                                        sw,
                                                    )
                                                }
                                            />
                                            <button
                                                onClick={() =>
                                                    updateSavedWalletsOnLoad(sw)
                                                }
                                            >
                                                {intl.get('setting.Activate')}
                                            </button>
                                        </SWButtonCtn>
                                    </SWRow>
                                ))}
                            </div>
                        </Panel>
                    </StyledCollapse>
                </>
            )}
            <StyledSpacer />
            
            <h2>{intl.get('language')}</h2>
              <AntdFormWrapper>
                <LanguageSelectDropdown
                  defaultValue={intl.get(cashtabSettings.lang)}
                  value={intl.get(cashtabSettings.lang)}
                  onChange={(locale) => {
                    changeCashtabSettings('lang', locale);
                  }}
                />
              </AntdFormWrapper>
            <StyledSpacer />
            <h2>
                <ThemedSettingOutlined /> {intl.get('setting.GeneralSettings')}
            </h2>
            <GeneralSettings>
                <LockAppSetting authentication={authentication} />
                <PushNotificationSetting pushNotificationConfig={pushNotificationConfig} />
            </GeneralSettings>
        </StyledConfigure>
    );
};

export default Configure;
