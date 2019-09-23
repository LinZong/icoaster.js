// let crypto = require('crypto'),
//   algorithm = 'aes-256-gcm'

import * as crypto from 'crypto'

const algorithm = 'aes-256-gcm'

function GetAES256GCMCipher() {

  function Encrypter(text : string, password : string, iv : string) {
    let cipher = crypto.createCipheriv(algorithm, password, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex');
    let tag = cipher.getAuthTag();
    return {
      content: encrypted,
      tag: tag.toString('base64'),
    };
  }

  function Decrypter(encrypted : any, password : string, iv : string) {
    let decipher = crypto.createDecipheriv(algorithm, password, iv)
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
    let dec = decipher.update(encrypted.content, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
  }

  return { Encrypter, Decrypter }
}

export default GetAES256GCMCipher