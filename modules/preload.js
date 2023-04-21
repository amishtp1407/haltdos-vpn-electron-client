const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

//Setting up communication channels
const ipc = {
    'render': {
        'send': [
            'disconnect'
        ],
        'sendReceive': [
            'connect',
            'status',
            'fetch'
        ]
    }
};

//Exposing Channels for renderer process
contextBridge.exposeInMainWorld('ipcRender', {
    send: (channel, args) => {
        let validChannels = ipc.render.send;
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, args);
        }
    },
    invoke: (channel, args) => {
        let validChannels = ipc.render.sendReceive;
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, args);
        }
    }
});