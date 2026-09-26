import CryptoJS from "crypto-js";

export function encrypt({
  plainText,
  secretKey = process.env.SECRET_KEY,
} = {}) {
  return CryptoJS.AES.encrypt(JSON.stringify(plainText), secretKey).toString();
}

export function decrypt({
  cipherText,
  secretKey = process.env.SECRET_KEY,
} = {}) {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
}
