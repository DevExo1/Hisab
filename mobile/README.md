# Hisab Mobile App

React Native mobile application for Hisab - Group Accounts Manager. A modern expense splitting and group accounts management platform.

## 🚀 Features

- **Cross-Platform**: Single codebase for iOS and Android
- **Shared Backend**: Uses the same API as the web application
- **Native Performance**: Built with React Native for native feel
- **Expo Ready**: Easy development and deployment with Expo
- **Ejectable**: Can be converted to native projects for app store publishing

## 📁 Project Structure

```
mobile/
├── src/
│   ├── api/              # API client (reused from web)
│   ├── components/       # Reusable UI components
│   ├── constants/        # Theme, colors, and constants
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   │   ├── auth/         # Login, Register
│   │   ├── main/         # Dashboard, Friends, Groups, etc.
│   │   ├── details/      # Group details, Settlement
│   │   └── settings/     # Profile settings
│   └── utils/            # Utility functions (reused from web)
├── assets/               # Images, fonts, icons
├── App.js               # Main app entry point
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure Backend URL**
   
   Update the API URL in `src/api/client.js`:
   ```javascript
   const API_URL = 'http://your-backend-url:8000';
   ```
   
   For local development:
   - iOS Simulator: `http://localhost:8000`
   - Android Emulator: `http://10.0.2.2:8000`
   - Physical Device: `http://YOUR_LOCAL_IP:8000`

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📱 Development Workflow

### Using Expo Go (Quick Testing)

```bash
npm start
```
Then scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

### Development Build (Recommended for Full Features)

```bash
# Create development build
npx expo run:ios
npx expo run:android
```

## 🏗️ Building for Production

### Option 1: Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Option 2: Generate Native Projects (Eject)

For full control and publishing to app stores:

```bash
# Generate native iOS and Android projects
npx expo prebuild

# Or completely eject from Expo
npm run eject
```

This creates:
- `ios/` folder - Open in Xcode for iOS development
- `android/` folder - Open in Android Studio for Android development

After ejecting, you can:
- Customize native code
- Add native modules
- Build and publish directly to App Store/Play Store

## 🔧 Configuration

### App Configuration (`app.json`)

- **name**: App display name
- **slug**: URL-friendly app name
- **bundleIdentifier** (iOS): `com.emergentsplit.app`
- **package** (Android): `com.emergentsplit.app`

### Environment Variables

Create `.env` file:
```
API_URL=http://localhost:8000
APP_ENV=development
```

## 📦 Code Sharing with Web App

### Shared Code (60-80% reuse)
- ✅ `src/api/client.js` - API client logic
- ✅ `src/utils/currency.js` - Currency formatting
- ✅ Business logic and calculations
- ✅ Data models and types
- ✅ Authentication flow

### Platform-Specific Code
- 🔄 UI Components (React Native vs React DOM)
- 🔄 Navigation (React Navigation vs React Router)
- 🔄 Storage (AsyncStorage vs localStorage)
- 🔄 Styling (StyleSheet vs CSS/Tailwind)

## 🎨 Theme & Styling

The app uses a consistent theme system defined in `src/constants/theme.js`:
- Colors (light/dark mode)
- Spacing
- Typography
- Border radius
- Shadows

## 🔐 Authentication

Authentication uses JWT tokens stored in AsyncStorage:
- Login/Register screens
- Token-based API authentication
- Automatic token refresh
- Secure logout

## 📱 App Store Submission

### iOS (App Store)

1. Generate native iOS project: `npx expo prebuild`
2. Open `ios/emergentsplit.xcworkspace` in Xcode
3. Configure signing certificates
4. Build and archive
5. Upload to App Store Connect
6. Submit for review

### Android (Play Store)

1. Generate native Android project: `npx expo prebuild`
2. Open `android/` folder in Android Studio
3. Generate signing key
4. Build release APK/AAB
5. Upload to Play Console
6. Submit for review

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npx expo start -c
```

### iOS Build Errors
```bash
cd ios
pod install
cd ..
```

### Android Build Errors
```bash
cd android
./gradlew clean
cd ..
```

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## 🤝 Contributing

The mobile app shares the same backend and business logic as the web application. When making changes:

1. **Shared logic** should be updated in both web and mobile
2. **UI components** are platform-specific
3. Test on both iOS and Android before committing

## 📄 License

Same as the main EmergentSplit project.
