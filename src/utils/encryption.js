import * as forge from 'node-forge'
import { PublicKey, PrivateKey, crypto } from '@abcpros/bitcore-lib-xpi'

// privateKey: PrivateKey
// publicKey: PublicKey
const constructMergedKey = (privateKey, publicKey) => {
    return PublicKey.fromPoint(publicKey.point.mul(privateKey.toBigNumber()));
}

const publicKeyToBuffer = (pubKey) => {
  const {x, y, compressed} = pubKey.toObject();
  let xBuf = Buffer.from(x,'hex');
  let yBuf = Buffer.from(y,'hex');
  let prefix;
  let buf;
  if (!compressed) {
    prefix = Buffer.from([0x04]);
    buf = Buffer.concat([prefix, xBuf, yBuf ]);
  } else {
    let odd = yBuf[yBuf.length - 1] % 2;
    if (odd) {
      prefix = Buffer.from([0x03]);
    } else {
      prefix = Buffer.from([0x02]);
    }
    buf = Buffer.concat([prefix, xBuf]);
  }

  return buf;
}

// privateKey: WIF string,
// publicKey: hex string,
const createSharedKey = (privateKeyWIF, publicKeyHex) => {
    const publicKeyObj = PublicKey.fromString(publicKeyHex, 'hex');
    const privateKeyObj = PrivateKey.fromWIF(privateKeyWIF);

    const mergedKey = constructMergedKey(privateKeyObj, publicKeyObj);
    // const rawMergedKey = mergedKey.toBuffer(); // this function throws assertion error sometimes
    const rawMergedKey = publicKeyToBuffer(mergedKey);
    const sharedKey = crypto.Hash.sha256(rawMergedKey)
    return sharedKey
  }

// sharedKey: Buffer, plainText: Uint8Array
const encrypt = (sharedKey, plainText) => {
    // Split shared key
    const iv = forge.util.createBuffer(sharedKey.slice(0, 16))
    const key = forge.util.createBuffer(sharedKey.slice(16))

    // Encrypt entries
    const cipher = forge.cipher.createCipher('AES-CBC', key)
    cipher.start({ iv })
    const rawBuffer = forge.util.createBuffer(plainText)
    cipher.update(rawBuffer)
    cipher.finish()
    const cipherText = Uint8Array.from(
      Buffer.from(cipher.output.toHex(), 'hex'),
    )

    return cipherText
  }

  // sharedKey: Buffer, plainText: Uint8Array
  const decrypt = (sharedKey, cipherText) => {
    // Split shared key
    const iv = forge.util.createBuffer(sharedKey.slice(0, 16))
    const key = forge.util.createBuffer(sharedKey.slice(16))

    // Encrypt entries
    const cipher = forge.cipher.createDecipher('AES-CBC', key)
    cipher.start({ iv })
    const rawBuffer = forge.util.createBuffer(cipherText)
    cipher.update(rawBuffer)
    cipher.finish()
    const plainText = Uint8Array.from(Buffer.from(cipher.output.toHex(), 'hex'))
    return plainText
  }

  export { createSharedKey, encrypt, decrypt }