import React, { useState } from 'react';
import { Spin } from 'antd';
import { CashLoadingIcon } from '@components/Common/CustomIcons';
import '../index.css';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '@assets/styles/theme';
import {
    SettingFilled,
    WalletFilled,
    SendOutlined
} from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { ReactComponent as IconLixi } from '@assets/icon_lixi.svg';
import Wallet from '@components/Wallet/Wallet';
// import Tokens from '@components/Tokens/Tokens';
import Send from '@components/Send/Send';
// import SendToken from '@components/Send/SendToken';
import Configure from '@components/Configure/Configure';
import NotFound from '@components/NotFound';
import SendLotus from '@assets/sendlotus_xpi.png';
import LogoLotus from '@assets/lotus-pink-logo.png'
import './App.css';
import { WalletContext } from '@utils/context';
import { isValidStoredWallet } from '@utils/cashMethods';
import WalletLabel from '@components/Common/WalletLabel.js';
import {
    Route,
    Link,
    Redirect,
    Switch,
    useLocation,
    useHistory,
} from 'react-router-dom';
// Extension-only import used for open in new tab link
import PopOut from '@assets/popout.svg';
import intl from 'react-intl-universal';
import ClaimComponent from './Claim/ClaimComponent';
import InApp from '@utils/inapp';

const GlobalStyle = createGlobalStyle`    
    .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button, .ant-modal > button, .ant-modal-confirm-btns > button, .ant-modal-footer > button {
        border-radius: 8px;
        background-color: ${props => props.theme.modals.buttons.background};
        color: ${props => props.theme.wallet.text.secondary};
        font-weight: bold;
    }    
    
    .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button:hover,.ant-modal-confirm-btns > button:hover, .ant-modal-footer > button:hover {
        color: ${props => props.theme.primary};
        transition: color 0.3s;
        background-color: ${props => props.theme.modals.buttons.background};
    }   
    .selectedCurrencyOption {
        text-align: left;
        color: ${props => props.theme.wallet.text.secondary} !important;
        background-color: ${props => props.theme.contrast} !important;
    }
    .cashLoadingIcon {
        color: ${props => props.theme.primary} !important;
        font-size: 48px !important;
    }
    .selectedCurrencyOption:hover {
        color: ${props => props.theme.contrast} !important;
        background-color: ${props => props.theme.primary} !important;
    }
    #addrSwitch {
        .ant-switch-checked {
            background-color: white !important;
        }
    }
    #addrSwitch.ant-switch-checked {
        background-image: ${props =>
        props.theme.buttons.primary.backgroundImage} !important;
    }
`;

const CustomApp = styled.div`
    text-align: center;
    font-family: 'Gilroy', sans-serif;
    background-color: ${props => props.theme.app.background};
`;

const Footer = styled.div`
    z-index: 2;
    background-color: ${props => props.theme.footer.background};
    position: fixed;
    bottom: 0;
    width: 580px;
    @media (max-width: 768px) {
        width: 100%;
    }
    border-top: 1px solid ${props => props.theme.wallet.borders.color};
`;

export const NavButton = styled.button`
    :focus,
    :active {
        outline: none;
    }
    cursor: pointer;
    padding: 24px 12px 12px 12px;
    margin: 0 28px;
    @media (max-width: 475px) {
        margin: 0 20px;
    }
    @media (max-width: 420px) {
        margin: 0 12px;
    }
    @media (max-width: 350px) {
        margin: 0 8px;
    }
    background-color: ${props => props.theme.footer.background};
    border: none;
    font-size: 12px;
    font-weight: bold;
    .anticon {
        display: block;
        color: ${props => props.theme.footer.navIconInactive};
        font-size: 24px;
        margin-bottom: 6px;
    }
    ${({ active, ...props }) =>
        active &&
        `    
        color: ${props.theme.primary};
        .anticon {
            color: ${props.theme.primary};
        }
  ` }
    .ant-popover-inner {
        background-color: ${props =>
        props.theme.app.background} !important;
    }
`;

export const WalletBody = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    background: ${props => props.theme.app.gradient};
    background-attachment: fixed;
