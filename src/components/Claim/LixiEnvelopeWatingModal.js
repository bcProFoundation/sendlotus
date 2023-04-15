import React from 'react';
import styled from 'styled-components';
import { Modal, Image } from 'antd';
import ThemeCardGif from '@assets/woman_day_theme_card.gif';
import WeddingThemeCardGif from '@assets/wedding_theme_card.gif';


const LixiEnvelopeWatingModal = ({ className, onOpenLixi, claimCode }) => {

    const specialclaimCode = '2LFmAfUm1A';

    return (
        <Modal visible={true} closable={false} footer={null} className={className}>
            <div className='lixi-container' onClick={onOpenLixi}>
                <Image preview={false} src={claimCode == specialclaimCode ? WeddingThemeCardGif : ThemeCardGif} className='envelope-background' />
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
