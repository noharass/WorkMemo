@echo off
setlocal DisableDelayedExpansion
set "wm_host=com.workmemo.browser_bridge_test"
set "wm_key=HKCU\Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test"
set "wm_manifest=%~dp0com.workmemo.browser_bridge_test.json"
if not exist "%~dp0workmemo-browser.exe" (
  echo ERROR: Put this file next to workmemo-browser.exe in the WorkMemo Preview folder.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
if not exist "%~dp0extension\bridge-config.js" (
  echo ERROR: The bundled extension folder is missing. Extract the complete package.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
if not exist "%~dp0workmemo-browser.profile.json" (
  echo ERROR: The browser profile is missing. Use the complete WorkMemo Preview package.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
findstr /L /C:"com.workmemo.test.monitor" "%~dp0workmemo-browser.profile.json" >nul
if errorlevel 1 (
  echo ERROR: This repair file is only for the com.workmemo.test.monitor preview package.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
findstr /L /C:"com.workmemo.browser_bridge_test" "%~dp0extension\bridge-config.js" >nul
if errorlevel 1 (
  echo ERROR: Use the extension bundled with WorkMemo Preview, not browser-extension from the source repository.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
> "%wm_manifest%" echo {"name":"com.workmemo.browser_bridge_test","description":"WorkMemo Preview local browser bridge","path":"workmemo-browser.exe","type":"stdio","allowed_origins":["chrome-extension://oljcealhccdhaddceacnokihjefloaih/"]}
if errorlevel 1 (
  echo ERROR: Cannot write the host manifest. Use your current-user installation folder.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
if /I "%~1"=="/prepare-only" (
  echo Host manifest prepared. Registry unchanged.
  exit /b 0
)
if not exist "%~dp0previous-browser-registration.txt" (
  reg.exe query "%wm_key%" /ve >nul 2>nul
  if not errorlevel 1 reg.exe query "%wm_key%" /ve > "%~dp0previous-browser-registration.txt"
)
reg.exe add "%wm_key%" /ve /t REG_SZ /d "%wm_manifest%" /f >nul
if errorlevel 1 (
  echo ERROR: Current-user Chrome host registration failed. Check your organization policy.
  pause
  exit /b 1
)
echo WorkMemo Preview browser host registered for the current Windows user.
echo Start WorkMemo, then reload the bundled extension in Chrome.
echo Work records and site permissions were not changed.
pause
exit /b 0