`;

export const WalletCtn = styled.div`
    position: relative;
    width: 520px;
    background-color: ${props => props.theme.footerBackground};
    min-height: 100vh;
    padding: 10px 30px 120px 30px;
    background: ${props => props.theme.wallet.background};
    -webkit-box-shadow: 0px 0px 24px 1px ${props => props.theme.wallet.shadow};
    -moz-box-shadow: 0px 0px 24px 1px ${props => props.theme.wallet.shadow};
    box-shadow: 0px 0px 24px 1px ${props => props.theme.wallet.shadow};
    @media (max-width: 768px) {
        width: 100%;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
`;

export const HeaderCtn = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start !important;
    width: 100%;
    padding: 10px 0 0 0;
    justify-content: space-between;
    border-bottom: 1px solid ${props => props.theme.wallet.borders.color};

    a {
        color: ${props => props.theme.wallet.text.secondary};

        :hover {
            color: ${props => props.theme.primary};
        }
    }

    @media (max-width: 768px) {
        a {
            font-size: 12px;
        }
        padding: 10px 0 0 0;
    }
`;

export const SendLotusLogo = styled.img`
    width: 200px;
    @media (max-width: 768px) {
        width: 150px;
    }
`;
export const LotusLogo = styled.img`
    width: 60px;
    @media (max-width: 768px) {
        width: 60px;
    }
`;

// Extension only styled components
const OpenInTabBtn = styled.button`
    background: none;
    border: none;
`;

const ExtTabImg = styled.img`
    max-width: 20px;
`;

const App = () => {
    const ContextValue = React.useContext(WalletContext);
    const inapp = new InApp(navigator.userAgent || window.opera);
    const { wallet, loading } = ContextValue;
    const [loadingUtxosAfterSend, setLoadingUtxosAfterSend] = useState(false);
    // If wallet is unmigrated, do not show page until it has migrated
    // An invalid wallet will be validated/populated after the next API call, ETA 10s
    const validWallet = isValidStoredWallet(wallet);
    const location = useLocation();
    const history = useHistory();
    const selectedKey =
        location && location.pathname ? location.pathname.substr(1) : '';
    // openInTab is an extension-only method
    const openInTab = () => {
        window.open(`index.html#/${selectedKey}`);
    };

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Spin
                spinning={
                    loading || loadingUtxosAfterSend || (wallet && !validWallet)
                }
                indicator={CashLoadingIcon}
            >
                <CustomApp>
                    <WalletBody>
                        <WalletCtn>
                            <HeaderCtn>
                                <Link to="/"><LotusLogo src={LogoLotus} alt="lotus" /></Link>
                                <SendLotusLogo src={SendLotus} alt="sendlotus" />
                                {/*Begin extension-only components*/}
                                {!inapp && <OpenInTabBtn
                                    data-tip="Open in tab"
                                    onClick={() => openInTab()}
                                >
                                    <ExtTabImg src={PopOut} alt="Open in tab" />
                                </OpenInTabBtn>}
                                {/*End extension-only components*/}
                            </HeaderCtn>
                            <WalletLabel name={wallet.name}></WalletLabel>
                            <Switch>
                                <Route exact path="/">
                                    <Wallet />
                                </Route>
                                {/* <Route path="/tokens">
                                    <Tokens
                                        passLoadingStatus={
                                            setLoadingUtxosAfterSend
                                        }
                                    />
                                </Route> */}
                                <Route path="/send">
                                    <Send
                                        passLoadingStatus={
                                            setLoadingUtxosAfterSend
                                        }
                                    />
                                </Route>
                                    
                                <Route path="/lixi/:claimCode"
                                    render={props => (<ClaimComponent
                                        claimCode={props.match.params.claimCode}
                                        address={wallet?.Path10605?.xAddress}
                                    />)}
                                />
                                <Route path="/lixi">
                                    <ClaimComponent
                                        address={wallet?.Path10605?.xAddress}
                                    />
                                </Route>
                                <Route path="/configure">
                                    <Configure />
                                </Route>
                                <Redirect exact from="/" to="/wallet" />
                                <Route component={NotFound} />
                            </Switch>
                        </WalletCtn>
                        {wallet && 
                            <Footer>
                                <NavButton
                                    active={!selectedKey}
                                    onClick={() => history.push('/')}
                                >
                                    <WalletFilled />
                                    {intl.get('wallet.Wallet')}
                                </NavButton>

                                {/* <NavButton
                                    active={selectedKey === 'tokens'}
                                    onClick={() => history.push('/tokens')}
                                >
                                    <AppstoreAddOutlined />
                                    {intl.get('wallet.Tokens')}
                                </NavButton> */}

                                <NavButton
                                    active={selectedKey === 'send'}
                                    onClick={() => history.push('/send')}
                                >
                                    <SendOutlined />
                                    {intl.get('wallet.Send')}
                                </NavButton>

                                <NavButton
                                    active={selectedKey === 'lixi'}
                                    onClick={() => history.push('/lixi')}
                                >
                                    <Icon component={IconLixi} />
                                    {intl.get('wallet.Lixi')}
                                </NavButton>

                                <NavButton
                                    active={selectedKey === 'configure'}
                                    onClick={() => history.push('/configure')}
                                >
                                    <SettingFilled />
                                    {intl.get('wallet.Settings')}
                                </NavButton>
                            </Footer>
                        }
                    </WalletBody>
                </CustomApp>
            </Spin>
        </ThemeProvider>
    );
};

export default App;
