import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Tx from './Tx';
import intl from 'react-intl-universal';
import { formatDate } from '@utils/formatting';

const TxHistoryHeading = styled.h4`
    font-size: 20px;
    margin: 0;
    padding: 15px 0;
    color: ${props => props.theme.footer.navIconInactive};
    @media (max-width: 400px) {
        font-size: 16px;
    }
`;
const TxHistoryWraper = styled.div`
    height: 400px;
    overflow: scroll;
    .tx-history-header {
        text-align: left;
        color: rgba(28, 55, 69, 0.6);
        letter-spacing: 0.4px;
        font-size: 11px;
        text-transform: uppercase;
        margin: 12px 0;
        font-weight: 600;
      }
`;


const TxHistory = ({ txs }) => {
    let keyIndex = 0;
    const orderedWalletParsedHistory = _.orderBy(txs, x => x.timeFirstSeen, 'desc');
    const walletParsedHistoryGroupByDate = _.groupBy(orderedWalletParsedHistory, item => {
        const currentMonth = new Date().getMonth();
        const dateTime = new Date(formatDate(item.timeFirstSeen));
        if (currentMonth == dateTime.getMonth()) return 'Recent';
        const month = dateTime.toLocaleString('en', { month: 'long' });
        return month + ' ' + dateTime.getFullYear();
    });
    return (
        <>
            <TxHistoryHeading>
                {intl.get('wallet.RecentTransaction')}
            </TxHistoryHeading>
            <TxHistoryWraper>
                {
                    Object.keys(walletParsedHistoryGroupByDate).map(index => {
                        keyIndex++
                        let keyPrefix = 0;
                        return (
                            <div key={keyIndex}>
                                <h3 className="tx-history-header">{index}</h3>
                                {walletParsedHistoryGroupByDate[index].map(tx => {
                                    keyPrefix++;
                                    return (
                                        <Tx key={keyPrefix + '_' + tx.txid} item={tx} />
                                    )
                                })}
                            </div>)
                    })
                }
            </TxHistoryWraper>
        </>
    );
};

TxHistory.propTypes = {
    txs: PropTypes.array
};

export default TxHistory;
