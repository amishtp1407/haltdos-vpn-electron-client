Write-Host "Building Electron Application Files for Windows"
& electron-packager . haltdos-vpn-client --overwrite --platform=win32 --arch=x64 --icon=static/assets/img/icon_light.ico --out=build/

Write-Host "Electron Application for Windows built successfully!"

Write-Host "Creating Windows Installer"
& "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" .\windows-setup\main.iss

Write-Host "Windows Installer created successfully."
