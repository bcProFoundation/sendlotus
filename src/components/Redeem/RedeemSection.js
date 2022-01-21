import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom'
import { RWebShare } from "react-web-share";
import { Image, Modal, Popover, notification, message } from 'antd';
import BalanceHeader from '@components/Common/BalanceHeader';
import { currency } from '@components/Common/Ticker.js';
import useRedeem from '@hooks/useRedeem';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { WalletContext } from '@utils/context';
import { saveAs } from 'file-saver';
import RedEnvelopeBackground from '@assets/red_envelope_background.svg';
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


const base62ToNumber = (text) => {
    const base = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = 0;
    for (let i = 0; i < text.length; i++) {
        const p = base.indexOf(text[i]);
        if (p < 0) {
            return NaN;
        }
        result += p * Math.pow(base.length, text.length - i - 1);
    }
    return result;
}

const imageBrowserDownload = (imageUri) => {
    const filename = 'redeem' + Date.now() + '.png';
    saveAs(imageUri, filename);
};

const RedeemButton = styled.button`
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
                    className="Demo__some-network__share-button"
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

const LixiEnvelopeModal = ({ className, onOpenLixi }) => {
    return (
        <>
            <Modal visible={true} closable={false} footer={null} className={className}>
                <div className='lixi-container' onClick={onOpenLixi}>
                    <Image preview={false} src={RedEnvelopeBackground} className='envelope-background' />
                </div>
            </Modal>
        </>
    )
}

const StyledLixiEnvelopeModal = styled(LixiEnvelopeModal)`
    height: 100vh !important;
    .lixi-container {
        position: relative;
        top: 0;
        left: 0;
        height: 100vh !important;
        .envelope-background {
            position: relative;
            top: 0;
            left: 0;
        }
    }
    .ant-modal-body {
        background-color: transparent;
    }
    .ant-modal-content {
        background-color: transparent;
    }
`;

const RedeemSection = ({ className, redeemCode, address }) => {
    const history = useHistory();
    const [loading, setLoading] = useState(true);

    const ContextValue = React.useContext(WalletContext);
    const { createWallet } = ContextValue;
    const [showModalEnvelope, setShowModalEnvelope] = useState(true);
    const [envelopeUrl, setEnvelopeUrl] = useState('');
    const [shareUrl, setShareUrl] = useState('abcxyz');
    const [currentRedeem, setCurrentRedeem] = useState(null);

    const encodedVaultId = redeemCode.slice(8);
    const vaultId = base62ToNumber(encodedVaultId);

    useEffect(async () => {
        if (!address) {
            createWallet();
        }
    }, [address]);


    const { reCaptchaReady, redeem, getLixi } = useRedeem(address);

    const handleOpenLixi = async (e) => {
        try {
            const lixi = await getLixi(vaultId);
            const url = `${process.env.REACT_APP_BCHA_LIXI_APIS_BASE}${lixi?.envelope?.image}`;
            setEnvelopeUrl(url);
            let token;

            if (process.env.NODE_ENV == 'development' || !window.grecaptcha) {
                token = null;
            } else {
                token = await reCaptchaReady(redeemCode, address);
            }
            const redeem = await submit(token, address, redeemCode);

            if (redeem) {
                setCurrentRedeem(redeem);
                const shareUrl = `${process.env.REACT_APP_BCHA_LIXI}lixi/${redeem.id}`;
                setShareUrl(shareUrl);
            }
            setLoading(false);
        } catch (error) {
            const message = error.message ?? `Unable to redeem.`;
            notification.error({
                message: message,
                duration: 10,
                style: { width: '100%' },
            });
            history.push("/wallet");
        }
    }

    const handleCancelEnvelope = () => {
        setShowModalEnvelope(false);
        history.push('/wallet');
    }

    async function submit(token, currentAddress, currentRedeemCode) {
        try {
            const response = await redeem(token, currentAddress, currentRedeemCode);

            notification.success({
                message: `Redeem successfully ${response?.data ? fromSmallestDenomination(response.data.amount) : ''} XPI`,
                duration: 10,
                style: { width: '100%' },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    const popOverContent = (
        <>
            <StyledSocialSharePanel shareUrl={shareUrl} />
        </>
    );

    const ShareSocialDropdown = (
        <Popover content={popOverContent}>
            <RedeemButton>
                <ShareAltOutlined /> Share
            </RedeemButton>
        </Popover>
    );

    const ShareSocialButton = (
        <RWebShare
            data={{
                text: "Lixi Program sent you a small gift!",
                url: shareUrl,
                title: "Flamingos",
            }}
            onClick={() => console.log("shared successfully!")}
        >
            <RedeemButton>
                <ShareAltOutlined /> Share
            </RedeemButton>
        </RWebShare>
    );

    const handleOnCopyLink = () => {
        message.info('Link to the redeem has been copied.');
    };

    const handleOnClickCopyLink = () => {
        console.log('handleOnClickRedeemCode');
    }

    const CopyLinkButton = (
        <CopyToClipboard
            style={{
                position: 'relative',
            }}
            text={shareUrl}
            onCopy={handleOnCopyLink}
        >
            <RedeemButton>
                <LinkOutlined /> Copy Link
            </RedeemButton>
        </CopyToClipboard>

    );

    return (
        <section className={className}>
            {loading
                ? <StyledLixiEnvelopeModal imageUrl={RedEnvelopeBackground}
                    onOpenLixi={handleOpenLixi}
                />
                : <Modal
                    title="Lixi Program sent you a small gift!"
                    visible={showModalEnvelope}
                    preview={false}
                    onCancel={handleCancelEnvelope}
                    getContainer={false}
                    footer={null}
                >
                    {currentRedeem && <BalanceHeader
                        balance={fromSmallestDenomination(currentRedeem.amount)}
                        ticker={currency.ticker} />}
                    <Image src={envelopeUrl} />
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        paddingTop: '20px'

                    }}>
                        <RedeemButton onClick={() => imageBrowserDownload(envelopeUrl)}>
                            <SaveOutlined /> Save
                        </RedeemButton>
                        {CopyLinkButton}
                    </div>

                </Modal>
            }
        </section>
    );
};

const StyledRedeemSection = styled(RedeemSection)`
    .ant-modal, .ant-modal-content {
        height: 100vh !important;
        top: 0 !important;
    }
    .ant-modal-body {
        height: calc(100vh - 110px) !important;
    }
`;

export default StyledRedeemSection;
