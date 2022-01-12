import axios from 'axios';
import useBCH from '@hooks/useBCH';

const SITE_KEY = "6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb";

const { getBCH } = useBCH();
const BCH = getBCH();

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

const redeemService = {
  async submit(token, currentAddress, redeemCode) {
    try {
      if (
        !currentAddress ||
        !redeemCode
      ) {
        throw 'Please input address and redeem code';
      }

      const address = currentAddress;

      // Get the param-free address
      let cleanAddress = address.split('?')[0];

      const isValidAddress = BCH.Address.isXAddress(cleanAddress);

      if (!isValidAddress) {
        const error = `Destination is not a valid ${currency.ticker} address`;
        throw error;
      }
      const response = await axios.post(`${process.env["REACT_APP_BCHA_LIXI_APIS"]}redeems`,
        {
          redeemCode: redeemCode,
          redeemAddress: address,
          captchaToken: token
        });

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  loadReCaptcha(callback) {
    loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`, () => {
      callback();
    });
  },
  reCaptchaReady(redeemCode, address, callback) {
    let captcha = window.grecaptcha.enterprise
    if (captcha) {
      captcha.ready(() => {
        captcha.execute(SITE_KEY, {
          action: 'submit',
          twofactor: true
        }).then((token) => {
          callback(token, address, redeemCode);
        });
      });
    }
  }
}

export default redeemService;