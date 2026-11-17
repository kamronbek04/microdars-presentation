@echo off
rem One click: build the presentation and open it in the browser on this PC.
rem Needs Node.js (https://nodejs.org). The deck itself needs no internet (it has no map).
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies, first run only...
  call npm install --no-audit --no-fund || goto :error
)

echo Building the presentation...
call npm run build || goto :error

echo.
echo Opening the presentation in your browser.
echo   Next: Right arrow, Space, Page Down, clicker or left click
echo   Back: Left arrow, Page Up or right click
echo   Full screen: F    Daftar / doska (light / dark): T    First / last step: Home / End
echo Close this window to stop.
echo.
call npx vite preview --port 4181 --open
goto :eof

:error
echo.
echo Something went wrong. See the messages above.
pause
