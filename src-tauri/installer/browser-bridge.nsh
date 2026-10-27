!include "LogicLib.nsh"
!ifndef WM_BRIDGE_REGISTRY_ROOT
  !define WM_BRIDGE_REGISTRY_ROOT "Software\Google\Chrome\NativeMessagingHosts"
!endif
!ifndef WM_BRIDGE_DATA_ROOT
  !define WM_BRIDGE_DATA_ROOT "$LOCALAPPDATA"
!endif
!macro WM_BRIDGE_CONSTANTS
!ifndef WM_BRIDGE_KEY
!if "${BUNDLEID}" == "com.workmemo.desktop"
  !define WM_BRIDGE_HOST "com.workmemo.browser_bridge"
!else
  !define WM_BRIDGE_HOST "com.workmemo.browser_bridge_test"
!endif
!define WM_BRIDGE_KEY "${WM_BRIDGE_REGISTRY_ROOT}\${WM_BRIDGE_HOST}"
!define WM_BRIDGE_MANIFEST "${WM_BRIDGE_DATA_ROOT}\${BUNDLEID}\browser-host.json"

!endif
!macroend

!macro NSIS_HOOK_POSTINSTALL
  !insertmacro WM_BRIDGE_CONSTANTS
  Push $R0
  SetRegView 64
  ClearErrors
  ExecWait '"$INSTDIR\workmemo-browser.exe" --register' $R0
  ${If} ${Errors}
  ${OrIf} $R0 != 0
    DetailPrint "WorkMemo browser registration needs repair in monitoring settings."
    MessageBox MB_ICONEXCLAMATION|MB_OK "Browser connection setup failed. Start WorkMemo and open monitoring settings to repair the connection." /SD IDOK
  ${Else}
    DetailPrint "WorkMemo browser connection registered for the current user."
  ${EndIf}
  Pop $R0
!macroend

; After Tauri's running-app/cancel check and resource removal.
; Never remove the registration of a newer install or portable directory.
!macro WM_BRIDGE_REMOVE_VIEW VIEW
  SetRegView ${VIEW}
  ReadRegStr $R0 HKCU "${WM_BRIDGE_KEY}" "WorkMemoExecutable"
  ReadRegStr $R1 HKCU "${WM_BRIDGE_KEY}" ""
  ReadRegStr $R2 HKCU "${WM_BRIDGE_KEY}" "WorkMemoProfile"
  ${If} $R0 == "$INSTDIR\workmemo-browser.exe"
  ${AndIf} $R1 == "${WM_BRIDGE_MANIFEST}"
  ${AndIf} $R2 == "${BUNDLEID}"
    StrCpy $R4 1
    DeleteRegValue HKCU "${WM_BRIDGE_KEY}" ""
    DeleteRegValue HKCU "${WM_BRIDGE_KEY}" "WorkMemoExecutable"
    DeleteRegValue HKCU "${WM_BRIDGE_KEY}" "WorkMemoProfile"
    DeleteRegKey /ifempty HKCU "${WM_BRIDGE_KEY}"
  ${ElseIf} $R0 != ""
    StrCpy $R3 0
  ${ElseIf} $R1 != ""
    StrCpy $R3 0
  ${EndIf}
!macroend
!macro NSIS_HOOK_POSTUNINSTALL
  !insertmacro WM_BRIDGE_CONSTANTS
  Push $R0
  Push $R1
  Push $R2
  Push $R3
  Push $R4
  StrCpy $R3 1
  StrCpy $R4 0
  !insertmacro WM_BRIDGE_REMOVE_VIEW 32
  !insertmacro WM_BRIDGE_REMOVE_VIEW 64
  ${If} $R3 == 1
  ${AndIf} $R4 == 1
    Delete "${WM_BRIDGE_MANIFEST}"
  ${EndIf}
  SetRegView 64
  Pop $R4
  Pop $R3
  Pop $R2
  Pop $R1
  Pop $R0
!macroend
