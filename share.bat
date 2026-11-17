@echo off
rem Share this presentation from this PC through a temporary public link (a Cloudflare quick tunnel).
rem Each run gives a new link like https://something.trycloudflare.com, printed in this window.
rem The link works while this PC is on and this window stays open. Close it to stop sharing.
cd /d "%~dp0"
set PORT=4181

rem cloudflared: the copy in ..\share\bin, or one on the PATH.
set CF=%~dp0..\share\bin\cloudflared.exe
if exist "%CF%" goto :have_cf
set CF=cloudflared
where cloudflared >nul 2>nul && goto :have_cf
echo cloudflared was not found.
echo Download cloudflared-windows-amd64.exe from https://github.com/cloudflare/cloudflared/releases
echo and save it as share\bin\cloudflared.exe in the folder above this one.
pause
goto :eof
:have_cf

if not exist node_modules (
  echo Installing dependencies, first run only...
  call npm install --no-audit --no-fund || goto :error
)
echo Building the presentation...
call npm run build || goto :error

rem The server listens on this PC only; the public link reaches it through the tunnel.
start "Presentation server" /min cmd /c "node tools\serve.mjs dist %PORT%"
timeout /t 2 >nul
echo.
echo Starting the public link. Look for https://....trycloudflare.com below.
echo.
"%CF%" tunnel --no-autoupdate --url http://127.0.0.1:%PORT% --http-host-header 127.0.0.1:%PORT%
goto :eof

:error
echo.
echo Something went wrong. See the messages above.
pause
