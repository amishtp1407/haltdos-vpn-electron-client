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
}

const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', type: 'normal', click: function(){mainWindow.show()} },
    { label: 'Connect', type: 'normal', click: function(){}},
    { label: 'Disconnect', type: 'normal', click: function(){} },
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

ipcMain.on('connect', (event, data) => {
    let vpn;

    if (platform === 'darwin') {
        vpn = spawn('openconnect', [data.server,'-b', '-u', data.username]);
    } else if (platform === 'win32') {
        vpn = spawn('openconnect', [data.server, '-u', data.username]);
    } else if (platform === 'linux') {
        vpn = spawn('openconnect', [data.server,'-b', '-u', data.username]);
    }

    vpn.stdout.on('data', (output) => {
        console.log('stdout: ' + output);
        if (output.includes("servercert") == true){
            vpn.stdin.write('yes\n');
            vpn.stdin.write(data.password);
            vpn.stdin.end();
        } else {
            vpn.stdin.write(data.password);
            vpn.stdin.end();
        }
    });

    vpn.stderr.on('data', (err) => {
        console.log('stderr: ' + err);
    });

    vpn.on('exit', (code) => {
        console.log('Exit Code: ' + code);
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

    vpn.stderr.on('data', (err) => {
        data.error = err;
        console.log('stderr: ' + err);
    });

    return new Promise((resolve, reject) => {
        vpn.on('exit', (code) => {
          if (code == 0) {
            data.status = true;
          }
          resolve(data);
        });
    });
});



