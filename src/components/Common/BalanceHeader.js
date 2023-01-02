import * as React from 'react';
import PropTypes from 'prop-types';
import { formatBalance } from '@utils/cashMethods';
import { BalanceHeaderWrap } from '@components/Common/Atoms';

const BalanceHeader = ({ balance, ticker }) => {
    return (
        <BalanceHeaderWrap>
            {formatBalance(balance)} {ticker}
        </BalanceHeaderWrap>
    );
};

export default BalanceHeader;
