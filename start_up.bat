@echo off
REM Install required Python packages
python -m pip install -r requirements.txt

REM Get the current directory
setlocal enabledelayedexpansion
for /f "tokens=*" %%i in ('cd') do set "current_dir=%%i"

REM Start the Flask server
start python main.py

REM Wait for the server to start
timeout /t 2 /nobreak

REM Open the browser to localhost:5000
start https://127.0.0.1:5000
