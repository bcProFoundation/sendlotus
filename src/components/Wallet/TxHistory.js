import React from 'react';
import styled from 'styled-components';
import Tx from './Tx';

export const TxLink = styled.a``;

const TxHistory = ({ txs, fiatPrice, fiatCurrency }) => {
    return (
        <div>
            {txs.map(tx => (
                <TxLink
                    key={tx.txid}
                    href={`https://explorer.be.cash/tx/${tx.txid}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <Tx
                        data={tx}
                        fiatPrice={fiatPrice}
                        fiatCurrency={fiatCurrency}
                    />
                </TxLink>
            ))}
        </div>
    );
};

export default TxHistory;
