#!/usr/bin/bash
echo "Building Deb Package..."

mkdir -p debian-packages/
mkdir -p debian-folder/usr/bin/
mkdir -p debian-folder/usr/lib/
mkdir -p debian-folder/usr/lib/haltdos/
mkdir -p debian-folder/usr/share/pixmaps/

echo "Building Electron Application Files for Linux"
electron-packager . haltdos-vpn-client --overwrite --platform=linux --arch=x64 --icon=static/assets/img/haltdos.png --out=build/
echo "Electron Application for Linux built successfully!"

echo "Building Debian Package"
cp -r build/haltdos-vpn-client-linux-x64/* debian-folder/usr/lib/haltdos/
cp static/assets/img/haltdos.png debian-folder/usr/share/pixmaps/
sed -i '2s/.*/Version: '"$1"'/' debian-folder/DEBIAN/control
dpkg-deb -Zxz --build debian-folder debian-packages/haltdos-vpn-client.deb
echo "Debian Package built successfully"