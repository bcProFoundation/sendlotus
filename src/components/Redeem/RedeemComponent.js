import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, notification } from 'antd';
import { useHistory } from 'react-router-dom'
import PrimaryButton from '@components/Common/PrimaryButton';
import { FormItemWithQRCodeAddon } from '@components/Common/EnhancedInputs';
import { isMobile, isIOS, isSafari } from 'react-device-detect';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useRedeem from '@hooks/useRedeem';

const RedeemComponent = ({ address }) => {
    const history = useHistory();
    const { reCaptchaReady, redeem } = useRedeem(address);

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

    useEffect(() => {
        if (!address) {
            history.push("/wallet");
        }
    }, []);

    const handleOnClick = e => {
        e.preventDefault();

        if (process.env.NODE_ENV == 'development' || !window.grecaptcha) {
            submit(null, address, formData.redeemCode);
        } else {
            reCaptchaReady(formData.redeemCode, address, submit);
        }
    }

    async function submit(token, currentAddress, redeemCode) {
        try {
            const response = await redeem(token ?? null, currentAddress, redeemCode);

            notification.success({
                message: `Redeem successfully ${response?.data ? fromSmallestDenomination(response.data.amount) : ''} XPI`,
                duration: 10,
                style: { width: '100%' },
            });

            return response.data;
        } catch (error) {
            const message = error.message ?? `Unable to redeem.`;
            notification.error({
                message: message,
                duration: 10,
                style: { width: '100%' },
            });
        }
    }

    const handleRedeemCodeChange = e => {
        const { value, name } = e.target;
        setFormData(p => ({
            ...p,
            [name]: value,
        }));
    };

    return (
        <>
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