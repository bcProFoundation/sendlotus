import { useEffect } from 'react';
import axios from 'axios';
import useBCH from '@hooks/useBCH';
import * as resolve from 'resolve';

const SITE_KEY = "6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb";

const loadScriptByURL = async (id, url) => {

    return new Promise((resolve, reject) => {

        try {
            const isScriptExist = document.getElementById(id);

            if (!isScriptExist) {
                let script = document.createElement("script");
                script.type = "text/javascript";
                script.src = url;
                script.id = id;
                script.onload = function () {
                    resolve();
                };
                document.body.appendChild(script);
            } else {
                resolve();
            }

        } catch (e) {
            reject(e);
        }
    });
}

const useRedeem = (address) => {
    const { getBCH } = useBCH();
    const BCH = getBCH();

    useEffect(async () => {
        if (address) {
            if (process.env.NODE_ENV !== 'development') {
                loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`);
            }
        }
    }, [address]);

    const redeem = async (token, currentAddress, redeemCode) => {
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

            return response;
        } catch (error) {
            throw error?.response?.data;
        }
    }

    const getLixi = async (lixiId) => {
        try {
            const url = `${process.env.REACT_APP_BCHA_LIXI_APIS}vaults/${lixiId}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.log(`Unable to get the lixi`);
            throw error?.response?.data;
        }
    }

    const getRedeem = async (redeemId) => {
        try {
            const url = `${process.env.REACT_APP_BCHA_LIXI_APIS}redeems/${redeemId}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.log(`Unable to get the redeem`);
            throw error?.response?.data;
        }
    }

    const reCaptchaReady = (redeemCode, address) => {
        return new Promise((resolve, reject) => {
            let captcha = window.grecaptcha.enterprise;
            if (captcha) {
                captcha.ready(() => {
                    captcha.execute(SITE_KEY, {
                        action: 'submit',
                        twofactor: true
                    }).then((token) => {
                        resolve(token);
                    }).catch(err => {
                        reject();
                    })
                });
            }
        });
    }

    return {
        redeem,
        reCaptchaReady,
        getLixi
    };
}

export default useRedeem;
