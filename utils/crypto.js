import CryptoJS from "crypto-js";

const SECRET_KEY = "rudrakshak";

export const decryptData = (encryptedText) => {
  const bytes = CryptoJS.AES.decrypt(
    encryptedText,
    SECRET_KEY
  );

  const decrypted = bytes.toString(
    CryptoJS.enc.Utf8
  );

  return JSON.parse(decrypted);
};