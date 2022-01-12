import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { Modal, notification } from 'antd';
import useBCH from '@hooks/useBCH';
import redeemService from './services/redeemService';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { WalletContext } from '@utils/context';

const RedeemSection = ({ address, redeemCode }) => {
  const { getBCH } = useBCH();
  const BCH = getBCH();

  const history = useHistory()

  const ContextValue = React.useContext(WalletContext);
  const [modal, contextHolder] = Modal.useModal();
  const { createWallet } = ContextValue;
  
  useEffect(() => {
    if (!address) {
      showRedemModal();
    }
    else {
      // load the script by passing the URL
      if (process.env.NODE_ENV !== 'development') {
        redeemService.loadReCaptcha(handleRedeem);
      } else {
        handleRedeem();
      }
    }
  }, [address, redeemCode]);

  const handleRedeem = () => {
    if (process.env.NODE_ENV == 'development' || !window.grecaptcha) {
      submit('', address);
    } else {
      redeemService.reCaptchaReady(redeemCode, address, submit);
    }
  };

  async function submit(token, currentAddress, currentRedeemCode) {
    try {
      const response = await redeemService.submit(token, currentAddress, currentRedeemCode);

      notification.success({
        message: `Redeem successfully ${ response?.data ? fromSmallestDenomination(response.data.amount) : '' } XPI`,
        duration: 10,
        style: { width: '100%' },
      });

      return response.data;
    } catch (error) {

      notification.error({
        message: 'Redeem failed',
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
    <>{ contextHolder }</>
  );
};

export default RedeemSection;
