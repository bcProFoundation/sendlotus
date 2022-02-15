import React, { useState } from 'react';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import { Input, Form, Modal } from 'antd';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import {
    ExclamationCircleOutlined,
    PlusSquareOutlined,
    ImportOutlined,
    LockOutlined,
} from '@ant-design/icons';
import PrimaryButton, {
    SecondaryButton,
    SmartButton,
} from '@components/Common/PrimaryButton';
import { Event } from '@utils/GoogleAnalytics';

export const WelcomeText = styled.p`
    color: ${props => props.theme.wallet.text.secondary};
    width: 100%;
    font-size: 16px;
    margin-bottom: 60px;
    text-align: left;
`;

export const WelcomeLink = styled.a`
    text-decoration: underline;
    color: ${props => props.theme.primary};
`;

const OnBoarding = () => {
    const ContextValue = React.useContext(WalletContext);
    const { createWallet, validateMnemonic } = ContextValue;
    const [formData, setFormData] = useState({
        dirty: true,
        mnemonic: '',
    });

    const [seedInput, openSeedInput] = useState(false);
    const [isValidMnemonic, setIsValidMnemonic] = useState(false);
    const { confirm } = Modal;

    async function submit() {
        setFormData({
            ...formData,
            dirty: false,
        });

        if (!formData.mnemonic) {
            return;
        }
        // Event("Category", "Action", "Label")
        // Track number of created wallets from onboarding
        Event('Onboarding.js', 'Create Wallet', 'Imported');
        createWallet(formData.mnemonic);
    }

    const handleChange = e => {
        const { value, name } = e.target;

        // Validate mnemonic on change
        // Import button should be disabled unless mnemonic is valid
        setIsValidMnemonic(validateMnemonic(value));

        setFormData(p => ({ ...p, [name]: value }));
    };

    function showBackupConfirmModal() {
        confirm({
            title: "Don't forget to back up your wallet",
            icon: <ExclamationCircleOutlined />,
            content: `Once your wallet is created you can back it up by writing down your 12-word seed. You can find your seed on the Settings page. If you are browsing in Incognito mode or if you clear your browser history, you will lose any funds that are not backed up!`,
            okText: 'Okay, make me a wallet!',
            onOk() {
                // Event("Category", "Action", "Label")
                // Track number of created wallets from onboarding
                Event('Onboarding.js', 'Create Wallet', 'New');
                createWallet();
            },
        });
    }

    return (
        <>
            <h2>Welcome to SendLotus!</h2>
            <WelcomeText>
                SendLotus is an open source, non-custodial web wallet for Lotus.
                <br />
                To start, install SendLotus to your device follow {' '}
                <WelcomeLink
                    href="https://gitlab.com/abcpros/sendlotus/-/wikis/home"
                    target="_blank"
                    rel="noreferrer"
                >
                    the guide
                </WelcomeLink>
            </WelcomeText>

            <PrimaryButton onClick={() => showBackupConfirmModal()}>
                <PlusSquareOutlined /> New Wallet
            </PrimaryButton>

            <SecondaryButton onClick={() => openSeedInput(!seedInput)}>
                <ImportOutlined /> Import Wallet
            </SecondaryButton>
            {seedInput && (
                <AntdFormWrapper>
                    <Form style={{ width: 'auto' }}>
                        <Form.Item
                            validateStatus={
                                !formData.dirty && !formData.mnemonic
                                    ? 'error'
                                    : ''
                            }
                            help={
                                !formData.mnemonic || !isValidMnemonic
                                    ? 'Valid mnemonic seed phrase required'
                                    : ''
                            }
                        >
                            <Input
                                prefix={<LockOutlined />}
                                type="email"
                                placeholder="mnemonic (seed phrase)"
                                name="mnemonic"
                                autoComplete="off"
                                onChange={e => handleChange(e)}
                                required
                            />
                        </Form.Item>

                        <SmartButton
                            disabled={!isValidMnemonic}
                            onClick={() => submit()}
                        >
                            Import
                        </SmartButton>
                    </Form>
                </AntdFormWrapper>
            )}
        </>
    );
};

export default OnBoarding;
