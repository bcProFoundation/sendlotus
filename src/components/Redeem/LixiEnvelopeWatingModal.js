import React from 'react';
import styled from 'styled-components';
import { Modal, Image } from 'antd';
import RedEnvelopeBackground from '@assets/red_envelope_background.svg';


const LixiEnvelopeWatingModal = ({ className, onOpenLixi }) => {
    return (
        <Modal visible={true} closable={false} footer={null} className={className}>
            <div className='lixi-container' onClick={onOpenLixi}>
                <Image preview={false} src={RedEnvelopeBackground} className='envelope-background' />
            </div>
        </Modal>
    )
}

const StyledLixiEnvelopeWatingModal = styled(LixiEnvelopeWatingModal)`
    top: 0 !important;
    height: 100vh !important;
    .lixi-container {
        position: relative;
        top: 0;
        left: 0;
        height: 100vh !important;
        display: flex;
        align-items: center;
        justify-content: center;
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

export default StyledLixiEnvelopeWatingModal;