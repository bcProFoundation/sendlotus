import { currency } from '@components/Common/Ticker';
import BigNumber from 'bignumber.js';
import { decryptOpReturnMsg, getHashArrayFromWallet, getUtxoWif, parseOpReturn } from './cashMethods';

const PATHS = ['Path899','Path1899','Path10605']
const getWalletPathsFromWalletState = (wallet) => {
  const allWalletPaths = selectAllPaths(wallet);
  return allWalletPaths;
};

/* 
Note: chronik.script('p2pkh', hash160).utxos(); is not readily mockable in jest
Hence it is necessary to keep this out of any functions that require unit testing
*/
export const getUtxosSingleHashChronik = async (chronik, hash160) => {
  // Get utxos at a single address, which chronik takes in as a hash160
  let utxos;
  try {
    utxos = await chronik.script('p2pkh', hash160).utxos();
    if (utxos.length === 0) {
      // Chronik returns an empty array if there are no utxos at this hash160
      return [];
    }
    /* Chronik returns an array of with a single object if there are utxos at this hash 160
    [
        {
            outputScript: <hash160>,
            utxos:[{utxo}, {utxo}, ..., {utxo}]
        }
    ]
    */

    // Return only the array of utxos at this address
    return utxos[0].utxos;
  } catch (err) {
    console.log(`Error in chronik.utxos(${hash160})`, err);
  }
};

export const returnGetUtxosChronikPromise = (chronik, hash160AndAddressObj) => {
  /*
      Chronik thinks in hash160s, but people and wallets think in addresses
      Add the address to each utxo
  */
  return new Promise((resolve, reject) => {
    getUtxosSingleHashChronik(chronik, hash160AndAddressObj.hash160).then(
      result => {
        for (let i = 0; i < result.length; i += 1) {
          const thisUtxo = result[i];
          thisUtxo.address = hash160AndAddressObj.address;
        }
        resolve(result);
      },
      err => {
        reject(err);
      }
    );
  });
};

export const getUtxosChronik = async (chronik, hash160sMappedToAddresses) => {
  /* 
      Chronik only accepts utxo requests for one address at a time
      Construct an array of promises for each address
      Note: Chronik requires the hash160 of an address for this request
  */
  const chronikUtxoPromises = [];
  for (let i = 0; i < hash160sMappedToAddresses.length; i += 1) {
    const thisPromise = returnGetUtxosChronikPromise(chronik, hash160sMappedToAddresses[i]);
    chronikUtxoPromises.push(thisPromise);
  }
  const allUtxos = await Promise.all(chronikUtxoPromises);
  // Since each individual utxo has address information, no need to keep them in distinct arrays
  // Combine into one array of all utxos
  const flatUtxos = allUtxos.flat();
  return flatUtxos;
};

export const organizeUtxosByType = chronikUtxos => {
  /* 
  Convert chronik utxos (returned by getUtxosChronik function, above) to match 
  shape of existing slpBalancesAndUtxos object
  */

  const nonSlpUtxos = [];
  for (let i = 0; i < chronikUtxos.length; i += 1) {
    // Construct nonSlpUtxos and slpUtxos arrays
    const thisUtxo = chronikUtxos[i];
    if (typeof thisUtxo.slpToken !== 'undefined') {
    } else {
      nonSlpUtxos.push(thisUtxo);
    }
  }

  return { nonSlpUtxos };
};

export const flattenChronikTxHistory = (txHistoryOfAllAddresses) => {
  // Create an array of all txs

  let flatTxHistoryArray = [];
  for (let i = 0; i < txHistoryOfAllAddresses.length; i += 1) {
    const txHistoryResponseOfThisAddress = txHistoryOfAllAddresses[i];
    const txHistoryOfThisAddress = txHistoryResponseOfThisAddress.txs;
    flatTxHistoryArray = flatTxHistoryArray.concat(txHistoryOfThisAddress);
  }
  return flatTxHistoryArray;
};

