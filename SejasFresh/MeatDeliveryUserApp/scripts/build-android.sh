# Android Build Scripts

# Production build (App Bundle for Google Play Store)
eas build --platform android --profile production --message "Production build for Play Store"

# Preview build (APK for testing)
eas build --platform android --profile preview --message "Preview build for testing"

# Development build (APK with development client)
eas build --platform android --profile development --message "Development build for testing"

# Check build status
eas build:list --limit 5

# Download latest build
eas build:download --latest

# Submit to Google Play Store (after production build)
eas submit --platform android --profile production