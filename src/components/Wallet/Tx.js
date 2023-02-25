import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
    LinkOutlined,
} from '@ant-design/icons';
import { currency } from '@components/Common/Ticker';
import { formatBalance } from '@utils/cashMethods';
import { ThemedLockFilledGrey } from 'components/Common/CustomIcons';
import { Button } from 'antd';
import { FormattedTxAddress } from 'components/Common/FormattedWalletAddress';
import intl from 'react-intl-universal';
import { formatDate } from '@utils/formatting';

const DateType = styled.div`
    color: ${props => props.theme.greyDark} !important;
    @media screen and (max-width: 500px) {
        font-size: 0.8em;
    }
`;
const OpReturnType = styled.div`
    overflow-wrap: break-word !important;
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
const MessageLabel = styled.span`
    text-align: left;
    color: ${props => props.theme.secondary} !important;
    white-space: nowrap;
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

const TxWrapper = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: auto;
    grid-gap: 10px;
    padding: 20px;

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
    color: ${props => props.theme.grey} !important;
`

const Tx = ({ item }) => {
    return (
        <div
            css={`
                position: relative;
            `}
        >
            {/* Link to the Explorer */}
            <a
                href={`https://explorer.givelotus.org/tx/${item.txid}`}
                target="_blank"
                rel="noreferrer"
                css={`
                    position: absolute;
                    top: 5px;
                    right: 5px;
                `}
            >
                <LinkOutlined
                    css={`
                        color: ${props => props.theme.greyLight} !important;
                        :hover {
                            color: ${props => props.theme.primary} !important;
                        }
                    `}
                />
            </a>
            <TxWrapper outgoing={!item.parsed.incoming}>
                <div className='label'>
                    {!item.parsed.incoming
                        ? <SentLabel>
                            {intl.get('wallet.SentTo')} {
                                item.parsed.destinationAddress &&
                                <FormattedTxAddress address={item.parsed.destinationAddress.slice(-8)} />
                            }
                        </SentLabel>
                        : <ReceivedLabel>
                            From: {
                                item.parsed.replyAddress &&
                                <FormattedTxAddress address={item.parsed.replyAddress.slice(-8)} />
                            }
                        </ReceivedLabel>
                    }
                    <DateType>
                        {formatDate(item.timeFirstSeen)}
                    </DateType>
                </div>
                <div className='amount'>
                    <TxInfo outgoing={!item.parsed.incoming} className='amount'>
                        {!item.parsed.incoming ? (
                            <>
                                -{' '}
                                {formatBalance(
                                    item.parsed.xpiAmount,
                                )}
                                &nbsp;
                                {currency.ticker}
                                <br />
                            </>
                        ) : (
                            <>
                                +{' '}
                                {formatBalance(
                                    item.parsed.xpiAmount
                                )}
                                &nbsp;
                                {currency.ticker}
                                <br />
                            </>
                        )}
                    </TxInfo>
                </div>
                <div className='msg'>
                    <OpReturnType>
                        <div>
                            {item.parsed.opReturnMessage}
                        </div>
                        <div
                            css={`
                                display: flex;
                                justify-content: space-between;
                            `}>
                            {item.parsed.isLotusMessage ? (
                                item.parsed.isEncryptedMessage ? (
                                    <EncryptionMessageLabel>
                                        <ThemedLockFilledGrey />
                                    </EncryptionMessageLabel>
                                ) : (
                                    <LotusChatMessageLabel>
                                    </LotusChatMessageLabel>
                                )
                            ) : (
                                item.parsed.opReturnMessage ? (
                                    <MessageLabel>
                                        {intl.get('wallet.ExternalMessage')}
                                    </MessageLabel>
                                ) : (
                                    <div></div>
                                )
                            )}
                            {item.parsed.incoming && (
                                <Link
                                    to={{
                                        pathname: `/send`,
                                        state: {
                                            replyAddress: item.parsed.replyAddress,
                                        },
                                    }}
                                >
                                    <ReplyButton
                                        size='small'
                                        type="text"
                                    >
                                        {intl.get('wallet.Reply')}
                                    </ReplyButton>
                                </Link>
                            )}
                        </div>
                    </OpReturnType>
                </div>
            </TxWrapper>
        </div>
    );
};

Tx.propTypes = {
    item: PropTypes.object,
    fiatPrice: PropTypes.number,
    fiatCurrency: PropTypes.string,
};

export default Tx;
