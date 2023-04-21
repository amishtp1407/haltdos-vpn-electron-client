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

const kill = () => {}

const getStatus = () => {
    let vpn;
    let proc;
    if (platform === 'darwin') {
        vpn = spawn('psgrep', ['openconnect']);
    } else if (platform === 'win32') {
        vpn = spawn("powershell.exe",["(Get-Process openconnect).Id"]);
        proc = spawn("powershell.exe", ["/c", "Get-NetAdapter | Where-Object {$_.InterfaceDescription -like \"TAP-Windows Adapter V9\"}| Select-Object -ExpandProperty Name"])
    } else if (platform === 'linux') {
        vpn = spawn('pidof', ['openconnect']);
        proc = spawn('ip', ["-o link show | awk '{print $2}' | cut -d':' -f1"])
    }
    vpn.stdout.on('data', (output) => {
        console.log('stdout: ' + output);
    });

    proc.stdout.on('data', (output) => {
        console.log('stdout: ' + output);
    });

}

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
        const childProcess = spawn('powershell.exe', ['-Command', 'openconnect', config.server, '-u', config.username, '-passwd-on-stdin', '--servercert', 'sha256:e7b7798e56d45f6e589eb319d30968a20a6b00f5228cba32d82fb3516fb98aea']);
        childProcess.stdin.write(config.password + '\n');
        childProcess.stdin.end();
        console.log("Hello!")
        childProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        childProcess.stderr.on('data', (data) => {
            console.error(data.toString());
        });
          
        childProcess.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
        });
        // vpn = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-Command', cmd]);
    } else if (platform === 'linux') {
        vpn = spawn('openconnect', [config.server, '-b', '-u', config.username, '--servercert pin-sha256:57d5jlbUX25YnrMZ0wloogprAPUijLoy2C+zUW+5iuo=', '--passwd-on-stdin']);
        vpn.stdin.write(config.password + '\n');
        vpn.stdin.end();

        vpn.stdout.on('data', (output) => {
            console.log('stdout: ' + output);
        });
        
        vpn.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        vpn.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    return new Promise((resolve, reject) => {
        resolve(data);
        // vpn.stdout.on('data', (output) => {
        //     console.log('stdout: ' + output);
        //     data.status = true;
        //     resolve(data);
        // });
    });
})

ipcMain.on('disconnect', () => {
    let vpn;
    if (platform === 'darwin') {
        vpn = spawn('psgrep', ['openconnect']);
    } else if (platform === 'win32') {
        console.log("Trying to disconnect!!");
        vpn = spawn("powershell.exe", ['-ExecutionPolicy', 'Bypass', '-Command', "Stop-Process", "-Name", "openconnect"]);
    } else if (platform === 'linux') {
        vpn = spawn('pkill', ['-9', 'openconnect']);
    }

    vpn.stdout.on('data', (output) => {
        console.log('stdout: ' + output);
    });
    
    vpn.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    
    vpn.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
})


ipcMain.handle('status', async () => {
    const interfaces = os.networkInterfaces();
    let data = {};
    data.status = false;
    console.log("Checking Status!!")
    return new Promise((resolve, reject) => {
        if (platform === 'darwin') {
            if (interfaces.includes('tun0')){
                data.status = true;
                resolve(data);
            }
        } else if (platform === 'win32') {
            const adapter = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-Command', 'Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "TAP-Windows Adapter V9"} | Select-Object -ExpandProperty Status']);
            adapter.stdout.on('data', (out) => {
                const output = out.toString();
                console.log(output);
                if(output.includes("Up")){
                    data.status = true;
                    console.log(data)
                    resolve(data);
                }
            });
        } else if (platform === 'linux') {
            let keys = Object.keys(interfaces);
            if (keys.includes('tun0')){
                data.status = true;
                resolve(data);
            }
        }
    });
});