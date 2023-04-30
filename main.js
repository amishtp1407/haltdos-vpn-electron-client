const { app, BrowserWindow, Menu, Tray } = require('electron')
const path = require("path");
const { connectionListener, fetchStatus, fetchConfig, killProcess } = require('./modules/ipc');

let mainWindow = null;
let tray = null

const loadMainWindow = () => {
    mainWindow = new BrowserWindow({
        width : 650,
        height: 525,
        resizable:false,
        title: 'Haltdos VPN Client',
        icon: __dirname + '/static/assets/img/icon_light.png',
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'modules/preload.js')
        }
    });
    mainWindow.loadFile(path.join(__dirname, "static/index.html"));
    mainWindow.setMenuBarVisibility(true);
    app.setAppUserModelId(process.execPath)
}

app.on("ready",  () => {
    loadMainWindow();
    let contextMenu = Menu.buildFromTemplate([
        { label: 'Show', type: 'normal', click: function(){mainWindow.show()} },
        { label: 'Quit', type: 'normal', click: function(){app.isQuiting = true; app.quit()}}
    ])
    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
        tray = new Tray(__dirname + '/static/assets/img/icon_light.png');
        tray.setToolTip('Haltdos VPN Client');
        tray.setContextMenu(contextMenu);
    })

    mainWindow.on('show', function (event) {
        event.preventDefault();
        tray.destroy();
    })

    mainWindow.on('close', function (event) {
        if (!app.isQuiting) {
            event.preventDefault()
        }
        mainWindow.hide()
        tray = new Tray(__dirname + '/static/assets/img/icon_light.png')
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

//Initializing IPC Channel Functions
connectionListener();
fetchStatus();
fetchConfig();
killProcess();