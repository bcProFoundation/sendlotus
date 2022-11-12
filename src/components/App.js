import React, { useEffect, useState } from 'react';
import 'antd/dist/antd.less';
import { Spin } from 'antd';
import { CashLoadingIcon } from '@components/Common/CustomIcons';
import '../index.css';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '@assets/styles/theme';
import {
    FolderOpenFilled,
    CaretRightOutlined,
    SettingFilled,
} from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { ReactComponent as IconLixi } from '@assets/icon_lixi.svg';
import Wallet from '@components/Wallet/Wallet';
import Send from '@components/Send/Send';
import ClaimComponent from '@components/Claim/ClaimComponent';
import Configure from '@components/Configure/Configure';
import NotFound from '@components/NotFound';
import CashTab from '@assets/cashtab_xec.png';
import LogoLotusPink from '@assets/lotus-pink-logo.png'
import TabCash from '@assets/tabcash.png';
import './App.css';
import { WalletContext } from '@utils/context';
import { isValidStoredWallet } from '@utils/cashMethods';
import WalletLabel from '@components/Common/WalletLabel.js';
import {
    Route,
    Redirect,
    Switch,
    useLocation,
    useHistory,
    Link,
} from 'react-router-dom';
// Easter egg imports not used in extension/src/components/App.js
import { checkForTokenById } from '@utils/tokenMethods.js';
import ProtectableComponentWrapper from './Authentication/ProtectableComponentWrapper';
import { PushNotificationContext } from 'utils/context';
import intl from 'react-intl-universal';
import { checkInWithPushNotificationServer } from 'utils/pushNotification';

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
    .ant-popover-inner {
        background-color: ${props =>
        props.theme.app.background} !important;
    }
`;

const CustomApp = styled.div`
    text-align: center;
    font-family: 'Gilroy', sans-serif;
    background-color: ${props => props.theme.app.background};
    overflow-y: scroll;
`;

const Footer = styled.div`
    z-index: 2;
    background-color: ${props => props.theme.footer.background};
    border-radius: 20px;
    position: fixed;
    bottom: 0;
    width: 520px;
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
  `}
`;

export const WalletBody = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    background-image: ${props => props.theme.app.gradient};
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
    padding: 10px 0 15px;
    margin-bottom: 20px;
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
        padding: 10px 0 20px;
    }
`;

export const CashTabLogo = styled.img`
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
export const AbcLogo = styled.img`
    width: 150px;
    @media (max-width: 768px) {
        width: 120px;
    }
`;

// Easter egg styled component not used in extension/src/components/App.js
export const EasterEgg = styled.img`
    position: fixed;
    bottom: -195px;
    margin: 0;
    right: 10%;
    transition-property: bottom;
    transition-duration: 1.5s;
    transition-timing-function: ease-out;

    :hover {
        bottom: 0;
    }

    @media screen and (max-width: 1250px) {
        display: none;
    }
`;


const App = () => {
    const pushNotificationConfig = React.useContext(PushNotificationContext);
    const ContextValue = React.useContext(WalletContext);
    const { wallet, loading } = ContextValue;
    const [loadingUtxosAfterSend, setLoadingUtxosAfterSend] = useState(false);
    // If wallet is unmigrated, do not show page until it has migrated
    // An invalid wallet will be validated/populated after the next API call, ETA 10s
    const validWallet = isValidStoredWallet(wallet);
    const location = useLocation();
    const history = useHistory();
    const selectedKey =
        location && location.pathname ? location.pathname.substr(1) : '';

    // Easter egg boolean not used in extension/src/components/App.js
    const hasTab = validWallet
        ? checkForTokenById(
            wallet.state.tokens,
            '50d8292c6255cda7afc6c8566fed3cf42a2794e9619740fe8f4c95431271410e',
        )
        : false;

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
                                <Link to="/"><LotusLogo src={LogoLotusPink} alt="lotus" /></Link>
                                <Link to="/"><CashTabLogo src={CashTab} alt="cashtab" /></Link>
                                {/*Begin component not included in extension as desktop only*/}
                                {hasTab && (
                                    <EasterEgg src={TabCash} alt="tabcash" />
                                )}
                                {/*End component not included in extension as desktop only*/}
                                {/*Begin component not included in extension as replaced by open in tab link*/}
                                <a
                                    href="https://givelotus.org//"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                </a>
                                {/*Begin component not included in extension as replaced by open in tab link*/}
                            </HeaderCtn>
                            <ProtectableComponentWrapper>
                                <WalletLabel name={wallet.name}></WalletLabel>
                                <Switch>
                                    <Route path="/wallet">
                                        <Wallet />
                                    </Route>
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
                                    <Route path="/lixi"
                                        render={props => (<ClaimComponent
                                            address={wallet?.Path10605?.xAddress}
                                        />)}
                                    />
                                    <Route path="/configure">
                                        <Configure />
                                    </Route>
                                    <Redirect exact from="/" to="/wallet" />
                                    <Route component={NotFound} />
                                </Switch>
                            </ProtectableComponentWrapper>
                        </WalletCtn>
                        {wallet ? (
                            <Footer>
                                <NavButton
                                    active={selectedKey === 'wallet'}
                                    onClick={() => history.push('/wallet')}
                                >
                                    <FolderOpenFilled />
                                    {intl.get('wallet.Wallet')}
                                </NavButton>

                                <NavButton
                                    active={selectedKey === 'send'}
                                    onClick={() => history.push('/send')}
                                >
                                    <CaretRightOutlined />
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
                        ) : null}
                    </WalletBody>
                </CustomApp>
            </Spin>
        </ThemeProvider>
    );
};

export default App;
