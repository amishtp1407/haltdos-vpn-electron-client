#!/usr/bin/bash
echo "Building Deb Package..."

mkdir -p debian-packages/
mkdir -p debian-setup/usr/bin/
mkdir -p debian-setup/usr/lib/
mkdir -p debian-setup/usr/lib/haltdos/
mkdir -p debian-setup/usr/share/pixmaps/

echo "Building Electron Application Files for Linux"
electron-packager . haltdos-vpn-client --overwrite --platform=linux --arch=x64 --icon=static/assets/img/haltdos.png --out=build/
echo "Electron Application for Linux built successfully!"

echo "Building Debian Package"
cp -r build/haltdos-vpn-client-linux-x64/* debian-setup/usr/lib/haltdos/
cp static/assets/img/haltdos.png debian-setup/usr/share/pixmaps/
sed -i '2s/.*/Version: '"$1"'/' debian-setup/DEBIAN/control
dpkg-deb -Zxz --build debian-setup debian-packages/haltdos-vpn-client.deb
echo "Debian Package built successfully"