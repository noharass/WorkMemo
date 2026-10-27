!include "LogicLib.nsh"

; Tests override only this key at compile time, never the shipped host identity.
!ifndef WM_BRIDGE_REGISTRY_KEY
  !define WM_BRIDGE_REGISTRY_KEY "Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test"
!endif
!define WM_BRIDGE_MANIFEST "com.workmemo.browser_bridge_test.json"

!macro NSIS_HOOK_POSTINSTALL
  Push $R0
  ${IfNot} ${FileExists} "$INSTDIR\${WM_BRIDGE_MANIFEST}"
    SetErrorLevel 1
    Abort "The WorkMemo browser host manifest is missing."
  ${EndIf}
  ${IfNot} ${FileExists} "$INSTDIR\workmemo-browser.exe"
    SetErrorLevel 1
    Abort "The WorkMemo browser host executable is missing."
  ${EndIf}
  ClearErrors
  WriteRegStr HKCU "${WM_BRIDGE_REGISTRY_KEY}" "" "$INSTDIR\${WM_BRIDGE_MANIFEST}"
  ${If} ${Errors}
    SetErrorLevel 1
    Abort "Cannot register the WorkMemo browser host for the current user."
  ${EndIf}
  DetailPrint "WorkMemo Chrome bridge registered for the current user."
  Pop $R0
!macroend

; Run only after Tauri's running-app/cancel check and resource removal.
; The manifest is a normal bundled resource, so cancellation preserves it.
!macro NSIS_HOOK_POSTUNINSTALL
  Push $R0
  ReadRegStr $R0 HKCU "${WM_BRIDGE_REGISTRY_KEY}" ""
  ${If} $R0 == "$INSTDIR\${WM_BRIDGE_MANIFEST}"
    DeleteRegValue HKCU "${WM_BRIDGE_REGISTRY_KEY}" ""
    DeleteRegKey /ifempty HKCU "${WM_BRIDGE_REGISTRY_KEY}"
  ${EndIf}
  ; An old uninstaller must not remove a newer directory's registration.
  Pop $R0
!macroend
