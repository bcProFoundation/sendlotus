import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Select } from 'antd';
import {
    ThemedDollarOutlined,
    ThemedWalletOutlined,
} from '@components/Common/CustomIcons';
import { LockOutlined } from '@ant-design/icons';
import styled, { css } from 'styled-components';
import ScanQRCode from './ScanQRCode';
import useBCH from '@hooks/useBCH';
import { currency } from '@components/Common/Ticker.js';

export const AntdFormCss = css`
    .ant-input-group-addon {
        background-color: ${props =>
        props.theme.forms.addonBackground} !important;
        border: 1px solid ${props => props.theme.forms.border};
        color: ${props => props.theme.forms.addonForeground} !important;
    }
    input.ant-input,
    .ant-select-selection {
        background-color: ${props =>
        props.theme.forms.selectionBackground} !important;
        box-shadow: none !important;
        border-radius: 4px;
        font-weight: bold;
        color: ${props => props.theme.forms.text};
        opacity: 1;
        height: 50px;
    }
    .ant-input-affix-wrapper {
        background-color: ${props => props.theme.forms.selectionBackground};
        border: 1px solid ${props => props.theme.wallet.borders.color} !important;
    }
    .ant-select-selector {
        height: 60px !important;
        border: 1px solid ${props => props.theme.wallet.borders.color} !important;
    }
    .ant-form-item-has-error
        > div
        > div.ant-form-item-control-input
        > div
        > span
        > span
        > span.ant-input-affix-wrapper {
        background-color: ${props => props.theme.forms.selectionBackground};
        border-color: ${props => props.theme.forms.error} !important;
    }

    .ant-form-item-has-error .ant-input,
    .ant-form-item-has-error .ant-input-affix-wrapper,
    .ant-form-item-has-error .ant-input:hover,
    .ant-form-item-has-error .ant-input-affix-wrapper:hover {
        background-color: ${props => props.theme.forms.selectionBackground};
        border-color: ${props => props.theme.forms.error} !important;
    }

    .ant-form-item-has-error
        .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input)
        .ant-select-selector {
        background-color: ${props => props.theme.forms.selectionBackground};
        border-color: ${props => props.theme.forms.error} !important;
    }
    .ant-select-single .ant-select-selector .ant-select-selection-item,
    .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
        line-height: 60px;
        text-align: left;
        color: ${props => props.theme.forms.text};
        font-weight: bold;
    }
    .ant-form-item-has-error .ant-input-group-addon {
        color: ${props => props.theme.forms.error} !important;
        border-color: ${props => props.theme.forms.error} !important;
    }
    .ant-form-item-explain.ant-form-item-explain-error {
        color: ${props => props.theme.forms.error} !important;
    }
`;

export const AntdFormWrapper = styled.div`
    ${AntdFormCss}
`;

export const InputAddonText = styled.span`
    width: 100%;
    height: 100%;
    display: block;

    ${props =>
        props.disabled
            ? `
      cursor: not-allowed;
      `
            : `cursor: pointer;`}
`;

export const InputNumberAddonText = styled.span`
    background-color: ${props => props.theme.forms.addonBackground} !important;
    border: 1px solid ${props => props.theme.forms.border};
    color: ${props => props.theme.forms.addonForeground} !important;
    height: 50px;
    line-height: 47px;

    * {
        color: ${props => props.theme.forms.addonForeground} !important;
    }
    ${props =>
        props.disabled
            ? `
      cursor: not-allowed;
      `
            : `cursor: pointer;`}
`;

export const SendBchInput = ({
    onMax,
    inputProps,
    selectProps,
    activeFiatCode,
    ...otherProps
}) => {
    const { Option } = Select;
    const currencies = [
        {
            value: currency.ticker,
            label: currency.ticker,
        }
        // {
        //     value: activeFiatCode ? activeFiatCode : 'USD',
        //     label: activeFiatCode ? activeFiatCode : 'USD',
        // },
    ];
    const currencyOptions = currencies.map(currency => {
        return (
            <Option
                key={currency.value}
                value={currency.value}
                className="selectedCurrencyOption"
            >
                {currency.label}
            </Option>
        );
    });

    const CurrencySelect = (
        <Select
            defaultValue={currency.ticker}
            className="select-after"
            style={{ width: '25%' }}
            {...selectProps}
        >
            {currencyOptions}
        </Select>
    );
    return (
        <AntdFormWrapper>
            <Form.Item {...otherProps}>
                <Input.Group compact>
                    <Input
                        style={{ width: '58%', textAlign: 'left' }}
                        type="number"
                        step={
                            inputProps.dollar === 1
                                ? 0.01
                                : 1 / 10 ** currency.cashDecimals
                        }
                        prefix={
                            inputProps.dollar === 1 ? (
                                <ThemedDollarOutlined />
                            ) : (
                                <img
                                    src={currency.logo}
                                    alt=""
                                    width={16}
                                    height={16}
                                />
                            )
                        }
                        {...inputProps}
                    />
                    {CurrencySelect}
                    <InputNumberAddonText
                        style={{
                            width: '17%',
                            height: '60px',
                            lineHeight: '60px',
                        }}
                        disabled={!!(inputProps || {}).disabled}
                        onClick={!(inputProps || {}).disabled && onMax}
                    >
                        max
                    </InputNumberAddonText>
                </Input.Group>
            </Form.Item>
        </AntdFormWrapper>
    );
};

SendBchInput.propTypes = {
    onMax: PropTypes.func,
    inputProps: PropTypes.object,
    selectProps: PropTypes.object,
    activeFiatCode: PropTypes.string,
};