// @todo
export const sortAndTrimChronikTxHistory = (flatTxHistoryArray, txHistoryCount) => {
  // Isolate unconfirmed txs
  // In chronik, unconfirmed txs have an `undefined` block key
  const unconfirmedTxs = [];
  const confirmedTxs = [];
  for (let i = 0; i < flatTxHistoryArray.length; i += 1) {
    const thisTx = flatTxHistoryArray[i];
    if (typeof thisTx.block === 'undefined') {
      unconfirmedTxs.push(thisTx);
    } else {
      confirmedTxs.push(thisTx);
    }
  }
  // Sort confirmed txs by blockheight, and then timeFirstSeen
  const sortedConfirmedTxHistoryArray = confirmedTxs.sort(
    (a, b) =>
      // We want more recent blocks i.e. higher blockheights to have earlier array indices
      b.block.height - a.block.height ||
      // For blocks with the same height, we want more recent timeFirstSeen i.e. higher timeFirstSeen to have earlier array indices
      b.timeFirstSeen - a.timeFirstSeen
  );
  // Sort unconfirmed txs by timeFirstSeen
  const sortedUnconfirmedTxHistoryArray = unconfirmedTxs.sort((a, b) => b.timeFirstSeen - a.timeFirstSeen);
  // The unconfirmed txs are more recent, so they should be inserted into an array before the confirmed txs
  const sortedChronikTxHistoryArray = sortedUnconfirmedTxHistoryArray.concat(sortedConfirmedTxHistoryArray);

  const trimmedAndSortedChronikTxHistoryArray = sortedChronikTxHistoryArray.splice(0, txHistoryCount);

  return trimmedAndSortedChronikTxHistoryArray;
};

export const returnGetTxHistoryChronikPromise = (chronik, hash160AndAddressObj) => {
  /*
      Chronik thinks in hash160s, but people and wallets think in addresses
      Add the address to each utxo
  */
  return new Promise((resolve, reject) => {
    chronik
      .script('p2pkh', hash160AndAddressObj.hash160)
      .history(/*page=*/ 0, /*page_size=*/ currency.txHistoryCount)
      .then(
        result => {
          resolve(result);
        },
        err => {
          reject(err);
        }
      );
  });
};

export const getRecipientPublicKey = async (
  XPI,
  chronik,
  recipientAddress,
  optionalMockPubKeyResponse = false
) => {
  // Necessary because jest can't mock
  // chronikTxHistoryAtAddress = await chronik.script('p2pkh', recipientAddressHash160).history(/*page=*/ 0, /*page_size=*/ 10);
  if (optionalMockPubKeyResponse) {
    return optionalMockPubKeyResponse;
  }

  // get hash160 of address
  let recipientAddressHash160 = null;
  try {
    recipientAddressHash160 = XPI.Address.toHash160(recipientAddress);
  } catch (err) {
    console.log(`Error determining XPI.Address.toHash160(${recipientAddress} in getRecipientPublicKey())`, err);
    // throw new Error(`Error determining XPI.Address.toHash160(${recipientAddress} in getRecipientPublicKey())`);
  }

  let chronikTxHistoryAtAddress = null;
  try {
    // Get 20 txs. If no outgoing txs in those 20 txs, just don't send the tx
    chronikTxHistoryAtAddress = await chronik
      .script('p2pkh', recipientAddressHash160)
      .history(/*page=*/ 0, /*page_size=*/ 20);
  } catch (err) {
    console.log(`Error getting await chronik.script('p2pkh', ${recipientAddressHash160}).history();`, err);
    throw new Error('Error fetching tx history to parse for public key');
  }

  let recipientPubKeyChronik;

  // Iterate over tx history to find an outgoing tx
  for (let i = 0; i < chronikTxHistoryAtAddress.txs.length; i += 1) {
    const { inputs } = chronikTxHistoryAtAddress.txs[i];
    for (let j = 0; j < inputs.length; j += 1) {
      const thisInput = inputs[j];
      const thisInputSendingHash160 = thisInput.outputScript;
      if (thisInputSendingHash160.includes(recipientAddressHash160)) {
        // Then this is an outgoing tx, you can get the public key from this tx
        // Get the public key
        try {
          recipientPubKeyChronik = chronikTxHistoryAtAddress.txs[i].inputs[j].inputScript.slice(-66);
        } catch (err) {
          throw new Error('Cannot send an encrypted message to a wallet with no outgoing transactions');
        }
        return recipientPubKeyChronik;
      }
    }
  }
  // You get here if you find no outgoing txs in the chronik tx history
  throw new Error('Cannot send an encrypted message to a wallet with no outgoing transactions in the last 20 txs');
};

