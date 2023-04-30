#define MyAppName "Haltdos VPN Client"
#define MyAppVersion "1.0"
#define MyAppPublisher "Haltdos"
#define MyAppURL "https://www.haltdos.com"
#define MyAppExeName "haltdos-vpn-client.exe"
#define MyAppAssocName MyAppName + " File"
#define MyAppAssocExt ".myp"
#define MyAppAssocKey StringChange(MyAppAssocName, " ", "") + MyAppAssocExt
#include "environment.iss"

[Setup]
AppId={{B190D556-DC94-4FCB-9B7C-0F5F26AC06CF}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
ChangesAssociations=yes
DisableProgramGroupPage=yes
OutputDir=executable
OutputBaseFilename=haltdos-vpn-client
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ChangesEnvironment=true

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "haltdos-vpn-client-win32-x64\**"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs 
Source: "openconnect\**"; DestDir: "{app}\openconnect"; Flags: uninsneveruninstall onlyifdoesntexist nocompression
Source: "drivers\vcredist_x86.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "drivers\tap-windows.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Registry]
Root: HKA; Subkey: "Software\Classes\{#MyAppAssocExt}\OpenWithProgids"; ValueType: string; ValueName: "{#MyAppAssocKey}"; ValueData: ""; Flags: uninsdeletevalue
Root: HKA; Subkey: "Software\Classes\{#MyAppAssocKey}"; ValueType: string; ValueName: ""; ValueData: "{#MyAppAssocName}"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\Classes\{#MyAppAssocKey}\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName},0"
Root: HKA; Subkey: "Software\Classes\{#MyAppAssocKey}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}\SupportedTypes"; ValueType: string; ValueName: ".myp"; ValueData: ""

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
Filename: "{tmp}\vcredist_x86.exe"; Parameters: "/quiet /norestart"; WorkingDir: "{tmp}"; StatusMsg: "Installing Visual C++ redistributable..."; Flags: waituntilterminated
Filename: "{tmp}\tap-windows.exe"; Parameters: "/S"; WorkingDir: "{tmp}"; StatusMsg: "Installing TAP adapter..."; Flags: waituntilterminated

[Uninstall]
AllowUninstall=Yes
UninstallFilesDir={app}
UninstallDisplayName={#MyAppName}
UninstallDisplayIcon={app}\{#MyAppExeName},0
UninstallLogMode=append
UninstallRestartComputer=No

[UninstallDelete]
Type: filesandordirs; Name: "{app}\*";

;Code to handle adding openconnect to System Path Variable
[Code]
function GetUninstallString: string;
begin
  Result := '"' + ExpandConstant('{uninstallexe}') + '" /SILENT';
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
    if CurStep = ssPostInstall 
     then EnvAddPath(ExpandConstant('{app}') +'\openconnect');
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
    if CurUninstallStep = usPostUninstall
    then EnvRemovePath(ExpandConstant('{app}') +'\openconnect');
end;