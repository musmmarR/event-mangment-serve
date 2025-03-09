const config = require('../config/config');
const CryptoJS = require('crypto-js');

// Encryption utility functions
exports.encryptData = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, config.CRYPTO_SECRET_KEY);
        return encodeURIComponent(encrypted.toString());
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed');
    }
};
// Decryption utility function
exports.decryptData = (encryptedText) => {
    try {
        // Decode the URL-safe string
        const decoded = decodeURIComponent(encryptedText);
        
        // Decrypt the data
        const decrypted = CryptoJS.AES.decrypt(decoded, config.CRYPTO_SECRET_KEY);
        
        // Convert to string
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        // Parse the JSON string back to object
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Decryption failed');
    }
};