import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import CheckBrowser from './components/InApp/check-browser';
import { AuthenticationProvider, PushNotificationProvider, WalletProvider } from './utils/context';
import { HashRouter as Router } from 'react-router-dom';
import GA from './utils/GoogleAnalytics';
import InApp from '@utils/inapp';

const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera);

ReactDOM.render(
    <AuthenticationProvider>
        <WalletProvider>
            <PushNotificationProvider>
                <Router>
                    <CheckBrowser />
                    {!inapp?.isInApp && <App />}
                </Router>
            </PushNotificationProvider>
        </WalletProvider>
    </AuthenticationProvider>,
    document.getElementById('root'),
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () =>
        navigator.serviceWorker.register('/serviceWorker.js').catch(() => null),
    );
}

if (module.hot) {
    module.hot.accept();
}
