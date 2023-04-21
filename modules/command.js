const os = require('os');
const sudo = require('sudo-prompt');
const { spawn } = require('child_process');

const platform = os.platform();
const options = { name: 'Haltdos VPN Client' }

const kill = () => {
    let vpn;
    if (platform === 'darwin' || platform === 'linux') {
        sudo.exec('pkill -9 openconnect', options, function(){});
    } else if (platform === 'win32') {
        sudo.exec("powershell.exe -ExecutionPolicy Bypass -Command Stop-Process -Name openconnect", options, function(){});
    }
}

const fetchInterfaces = () => {
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

module.exports = {
    kill,
    fetchInterfaces
};