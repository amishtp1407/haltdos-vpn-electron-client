// IPC Channel Listeners and Handlers

const os = require('os');
const sudo = require('sudo-prompt');
const { ipcMain } = require('electron');
const { readAndDecryptFormData } = require('./security');
const { fetchInterfaces, kill, saveConfig } = require('./command');

const platform = os.platform();
const options = { name: 'Haltdos VPN Client' }

function connectionListener(){
    ipcMain.handle('connect', async (event, config) => {
        let data = {};
        data.status = false;
        if (platform === 'darwin' || platform === 'linux') {
            let cmd = `/bin/sh -c "echo ${config.password} | openconnect ${config.server} -b -u ${config.username} --passwd-on-stdin"`;
            sudo.exec(cmd, options, function(error, stdout, stderr){
                if (error) {
                    console.error(error);
                    return;
                  }
                  console.log('stdout:', stdout);
                  console.log('stderr:', stderr);
            });
            saveConfig(config);
            return new Promise((resolve) => {
                let data = fetchInterfaces();
                resolve(data);
            });
        } else if (platform === 'win32') {
            let cmd = `echo | set /p=${config.password}| openconnect ${config.server} -u ${config.username} --passwd-on-stdin`
            console.log(cmd);
            sudo.exec(cmd, options, (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
            saveConfig(config);
            return new Promise((resolve) => {
                let data = fetchInterfaces();
                resolve(data)
            });
        }
    })
}

function fetchStatus(){
    ipcMain.handle('status', async () => {
        return new Promise((resolve) => {
            let data = fetchInterfaces();
            resolve(data);
        });
    });
}

function fetchConfig(){
    ipcMain.handle('fetch', async () => {
        return new Promise((resolve) => {
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
    connectionListener,
    fetchConfig,
    fetchStatus,
    killProcess
}