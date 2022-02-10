import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    ExperimentOutlined,
    ExclamationOutlined,
} from '@ant-design/icons';
import { currency } from '@components/Common/Ticker';
import makeBlockie from 'ethereum-blockies-base64';
import { Img } from 'react-image';
import { formatBalance, fromLegacyDecimals } from '@utils/cashMethods';
import { ThemedLockFilledGrey, ThemedUnlockFilledGrey } from 'components/Common/CustomIcons';
import { Button } from 'antd';

const SentTx = styled(ArrowUpOutlined)`
    color: ${props => props.theme.greyDark} !important;
`;
const ReceivedTx = styled(ArrowDownOutlined)`
    color: ${props => props.theme.primary} !important;
`;
const UnparsedTx = styled(ExclamationOutlined)`
    color: ${props => props.theme.primary} !important;
`;
const DateType = styled.div`
    color: ${props => props.theme.greyDark} !important;
    @media screen and (max-width: 500px) {
        font-size: 0.8rem;
    }
`;
const OpReturnType = styled.div`
    // width: 300%;
    // max-height: 200px;
    // padding: 3px;
    // margin: auto;
    word-break: break-word;
    // padding-left: 13px;
    // padding-right: 30px;
    /* invisible scrollbar */
    overflow: hidden;
    height: 100%;
    margin-right: -50px; /* Maximum width of scrollbar */
    padding-right: 50px; /* Maximum width of scrollbar */
    overflow-y: scroll;
    ::-webkit-scrollbar {
        display: none;
    }
`;
const SentLabel = styled.span`
    font-weight: bold;
    color: ${props => props.theme.greyDark} !important;
`;
const ReceivedLabel = styled.span`
    font-weight: bold;
    color: ${props => props.theme.primary} !important;
`;
const LotusChatMessageLabel = styled.span`
    text-align: left;
    color: ${props => props.theme.greyLight} !important;
    white-space: nowrap;
`;
const EncryptionMessageLabel = styled.span`
    text-align: left;
    color: ${props => props.theme.greyLight} !important;
    white-space: nowrap;
`;
const UnauthorizedDecryptionMessage = styled.span`
    text-align: left;
    color: ${props => props.theme.greyLight} !important;
    white-space: nowrap;
    font-style: italic;
`;
const MessageLabel = styled.span`
    text-align: left;
    color: ${props => props.theme.secondary} !important;
    white-space: nowrap;
`;
const ReplyMessageLabel = styled.span`
    color: ${props => props.theme.greyLight} !important;
`;
const TxIcon = styled.div`
    svg {
        width: 32px;
        height: 32px;
    }
    height: 32px;
    width: 32px;
    @media screen and (max-width: 500px) {
        svg {
            width: 24px;
            height: 24px;
        }
        height: 24px;
        width: 24px;
    }
`;

const TxInfo = styled.div`
    padding: 12px;
    font-size: 1rem;
    text-align: right;

    color: ${props =>
        props.outgoing ? props.theme.greyDark : props.theme.primary};

    @media screen and (max-width: 500px) {
        font-size: 0.8rem;
    }
`;
const TxFiatPrice = styled.span`
    font-size: 0.8rem;
`;


// const TxWrapper = styled.div`   
//     display: grid;
//     grid-template-columns: 36px 30% 50%;

//     justify-content: space-between;
//     align-items: center;
//     padding: 15px 25px;
//     border-radius: 3px;
//     background: ${props => props.theme.tokenListItem.background};
//     margin-bottom: 3px;
//     box-shadow: ${props => props.theme.tokenListItem.boxShadow};
//     border: 1px solid ${props => props.theme.tokenListItem.border};

//     :hover {
//         border-color: ${props => props.theme.primary};
//     }
//     @media screen and (max-width: 500px) {
//         grid-template-columns: 24px 30% 50%;
//         padding: 12px 12px;
//     }
// `;


const TxWrapper = styled.div`
  
        display: grid;
        grid-template-columns: 70% 30%;
        grid-template-rows: auto;
    
        grid-template-areas: 
            "header-main header-side"
            "main main";
    
        border-radius: 3px;
        background: ${props => props.theme.tokenListItem.background};
        margin-bottom: 3px;
        box-shadow: ${props => props.theme.tokenListItem.boxShadow};
        border: 1px solid ${props => props.theme.tokenListItem.border};
        color: ${props => props.outgoing ? props.theme.grey : props.theme.primary} !important;
        text-align: left;
    
        :hover {
            border-color: ${props => props.theme.primary};
        }
        @media screen and (max-width: 500px) {
            // grid-template-columns: 24px 30% 50%;
            // padding: 12px 12px;
        }


    .label {
        grid-area: header-main;
    }
    .date {
        grid-area: header-main;
    }
    .amount {
        grid-area: header-side;
    }
    .msg {
        grid-area: main;
    }



`;

