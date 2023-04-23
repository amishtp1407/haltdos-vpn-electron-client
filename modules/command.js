const os = require('os');
const fs = require('fs');
const sudo = require('sudo-prompt');
const { spawn } = require('child_process');
const { encryptAndSaveFormData, encryptedFilePath } = require('./security');

const platform = os.platform();
const options = { name: 'Haltdos VPN Client' }

function kill() {
    if (platform === 'darwin' || platform === 'linux') {
        sudo.exec('pkill -9 openconnect', options, function(){});
    } else if (platform === 'win32') {
        sudo.exec("powershell.exe -ExecutionPolicy Bypass -Command Stop-Process -Name openconnect", options, function(){});
    }
}

function fetchInterfaces() {
    let data = {};
    data.status = false;
    const interfaces = os.networkInterfaces();
    if (platform === 'darwin' || platform === 'linux') {
        let keys = Object.keys(interfaces);
        if (keys.includes('tun0')){
            data.status = true;
        }
        return data;
    } else if (platform === 'win32') {
        return new Promise((resolve, reject) => {
            const adapter = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-Command', 'Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "TAP-Windows Adapter V9"} | Select-Object -ExpandProperty Status']);
            adapter.stdout.on('data', (out) => {
                const output = out.toString();
                if(output.includes("Up")){
                    data.status = true;
                }
            });
            adapter.on('close', () => {
                resolve(data);
            });
        });
    }
}

function saveConfig() {
    if(config.toSave == true){
        encryptAndSaveFormData(config);
    } else {
        if (fs.existsSync(encryptedFilePath)) {
            fs.unlink(encryptedFilePath, (err) => {});
        }
    }
}

module.exports = {
    kill,
    fetchInterfaces,
    saveConfig
};