export const parseChronikTx = async (XPI, chronik, tx, wallet ) => {
  const walletHash160s = getHashArrayFromWallet(wallet);
  const { inputs, outputs } = tx;
  // Assign defaults
  let incoming = true;
  let xpiAmount = new BigNumber(0);
  let originatingHash160 = '';

  // Initialize required variables
  let messageHex = '';
  let opReturnMessage;
  let isLotusMessage = false;
  let isEncryptedMessage = false;
  let decryptionSuccess = false;
  let replyAddress = ''; // or senderAddress
  let destinationAddress = '';

  // Iterate over inputs to see if this is an incoming tx (incoming === true)
  for (let i = 0; i < inputs.length; i += 1) {
    const thisInput = inputs[i];
    const thisInputSendingHash160 = thisInput.outputScript;

    try {
      const legacyReplyAddress = XPI.Address.fromOutputScript(Buffer.from(thisInput.outputScript, 'hex'));
      replyAddress = XPI.Address.toXAddress(legacyReplyAddress);
    } catch (err) {
      console.log(`err from ${originatingHash160}`, err);
      // If the transaction is nonstandard, don't worry about a reply address for now
      originatingHash160 = 'N/A';
    }

    // Incoming transaction means that all inputs are not from current addresses
    for (let j = 0; j < walletHash160s.length; j += 1) {
      const thisWalletHash160 = walletHash160s[j];
      if (thisInputSendingHash160.includes(thisWalletHash160)) {
        // Then this is an outgoing tx
        incoming = false;
        // Break out of this for loop once you know this is an outgoing tx
        break;
      }
    }
  }

  // Iterate over outputs to get the amount sent
  for (let i = 0; i < outputs.length; i += 1) {
    const thisOutput = outputs[i];
    const thisOutputReceivedAtHash160 = thisOutput.outputScript;
    // Check for OP_RETURN msg
    if (thisOutput.value === '0' && typeof thisOutput.slpToken === 'undefined') {
      let hex = thisOutputReceivedAtHash160;
      let parsedOpReturnArray = parseOpReturn(hex);

      if (!parsedOpReturnArray) {
        console.log('parseChronikTx() error: parsed array is empty');
        break;
      }

      let txType = parsedOpReturnArray[0];

      if (txType === currency.opReturn.appPrefixesHex.lotusChat) {
        // this is a sendlotus message
        try {
          messageHex = parsedOpReturnArray[1];
          isLotusMessage = true;
          opReturnMessage = Buffer.from(messageHex, 'hex').toString();
        } catch (err) {
          // soft error if an unexpected or invalid cashtab hex is encountered
          opReturnMessage = '';
          console.log('useXPI.parsedTxData() error: invalid cashtab msg hex: ' + parsedOpReturnArray[1]);
        }
      } else if (txType === currency.opReturn.appPrefixesHex.lotusChatEncrypted) {
        isLotusMessage = true;
        isEncryptedMessage = true;
        messageHex = parsedOpReturnArray[1];
      } else {
        // this is an externally generated message
        messageHex = txType; // index 0 is the message content in this instance

        // if there are more than one part to the external message
        const arrayLength = parsedOpReturnArray.length;
        for (let i = 1; i < arrayLength; i++) {
          messageHex = messageHex + parsedOpReturnArray[i];
        }
      }
    }
    // Find amounts at your wallet's addresses
    for (let j = 0; j < walletHash160s.length; j += 1) {
      const thisWalletHash160 = walletHash160s[j];
      if (thisOutputReceivedAtHash160.includes(thisWalletHash160)) {
        // If incoming tx, this is amount received by the user's wallet
        // if outgoing tx (incoming === false), then this is a change amount
        const thisOutputAmount = new BigNumber(thisOutput.value);
        xpiAmount = incoming ? xpiAmount.plus(thisOutputAmount) : xpiAmount.minus(thisOutputAmount);
      }
    }
    // Output amounts not at your wallet are sent amounts if !incoming
    if (!incoming) {
      const thisOutputAmount = new BigNumber(thisOutput.value);
      xpiAmount = xpiAmount.plus(thisOutputAmount);
      try {
        if (!destinationAddress) {
          // Assumpt the destination address is the first output
          const legacyDestinationAddress = XPI.Address.fromOutputScript(Buffer.from(thisOutput.outputScript, 'hex'));
          destinationAddress = XPI.Address.toXAddress(legacyDestinationAddress);
        }
      } catch (err) {}
    }
  }

  // Convert from sats to XPI
  xpiAmount = xpiAmount.shiftedBy(-1 * currency.cashDecimals);

  // Convert from BigNumber to string
  const xpiAmountString = xpiAmount.toString();

  // Convert messageHex to string
  const theOtherAddress = incoming ? replyAddress : destinationAddress;
  let otherPublicKey;
  try {
    otherPublicKey = await getRecipientPublicKey(XPI, chronik, theOtherAddress);
  } catch (err) {}

  if (
    isLotusMessage &&
    isEncryptedMessage &&
    theOtherAddress &&
    otherPublicKey &&
    wallet &&
    wallet.state &&
    wallet.state.slpBalancesAndUtxos &&
    wallet.state.slpBalancesAndUtxos.nonSlpUtxos[0]
  ) {
    // const allWalletPaths = Object.values(wallet.entities);
    const allWalletPaths = selectAllPaths(wallet);
    const nonSlpToken = wallet.state.slpBalancesAndUtxos.nonSlpUtxos.find(x => x.address == wallet.Path10605.xAddress);
    const fundingWif = getUtxoWif(nonSlpToken, allWalletPaths);
    try {
      const decryption = await decryptOpReturnMsg(messageHex, fundingWif, otherPublicKey);

      if (decryption.success) {
        opReturnMessage = Buffer.from(decryption.decryptedMsg).toString('utf8');
        decryptionSuccess = true;
      } else {
        opReturnMessage = 'Error in decrypting message!';
      }
    }
    catch (err){
      console.log('err', err);
    }
  }

  const parsedTx = {
    incoming,
    xpiAmount: xpiAmountString,
    originatingHash160,
    opReturnMessage,
    isLotusMessage,
    isEncryptedMessage,
    decryptionSuccess,
    replyAddress,
    destinationAddress
  };
  return parsedTx;
};

