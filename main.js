const { app, BrowserWindow, Menu, Tray } = require('electron')
const path = require("path");
const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const sudo = require('sudo-prompt');
const os = require('os');

let mainWindow = null;
let tray = null

const platform = os.platform();

const loadMainWindow = () => {
    mainWindow = new BrowserWindow({
        width : 650,
        height: 550,
        resizable:false,
        icon: __dirname + '/static/icon_light.png',
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    app.setAppUserModelId(process.execPath)
}

const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', type: 'normal', click: function(){mainWindow.show()} },
    { label: 'Quit', type: 'normal', click: function(){app.quit()}},
])

app.on("ready",  () => {
    loadMainWindow();
    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
        tray = new Tray(__dirname + '/static/icon_light.png')
        tray.setToolTip('Haltdos VPN Client')
        tray.setContextMenu(contextMenu)
    })

    mainWindow.on('show', function (event) {
        event.preventDefault();
        tray.destroy();
    })

    mainWindow.on('close', function (event) {
        mainWindow.hide()
        tray = new Tray(__dirname + '/static/icon_light.png')
        tray.setToolTip('Haltdos VPN Client')
        tray.setContextMenu(contextMenu)
    })
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow();
    }
});

ipcMain.handle('connect', async (event, config) => {
    let vpn;
    let data = {};
    data.status = false;

    if (platform === 'darwin') {
        vpn = spawn('openconnect', [config.server,'-b', '-u', config.username]);
    } else if (platform === 'win32') {
        vpn = spawn("openconnect", [config.server, '-u', config.username]);
    } else if (platform === 'linux') {
        vpn = spawn('openconnect', [config.server, '-b', '-u', config.username]);
    }

    vpn.stdout.on('data', (output) => {
        console.log('stdout: ' + output);
    });

    vpn.stdin.write('yes\n');
    vpn.stdin.write(data.password);
    vpn.stdin.end();

    vpn.on('error', (err) => {
        console.log('stderr: ' + err);
    });

    return new Promise((resolve, reject) => {
        vpn.on('exit', (code) => {
            if (code == 0) {
                console.log(code)
                data.status = true;
                resolve(data);
              }
          });
    });
})

ipcMain.on('disconnect', () => {
    let vpn;
    if (platform === 'darwin') {
        vpn = spawn('psgrep', ['openconnect']);
    } else if (platform === 'win32') {
        vpn = spawn("powershell.exe",["(Get-Process openconnect).Id"]);
    } else if (platform === 'linux') {
        vpn = spawn('pidof', ['openconnect']);
    }

    vpn.stdout.on('data', (data) => {
        if (data == null){
            return ;
        }
        const options = {
            name: 'Haltdos VPN Client'
        }
        if (platform === 'darwin') {
            sudo.exec('pkill -9 openconnect', options, function(){});
        } else if (platform === 'win32') {
            sudo.exec('cmd.exe /C taskkill /F /IM openconnect.exe', options, function(){});
        } else if (platform === 'linux') {
            sudo.exec('pkill -9 openconnect', options, function(){});
        }
    });
})


ipcMain.handle('status', async () => {
    let data = {};
    let vpn;

    data.status = false;

    if (platform === 'darwin') {
        vpn = spawn('psgrep', ['openconnect']);
    } else if (platform === 'win32') {
        vpn = spawn("powershell.exe",["(Get-Process openconnect).Id"]);
    } else if (platform === 'linux') {
        vpn = spawn('pidof', ['openconnect']);
    }

    const stderr = [];
    vpn.stderr.on('data', (data) => {
        stderr.push(data);
    });

    return new Promise((resolve, reject) => {
        vpn.on('exit', (code) => {
            if (code == 0) {
              if (stderr.length > 0) { // check for errors on stderr stream
                resolve(data);
              } else {
                data.status = true;
                resolve(data);
              }
            } else {
                resolve(data);
            }
          });
          vpn.on('error', (err) => {
            console.error('Error:', err);
            reject(err);
          });
    });
});



