const crypto = require('crypto');
const fs = require('fs');
const keyFilePath = '/tmp/key.txt';
const ivFilePath = '/tmp/iv.txt';
const encryptedFilePath = '/tmp/credentials.txt'

//Encrypting Form and Writing Encrypted Data to File
function encryptAndSaveFormData(formData) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const data = JSON.stringify(formData);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    fs.writeFileSync('/tmp/credentials.txt', encrypted);
    fs.writeFileSync('/tmp/key.txt', key);
    fs.writeFileSync('/tmp/iv.txt', iv);
}

//Decrypting File Content and Sending JSON to renderer process
function readAndDecryptFormData() {
    let config = {};
    if (fs.existsSync(encryptedFilePath) == false) {
        return config;
    }
    const stats = fs.statSync(encryptedFilePath);
    if (stats.size === 0) {
        return config;
    }

    const encryptedData = fs.readFileSync(encryptedFilePath, 'utf8');
    const key = fs.readFileSync(keyFilePath);
    const iv = fs.readFileSync(ivFilePath);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    config = JSON.parse(decrypted);
    return config;
}

module.exports = {
    encryptAndSaveFormData,
    readAndDecryptFormData,
    encryptedFilePath
};
