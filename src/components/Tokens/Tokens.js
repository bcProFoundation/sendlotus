import React from 'react';
import PropTypes from 'prop-types';
import { WalletContext } from '@utils/context';
import { fromSmallestDenomination, getWalletState } from '@utils/cashMethods';
import CreateTokenForm from '@components/Tokens/CreateTokenForm';
import { currency } from '@components/Common/Ticker.js';
import TokenList from '@components/Wallet/TokenList';
import useXPI from '@hooks/useXPI';
import BalanceHeader from '@components/Common/BalanceHeader';
import { ZeroBalanceHeader, AlertMsg } from '@components/Common/Atoms';
import ApiError from '@components/Common/ApiError';

const Tokens = ({ jestXPI, passLoadingStatus }) => {
    /*
    Dev note

    This is the first new page created after the wallet migration to include state in storage

    As such, it will only load this type of wallet

    If any user is still migrating at this point, this page will display a loading spinner until
    their wallet has updated (ETA within 10 seconds)

    Going forward, this approach will be the model for Wallet, Send, and SendToken, as the legacy
    wallet state parameters not stored in the wallet object are deprecated
    */

    const { wallet, apiError } = React.useContext(
        WalletContext,
    );
    const walletState = getWalletState(wallet);
    const { balances, tokens } = walletState;

    const { getXPI, getRestUrl, createToken } = useXPI();

    // Support using locally installed bchjs for unit tests
    const XPI = jestXPI ? jestXPI : getXPI();
    return (
        <>
            {!balances.totalBalance ? (
                <>
                    <ZeroBalanceHeader>
                        You need some {currency.ticker} in your wallet to create
                        tokens.
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
            <CreateTokenForm
                XPI={XPI}
                getRestUrl={getRestUrl}
                createToken={createToken}
                disabled={balances.totalBalanceInSatoshis < currency.dustSats}
                passLoadingStatus={passLoadingStatus}
            />
            {balances.totalBalanceInSatoshis < currency.dustSats && (
                <AlertMsg>
                    You need at least{' '}
                    {fromSmallestDenomination(currency.dustSats).toString()}{' '}
                    {currency.ticker} to create a token
                </AlertMsg>
            )}

            {tokens && tokens.length > 0 ? (
                <>
                    <TokenList tokens={tokens} />
                </>
            ) : (
                <>No {currency.tokenTicker} tokens in this wallet</>
            )}
        </>
    );
};

/*
passLoadingStatus must receive a default prop that is a function
in order to pass the rendering unit test in Tokens.test.js

status => {console.log(status)} is an arbitrary stub function
*/

Tokens.defaultProps = {
    passLoadingStatus: status => {
        console.log(status);
    },
};

Tokens.propTypes = {
    jestXPI: PropTypes.object,
    passLoadingStatus: PropTypes.func,
};

export default Tokens;
