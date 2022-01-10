import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, notification } from 'antd';
import { useHistory } from 'react-router-dom'
import PrimaryButton from '@components/Common/PrimaryButton';
import { FormItemRedeemCodeXpiInput } from '@components/Common/EnhancedInputs';
import redeemService from './services/redeemService';

const RedeemComponent = ({ address }) => {
  const history = useHistory()

  const [formData, setFormData] = useState({
    dirty: true,
    value: '',
    redeemCode: '',
  });

  useEffect(() => {
    if (!address) {
      history.push("/wallet");
    }
    else if (process.env.NODE_ENV !== 'development') {
      redeemService.loadReCaptcha(() => { });
    }
  }, []);

  const handleOnClick = e => {
    e.preventDefault();
    if (process.env.NODE_ENV !== 'development') {
      redeemService.reCaptchaReady(formData.redeemCode, address, submit);
    } else {
      submit();
    }
  }

  const handleRedeemCodeChange = e => {
    const { value, name } = e.target;
    let redeemCode = value;
  }

  async function submit(token) {
    try {
      const response = await redeemService.submit(token ?? null, address, formData.redeemCode);

      notification.success({
        message: `Redeem successfully ${response?.data ? fromSmallestDenomination(response.data.amount) : ''} XPI`,
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
    }
  }

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
            <FormItemRedeemCodeXpiInput
              inputProps={{
                onChange: e => handleRedeemCodeChange(e),
                value: formData.redeemCode,
              }}
            ></FormItemRedeemCodeXpiInput>
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