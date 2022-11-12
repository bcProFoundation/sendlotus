import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Tx from './Tx';
import intl from 'react-intl-universal';

const TxHistoryHeading = styled.h4`
    font-size: 20px;
    margin: 0;
    padding: 15px 0;
    color: ${props => props.theme.footer.navIconInactive};
    @media (max-width: 400px) {
        font-size: 16px;
    }
`;

const TxHistory = ({ txs }) => {
    return (
        <div>
            <TxHistoryHeading>
                {intl.get('wallet.RecentTransaction')}
            </TxHistoryHeading>
            {txs.map(tx => (
                <Tx
                    key={tx.txid}
                    data={tx}
                />
            ))}
        </div>
    );
};

TxHistory.propTypes = {
    txs: PropTypes.array
};

export default TxHistory;
