import crypto from 'crypto';

const KEY = process.env.DOCUMENT_ENCRYPTION_KEY || 'dev-doc-encryption-key-32-bytes!';
if (KEY.length < 32) {
  // pad for dev convenience
   
}
const KEY_BUF = Buffer.from(KEY.padEnd(32, '-').slice(0, 32));

export function encryptBuffer(buffer: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUF, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store as iv + tag + encrypted
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptToBuffer(b64: string) {
  const data = Buffer.from(b64, 'base64');
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUF, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted;
}
