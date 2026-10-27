@echo off
setlocal
if not exist "%~dp0workmemo-browser.exe" (
  echo Missing workmemo-browser.exe. Extract or install the COMPLETE WorkMemo package.
  exit /b 1
)
set "WM_ACTION=--register"
if /i "%~1"=="/check" set "WM_ACTION=--check"
if /i "%~1"=="/unregister" set "WM_ACTION=--unregister"
"%~dp0workmemo-browser.exe" %WM_ACTION%
set "WM_RESULT=%ERRORLEVEL%"
if not "%WM_RESULT%"=="0" echo Connection repair failed. Open WorkMemo monitoring settings for details.
if "%~1"=="" pause
exit /b %WM_RESULT%
