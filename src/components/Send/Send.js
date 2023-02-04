import React, { useState, useEffect } from 'react';
import {
    useLocation,
    useHistory
} from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import { Form, notification, message, Modal, Alert, Checkbox } from 'antd';
import { Row, Col } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import PrimaryButton from '@components/Common/PrimaryButton';
import {
    SendXpiInput,
    FormItemWithQRCodeAddon,
    OpReturnMessageInput
} from '@components/Common/EnhancedInputs';
import {
    currency,
    isValidTokenPrefix,
    parseAddress,
} from '@components/Common/Ticker.js';
import { Event } from '@utils/GoogleAnalytics';
import { shouldRejectAmountInput } from '@utils/validation';
import BalanceHeader from '@components/Common/BalanceHeader';
import {
    ZeroBalanceHeader,
} from '@components/Common/Atoms';
import {
    getWalletState,
    getDustXPI,
    getUtxoWif,
} from '@utils/cashMethods';
import {
    CashReceivedNotificationIcon,
} from '@components/Common/CustomIcons';
import ApiError from '@components/Common/ApiError';
import { createSharedKey, encrypt } from 'utils/encryption';
import { PushNotificationContext } from 'utils/context';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { askPermission, subscribeAllWalletsToPushNotification } from 'utils/pushNotification';
import intl from 'react-intl-universal';
import useXPI from '@hooks/useXPI';
import {
    selectAllPaths
} from '@utils/chronik';

const StyledCheckbox = styled(Checkbox)`
    .ant-checkbox-inner {
        background-color: #fff !important;
        border: 1px solid ${props => props.theme.forms.border} !important
    }

    .ant-checkbox-checked .ant-checkbox-inner::after {
        position: absolute;
        display: table;
        border: 2px solid ${props => props.theme.primary};
        border-top: 0;
        border-left: 0;
        transform: rotate(45deg) scale(1) translate(-50%, -50%);
        opacity: 1;
        transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
        content: ' ';
    }
`

