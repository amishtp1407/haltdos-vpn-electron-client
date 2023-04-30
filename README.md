# Instructions to build installers and packages

## Pre-Requisities
- Install Node.js (**16.x or above**)
- Clone the repository and go into the repo
- Run `npm install` to install dependencies

## Making Installer Executable for Windows
- Install [**Inno Setup**](https://jrsoftware.org/isdl.php) (For creating Windows Installers). **It is supported only for Windows OS**

- Run the setup.ps1 script in Powershell

```
.\setup.ps1
```
- Let the script run. It will take some time to build files and compile the installer.

- Check the installer executable inside the **`installer`** folder, that was created by the Inno Setup as an output directory and upload it where other installers are hosted.

## Making Debian Package for Ubuntu
- Run the setup.sh script and provide the version number for the deb package

```
bash setup.sh <version_number>
```
- Let the script run. It will take some time to build files and compile the installer.

- You can find the deb package inside **`debian-packages`** folder and upload it where other installers are hosted.