const ReplyButton = styled(Button)`
    color: ${props => props.theme.grey } !important;
`

const Tx = ({ data, fiatPrice, fiatCurrency }) => {
    const txDate =
        typeof data.blocktime === 'undefined'
            ? new Date().toLocaleDateString()
            : new Date(data.blocktime * 1000).toLocaleDateString();
    // if data only includes height and txid, then the tx could not be parsed by cashtab
    // render as such but keep link to block explorer
    let unparsedTx = false;
    if (!Object.keys(data).includes('outgoingTx')) {
        unparsedTx = true;
    }
    return (
        <>
            {unparsedTx ? (
                <TxWrapper className='container'>
                    <DateType>
                        <ReceivedLabel>Unparsed</ReceivedLabel>
                        <br />
                        {txDate}
                    </DateType>
                    <TxInfo>Open in Explorer</TxInfo>
                </TxWrapper>
            ) : (
                <TxWrapper outgoing={data.outgoingTx}>
                    <div className='label'>
                        {data.outgoingTx 
                            ? <SentLabel>Sent</SentLabel>
                            : <ReceivedLabel>Received</ReceivedLabel>
                        }
                        <DateType>
                            {txDate}
                        </DateType>
                    </div>
                    <div className='amount'>
                        <TxInfo outgoing={data.outgoingTx} className='amount'>
                            {data.outgoingTx ? (
                                <>
                                    -{' '}
                                    {formatBalance(
                                        data.amountSent,
                                    )}
                                    &nbsp;
                                    {currency.ticker}
                                    <br />
                                </>
                            ) : (
                                <>
                                    +{' '}
                                    {formatBalance(
                                        data.amountReceived
                                    )}
                                    &nbsp;
                                    {currency.ticker}
                                    <br />
                                </>
                            )}
                        </TxInfo>
                    </div>
                    <div className='msg'>
                        {data.opReturnMessage && (
                            <OpReturnType>
                                {/*unencrypted OP_RETURN Message*/}
                                {data.opReturnMessage &&
                                !data.isEncryptedMessage ? data.opReturnMessage : ''}
                                {/*encrypted and wallet is authorized to view OP_RETURN Message*/}
                                {data.opReturnMessage &&
                                data.isEncryptedMessage &&
                                data.decryptionSuccess
                                    ? data.opReturnMessage
                                    : ''}
                                {/*encrypted but wallet is not authorized to view OP_RETURN Message*/}
                                {data.opReturnMessage &&
                                data.isEncryptedMessage &&
                                !data.decryptionSuccess ? (
                                    <UnauthorizedDecryptionMessage>
                                        { data.opReturnMessage }
                                    </UnauthorizedDecryptionMessage>
                                ) : (
                                    ''
                                )}
                                <div
                                    css={`
                                        display: flex;
                                        justify-content: space-between;
                                    `}
                                >
                                    {data.isLotusChatMessage ? (
                                        data.isEncryptedMessage ? (
                                            <EncryptionMessageLabel>
                                                <ThemedLockFilledGrey />
                                            </EncryptionMessageLabel>
                                        ) : (
                                            <LotusChatMessageLabel>
                                            </LotusChatMessageLabel>
                                        )
                                        
                                    ) : (
                                        <MessageLabel>
                                            External Message
                                        </MessageLabel>
                                    )}
                                    {!data.outgoingTx && data.replyAddress ? (
                                        <Link
                                            to={{
                                                pathname: `/send`,
                                                state: {
                                                    replyAddress: data.replyAddress,
                                                },
                                            }}
                                        >
                                            <ReplyButton
                                                size='small'
                                                type="text"
                                            >
                                                Reply
                                            </ReplyButton>
                                        </Link>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </OpReturnType>
                        )}
                    </div>
                </TxWrapper>
            )}
        </>
    );
};

Tx.propTypes = {
    data: PropTypes.object,
    fiatPrice: PropTypes.number,
    fiatCurrency: PropTypes.string,
};

export default Tx;
