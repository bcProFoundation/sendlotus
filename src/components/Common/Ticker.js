import mainLogo from '@assets/logo_primary.png';
import tokenLogo from '@assets/logo_secondary.png';
import cashaddr from 'ecashaddrjs';
import BigNumber from 'bignumber.js';

export const currency = {
    name: 'Lotus',
    ticker: 'XPI',
    logo: mainLogo,
    legacyPrefix: 'bitcoincash',
    prefixes: ['lotus'],
    coingeckoId: 'bitcoin-cash-abc-2',
    defaultFee: 1.01,
    dustSats: 550,
    etokenSats: 546,
    cashDecimals: 6,
    blockExplorerUrl: 'https://explorer.givelotus.org',
    tokenExplorerUrl: 'https://explorer.be.cash',
    blockExplorerUrlTestnet: 'https://texplorer.bitcoinabc.org',
    tokenName: 'eToken',
    tokenTicker: 'eToken',
    tokenLogo: tokenLogo,
    tokenPrefixes: ['etoken'],
    tokenIconsUrl: '', //https://tokens.bitcoin.com/32 for BCH SLP
    txHistoryCount: 10,
    hydrateUtxoBatchSize: 20,
    defaultSettings: { fiatCurrency: 'usd' },
    opReturn: {
        opReturnPrefixHex: '6a',
        opReturnAppPrefixLengthHex: '04',
        opPushDataOne: '4c',
        appPrefixesHex: {
            eToken: '534c5000',
            lotusChat: '02020202',
            lotusChatEncrypted: '03030303'
        },
        encryptedMsgByteLimit: 206,
        unencryptedMsgByteLimit: 215,
    },
    settingsValidation: {
        fiatCurrency: [
            'usd',
            'idr',
            'krw',
            'cny',
            'zar',
            'vnd',
            'cad',
            'nok',
            'eur',
            'gbp',
            'jpy',
            'try',
            'rub',
            'inr',
            'brl',
        ],
    },
    fiatCurrencies: {
        usd: { name: 'US Dollar', symbol: '$', slug: 'usd' },
        brl: { name: 'Brazilian Real', symbol: 'R$', slug: 'brl' },
        gbp: { name: 'British Pound', symbol: '£', slug: 'gbp' },
        cad: { name: 'Canadian Dollar', symbol: '$', slug: 'cad' },
        cny: { name: 'Chinese Yuan', symbol: '元', slug: 'cny' },
        eur: { name: 'Euro', symbol: '€', slug: 'eur' },
        inr: { name: 'Indian Rupee', symbol: '₹', slug: 'inr' },
        idr: { name: 'Indonesian Rupiah', symbol: 'Rp', slug: 'idr' },
        jpy: { name: 'Japanese Yen', symbol: '¥', slug: 'jpy' },
        krw: { name: 'Korean Won', symbol: '₩', slug: 'krw' },
        nok: { name: 'Norwegian Krone', symbol: 'kr', slug: 'nok' },
        rub: { name: 'Russian Ruble', symbol: 'р.', slug: 'rub' },
        zar: { name: 'South African Rand', symbol: 'R', slug: 'zar' },
        try: { name: 'Turkish Lira', symbol: '₺', slug: 'try' },
        vnd: { name: 'Vietnamese đồng', symbol: 'đ', slug: 'vnd' },
    },
};

export function isValidCashPrefix(addressString) {
    // Note that this function validates prefix only
    // Check for prefix included in currency.prefixes array
    // For now, validation is handled by converting to bitcoincash: prefix and checksum
    // and relying on legacy validation methods of bitcoincash: prefix addresses

    // Also accept an address with no prefix, as some exchanges provide these
    for (let i = 0; i < currency.prefixes.length; i += 1) {
        // If the addressString being tested starts with an accepted prefix or no prefix at all
        if (
            addressString.startsWith(currency.prefixes[i]) ||
            !addressString.includes(':')
        ) {
            return true;
        }
    }
    return false;
}

export function isValidTokenPrefix(addressString) {
    // Check for prefix included in currency.tokenPrefixes array
    // For now, validation is handled by converting to simpleledger: prefix and checksum
    // and relying on legacy validation methods of simpleledger: prefix addresses

    // For token addresses, do not accept an address with no prefix
    for (let i = 0; i < currency.tokenPrefixes.length; i += 1) {
        if (addressString.startsWith(currency.tokenPrefixes[i] + ':')) {
            return true;
        }
    }
    return false;
}

export function toLegacy(address) {
    let legacyAddress;

    try {
        if (isValidCashPrefix(address)) {
            // Note: an `ecash:` checksum address with no prefix will not be validated by
            // parseAddress in Send.js

            // Only handle the case of prefixless address that is valid `bitcoincash:` address

            // const { type, hash } = cashaddr.decode(testedAddress);
            // legacyAddress = cashaddr.encode(currency.legacyPrefix, type, hash);
        } else {
            console.log(`Error: ${address} is not a cash address`);
            throw new Error(
                'Address prefix is not a valid cash address with a prefix from the Ticker.prefixes array',
            );
        }
    } catch (err) {
        return err;
    }
    return legacyAddress;
}

export function parseAddress(BCH, addressString, isToken = false) {
    // Build return obj
    const addressInfo = {
        address: '',
        isValid: false,
        queryString: null,
        amount: null,
    };
    // Parse address string for parameters
    const paramCheck = addressString.split('?');

    let cleanAddress = paramCheck[0];
    addressInfo.address = cleanAddress;

    // Validate address
    let isValidAddress;
    
    try {
        if (isToken) {
            isValidAddress = BCH.Address.isCashAddress(cleanAddress);
            const { prefix } = cashaddr.decode(cleanAddress);
            if (!currency.tokenPrefixes.includes(prefix)) {
                isValidAddress = false;
            }
        } else {
            isValidAddress = BCH.Address.isXAddress(cleanAddress);
        }
        
    } catch (err) {
        isValidAddress = false;
    }

    addressInfo.isValid = isValidAddress;

    // Check for parameters
    // only the amount param is currently supported
    let queryString = null;
    let amount = null;
    if (paramCheck.length > 1) {
        queryString = paramCheck[1];
        addressInfo.queryString = queryString;

        const addrParams = new URLSearchParams(queryString);

        if (addrParams.has('amount')) {
            // Amount in satoshis
            try {
                amount = new BigNumber(parseInt(addrParams.get('amount')))
                    .div(10 ** currency.cashDecimals)
                    .toString();
            } catch (err) {
                amount = null;
            }
        }
    }

    addressInfo.amount = amount;
    return addressInfo;
}
