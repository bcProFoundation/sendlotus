import { currency } from '@components/Common/Ticker.js';
import {
  encryptOpReturnMsg,
  fromXpiToSatoshis,
  generateOpReturnScript,
  generateTxInput,
  generateTxOutput,
  getChangeAddressFromInputUtxos,
  parseXpiSendValue,
  signAndBuildTx
} from '@utils/cashMethods';
import { getRecipientPublicKey } from '@utils/chronik';
import intl from 'react-intl-universal';
import SlpWallet from '@abcpros/minimal-xpi-slp-wallet';

export default function useXPI() {
  
  const getRestUrl = (apiIndex = 0) => {
    const apiString =
        process.env.REACT_APP_NETWORK === `mainnet`
            ? process.env.REACT_APP_BCHA_APIS
            : process.env.REACT_APP_BCHA_APIS_TEST;
    const apiArray = apiString.split(',');
    return apiArray[apiIndex];
};

  const getXPI = (apiIndex = 0) => {
    let ConstructedSlpWallet;

    ConstructedSlpWallet = new SlpWallet('', {
      restURL: getRestUrl(apiIndex)
    });
    return ConstructedSlpWallet.bchjs;
  };

  const calcFee = (XPI, utxos, p2pkhOutputNumber = 2, satoshisPerByte = 2.01, opReturnLength = 0) => {
    const byteCount = XPI.BitcoinCash.getByteCount({ P2PKH: utxos.length }, { P2PKH: p2pkhOutputNumber });
    // 8 bytes : the output's value
    // 1 bytes : Locking-Script Size
    // opReturnLength: the size of the OP_RETURN script
    // Referece
    // https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch06.asciidoc#transaction-serializationoutputs
    //
    // Technically, Locking-Script Size can be 1, 3, 5 or 9 bytes, But
    //  - Lotus Node's default allowed OP_RETURN length is set the 223 bytes
    //  - SendLotus max OP_RETURN length is also limited to 223 bytes
    // We can safely assume it is 1 byte (0 - 252. fd, fe, ff are special)
    //
    // The Output Count field is of VarInt (1, 3, 5 or 9 bytes), which indicates the number of outputs present in the transaction
    // Adding OP_RETURNs to the outputs increases the count
    // Since SendLotus only allows single recipient transaction, the maxium number of outputs in a tx is 5
    //  - one for recipient
    //  - one for change
    //  - maximum 3 for OP_RETURNs
    // So we can safely assume the Output will only take 1 byte.
    //
    // In wallet where multiple recipients are allowed in a transaction
    // adding extra OP_RETURN outputs may change the output count from 1 byte to 3 bytes
    // this would affect the fee
    let opReturnOutputByteLength = opReturnLength;
    if (opReturnLength) {
      opReturnOutputByteLength += 8 + 1;
    }
    const txFee = Math.ceil(satoshisPerByte * byteCount);
    return txFee;
  };

  const sendXpi = async (
    XPI,
    chronik,
    walletPaths,
    utxos,
    feeInSatsPerByte,
    optionalOpReturnMsg,
    isOneToMany,
    destinationAddressAndValueArray,
    destinationAddress,
    sendAmount,
    encryptionFlag,
    fundingWif
  ) => {
    try {
      let txBuilder = new XPI.TransactionBuilder();

      // parse the input value of XPIs to send
      const value = parseXpiSendValue(isOneToMany, sendAmount, destinationAddressAndValueArray);

      const satoshisToSend = fromXpiToSatoshis(value);

      // Throw validation error if fromXecToSatoshis returns false
      if (!satoshisToSend) {
        const error = new Error(`Invalid decimal places for send amount`);
        throw error;
      }

      let encryptedEj; // serialized encryption data object
      let opReturnData;

      // if the user has opted to encrypt this message
      if (encryptionFlag && optionalOpReturnMsg) {
        try {
          // get the pub key for the recipient address
          let recipientPubKey = await getRecipientPublicKey(XPI, chronik, destinationAddress);
          // if the API can't find a pub key, it is due to the wallet having no outbound tx
          if (!recipientPubKey) {
            throw new Error('Cannot send an encrypted message to a wallet with no outgoing transactions');
          }
          if (recipientPubKey) {
            encryptedEj = encryptOpReturnMsg(fundingWif, recipientPubKey, optionalOpReturnMsg);
          }
        } catch (err) {
          console.log(`sendXpi() encryption error.`);
          throw err;
        }
      }

      // Start of building the OP_RETURN output.
      // Only build the OP_RETURN output if the user supplied it
      if (optionalOpReturnMsg && typeof optionalOpReturnMsg !== 'undefined' && optionalOpReturnMsg.trim() !== '') {
        opReturnData = generateOpReturnScript(XPI, optionalOpReturnMsg, encryptionFlag, encryptedEj);
        txBuilder.addOutput(opReturnData, 0);
      }
      const opReturnLength = opReturnData ? opReturnData.length : 0;

      // generate the tx inputs and add to txBuilder instance
      // returns the updated txBuilder, txFee, totalInputUtxoValue and inputUtxos
      let txInputObj = generateTxInput(
        XPI,
        isOneToMany,
        utxos,
        txBuilder,
        destinationAddressAndValueArray,
        satoshisToSend,
        feeInSatsPerByte,
        opReturnLength
      );

      const changeAddress = getChangeAddressFromInputUtxos(XPI, txInputObj.inputUtxos);

      txBuilder = txInputObj.txBuilder; // update the local txBuilder with the generated tx inputs

      // generate the tx outputs and add to txBuilder instance
      // returns the updated txBuilder
      const txOutputObj = generateTxOutput(
        XPI,
        isOneToMany,
        value,
        satoshisToSend,
        txInputObj.totalInputUtxoValue,
        destinationAddress,
        destinationAddressAndValueArray,
        changeAddress,
        txInputObj.txFee,
        txBuilder
      );
      txBuilder = txOutputObj; // update the local txBuilder with the generated tx outputs

      // sign the collated inputUtxos and build the raw tx hex
      // returns the raw tx hex string
      const rawTxHex = signAndBuildTx(XPI, txInputObj.inputUtxos, txBuilder, walletPaths);

      // Broadcast transaction to the network via the chronik client
      let broadcastResponse;
      try {
        broadcastResponse = await chronik.broadcastTx(rawTxHex);
        if (!broadcastResponse) {
          throw new Error('Empty chronik broadcast response');
        }
      } catch (err) {
        console.log('Error broadcasting tx to chronik client');
        throw err;
      }

      // return the explorer link for the broadcasted tx
      return `${currency.blockExplorerUrl}/tx/${broadcastResponse.txid}`;
    } catch (err) {
      if (err.error === 'insufficient priority (code 66)') {
        err = new Error(intl.get('send.insufficientPriority'));
      } else if (err.error === 'txn-mempool-conflict (code 18)') {
        err = new Error('txn-mempool-conflict');
      } else if (err.error === 'Network Error') {
        err = new Error(intl.get('send.networkError'));
      } else if (err.error === 'too-long-mempool-chain, too many unconfirmed ancestors [limit: 25] (code 64)') {
        err = new Error(intl.get('send.longMempoolChain'));
      }
      throw err;
    }
  };

  return {
    getXPI,
    getRestUrl,
    calcFee,
    sendXpi
  };
}
