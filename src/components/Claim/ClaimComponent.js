import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, notification } from 'antd';
import { useHistory } from 'react-router-dom'
import { WalletContext } from '@utils/context';
import { SmartButton } from '@components/Common/PrimaryButton';
import { FormItemWithQRCodeAddon } from '@components/Common/EnhancedInputs';
import { isMobile, isIOS, isSafari } from 'react-device-detect';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useClaim from '@hooks/useClaim';
import { fromSmallestDenomination } from '@utils/cashMethods';
import LixiEnvelopeWatingModal from './LixiEnvelopeWatingModal';
import LixiEnvelopeViewModal from './LixiEnvelopeViewModal';


export function base58ToNumber(text) {
    const base = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
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

export function numberToBase58(input) {
    let n = input;

    if (n === 0) {
        return '0';
    }

    const base = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

    let result = '';
    while (n > 0) {
        result = base[n % base.length] + result;
        n = Math.floor(n / base.length);
    }

    return result;
}

const ClaimComponent = ({ address, claimCode }) => {
    const history = useHistory();
    const ContextValue = React.useContext(WalletContext);
    const { createWallet } = ContextValue;
    const { reCaptchaReady, claim, getLixi } = useClaim(address);

    // Get device window width
    // If this is less than 769, the page will open with QR scanner open
    const { width } = useWindowDimensions();
    // Load with QR code open if device is mobile and NOT iOS + anything but safari
    const scannerSupported = width < 769 && isMobile && !(isIOS && !isSafari);

    const [formData, setFormData] = useState({
        dirty: true,
        value: '',
        claimCode: '',
    });

    const [envelopeUrl, setEnvelopeUrl] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [showLixiModal, setShowLixiModal] = useState(false);
    const [lixiClaimed, setlixiClaimed] = useState(null);
    const [isWaitingToOpenLixi, setIsWaitingToOpenLixi] = useState(false);
    const [enableClaim, setEnableClaim] = useState(true);
    const [enableOpenLixi, setEnableOpenLixi] = useState(true);
    const [code, setCode] = useState('');

    useEffect(() => {
        if (claimCode) {
            setFormData(p => ({
                ...p,
                claimCode: claimCode
            }));
        }
    }, [claimCode]);

    const handleOnClick = async (e) => {
        setEnableClaim(false);
        e.preventDefault();
        setlixiClaimed(null);
        setEnvelopeUrl('');
        if (!address && formData.claimCode) {
            const wallet = await createWallet();
        }
        setShowLixiModal(true);
        setIsWaitingToOpenLixi(true);
        setEnableClaim(true);
        setCode(formData.claimCode);

    }

    async function submit(token, currentAddress, claimCode) {
        try {
            const response = await claim(token ?? null, currentAddress, claimCode);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    const handleOpenLixi = async () => {

        if (!enableOpenLixi) return;

        setEnableOpenLixi(false);
        const encodedLixiId = formData.claimCode.slice(8);
        const lixiId = base58ToNumber(encodedLixiId);

        try {

            const lixi = await getLixi(lixiId);

            let token = null;
            let lixiClaimed = null;
            if (process.env.NODE_ENV == 'development' || !window.grecaptcha) {
                lixiClaimed = await submit(token, address, formData.claimCode);
            } else {
                token = await reCaptchaReady(claimCode, address);
                if (token) {
                    lixiClaimed = await submit(token, address, formData.claimCode);
                }
            }

            if (lixiClaimed) {

                // Claim the lixi successfully
                notification.success({
                    message: `Claim successfully ${lixiClaimed.amount ? fromSmallestDenomination(lixiClaimed.amount) : ''} XPI`,
                    duration: 10,
                    style: { width: '100%' },
                });

                setlixiClaimed(lixiClaimed);
                setShowLixiModal(true);
                setIsWaitingToOpenLixi(false);
                let url = `${process.env.REACT_APP_BCHA_LIXI_APIS_BASE}api/${lixiClaimed?.image}`;
                const shareUrl = `${process.env.REACT_APP_BCHA_LIXI}claimed/${numberToBase58(lixiClaimed.id)}`;

                if (lixiClaimed.lixiId == 72) {
                    url = `${process.env.REACT_APP_BCHA_LIXI_APIS_BASE}images/8f/8fa0be278c688c2de955aa66baef62e04d23d36f58adeccfeba3ae3276ea3ae3.jpg`;
                }
                setEnvelopeUrl(url);
                setShareUrl(shareUrl);
            }


        } catch (error) {
            const message = error?.message ?? `Unable to claim.`;
            notification.error({
                message: message,
                duration: 10,
                style: { width: '100%' },
            });
            setShowLixiModal(false);
            setIsWaitingToOpenLixi(false);
        } finally {
            setEnableOpenLixi(true);
        }
    }

    const handleclaimCodeChange = e => {
        const { value, name } = e.target;
        setFormData(p => ({
            ...p,
            [name]: value,
        }));
    };

    const handleCancelLixiModal = () => {
        setlixiClaimed(null);
        setEnvelopeUrl('');
        setShowLixiModal(false);
        setIsWaitingToOpenLixi(false);
    }

    let lixiModal;
    if (showLixiModal && isWaitingToOpenLixi) {
        lixiModal = <LixiEnvelopeWatingModal
            onOpenLixi={handleOpenLixi}
            claimCode={code}
        />
    } else if (showLixiModal && !isWaitingToOpenLixi) {
        lixiModal = <LixiEnvelopeViewModal
            envelopeUrl={envelopeUrl}
            lixiClaimed={lixiClaimed}
            shareUrl={shareUrl}
            handleCancelLixiModal={handleCancelLixiModal}
            isMobile={isMobile}
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
                                handleclaimCodeChange({
                                    target: {
                                        name: 'claimCode',
                                        value: result,
                                    },
                                })
                            }
                            codeType='claimCode'
                            inputProps={{
                                placeholder: `Claim`,
                                name: 'claimCode',
                                onChange: e => handleclaimCodeChange(e),
                                required: true,
                                value: formData.claimCode,
                            }}
                        />
                        <div
                            style={{
                                paddingTop: '12px',
                            }}
                        >
                            <SmartButton
                                onClick={handleOnClick}
                                disabled={!enableClaim}
                            >Claim Lixi</SmartButton>
                        </div>
                    </Form>
                </Col>
            </Row>
        </>
    )
};

export default ClaimComponent;