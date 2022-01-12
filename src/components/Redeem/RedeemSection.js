import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { Modal, notification } from 'antd';
import useRedeem from '@hooks/useRedeem';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { WalletContext } from '@utils/context';

const RedeemSection = ({ address, redeemCode }) => {
    const history = useHistory()

    const ContextValue = React.useContext(WalletContext);
    const [modal, contextHolder] = Modal.useModal();
    const { createWallet } = ContextValue;

    useEffect(() => {
        if (!address) {
            showRedemModal();
        }
    }, [address]);


    const { reCaptchaReady, redeem } = useRedeem(address, () => {
        if (process.env.NODE_ENV == 'development' || !window.grecaptcha) {
            submit(null, address, redeemCode);
        } else {
            reCaptchaReady(redeemCode, address, submit);
        }
    });

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
            const message = error.message ?? `Unable to redeem.`;
            notification.error({
                message: message,
                duration: 10,
                style: { width: '100%' },
            });
        } finally {
            history.push("/wallet");
        }
    }


    function showRedemModal() {
        modal.success({
            title: "Lixi Program sent you a small gift!",
            content: `Special thanks for using our service!`,
            okText: 'Redeem!',
            zIndex: 2,
            onOk() {
                createWallet();
            },
        });
    }

    return (
        <>{contextHolder}</>
    );
};

export default RedeemSection;
