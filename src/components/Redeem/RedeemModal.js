import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { notification } from 'antd';
import axios from 'axios';
import useBCH from '@hooks/useBCH';
import { WalletContext } from '@utils/context';

const SITE_KEY = "6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb";

const RedeemModal = ({ address, redeemCode }) => {
  const { getBCH } = useBCH();
  const BCH = getBCH();

  const history = useHistory()

  const ContextValue = React.useContext(WalletContext);
  const { createWallet } = ContextValue;

  useEffect(() => {
    if (!address) {
      createWallet()
    }
    else {
      // load the script by passing the URL
      loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`, function () {
        handleRedeem();
      });
    }
  }, [address, redeemCode]);

  const loadScriptByURL = (id, url, callback) => {
    const isScriptExist = document.getElementById(id);

    if (!isScriptExist) {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.id = id;
      script.onload = function () {
        if (callback) callback();
      };
      document.body.appendChild(script);
    }

    if (isScriptExist && callback) callback();
  }

  const handleRedeem = () => {
    let captcha = window.grecaptcha.enterprise
    if (captcha) {
      captcha.ready(() => {
        captcha.execute(SITE_KEY, {
          action: 'submit',
          twofactor: true
        }).then((token) => {
          submit(token, address);
        });
      });
    }
  };

  async function submit(token, currentAddress) {
    try {
      if (
        !currentAddress ||
        !redeemCode
      ) {
        return;
      }

      const address = currentAddress;

      // Get the param-free address
      let cleanAddress = address.split('?')[0];

      const isValidAddress = BCH.Address.isXAddress(cleanAddress);

      if (!isValidAddress) {
        const error = `Destination is not a valid ${currency.ticker} address`;
        throw error;
      }

      const response = await axios.post('https://api.lixilotus.com/api/redeems',
        {
          redeemCode: redeemCode,
          redeemAddress: address,
          captchaToken: token
        });

      notification.success({
        message: 'Redeem success',
        duration: 3,
        style: { width: '100%' },
      });
      return response.data;
    } catch (error) {

      notification.error({
        message: 'Redeem failed',
        duration: 3,
        style: { width: '100%' },
      });
    } finally {
      history.push("/wallet");
    }
  }

  return (
    <></>
  );
};

export default RedeemModal;
