// IPC Channel Listeners and Handlers

const fs = require('fs');
const os = require('os');
const sudo = require('sudo-prompt');
const { ipcMain } = require('electron');
const { encryptAndSaveFormData, readAndDecryptFormData, encryptedFilePath } = require('./security');
const { fetchInterfaces, kill } = require('./command');

const platform = os.platform();
const options = { name: 'Haltdos VPN Client' }

function connectionListener(){
    ipcMain.handle('connect', async (event, config) => {
        let data = {};
        data.status = false;
        if (platform === 'darwin' || platform === 'linux') {
            let cmd = `/bin/sh -c "echo ${config.password} | openconnect ${config.server} -b -u ${config.username} --passwd-on-stdin --servercert pin-sha256:57d5jlbUX25YnrMZ0wloogprAPUijLoy2C+zUW+5iuo="`;
            if(config.toSave == true){
                encryptAndSaveFormData(config);
            } else {
                if (fs.existsSync(encryptedFilePath)) {
                    fs.unlink(encryptedFilePath, (err) => {});
                }
            }
            sudo.exec(cmd, options, function(error, stdout, stderr){
                if (error) {
                    console.error(error);
                    return;
                  }
                  console.log('stdout:', stdout);
                  console.log('stderr:', stderr);
            });

            return new Promise((resolve, reject) => {
                const interfaces = os.networkInterfaces();
                let keys = Object.keys(interfaces);
                if (keys.includes('tun0')){
                    data.status = true;
                    resolve(data);
                }
            });
        } else if (platform === 'win32') {
            console.log("Not Supported for Windows!")
        }
    })
}

function fetchStatus(){
    ipcMain.handle('status', async () => {
        return new Promise((resolve, reject) => {
            let data = fetchInterfaces();
            resolve(data);
        });
    });
}

function fetchConfig(){
    ipcMain.handle('fetch', async () => {
        return new Promise((resolve, reject) => {
            let config = readAndDecryptFormData();
            config['response'] = true;
            if(Object.keys(config).length === 0){
                config.response = false;
                resolve(config);
            }
            resolve(config);
        });
    });
}

function killProcess(){
    ipcMain.on('disconnect', () => {
        kill();
    })
}

module.exports = {
    killProcess,
    connectionListener,
    fetchConfig,
    fetchStatus
}