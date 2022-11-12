import React from 'react';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import OnBoarding from '@components/OnBoarding/OnBoarding';
import { QRCode } from '@components/Common/QRCode';
import { currency } from '@components/Common/Ticker.js';
import { Link } from 'react-router-dom';
import TxHistory from './TxHistory';
import ApiError from '@components/Common/ApiError';
import BalanceHeader from '@components/Common/BalanceHeader';
import { LoadingCtn, ZeroBalanceHeader } from '@components/Common/Atoms';
import { getWalletState } from '@utils/cashMethods';
import intl from 'react-intl-universal';

export const Tabs = styled.div`
    margin: auto;
    margin-bottom: 12px;
    display: inline-block;
    text-align: center;
`;
export const TabLabel = styled.button`
    :focus,
    :active {
        outline: none;
    }

    border: none;
    background: none;
    font-size: 20px;
    cursor: pointer;

    @media (max-width: 400px) {
        font-size: 16px;
    }

    ${({ active, ...props }) =>
        active &&
        `    
        color: ${props.theme.primary};       
  `}
`;
export const TabLine = styled.div`
    margin: auto;
    transition: margin-left 0.5s ease-in-out, width 0.5s 0.1s;
    height: 4px;
    border-radius: 5px;
    background-color: ${props => props.theme.primary};
    pointer-events: none;

    margin-left: 72%;
    width: 28%;

    ${({ left, ...props }) =>
        left &&
        `
        margin-left: 1%
        width: 69%;
  `}
`;
export const TabPane = styled.div`
    ${({ active }) =>
        !active &&
        `    
        display: none;
  `}
`;

export const SwitchBtnCtn = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    align-content: space-between;
    margin-bottom: 15px;
    .nonactiveBtn {
        color: ${props => props.theme.wallet.text.secondary};
        background: ${props =>
        props.theme.wallet.switch.inactive.background} !important;
        box-shadow: none !important;
    }
    .slpActive {
        background: ${props =>
        props.theme.wallet.switch.activeToken.background} !important;
        box-shadow: ${props =>
        props.theme.wallet.switch.activeToken.shadow} !important;
    }
`;

export const SwitchBtn = styled.div`
    font-weight: bold;
    display: inline-block;
    cursor: pointer;
    color: ${props => props.theme.contrast};
    font-size: 14px;
    padding: 6px 0;
    width: 100px;
    margin: 0 1px;
    text-decoration: none;
    background: ${props => props.theme.primary};
    box-shadow: ${props => props.theme.wallet.switch.activeCash.shadow};
    user-select: none;
    :first-child {
        border-radius: 100px 0 0 100px;
    }
    :nth-child(2) {
        border-radius: 0 100px 100px 0;
    }
`;

export const Links = styled(Link)`
    color: ${props => props.theme.wallet.text.secondary};
    width: 100%;
    font-size: 16px;
    margin: 10px 0 20px 0;
    border: 1px solid ${props => props.theme.wallet.text.secondary};
    padding: 14px 0;
    display: inline-block;
    border-radius: 3px;
    transition: all 200ms ease-in-out;
    svg {
        fill: ${props => props.theme.wallet.text.secondary};
    }
    :hover {
        color: ${props => props.theme.primary};
        border-color: ${props => props.theme.primary};
        svg {
            fill: ${props => props.theme.primary};
        }
    }
    @media (max-width: 768px) {
        padding: 10px 0;
        font-size: 14px;
    }
`;

export const ExternalLink = styled.a`
    color: ${props => props.theme.wallet.text.secondary};
    width: 100%;
    font-size: 16px;
    margin: 0 0 20px 0;
    border: 1px solid ${props => props.theme.wallet.text.secondary};
    padding: 14px 0;
    display: inline-block;
    border-radius: 3px;
    transition: all 200ms ease-in-out;
    svg {
        fill: ${props => props.theme.wallet.text.secondary};
        transition: all 200ms ease-in-out;
    }
    :hover {
        color: ${props => props.theme.primary};
        border-color: ${props => props.theme.primary};
        svg {
            fill: ${props => props.theme.primary};
        }
    }
    @media (max-width: 768px) {
        padding: 10px 0;
        font-size: 14px;
    }
`;

export const AddrSwitchContainer = styled.div`
    text-align: center;
    padding: 6px 0 12px 0;
`;

const WalletInfo = () => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet, fiatPrice, apiError } = ContextValue;
    const walletState = getWalletState(wallet);
    const { balances, parsedTxHistory } = walletState;

    const hasHistory = parsedTxHistory && parsedTxHistory.length > 0;
   

    return (
        <>
            {!balances.totalBalance && !apiError && !hasHistory ? (
                <>
                    <ZeroBalanceHeader>
                        <span role="img" aria-label="party emoji">
                            🎉
                        </span>
                        {intl.get('wallet.CongratulationMessage')}{' '}
                        <span role="img" aria-label="party emoji">
                            🎉
                        </span>
                        {intl.get('wallet.StartUsingMessageLine1')}{' '}
                        {currency.ticker} {intl.get('wallet.StartUsingMessageLine2')}{' '}
                        {currency.ticker} {intl.get('wallet.StartUsingMessageLine3')}
                    </ZeroBalanceHeader>
                    <BalanceHeader balance={0} ticker={currency.ticker} />
                </>
            ) : (
                <>
                    <BalanceHeader
                        balance={balances.totalBalance}
                        ticker={currency.ticker}
                    />
                </>
            )}
            {apiError && <ApiError />}

            {wallet && (wallet.Path10605) && (
                <>
                    <QRCode
                        id="borderedQRCode"
                        address={wallet.Path10605.xAddress}
                    />
                </>
            )}

            {hasHistory && parsedTxHistory && (
                <>
                    <TxHistory
                        txs={parsedTxHistory}
                    />
                </>
            )}
        </>
    );
};

const Wallet = () => {
    const ContextValue = React.useContext(WalletContext);

    const { wallet, previousWallet, loading } = ContextValue;

    return (
        <>
            {loading ? (
                <LoadingCtn />
            ) : (
                <>
                    {(wallet && wallet.Path10605) ||
                        (previousWallet && previousWallet.path10605) ? (
                        <>
                            <WalletInfo />
                        </>
                    ) : (
                        <>
                            <OnBoarding />
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default Wallet;
