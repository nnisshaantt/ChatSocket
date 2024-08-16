const crypto = require('crypto');
const { encryptionKey, ivString } = require('../EnvironmentConstants');

const algorithm = 'aes-256-cbc';
const key = encryptionKey;

const iv = Buffer.from(ivString);


function EncryptString(str) {

    try {
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(str, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { error: false, value: encrypted };
    } catch {
        return { error: true };
    }
}

function DecryptString(str) {
    try {
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
        let decrypted = decipher.update(str, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return { error: false, value: decrypted };
    } catch {
        return { error: true };
    }
}

module.exports = { EncryptString, DecryptString }