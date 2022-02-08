import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import { Form, notification, message, Modal, Alert, Input, Collapse, Checkbox } from 'antd';
const { Panel } = Collapse;
const { TextArea } = Input;
import { Row, Col, Switch } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import PrimaryButton, {
    SecondaryButton,
} from '@components/Common/PrimaryButton';
import {
    SendBchInput,
    FormItemWithQRCodeAddon,
    AntdFormWrapper,
    OpReturnMessageInput
} from '@components/Common/EnhancedInputs';
import {
    AdvancedCollapse,
} from '@components/Common/StyledCollapse';
import useBCH from '@hooks/useBCH';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { isMobile, isIOS, isSafari } from 'react-device-detect';
import {
    currency,
    isValidTokenPrefix,
    parseAddress,
    toLegacy,
} from '@components/Common/Ticker.js';
import { Event } from '@utils/GoogleAnalytics';
import { fiatToCrypto, shouldRejectAmountInput } from '@utils/validation';
import BalanceHeader from '@components/Common/BalanceHeader';
import BalanceHeaderFiat from '@components/Common/BalanceHeaderFiat';
import {
    ZeroBalanceHeader,
    ConvertAmount,
    AlertMsg,
} from '@components/Common/Atoms';
import { 
    getWalletState,
    getDustXPI
} from '@utils/cashMethods';
import { 
    CashReceivedNotificationIcon,
    ThemedQuerstionCircleOutlinedFaded
} from '@components/Common/CustomIcons';
import ApiError from '@components/Common/ApiError';

const TextAreaLabel = styled.div`
    text-align: left;
    color: #0074c2;
    padding-left: 1px;
`;

const OpReturnMessageHelp = styled.div`
    margin-top: 20px;
    font-size: 12px;

    .heading {
        margin-left: -20px;
        margin-bottom: 5px;
        font-weight: bold;
    }

    ul {
        padding-left: 0;
    }

    em {
        // color: ${props => props.theme.primary} !important;
        // TODO: should be able to access the theme as above
        // but it return undefined - need to figure out what causes the error

        color: #6f2dbd !important
    }
    
`;

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

