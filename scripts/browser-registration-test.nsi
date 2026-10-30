Unicode true
RequestExecutionLevel user
SilentInstall silent
SilentUnInstall silent
Name "WorkMemo isolated registration test"
OutFile "${TEST_SETUP}"
InstallDir "${TEST_INSTALL}"
!define WM_BRIDGE_REGISTRY_ROOT "${TEST_REGISTRY}"
!define WM_BRIDGE_DATA_ROOT "${TEST_DATA}"
!define WM_STARTUP_REGISTRY_ROOT "${TEST_STARTUP_REGISTRY}"
!include "${TEST_HOOK}"
; Tauri includes hooks before BUNDLEID is defined, too.
!define BUNDLEID "${TEST_PROFILE}"
Section
  SetOutPath "$INSTDIR"
  File /oname=workmemo-browser.exe "${TEST_HOST}"
  File /oname=workmemo-browser.profile.json "${TEST_PROFILEFILE}"
  !insertmacro NSIS_HOOK_POSTINSTALL
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd
Section Uninstall
  Delete "$INSTDIR\workmemo-browser.exe"
  Delete "$INSTDIR\workmemo-browser.profile.json"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"
  !insertmacro NSIS_HOOK_POSTUNINSTALL
SectionEnd
