import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, notification } from 'antd';
import { useHistory } from 'react-router-dom'
import PrimaryButton from '@components/Common/PrimaryButton';
import { FormItemWithQRCodeAddon } from '@components/Common/EnhancedInputs';
import { isMobile, isIOS, isSafari } from 'react-device-detect';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useRedeem from '@hooks/useRedeem';
import { fromSmallestDenomination } from '@utils/cashMethods';
import LixiEnvelopeWatingModal from './LixiEnvelopeWatingModal';
import LixiEnvelopeViewModal from './LixiEnvelopeViewModal';


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

const RedeemComponent = ({ address, redeemCode }) => {
    const history = useHistory();
    const { reCaptchaReady, redeem, getLixi } = useRedeem(address);

    // Get device window width
    // If this is less than 769, the page will open with QR scanner open
    const { width } = useWindowDimensions();
    // Load with QR code open if device is mobile and NOT iOS + anything but safari
    const scannerSupported = width < 769 && isMobile && !(isIOS && !isSafari);

    const [formData, setFormData] = useState({
        dirty: true,
        value: '',
        redeemCode: '',
    });

    const [envelopeUrl, setEnvelopeUrl] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [showLixiModal, setShowLixiModal] = useState(false);
    const [lixiRedeemed, setLixiRedeemed] = useState(null);
    const [isWaitingToOpenLixi, setIsWaitingToOpenLixi] = useState(false);

    useEffect(() => {
        if (redeemCode) {
            setFormData(p => ({
                ...p,
                redeemCode: redeemCode
            }));
        }
    }, [redeemCode]);

    const handleOnClick = async e => {
        e.preventDefault();
        setLixiRedeemed(null);
        setEnvelopeUrl('');
        setShowLixiModal(true);
        setIsWaitingToOpenLixi(true);
    }

    async function submit(token, currentAddress, redeemCode) {
        try {
            const response = await redeem(token ?? null, currentAddress, redeemCode);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    const handleOpenLixi = async () => {
        const encodedVaultId = formData.redeemCode.slice(8);
        const vaultId = base62ToNumber(encodedVaultId);

        try {

            const lixi = await getLixi(vaultId);

            let token;
            if (process.env.NODE_ENV == 'development' || !window.grecaptcha) {
                token = null;
            } else {
                token = await reCaptchaReady(redeemCode, address);
            }

            const lixiRedeemed = await submit(token, address, formData.redeemCode);

            if (lixiRedeemed) {

                // Redeem the lixi successfully
                notification.success({
                    message: `Redeem successfully ${lixiRedeemed.amount ? fromSmallestDenomination(lixiRedeemed.amount) : ''} XPI`,
                    duration: 10,
                    style: { width: '100%' },
                });

                setLixiRedeemed(lixiRedeemed);
                setShowLixiModal(true);
                setIsWaitingToOpenLixi(false);
                const url = `${process.env.REACT_APP_BCHA_LIXI_APIS_BASE}${lixi?.envelope?.image}`;
                const shareUrl = `${process.env.REACT_APP_BCHA_LIXI}lixi/${lixiRedeemed.id}`;
                setEnvelopeUrl(url);
                setShareUrl(shareUrl);
            }


        } catch (error) {
            const message = error?.message ?? `Unable to redeem.`;
            notification.error({
                message: message,
                duration: 10,
                style: { width: '100%' },
            });
            setShowLixiModal(false);
            setIsWaitingToOpenLixi(false);
        }
    }

    const handleRedeemCodeChange = e => {
        const { value, name } = e.target;
        setFormData(p => ({
            ...p,
            [name]: value,
        }));
    };

    const handleCancelLixiModal = () => {
        setLixiRedeemed(null);
        setEnvelopeUrl('');
        setShowLixiModal(false);
        setIsWaitingToOpenLixi(false);
    }

    let lixiModal;
    if (showLixiModal && isWaitingToOpenLixi) {
        lixiModal = <LixiEnvelopeWatingModal
            onOpenLixi={handleOpenLixi}
        />
    } else if (showLixiModal && !isWaitingToOpenLixi) {
        lixiModal = <LixiEnvelopeViewModal
            envelopeUrl={envelopeUrl}
            lixiRedeemed={lixiRedeemed}
            shareUrl={shareUrl}
            handleCancelLixiModal={handleCancelLixiModal}
        />
    }

    return (
        <>
            {lixiModal}
            <Row style={{
                display: 'flex'
            }}>
                <Col span={24}>
                    <Form
                        style={{
                            width: 'auto',
                        }}
                    >

                        <FormItemWithQRCodeAddon
                            loadWithCameraOpen={scannerSupported}
                            onScan={result =>
                                handleRedeemCodeChange({
                                    target: {
                                        name: 'redeemCode',
                                        value: result,
                                    },
                                })
                            }
                            codeType='redeemCode'
                            inputProps={{
                                placeholder: `Redeem`,
                                name: 'redeemCode',
                                onChange: e => handleRedeemCodeChange(e),
                                required: true,
                                value: formData.redeemCode,
                            }}
                        />
                        <div
                            style={{
                                paddingTop: '12px',
                            }}
                        >
                            <PrimaryButton
                                onClick={handleOnClick}
                            >Redeem</PrimaryButton>
                        </div>
                    </Form>
                </Col>
            </Row>
        </>
    )
};

export default RedeemComponent;