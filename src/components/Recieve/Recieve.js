import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Collapse, Form, Input, Modal, Alert } from 'antd';
import { WalletContext } from 'utils/context';
import { QRCode } from '@components/Common/QRCode';

const Recieve = () => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet } = ContextValue;


    return (
        <div>
            {wallet && (wallet.Path10605) && (
                <QRCode
                    id="borderedQRCode"
                    address={wallet.Path10605.xAddress}
                />
            )}
        </div>
    );
};

export default Recieve;