export const getTxHistoryChronik = async (chronik, XPI, wallet) => {
  // Create array of promises to get chronik history for each address
  // Combine them all and sort by blockheight and firstSeen
  // Add all the info cashtab needs to make them useful
  const walletPaths = getWalletPathsFromWalletState(wallet);

  const hash160AndAddressObjArray = walletPaths.map(item => {
    return {
      address: item.xAddress,
      hash160: item.hash160
    };
  });

  let txHistoryPromises = [];
  for (let i = 0; i < hash160AndAddressObjArray.length; i += 1) {
    const txHistoryPromise = returnGetTxHistoryChronikPromise(chronik, hash160AndAddressObjArray[i]);
    txHistoryPromises.push(txHistoryPromise);
  }
  let txHistoryOfAllAddresses;
  try {
    txHistoryOfAllAddresses = await Promise.all(txHistoryPromises);
  } catch (err) {
    console.log(`Error in Promise.all(txHistoryPromises)`, err);
  }
  const flatTxHistoryArray = flattenChronikTxHistory(txHistoryOfAllAddresses);
  const sortedTxHistoryArray = sortAndTrimChronikTxHistory(flatTxHistoryArray, currency.txHistoryCount);

  // Parse txs
  const chronikTxHistory = [];
  for (let i = 0; i < sortedTxHistoryArray.length; i += 1) {
    const sortedTx = sortedTxHistoryArray[i];
    // Add token genesis info so parsing function can calculate amount by decimals
    sortedTx.parsed = await parseChronikTx(XPI, chronik, sortedTx, wallet);
    chronikTxHistory.push(sortedTx);
  }

  return {
    chronikTxHistory
  };
};

export const selectAllPaths = wallet => {
  const allPaths = [];
  PATHS.map(x => {
    const currentPathData = wallet[x];
    if (currentPathData) {
      allPaths.push(currentPathData);
    }
  });
  return allPaths;
}
