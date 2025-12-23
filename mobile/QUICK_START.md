# 🚀 Quick Start Guide - Hisab Mobile

## Get Started in 5 Minutes

### 1. Install Dependencies (2 min)

```bash
cd mobile
npm install
```

### 2. Configure Backend URL (1 min)

Open `src/api/client.js` and update line 6:

```javascript
// For local development on physical device, use your computer's IP
const API_URL = 'http://192.168.1.100:8000'; // Replace with YOUR IP

// For iOS Simulator
// const API_URL = 'http://localhost:8000';

// For Android Emulator
// const API_URL = 'http://10.0.2.2:8000';
```

**Find your IP:**
- **Mac/Linux**: `ifconfig | grep inet`
- **Windows**: `ipconfig` (look for IPv4 Address)

### 3. Start the App (1 min)

```bash
npm start
```

### 4. Run on Device (1 min)

**Option A: Physical Device (Recommended for Testing)**
1. Install **Expo Go** from App Store or Play Store
2. Scan the QR code from the terminal
3. App will open in Expo Go

**Option B: Simulator/Emulator**
```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android
```

### 5. Test Login

Use existing test accounts from your web app or create a new account through the register screen.

---

## 🎯 What You'll See

1. **Login Screen** - Fully functional, connects to your backend
2. **Main App** - 5 tabs (Dashboard, Friends, Groups, Expenses, Activity)
3. **Profile** - Settings with dark mode toggle and logout

**Note:** Most screens show "Coming soon..." placeholders. These need to be implemented following the development guide.

---

## ⚡ Common Issues & Solutions

### Issue: "Network request failed"
**Solution:** Check backend URL in `src/api/client.js` matches your backend server

### Issue: "Cannot connect to Metro"
**Solution:** 
```bash
npx expo start -c  # Clear cache
```

### Issue: "iOS build failed"
**Solution:**
```bash
cd ios && pod install && cd ..
```

### Issue: App crashes on physical device
**Solution:** Make sure backend URL uses your computer's IP, not `localhost`

---

## 📱 Next Steps

1. **Read** `DEVELOPMENT.md` for detailed development workflow
2. **Reference** `../frontend/src/` for business logic to implement
3. **Start** with Dashboard screen - implement balance cards
4. **Test** frequently on both iOS and Android

---

## 🛠️ Useful Development Commands

```bash
# Clear cache and restart
npx expo start -c

# Check for issues
npx expo-doctor

# Generate native projects (for app store builds)
npx expo prebuild

# Install a package
npx expo install package-name
```

---

## 📚 Key Files to Know

- **App.js** - Main entry point, wraps app with providers
- **src/navigation/AppNavigator.js** - All screen navigation
- **src/contexts/** - Auth, Data, and Theme management
- **src/api/client.js** - All backend API calls
- **src/constants/theme.js** - Colors, spacing, fonts

---

## 💡 Pro Tips

1. **Use Expo Go for quick iteration** - Changes reflect instantly
2. **Keep backend running** - Mobile app needs API access
3. **Test on real devices** - Simulators don't show real performance
4. **Follow theme system** - Use `COLORS`, `SPACING`, `FONT_SIZES` constants
5. **Reference web app** - Copy business logic, adapt UI

---

## 🎉 You're Ready!

The foundation is set. Start implementing screens and refer to the web app for logic. Happy coding! 🚀

**Questions?** Check `README.md` and `DEVELOPMENT.md` for detailed guides.
