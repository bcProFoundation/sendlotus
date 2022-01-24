import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import CheckBrowser from './components/InApp/check-browser';
import { AuthenticationProvider, WalletProvider } from './utils/context';
import { BrowserRouter as Router } from 'react-router-dom';
import GA from './utils/GoogleAnalytics';
import InApp from '@utils/inapp';

const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera);

ReactDOM.render(
    <AuthenticationProvider>
        <WalletProvider>
            <Router>
                <CheckBrowser />
                {GA.init() && <GA.RouteTracker />}
                {!inapp?.isInApp && <App />}
            </Router>
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