export const FormItemWithMaxAddon = ({ onMax, inputProps, ...otherProps }) => {
    return (
        <AntdFormWrapper>
            <Form.Item {...otherProps}>
                <Input
                    type="number"
                    prefix={
                        <img
                            src={currency.logo}
                            alt=""
                            width={16}
                            height={16}
                        />
                    }
                    addonAfter={
                        <InputAddonText
                            disabled={!!(inputProps || {}).disabled}
                            onClick={!(inputProps || {}).disabled && onMax}
                        >
                            max
                        </InputAddonText>
                    }
                    {...inputProps}
                />
            </Form.Item>
        </AntdFormWrapper>
    );
};

FormItemWithMaxAddon.propTypes = {
    onMax: PropTypes.func,
    inputProps: PropTypes.object,
};

// loadWithCameraOpen prop: if true, load page with camera scanning open
export const FormItemWithQRCodeAddon = ({
    onScan,
    loadWithCameraOpen,
    inputProps,
    codeType,
    ...otherProps
}) => {
    return (
        <AntdFormWrapper>
            <Form.Item {...otherProps}>
                <Input
                    prefix={codeType == 'address' ? <ThemedWalletOutlined /> : <LockOutlined />}
                    autoComplete="off"
                    addonAfter={
                        <ScanQRCode
                            loadWithCameraOpen={loadWithCameraOpen}
                            onScan={onScan}
                            codeType={codeType}
                        />
                    }
                    {...inputProps}
                />
            </Form.Item>
        </AntdFormWrapper>
    );
};

FormItemWithQRCodeAddon.propTypes = {
    onScan: PropTypes.func,
    loadWithCameraOpen: PropTypes.bool,
    inputProps: PropTypes.object,
    codeType: PropTypes.string,
};

export const CurrencySelectDropdown = selectProps => {
    const { Option } = Select;

    // Build select dropdown from currency.fiatCurrencies
    const currencyMenuOptions = [];
    const currencyKeys = Object.keys(currency.fiatCurrencies);
    for (let i = 0; i < currencyKeys.length; i += 1) {
        const currencyMenuOption = {};
        currencyMenuOption.value =
            currency.fiatCurrencies[currencyKeys[i]].slug;
        currencyMenuOption.label = `${currency.fiatCurrencies[currencyKeys[i]].name
            } (${currency.fiatCurrencies[currencyKeys[i]].symbol})`;
        currencyMenuOptions.push(currencyMenuOption);
    }
    const currencyOptions = currencyMenuOptions.map(currencyMenuOption => {
        return (
            <Option
                key={currencyMenuOption.value}
                value={currencyMenuOption.value}
                className="selectedCurrencyOption"
            >
                {currencyMenuOption.label}
            </Option>
        );
    });

    return (
        <Select
            className="select-after"
            style={{
                width: '100%',
            }}
            {...selectProps}
        >
            {currencyOptions}
        </Select>
    );
};

export const AddressValidators = () => {
    const { BCH } = useBCH();

    return {
        safelyDetectAddressFormat: value => {
            try {
                return BCH.Address.detectAddressFormat(value);
            } catch (error) {
                return null;
            }
        },
        isSLPAddress: value =>
            AddressValidators.safelyDetectAddressFormat(value) === 'slpaddr',
        isBCHAddress: value =>
            AddressValidators.safelyDetectAddressFormat(value) === 'cashaddr',
        isLegacyAddress: value =>
            AddressValidators.safelyDetectAddressFormat(value) === 'legacy',
        isXAddress: value =>
            AddressValidators.safelyDetectAddressFormat(value) === 'xaddr',
    }();
};


const StyledOpReturnMessageTextArea = styled.div`
    textarea.ant-input {
        background-color: ${props => props.theme.forms.selectionBackground} !important;
        border-radius: 4px;
        color: ${props => props.theme.forms.text};
        border: 1px solid ${props => props.theme.forms.border};
        opacity: 1;
    }

    .ant-input-affix-wrapper {
        background-color: ${props => props.theme.forms.addonBackground};
        border: 1px solid ${props => props.theme.forms.border};;
    }
` 

export const OpReturnMessageInput = ({value, onChange, maxByteLength, labelTop, labelBottom,  ...otherProps}) => {

    const trimMessage = (msg) => {
        // keep trimming the message one character at time
        // until the length in bytes < maxByteLength
        let trim = msg;
        while (Buffer.from(trim).length > maxByteLength) {
            trim = trim.substring(0,trim.length -1);
        }
        return trim;
    }

    const handleInputChange = (event) => {
        // trim the input value against to maxByteLength
        let msg = trimMessage(event.target.value);
        // pass the value back up to parent component
        onChange(msg);
    }

    return (
        <StyledOpReturnMessageTextArea>
            <Form.Item>
                <div
                    css={`
                        display: flex;
                        justify-content: flex-start;
                        align-items: flex-end;
                    `}
                >
                    <div>
                        {Buffer.from(value).length}  / {maxByteLength} bytes
                    </div>
                    <div
                        css={`
                            flex-grow: 1
                        `}
                    >
                        {labelTop}
                    </div>
                </div>
                <Input.TextArea { ...otherProps } onChange={handleInputChange} value={value} style={{margin: 0}} />
                <div
                    css={`
                        text-align: right;
                        color: ${props => props.theme.greyLight}
                    `}
                >
                    {labelBottom}
                </div>
            </Form.Item>
        </StyledOpReturnMessageTextArea>
    )
}

OpReturnMessageInput.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    maxByteLength: PropTypes.number,
    labelTop: PropTypes.object,
    labelBottom: PropTypes.object
}
