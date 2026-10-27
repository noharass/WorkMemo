!include "LogicLib.nsh"

; Tests override only this key at compile time, never the shipped host identity.
!ifndef WM_BRIDGE_REGISTRY_KEY
  !define WM_BRIDGE_REGISTRY_KEY "Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test"
!endif
!define WM_BRIDGE_MANIFEST "com.workmemo.browser_bridge_test.json"

!macro NSIS_HOOK_POSTINSTALL
  Push $R0
  ClearErrors
  FileOpen $R0 "$INSTDIR\${WM_BRIDGE_MANIFEST}" w
  ${If} ${Errors}
    SetErrorLevel 1
    Abort "Cannot create the WorkMemo browser host manifest."
  ${EndIf}
  ; Relative host paths are supported on Windows. ASCII JSON avoids encoding
  ; problems when the installation directory contains Chinese characters.
  FileWrite $R0 '{"name":"com.workmemo.browser_bridge_test","description":"WorkMemo Preview local browser bridge","path":"workmemo-browser.exe","type":"stdio","allowed_origins":["chrome-extension://oljcealhccdhaddceacnokihjefloaih/"]}$\r$\n'
  FileClose $R0
  ${If} ${Errors}
    SetErrorLevel 1
    Abort "Cannot save the WorkMemo browser host manifest."
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

!macro NSIS_HOOK_PREUNINSTALL
  Push $R0
  ReadRegStr $R0 HKCU "${WM_BRIDGE_REGISTRY_KEY}" ""
  ${If} $R0 == "$INSTDIR\${WM_BRIDGE_MANIFEST}"
    DeleteRegValue HKCU "${WM_BRIDGE_REGISTRY_KEY}" ""
    DeleteRegKey /ifempty HKCU "${WM_BRIDGE_REGISTRY_KEY}"
  ${EndIf}
  ; An old uninstaller must not remove a newer directory's registration.
  Delete "$INSTDIR\${WM_BRIDGE_MANIFEST}"
  Pop $R0
!macroend
