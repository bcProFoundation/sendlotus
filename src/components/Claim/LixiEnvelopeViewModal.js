import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import { RWebShare } from "react-web-share";
import { Image, Modal, Popover, notification, message } from 'antd';
import { fromSmallestDenomination } from '@utils/cashMethods';
import BalanceHeader from '@components/Common/BalanceHeader';
import { currency } from '@components/Common/Ticker.js';

import {
    ShareAltOutlined,
    SaveOutlined,
    LinkOutlined
} from '@ant-design/icons';
import {
    FacebookShareButton,
    FacebookIcon,
    FacebookMessengerShareButton,
    FacebookMessengerIcon,
    TwitterShareButton,
    TwitterIcon,
    TelegramShareButton,
    TelegramIcon,
    WhatsappShareButton,
    WhatsappIcon
} from 'react-share';
import * as CopyToClipboard from 'react-copy-to-clipboard';



const imageBrowserDownload = (imageUri) => {
    const filename = 'claim' + Date.now() + '.png';
    saveAs(imageUri, filename);
};

const ClaimButton = styled.button`
    border: none;
    color: ${props => props.theme.buttons.primary.color};
    background-image: ${props => props.theme.buttons.primary.backgroundImage};
    transition: all 0.5s ease;
    width: 35%;
    font-size: 16px;
    background-size: 200% auto;
    padding: 10px 0;
    border-radius: 4px;
    margin-bottom: 20px;
    cursor: pointer;
    :hover {
        background-position: right center;
        -webkit-box-shadow: ${props => props.theme.buttons.primary.hoverShadow};
        -moz-box-shadow: ${props => props.theme.buttons.primary.hoverShadow};
        box-shadow: ${props => props.theme.buttons.primary.hoverShadow};
    }
    svg {
        fill: ${props => props.theme.buttons.primary.color};
    }
    @media (max-width: 768px) {
        font-size: 16px;
        padding: 10px 5px;
    }
`;

const SocialSharePanel = ({ className, shareUrl }) => {
    const title = 'Lixi Program sent you a small gift!';
    return (
        <div className={className}>
            <div className="socialshare-network">
                <FacebookShareButton
                    url={shareUrl}
                    quote={title}
                    className="socialshare-button"
                >
                    <FacebookIcon size={32} round />
                </FacebookShareButton>
            </div>

            <div className="socialshare-network">
                <FacebookMessengerShareButton
                    url={shareUrl}
                    appId="521270401588372"
                    className="socialshare-button"
                >
                    <FacebookMessengerIcon size={32} round />
                </FacebookMessengerShareButton>
            </div>

            <div className="socialshare-network">
                <TwitterShareButton
                    url={shareUrl}
                    title={title}
                    className="socialshare"
                >
                    <TwitterIcon size={32} round />
                </TwitterShareButton>
            </div>

            <div className="socialshare-network">
                <TelegramShareButton
                    url={shareUrl}
                    title={title}
                    className="socialshare-button"
                >
                    <TelegramIcon size={32} round />
                </TelegramShareButton>

            </div>

            <div className="socialshare-network">
                <WhatsappShareButton
                    url={shareUrl}
                    title={title}
                    separator=":: "
                    className="socialshare-button"
                >
                    <WhatsappIcon size={32} round />
                </WhatsappShareButton>
            </div>
        </div>
    );
}

const StyledSocialSharePanel = styled(SocialSharePanel)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .socialshare-network {
        padding: 10px 4px;
    }
`;

const popOverContent = (shareUrl) => {
    return (
        <StyledSocialSharePanel shareUrl={shareUrl} />
    )
};

const ShareSocialDropdown = (
    <Popover content={() => popOverContent(shareUrl)}>
        <ClaimButton>
            <ShareAltOutlined /> Share
        </ClaimButton>
    </Popover>
);


const LixiEnvelopeViewModal =
    ({ className,
        lixiClaimed,
        handleCancelLixiModal,
        envelopeUrl,
        shareUrl
    }) => {

        // const ShareSocialButton = (
        //     <RWebShare
        //         data={{
        //             text: "Lixi Program sent you a small gift!",
        //             url: shareUrl,
        //             title: "Flamingos",
        //         }}
        //         onClick={() => console.log("shared successfully!")}
        //     >
        //         <ClaimButton>
        //             <ShareAltOutlined /> Share
        //         </ClaimButton>
        //     </RWebShare>
        // );

        const handleOnCopyLink = () => {
            message.info('Link to the claim has been copied.');
        };

        const handleOnClickCopyLink = () => {
            console.log('handleOnClickclaimCode');
        }

        const CopyLinkButton = (
            <CopyToClipboard
                style={{
                    position: 'relative',
                }}
                text={shareUrl}
                onCopy={handleOnCopyLink}
            >
                <ClaimButton>
                    <LinkOutlined /> Copy Link
                </ClaimButton>
            </CopyToClipboard>
        );

        return (
            <Modal
                title="Lixi Program sent you a small gift!"
                visible={true}
                preview={false}
                onCancel={handleCancelLixiModal}
                getContainer={false}
                footer={null}
                maskClosable={false}
            >
                {lixiClaimed && <BalanceHeader
                    balance={fromSmallestDenomination(lixiClaimed.amount)}
                    ticker={currency.ticker} />}
                {envelopeUrl && <Image src={envelopeUrl} />}
                {lixiClaimed && lixiClaimed.message && <div>{lixiClaimed.message}</div>}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    paddingTop: '20px'

                }}>
                    <ClaimButton onClick={() => imageBrowserDownload(envelopeUrl)}>
                        <SaveOutlined /> Save
                    </ClaimButton>
                    {CopyLinkButton}
                </div>

            </Modal>
        )
    }

const Container = styled(LixiEnvelopeViewModal)`
    top: 0 !important;
    .ant-modal, .ant-modal-content {
        height: 100vh !important;
        top: 0 !important;
    }
    .ant-modal-body {
        height: calc(100vh - 110px) !important;
    }
`;

export default Container;