// Note jestBCH is only used for unit tests; BCHJS must be mocked for jest
const SendBCH = ({ jestBCH, passLoadingStatus }) => {
    // use balance parameters from wallet.state object and not legacy balances parameter from walletState, if user has migrated wallet
    // this handles edge case of user with old wallet who has not opened latest Cashtab version yet

    // If the wallet object from ContextValue has a `state key`, then check which keys are in the wallet object
    // Else set it as blank
    const ContextValue = React.useContext(WalletContext);
    const location = useLocation();
    const { wallet, fiatPrice, apiError, cashtabSettings } = ContextValue;

    const currentAddress = wallet && wallet.Path10605 ? wallet.Path10605.xAddress : undefined;
    const walletState = getWalletState(wallet);
    const { balances, slpBalancesAndUtxos } = walletState;

    const [opReturnMsg, setOpReturnMsg] = useState(false);
    const [isEncryptedOptionalOpReturnMsg, setIsEncryptedOptionalOpReturnMsg] =
        useState(true);
    const [bchObj, setBchObj] = useState(false);

    // Get device window width
    // If this is less than 769, the page will open with QR scanner open
    const { width } = useWindowDimensions();
    // Load with QR code open if device is mobile and NOT iOS + anything but safari
    const scannerSupported = width < 769 && isMobile && !(isIOS && !isSafari);

    const [formData, setFormData] = useState({
        dirty: true,
        value: '',
        address: '',
    });
    const [queryStringText, setQueryStringText] = useState(null);
    const [sendBchAddressError, setSendBchAddressError] = useState(false);
    const [sendBchAmountError, setSendBchAmountError] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(currency.ticker);

    // Support cashtab button from web pages
    const [txInfoFromUrl, setTxInfoFromUrl] = useState(false);

    // Show a confirmation modal on transactions created by populating form from web page button
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

    const { getBCH, getRestUrl, sendBch, calcFee } = useBCH();


    // If the balance has changed, unlock the UI
    // This is redundant, if backend has refreshed in 1.75s timeout below, UI will already be unlocked
    useEffect(() => {
        passLoadingStatus(false);
    }, [balances.totalBalance]);

    useEffect(() => {
         // jestBCH is only ever specified for unit tests, otherwise app will use getBCH();
         const BCH = jestBCH ? jestBCH : getBCH();

         // set the BCH instance to state, for other functions to reference
         setBchObj(BCH);

        // Manually parse for txInfo object on page load when Send.js is loaded with a query string

        // if this was routed from Wallet screen's Reply to message link then prepopulate the address and value field
        if (location && location.state && location.state.replyAddress) {
            setFormData({
                address: location.state.replyAddress,
                // send dust amount
                value: getDustXPI(),
            });
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

    async function submit() {
        setFormData({
            ...formData,
            dirty: false,
        });

        if (
            !formData.address ||
            !formData.value ||
            Number(formData.value) <= 0
        ) {
            return;
        }

        // Event("Category", "Action", "Label")
        // Track number of BCHA send transactions and whether users
        // are sending BCHA or USD
        Event('Send.js', 'Send', selectedCurrency);

        passLoadingStatus(true);
        const { address, value } = formData;

        // Get the param-free address
        let cleanAddress = address.split('?')[0];

        // Ensure address has bitcoincash: prefix and checksum
        // cleanAddress = toLegacy(cleanAddress);

        const isValidAddress = bchObj.Address.isXAddress(cleanAddress);
        // try {
        //     hasValidLotusPrefix = cleanAddress.startsWith(
        //         currency.legacyPrefix + ':',
        //     );
        // } catch (err) {
        //     hasValidCashPrefix = false;
        //     console.log(`toLegacy() returned an error:`, cleanAddress);
        // }

        if (!isValidAddress) {
            // set loading to false and set address validation to false
            // Now that the no-prefix case is handled, this happens when user tries to send
            // BCHA to an SLPA address
            passLoadingStatus(false);
            setSendBchAddressError(
                `Destination is not a valid ${currency.ticker} address`,
            );
            return;
        }

        // Calculate the amount in BCH
        let bchValue = value;

        // if (selectedCurrency !== 'XPI') {
        //     bchValue = fiatToCrypto(value, fiatPrice);
        // }

        // encrypted message limit truncation
        let optionalOpReturnMsg;
        if (isEncryptedOptionalOpReturnMsg) {
            optionalOpReturnMsg = opReturnMsg.substring(
                0,
                currency.opReturn.encryptedMsgByteLimit,
            );
        } else {
            optionalOpReturnMsg = opReturnMsg;
        }

        try {
            const link = await sendBch(
                bchObj,
                wallet,
                slpBalancesAndUtxos.nonSlpUtxos,
                cleanAddress,
                bchValue,
                currency.defaultFee,
                optionalOpReturnMsg,
                isEncryptedOptionalOpReturnMsg,
            );

            notification.success({
                message: 'Success',
                description: (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        <Paragraph>
                            Transaction successful. Click to view in block
                            explorer.
                        </Paragraph>
                    </a>
                ),
                duration: 3,
                icon: <CashReceivedNotificationIcon />,
                style: { width: '100%' },
            });

            // redirect to wallet page
        } catch (e) {
            // Set loading to false here as well, as balance may not change depending on where error occured in try loop
            passLoadingStatus(false);
            let message;

            if (!e.error && !e.message) {
                message = `Transaction failed: no response from ${getRestUrl()}.`;
            } else if (
                /Could not communicate with full node or other external service/.test(
                    e.error,
                )
            ) {
                message = 'Could not communicate with API. Please try again.';
            } else if (
                e.error &&
                e.error.includes(
                    'too-long-mempool-chain, too many unconfirmed ancestors [limit: 50] (code 64)',
                )
            ) {
                message = `The ${currency.ticker} you are trying to send has too many unconfirmed ancestors to send (limit 50). Sending will be possible after a block confirmation. Try again in about 10 minutes.`;
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

    const handleAddressChange = e => {
        const { value, name } = e.target;
        let error = false;
        let addressString = value;

        // parse address
        const addressInfo = parseAddress(bchObj, addressString);
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
            error = `Invalid ${currency.ticker} address`;
            // If valid address but token format
            if (isValidTokenPrefix(address)) {
                error = `Token addresses are not supported for ${currency.ticker} sends`;
            }
        }
        setSendBchAddressError(error);

        // Is this address same with my address?
        if (currentAddress && address && address === currentAddress) {
            setSendBchAddressError(
                'Cannot send to yourself!'
            );
        }

        // Set amount if it's in the query string
        if (amount !== null) {
            // Set currency to BCHA
            setSelectedCurrency(currency.ticker);

            // Use this object to mimic user input and get validation for the value
            let amountObj = {
                target: {
                    name: 'value',
                    value: amount,
                },
            };
            handleBchAmountChange(amountObj);
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
        // Clear input field to prevent accidentally sending 1 BCH instead of 1 USD
        setFormData(p => ({
            ...p,
            value: '',
        }));
    };

    const handleBchAmountChange = e => {
        const { value, name } = e.target;
        let bchValue = value;
        const error = shouldRejectAmountInput(
            bchValue,
            selectedCurrency,
            fiatPrice,
            balances.totalBalance,
        );
        setSendBchAmountError(error);

        setFormData(p => ({
            ...p,
            [name]: value,
        }));
    };

    const onMax = async () => {
        // Clear amt error
        setSendBchAmountError(false);
        // Set currency to BCH
        setSelectedCurrency(currency.ticker);
        try {
            const txFeeSats = calcFee(bchObj, slpBalancesAndUtxos.nonSlpUtxos);

            const txFeeBch = txFeeSats / 10 ** currency.cashDecimals;
            let value =
                balances.totalBalance - txFeeBch >= 0
                    ? (balances.totalBalance - txFeeBch).toFixed(
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
                'Unable to calculate the max value due to network errors',
            );
        }
    };
    // Display price in USD below input field for send amount, if it can be calculated
    let fiatPriceString = '';
    if (fiatPrice !== null && !isNaN(formData.value)) {
        if (selectedCurrency === currency.ticker) {
            fiatPriceString = `${
                cashtabSettings
                    ? `${
                          currency.fiatCurrencies[cashtabSettings.fiatCurrency]
                              .symbol
                      } `
                    : '$ '
            } ${(fiatPrice * Number(formData.value)).toFixed(2)} ${
                cashtabSettings && cashtabSettings.fiatCurrency
                    ? cashtabSettings.fiatCurrency.toUpperCase()
                    : 'USD'
            }`;
        } else {
            fiatPriceString = `${
                formData.value ? fiatToCrypto(formData.value, fiatPrice) : '0'
            } ${currency.ticker}`;
        }
    }

    const priceApiError = fiatPrice === null && selectedCurrency !== 'XEC';

    // Help (?) Icon that shows the OP_RETURN info
    const helpInfoIcon = (
        <ThemedQuerstionCircleOutlinedFaded 
            onClick={() => {
                Modal.info({
                    centered: true,
                    okText: 'Got It',
                    title: 'Optional Message',
                    maskClosable: 'true',
                    content: (
                        <OpReturnMessageHelp>
                            <div className='heading'>Higher Fee</div>
                            <ul>
                                <li>Transaction with attached message will incur <em>higher fee.</em></li>
                            </ul>
                            <div className='heading'>Encryption</div>
                            <ul>
                                <li><em>Un-encrypted message is readable to everybody.</em></li>
                                <li>Encrypted message is only readable to the intended recipient.</li>
                                <li>Encrypted message can only be sent to wallets with at least 1 outgoing transaction.</li>
                            </ul>
                            <div className='heading'>Message Length</div>
                            <ul>
                                <li>Depending on your language, <em>each character may occupy from 1 to 4 bytes.</em></li>
                                <li>Un-encrypted message max length is 215 bytes.</li>
                                <li>Encrypted message max length is 94 bytes.</li>
                            </ul>
                        </OpReturnMessageHelp>
                    ),
                })
            }}
        />
    )

    // Encrypted Checkbox UI
    const encryptedCheckbox = (
        <div>
            encrypted &nbsp;
            <StyledCheckbox
                checked={
                    isEncryptedOptionalOpReturnMsg
                }
                onChange={() =>
                    setIsEncryptedOptionalOpReturnMsg(
                        prev => !prev,
                    )
                }
            />
        </div>
    );

    // Label for OP_RETURN message textarea
    const opReturnLabel = (
        <div
            css={`
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-left: 5px;
            `}
        >
            {helpInfoIcon}
            {encryptedCheckbox}
        </div>
    );

    // Only Send Mesage Checkbox
    const sendOnlyMessageCheckbox = (
        <div
            css={`
                text-align: right;
            `}
        >
            send only message &nbsp;
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

    return (
        <>
            <Modal
                title="Confirm Send"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>
                    Are you sure you want to send {formData.value}{' '}
                    {currency.ticker} to {formData.address}?
                </p>
            </Modal>
            {!balances.totalBalance ? (
                <ZeroBalanceHeader>
                    You currently have 0 {currency.ticker}
                    <br />
                    Deposit some funds to use this feature
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
                        <FormItemWithQRCodeAddon
                                style={{
                                    margin: '0 0 10px 0'
                                }}
                            loadWithCameraOpen={scannerSupported}
                            validateStatus={sendBchAddressError ? 'error' : ''}
                            help={
                                sendBchAddressError ? sendBchAddressError : ''
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
                                placeholder: `${currency.ticker} Address`,
                                name: 'address',
                                onChange: e => handleAddressChange(e),
                                required: true,
                                value: formData.address,
                            }}
                        ></FormItemWithQRCodeAddon>
                        {sendOnlyMessageCheckbox}
                        <SendBchInput
                            style={{
                                margin: '0 0 10px 0'
                            }}
                            activeFiatCode={
                                cashtabSettings && cashtabSettings.fiatCurrency
                                    ? cashtabSettings.fiatCurrency.toUpperCase()
                                    : 'USD'
                            }
                            validateStatus={sendBchAmountError ? 'error' : ''}
                            help={sendBchAmountError ? sendBchAmountError : ''}
                            onMax={onMax}
                            inputProps={{
                                name: 'value',
                                dollar: selectedCurrency === 'USD' ? 1 : 0,
                                placeholder: 'Amount',
                                onChange: e => handleBchAmountChange(e),
                                required: true,
                                value: formData.value,
                            }}
                            selectProps={{
                                value: selectedCurrency,
                                disabled: queryStringText !== null,
                                onChange: e => handleSelectedCurrencyChange(e),
                            }}
                        ></SendBchInput>
                        {/* OP_RETURN message */}
                        <OpReturnMessageInput
                             style={{
                                margin: '0 0 20px 0'
                            }}
                            name="opReturnMsg"
                            allowClear={true}
                            autoSize={{minRows: 2, maxRows: 4}}
                            placeholder="Optional Message"
                            value={
                                opReturnMsg
                                    ? isEncryptedOptionalOpReturnMsg
                                        ? opReturnMsg.substring(0,currency.opReturn.encryptedMsgByteLimit)
                                        : opReturnMsg
                                    : ''
                            }
                            onChange={msg => setOpReturnMsg(msg)}
                            maxByteLength={
                                isEncryptedOptionalOpReturnMsg
                                    ? currency.opReturn
                                            .encryptedMsgByteLimit
                                    : currency.opReturn
                                            .unencryptedMsgByteLimit
                            }
                            label={opReturnLabel} 
                        />     
                        {/* END OF OP_RETURN message */}
                        <div>
                            {!balances.totalBalance ||
                            apiError ||
                            sendBchAmountError ||
                            sendBchAddressError ? (
                                    <PrimaryButton>Send</PrimaryButton>
                            ) : (
                                <>
                                    {txInfoFromUrl ? (
                                        <PrimaryButton
                                            onClick={() => showModal()}
                                        >
                                            Send
                                        </PrimaryButton>
                                    ) : (
                                        <PrimaryButton onClick={() => submit()}>
                                            Send
                                        </PrimaryButton>
                                    )}
                                </>
                            )}
                        </div>
                        {queryStringText && (
                            <Alert
                                message={`You are sending a transaction to an address including query parameters "${queryStringText}." Only the "amount" parameter, in units of ${currency.ticker} satoshis, is currently supported.`}
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

SendBCH.defaultProps = {
    passLoadingStatus: status => {
        console.log(status);
    },
};

SendBCH.propTypes = {
    jestBCH: PropTypes.object,
    passLoadingStatus: PropTypes.func,
};

export default SendBCH;