// Note jestXPI is only used for unit tests; XPIJS must be mocked for jest
const SendXPI = ({ jestXPI, passLoadingStatus }) => {
    // use balance parameters from wallet.state object and not legacy balances parameter from walletState, if user has migrated wallet
    // this handles edge case of user with old wallet who has not opened latest Cashtab version yet

    // If the wallet object from ContextValue has a `state key`, then check which keys are in the wallet object
    // Else set it as blank
    const ContextValue = React.useContext(WalletContext);
    const pushNotificationConfig = React.useContext(PushNotificationContext);
    const location = useLocation();
    const history = useHistory();
    const { XPI, chronik, wallet, fiatPrice, apiError, refresh } = ContextValue;

    const currentAddress = wallet && wallet.Path10605 ? wallet.Path10605.xAddress : undefined;
    const walletState = getWalletState(wallet);
    const { balances, slpBalancesAndUtxos } = walletState;

    const [isOpReturnMsgDisabled, setIsOpReturnMsgDisabled] = useState(true);
    const [recipientPubKeyHex, setRecipientPubKeyHex] = useState(false);
    const [recipientPubKeyWarning, setRecipientPubKeyWarning] = useState(false);
    const [opReturnMsg, setOpReturnMsg] = useState(false);
    const [isEncryptedOptionalOpReturnMsg, setIsEncryptedOptionalOpReturnMsg] = useState(true);
    const [xpiObj, setXpiObj] = useState(false);
    const allWalletPaths = selectAllPaths(wallet)
    const [formData, setFormData] = useState({
        dirty: true,
        value: '',
        address: '',
    });
    const [queryStringText, setQueryStringText] = useState(null);
    const [sendXpiAddressError, setSendXpiAddressError] = useState(false);
    const [sendXpiAmountError, setSendXpiAmountError] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(currency.ticker);

    // Support cashtab button from web pages
    const [txInfoFromUrl, setTxInfoFromUrl] = useState(false);

    // Show a Modal.ation modal on transactions created by populating form from web page button
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        submit();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const { getXPI, getRestUrl, sendXpi, calcFee } = useXPI();


    // If the balance has changed, unlock the UI
    // This is redundant, if backend has refreshed in 1.75s timeout below, UI will already be unlocked
    useEffect(() => {
        passLoadingStatus(false);
    }, [balances.totalBalance]);

    useEffect(async () => {
        // jestXPI is only ever specified for unit tests, otherwise app will use getXPI();
        const XPI = jestXPI ? jestXPI : getXPI();

        // set the XPI instance to state, for other functions to reference
        setXpiObj(XPI);

        // Manually parse for txInfo object on page load when Send.js is loaded with a query string

        // if this was routed from Wallet screen's Reply to message link then prepopulate the address and value field
        if (location && location.state && location.state.replyAddress) {
            setFormData({
                address: location.state.replyAddress,
                // send dust amount
                value: getDustXPI(),
            });
            await fetchRecipientPublicKey(XPI, location.state.replyAddress);
        }

        // Do not set txInfo in state if query strings are not present
        if (
            !window.location ||
            !window.location.hash ||
            window.location.hash === '#/send'
        ) {
            return;
        }

        const txInfoArr = window.location.hash.split('?')[1].split('&');

        // Iterate over this to create object
        const txInfo = {};
        for (let i = 0; i < txInfoArr.length; i += 1) {
            let txInfoKeyValue = txInfoArr[i].split('=');
            let key = txInfoKeyValue[0];
            let value = txInfoKeyValue[1];
            txInfo[key] = value;
        }
        console.log(`txInfo from page params`, txInfo);
        setTxInfoFromUrl(txInfo);
        populateFormsFromUrl(txInfo);
    }, []);

    function populateFormsFromUrl(txInfo) {
        if (txInfo && txInfo.address && txInfo.value) {
            setFormData({
                address: txInfo.address,
                value: txInfo.value,
            });
        }
    }

    const encryptOpReturnMsg = (
        privateKeyWIF,
        recipientPubKeyHex,
        plainTextMsg,
    ) => {
        let encryptedMsg;
        try {
            const sharedKey = createSharedKey(privateKeyWIF, recipientPubKeyHex);
            encryptedMsg = encrypt(sharedKey, Uint8Array.from(Buffer.from(plainTextMsg)));

        } catch (err) {
            console.log(`SendXPI.encryptOpReturnMsg() error: ` + err);
            throw err;
        }

        return encryptedMsg;
    };

    const showPushNotificationPromptModal = () => {
        Modal.confirm({
            centered: true,
            title: intl.get('send.PushNotificationTitle'),
            icon: <ExclamationCircleOutlined />,
            content: intl.get('send.PushNotificationConfirmation'),
            okText: intl.get('send.Yes'),
            cancelText: intl.get('send.No'),
            async onOk() {
                // get user permissioin
                try {
                    await askPermission();
                } catch (error) {
                    if (error.message.includes('permission denied')) {
                        // turn off so that it will not ask for permission next time
                        pushNotificationConfig.turnOffPushNotification();
                    }
                    Modal.error({
                        title: intl.get('send.PermisionError'),
                        content: error.message
                    })
                    return;
                }

                // subscribe all wallets to Push Notification in interactive mode
                subscribeAllWalletsToPushNotification(pushNotificationConfig, true);
            },
            onCancel() {
                pushNotificationConfig.turnOffPushNotification();
            },
            afterClose() {
                history.push("/");
            },
        });
    }

    async function submit() {
        setFormData({
            ...formData,
            dirty: false
        });

        if (!formData.address || !formData.value || Number(formData.value) <= 0) {
            return;
        }

        const { address, value } = formData;

        // Get the param-free address
        let cleanAddress = address.split('?')[0];
        const isValidAddress = XPI.Address.isXAddress(cleanAddress);
        if (!isValidAddress) {
            setSendXpiAddressError(`Destination is not a valid XPI address`);
            return;
        }
        try {
            const allWalletPaths = selectAllPaths(wallet);
            const nonSlpUtxos = slpBalancesAndUtxos.nonSlpUtxos.filter(x => x.address == wallet.Path10605.xAddress);
            if (!nonSlpUtxos.length) {
                setSendXpiAddressError(`Not enough fund`);
                return;
            }
            const fundingWif = getUtxoWif(nonSlpUtxos[0], allWalletPaths);

            // only use path 10605 incase sending message
            const sendNonSlpUtxos = isEncryptedOptionalOpReturnMsg && opReturnMsg ? nonSlpUtxos : slpBalancesAndUtxos.nonSlpUtxos;

            const link = await sendXpi(
                XPI,
                chronik,
                allWalletPaths,
                sendNonSlpUtxos,
                currency.defaultFee,
                opReturnMsg,
                false, // indicate send mode is one to one
                null,
                cleanAddress,
                value,
                isEncryptedOptionalOpReturnMsg,
                fundingWif
            );

            notification.success({
                message: 'Success',
                description: (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        <Paragraph>
                            {intl.get('send.TransactionSuccessful')}
                        </Paragraph>
                    </a>
                ),
                duration: 3,
                icon: <CashReceivedNotificationIcon />,
                style: { width: '100%' },
            });

            passLoadingStatus(false);
            // update the wallet the get the new utxos 1s after sending
            setTimeout(refresh, 1000);
            // if Push Notification is not supported, pushNotificationConfig will be null
            // The allowPushNotification property value can be undefined, null, true, false
            // undefined & null mean config has not been set
            if (pushNotificationConfig && (pushNotificationConfig.allowPushNotification === undefined || pushNotificationConfig.allowPushNotification === null)) {
                showPushNotificationPromptModal();
            } else {
                // redirect to wallet home page
                history.push('/');
            }
        } catch (e) {
            // Set loading to false here as well, as balance may not change depending on where error occured in try loop
            passLoadingStatus(false);
            let message;

            if (!e.error && !e.message) {
                message = intl.get('send.TransactionFail', { restUrl: getRestUrl() });
            } else if (
                /Could not communicate with full node or other external service/.test(
                    e.error,
                )
            ) {
                message = intl.get('send.CouldNotCommunicateWithAPI');
            } else if (
                e.error &&
                e.error.includes(
                    'too-long-mempool-chain, too many unModal.ed ancestors [limit: 50] (code 64)',
                )
            ) {
                message = intl.get('send.TooManyUnModalMessage', { ticker: currency.ticker });
            } else {
                message = e.message || e.error || JSON.stringify(e);
            }

            notification.error({
                message: 'Error',
                description: message,
                duration: 5,
            });
            console.error(e);
        }
    }

    const fetchRecipientPublicKey = async (XPI, recipientAddress) => {
        let recipientPubKey;
        try {
            // see https://api.fullstack.cash/docs/#api-Encryption-Get_encryption_key_for_xpi_address
            // if successful, returns
            // { 
            //   success: true,
            //   publicKey: hex string
            // }
            // if Address only has incoming transaction but NO outgoing transaction, returns
            // { 
            //   success: false,
            //   publicKey: "not found"
            // }
            recipientPubKey = await XPI.encryption.getPubKey(recipientAddress);
        } catch (err) {
            console.log(`SendXPI.handleAddressChange() error: ` + err);
            recipientPubKey = {
                success: false,
                error: 'fetch error - exception thrown'
            }
        }
        const { success, publicKey } = recipientPubKey;
        if (success) {
            setRecipientPubKeyHex(publicKey);
            setIsOpReturnMsgDisabled(false);
            setRecipientPubKeyWarning(false);
        } else {
            setRecipientPubKeyHex(false);
            setIsOpReturnMsgDisabled(true);
            if (publicKey && publicKey === 'not found') {
                setRecipientPubKeyWarning(intl.get('send.CanNotSendMessage'));
            } else {
                setRecipientPubKeyWarning(intl.get('send.NewAddressWarning'));
            }
        }
    }

    const handleAddressChange = async e => {
        const { value, name } = e.target;
        let error = false;
        let addressString = value;

        // parse address
        const addressInfo = parseAddress(xpiObj, addressString);
        /*
        Model

        addressInfo = 
        {
            address: '',
            isValid: false,
            queryString: '',
            amount: null,
        };
        */

        const { address, isValid, queryString, amount } = addressInfo;

        // If query string,
        // Show an alert that only amount and currency.ticker are supported
        setQueryStringText(queryString);

        // Is this valid address?
        if (!isValid) {
            error = intl.get('send.InvalidAddress', { ticker: currency.ticker });
        }

        // If valid address but token format
        if (isValidTokenPrefix(address)) {
            error = intl.get('send.NotSupportAddress', { ticker: currency.ticker });
        }

        // Is this address same with my address?
        if (currentAddress && address && address === currentAddress) {
            error = intl.get('send.CannotSendToYourself');
        }

        setSendXpiAddressError(error);

        // if the address is correct
        // attempt the fetch the public key assocciated with this address
        if (!error) {
            fetchRecipientPublicKey(xpiObj, address);
        }

        // Set amount if it's in the query string
        if (amount !== null) {
            // Set currency to XPI
            setSelectedCurrency(currency.ticker);

            // Use this object to mimic user input and get validation for the value
            let amountObj = {
                target: {
                    name: 'value',
                    value: amount,
                },
            };
            handleXpiAmountChange(amountObj);
            setFormData({
                ...formData,
                value: amount,
            });
        }

        // Set address field to user input
        setFormData(p => ({
            ...p,
            [name]: value,
        }));
    };

    const handleSelectedCurrencyChange = e => {
        setSelectedCurrency(e);
        // Clear input field to prevent accidentally sending 1 XPI instead of 1 USD
        setFormData(p => ({
            ...p,
            value: '',
        }));
    };

    const handleXpiAmountChange = e => {
        const { value, name } = e.target;
        let xpiValue = value;
        const error = shouldRejectAmountInput(
            xpiValue,
            selectedCurrency,
            fiatPrice,
            balances.totalBalance,
        );
        setSendXpiAmountError(error);

        setFormData(p => ({
            ...p,
            [name]: value,
        }));
    };

    const onMax = async () => {
        // Clear amt error
        setSendXpiAmountError(false);
        // Set currency to XPI
        setSelectedCurrency(currency.ticker);
        try {
            const txFeeSats = calcFee(xpiObj, slpBalancesAndUtxos.nonSlpUtxos);

            const txFeeXpi = txFeeSats / 10 ** currency.cashDecimals;
            let value =
                balances.totalBalance - txFeeXpi >= 0
                    ? (balances.totalBalance - txFeeXpi).toFixed(
                        currency.cashDecimals,
                    )
                    : 0;

            setFormData({
                ...formData,
                value,
            });
        } catch (err) {
            console.log(`Error in onMax:`);
            console.log(err);
            message.error(
                intl.get('send.UnableCalculateMaxValue'),
            );
        }
    };

    // Only Send Mesage Checkbox
    const sendOnlyMessageCheckbox = (
        <div
            css={`
                text-align: right;
            `}
        >
            {intl.get('send.SendOnlyMessage')} &nbsp;
            <StyledCheckbox
                defaultChecked={false}
                onChange={() =>
                    setFormData({
                        ...formData,
                        value: getDustXPI(),
                    })
                }
            />
        </div>
    );

    const computeOpReturnMsgMaxByteLength = () => {
        const maxOpReturnLimit = (
            isEncryptedOptionalOpReturnMsg
                ? currency.opReturn.encryptedMsgByteLimit
                : currency.opReturn.unencryptedMsgByteLimit
        );

        return maxOpReturnLimit
    }

    return (
        <>
            <Modal
                title="Modal. Send"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>
                    {intl.get('send.HaveZeroTicker', { formDataValue: formData.value, ticker: currency.ticker, formDataAddress: formData.address })}
                </p>
            </Modal>
            {!balances.totalBalance ? (
                <ZeroBalanceHeader>
                    {intl.get('send.HaveZeroTicker', { ticker: currency.ticker })}
                    <br />
                    {intl.get('send.DepositFund')}
                </ZeroBalanceHeader>
            ) : (
                <>
                    <BalanceHeader
                        balance={balances.totalBalance}
                        ticker={currency.ticker}
                    />
                </>
            )}

            <Row type="flex">
                <Col span={24}>
                    <Form
                        style={{
                            width: 'auto',
                        }}
                    >
                        {recipientPubKeyWarning &&
                            <Alert
                                style={{
                                    margin: '0 0 10px 0'
                                }}
                                message={recipientPubKeyWarning}
                                type="warning"
                                showIcon
                            />
                        }
                        <FormItemWithQRCodeAddon
                            style={{
                                margin: '0 0 10px 0'
                            }}
                            loadWithCameraOpen={false}
                            validateStatus={sendXpiAddressError ? 'error' : ''}
                            help={
                                sendXpiAddressError ? sendXpiAddressError : ''
                            }
                            onScan={result =>
                                handleAddressChange({
                                    target: {
                                        name: 'address',
                                        value: result,
                                    },
                                })
                            }
                            codeType='address'
                            inputProps={{
                                placeholder: intl.get('send.TickerAddress', { ticker: currency.ticker }),
                                name: 'address',
                                onChange: e => handleAddressChange(e),
                                required: true,
                                value: formData.address,
                            }}
                        ></FormItemWithQRCodeAddon>
                        {sendOnlyMessageCheckbox}
                        <SendXpiInput
                            style={{
                                margin: '0 0 10px 0'
                            }}

                            validateStatus={sendXpiAmountError ? 'error' : ''}
                            help={sendXpiAmountError ? sendXpiAmountError : ''}
                            onMax={onMax}
                            inputProps={{
                                name: 'value',
                                dollar: selectedCurrency === 'USD' ? 1 : 0,
                                placeholder: intl.get('send.Amount'),
                                onChange: e => handleXpiAmountChange(e),
                                required: true,
                                value: formData.value,
                            }}
                            selectProps={{
                                value: selectedCurrency,
                                disabled: queryStringText !== null,
                                onChange: e => handleSelectedCurrencyChange(e),
                            }}
                        ></SendXpiInput>
                        {/* OP_RETURN message */}
                        <OpReturnMessageInput
                            style={{
                                margin: '0 0 25px 0',
                            }}
                            name="opReturnMsg"
                            placeholder={intl.get('send.OptionalPrivateMessage')}
                            disabled={isOpReturnMsgDisabled}
                            value={
                                opReturnMsg
                                    ? isEncryptedOptionalOpReturnMsg
                                        ? opReturnMsg.substring(0, currency.opReturn.encryptedMsgByteLimit)
                                        : opReturnMsg
                                    : ''
                            }
                            onChange={msg => setOpReturnMsg(msg)}
                            maxByteLength={computeOpReturnMsgMaxByteLength()}
                            labelTop={null}
                            labelBottom={null}
                        />
                        {/* END OF OP_RETURN message */}
                        <div>
                            {!balances.totalBalance ||
                                apiError ||
                                sendXpiAmountError ||
                                sendXpiAddressError ? (
                                <PrimaryButton>{intl.get('send.SendButton')}</PrimaryButton>
                            ) : (
                                <>
                                    {txInfoFromUrl ? (
                                        <PrimaryButton
                                            onClick={() => showModal()}
                                        >
                                            {intl.get('send.SendButton')}
                                        </PrimaryButton>
                                    ) : (
                                        <PrimaryButton onClick={() => submit()}>
                                            {intl.get('send.SendButton')}
                                        </PrimaryButton>
                                    )}
                                </>
                            )}
                        </div>
                        {queryStringText && (
                            <Alert
                                message={intl.get('send.AlertQueryParam', { queryStringText: queryStringText, ticker: currency.ticker, })}
                                type="warning"
                            />
                        )}
                        {apiError && <ApiError />}
                    </Form>
                </Col>
            </Row>
        </>
    );
};

/*
passLoadingStatus must receive a default prop that is a function
in order to pass the rendering unit test in Send.test.js

status => {console.log(status)} is an arbitrary stub function
*/

SendXPI.defaultProps = {
    passLoadingStatus: status => {
        console.log(status);
    },
};

SendXPI.propTypes = {
    jestXPI: PropTypes.object,
    passLoadingStatus: PropTypes.func,
};

export default SendXPI;
