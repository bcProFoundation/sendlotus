import React, { useState } from 'react';
import styled from 'styled-components';
import RawQRCode from 'qrcode.react';
import {
    currency,
    isValidTokenPrefix,
} from '@components/Common/Ticker.js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Event } from '@utils/GoogleAnalytics';
import { convertToEcashPrefix } from '@utils/cashMethods';
import FormattedWalletAddress from './FormattedWalletAddress';

export const StyledRawQRCode = styled(RawQRCode)`
    cursor: pointer;
    border-radius: 23px;
    background: ${props => props.theme.qr.background};
    box-shadow: ${props => props.theme.qr.shadow};
    margin-bottom: 10px;
    border: 1px solid ${props => props.theme.wallet.borders.color};
    path:first-child {
        fill: ${props => props.theme.qr.background};
    }
    :hover {
        border-color: ${({ xpi = 0, ...props }) =>
            xpi === 1 ? props.theme.primary : props.theme.qr.token};
    }
    @media (max-width: 768px) {
        border-radius: 18px;
        width: 170px;
        height: 170px;
    }
`;

const Copied = styled.div`
    width: 100%;
    text-align: center;
    background-color: ${({ xpi = 0, ...props }) =>
        xpi === 1 ? props.theme.primary : props.theme.qr.token}; 
    color: ${props => props.theme.contrast};
    position: absolute;
    top: 65px;
    padding: 30px 0;

    .heading {
        font-size: 18px;
        font-weight: bold;
    }

    .text {
        font-size: 12px
    }

    @media (max-width: 768px) {
        top: 52px;
        padding: 20px 0;

        .heading {
            font-size: 14px;
        }

        .text {
            font-size: 10px;
        }
    }
`;

const CustomInput = styled.div`
    font-size: 12px;
    color: ${props => props.theme.wallet.text.primary};
    text-align: center;
    cursor: pointer;
    margin-bottom: 0px;
    padding: 6px 0;
    font-family: 'Roboto Mono', monospace;

    input {
        border: none;
        width: 100%;
        text-align: center;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: pointer;
        color: ${props => props.theme.wallet.text.primary};
        padding: 10px 0;
        background: transparent;
        margin-bottom: 15px;
        display: none;
    }
    input:focus {
        outline: none;
    }
    input::selection {
        background: transparent;
        color: ${props => props.theme.wallet.text.primary};
    }
    @media (max-width: 768px) {
        font-size: 10px;
        input {
            font-size: 10px;
            margin-bottom: 10px;
        }
    }
    @media (max-width: 340px) {
        font-size: 8px;
        input {
            font-size: 10px;
            margin-bottom: 10px;
        }
    }
`;

export const QRCode = ({
    address,
    size = 210,
    onClick = () => null,
    ...otherProps
}) => {
    address = address ? convertToEcashPrefix(address) : '';

    const [visible, setVisible] = useState(false);

    const txtRef = React.useRef(null);

    const handleOnClick = evt => {
        setVisible(true);
        setTimeout(() => {
            setVisible(false);
        }, 1500);
        onClick(evt);
    };

    const handleOnCopy = () => {
        // Event.("Category", "Action", "Label")
        // xec or etoken?
        let eventLabel = currency.ticker;
        if (address) {
            const isToken = isValidTokenPrefix(address);
            if (isToken) {
                eventLabel = currency.tokenTicker;
            }
            // Event('Category', 'Action', 'Label')
            Event('Wallet', 'Copy Address', eventLabel);
        }

        setVisible(true);
        setTimeout(() => {
            txtRef.current.select();
        }, 100);
    };

    return (
        <CopyToClipboard
            style={{
                display: 'inline-block',
                width: '100%',
                position: 'relative',
            }}
            text={address}
            onCopy={handleOnCopy}
        >
            <div style={{ position: 'relative' }} onClick={handleOnClick}>
                <Copied
                    xpi={address ? 1 : 0}
                    style={{ display: visible ? null : 'none' }}
                >
                    <span className='heading'>
                        Copied
                    </span>
                    <br />
                    <span className='text'>{address}</span>
                </Copied>

                <StyledRawQRCode
                    id="borderedQRCode"
                    value={address || ''}
                    size={size}
                    xpi={address ? 1 : 0}
                    renderAs={'svg'}
                    includeMargin
                    imageSettings={{
                        src:
                            address
                                ? currency.logo
                                : currency.tokenLogo,
                        x: null,
                        y: null,
                        height: 24,
                        width: 24,
                        excavate: true,
                    }}
                />

                {address && (
                    <CustomInput xpi={address ? 1 : 0}>
                        <input
                            ref={txtRef}
                            readOnly
                            value={address}
                            spellCheck="false"
                            type="text"
                        />
                        <FormattedWalletAddress address={address} />
                    </CustomInput>
                )}
            </div>
        </CopyToClipboard>
    );
};
