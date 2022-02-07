export const theme = {
    primary: '#6f2dbd',
    brandSecondary: '#CD0BC3',
    contrast: '#fff',
    app: {
        sidebars: `url("/cashtab_bg.png")`,
        gradient : 'linear-gradient(-225deg, #231557 0%, #44107A 29%, #FF1361 67%, #d38cad 100%)',
        background: '#fbfbfd',
    },
    wallet: {
        background: '#fff',
        text: {
            primary: '#6f2dbd',
            secondary: '#6212f5',
        },
        switch: {
            activeCash: {
                shadow:
                    'inset 8px 8px 16px #44107A, inset -8px -8px 16px #6f2dbd',
            },
            activeToken: {
                background: '#CD0BC3',
                shadow:
                    'inset 5px 5px 11px #FF21D0, inset -5px -5px 11px #CD0BC3',
            },
            inactive: {
                background: 'linear-gradient(145deg, #eeeeee, #c8c8c8)',
            },
        },
        borders: { color: '#e2e2e2' },
        shadow: 'rgba(0, 0, 0, 1)',
    },
    tokenListItem: {
        background: '#ffffff',
        color: '',
        boxShadow:
            'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px,rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
        border: '#e9eaed',
        hoverBorder: '#231F20',
    },
    footer: {
        background: '#fff',
        navIconInactive: '#949494',
    },
    forms: {
        error: '#FF21D0',
        border: '#e7edf3',
        text: '#6f2dbd',
        addonBackground: '#f4f4f4',
        addonForeground: '#6f2dbd',
        selectionBackground: '#fff',
    },
    icons: { 
        outlined: '#6f2dbd',
        outlinedFaded: '#bb98ff',
        filled: '#6f2dbd',
        filledFaded: '#bb98ff'
    },
    modals: {
        buttons: { background: '#fff' },
    },
    settings: { delete: '#CD0BC3' },
    qr: {
        copyBorderCash: '#00ABE7',
        copyBorderToken: '#FF21D0',
        background: '#fff',
        token: '#231F20',
        shadow:
            'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
    },
    buttons: {
        primary: {
            backgroundImage:
                'linear-gradient(270deg, #973aa8 0%, #6d23b6 100%)',
            color: '#fff',
            hoverShadow: '0px 3px 10px -5px rgba(0, 0, 0, 0.75)',
        },
        secondary: {
            background: '#e9eaed',
            color: '#6f2dbd',
            hoverShadow: '0px 3px 10px -5px rgba(0, 0, 0, 0.75)',
        },
    },
    collapses: {
        background: '#fbfcfd',
        border: '#eaedf3',
        color: '#3e3f42',
    },
    generalSettings: {
        item: {
            icon: '#949494',
            title: '#949494',
        },
        background: '#fff',
    },
};
