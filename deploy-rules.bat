@echo off
echo Deploying Firebase Firestore Rules...
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Firebase CLI is not installed.
    echo Please install it with: npm install -g firebase-tools
    echo Then run: firebase login
    pause
    exit /b 1
)

REM Deploy the rules
echo Deploying firestore.rules...
firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo.
    echo ✅ Rules deployed successfully!
    echo Your app should now work without permissions errors.
) else (
    echo.
    echo ❌ Failed to deploy rules.
    echo Please check your Firebase project configuration.
)

echo.
pause