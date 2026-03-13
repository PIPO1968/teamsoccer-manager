@echo off
REM build-check-env-win.bat
REM Este script asegura que la variable VITE_API_BASE_URL esté definida antes de hacer el build

setlocal
set VITE_API_BASE_URL=
for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
    if "%%A"=="VITE_API_BASE_URL" set VITE_API_BASE_URL=%%B
)

if "%VITE_API_BASE_URL%"=="" (
    echo [ERROR] La variable VITE_API_BASE_URL no está definida en .env.
    exit /b 1
) else (
    echo [OK] VITE_API_BASE_URL=%VITE_API_BASE_URL%
)

REM Ejecutar build con la variable cargada
set VITE_API_BASE_URL=%VITE_API_BASE_URL%
npm run build
