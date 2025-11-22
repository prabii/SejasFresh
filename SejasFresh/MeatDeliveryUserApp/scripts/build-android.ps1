# Android Build Scripts for Windows PowerShell

# Production build (App Bundle for Google Play Store)
Write-Host "Building production version..." -ForegroundColor Green
eas build --platform android --profile production --message "Production build for Play Store"

# Preview build (APK for testing)
# Write-Host "Building preview version..." -ForegroundColor Yellow
# eas build --platform android --profile preview --message "Preview build for testing"

# Development build (APK with development client)
# Write-Host "Building development version..." -ForegroundColor Blue
# eas build --platform android --profile development --message "Development build for testing"

# Check build status
Write-Host "Checking build status..." -ForegroundColor Cyan
eas build:list --limit 5

# Download latest build
# Write-Host "Downloading latest build..." -ForegroundColor Magenta
# eas build:download --latest

# Submit to Google Play Store (after production build)
# Write-Host "Submitting to Play Store..." -ForegroundColor Red
# eas submit --platform android --profile production