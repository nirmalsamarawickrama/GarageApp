@echo off
echo ==========================================================
echo AutoPulse - Add 192.168.1.5 Secondary IP to Ethernet Adapter
echo ==========================================================
echo.
netsh interface ipv4 add address "Ethernet" 192.168.1.5 255.255.255.0
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] 192.168.1.5 added successfully!
    echo Your mobile phone APK can now connect to http://192.168.1.5:5173
) else (
    echo [NOTE] If 192.168.1.5 is already assigned or needs elevation, please verify in Settings.
)
echo.
pause
