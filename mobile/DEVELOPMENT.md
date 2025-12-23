# Hisab Mobile - Development Guide

## 🎯 Current Status

The mobile app structure has been set up with:
- ✅ Project structure with proper folder organization
- ✅ API client (reused from web with React Native adaptations)
- ✅ Authentication context and flow
- ✅ Data management context
- ✅ Theme system with dark mode support
- ✅ Navigation structure (bottom tabs + stack navigation)
- ✅ Placeholder screens for all main features
- ✅ Ready for Expo development and future ejection

## 🚧 Next Steps

### Phase 1: Complete Core Screens (Weeks 1-2)

1. **Dashboard Screen**
   - Balance summary card
   - Recent expenses list
   - Quick actions (Add Expense, Settle Up)

2. **Friends Screen**
   - Friends list with balances
   - Add friend functionality
   - Friend detail view

3. **Groups Screen**
   - Groups list
   - Create/Edit group functionality
   - Group cards with member count

4. **Expenses Screen**
   - Expenses list with filters
   - Add expense modal
   - Expense detail view

5. **Activity Screen**
   - Activity feed
   - Notifications

### Phase 2: Detail Screens (Week 3)

1. **Group Details Screen**
   - Group info and members
   - Group expenses
   - Balance breakdown
   - Settlement options

2. **Settlement Screen**
   - Simplified view
   - Detailed/Pairwise view
   - Record payment functionality

3. **Profile Settings Screen**
   - User profile info
   - App settings
   - Currency preference
   - Dark mode toggle
   - Logout

### Phase 3: Polish & Optimization (Week 4)

1. **UI Components Library**
   - Reusable button components
   - Card components
   - Input components
   - Modal components

2. **Loading States**
   - Skeleton loaders
   - Pull-to-refresh
   - Loading indicators

3. **Error Handling**
   - Error boundaries
   - Retry mechanisms
   - Offline support

4. **Performance**
   - Image optimization
   - List virtualization
   - Memoization

### Phase 4: Testing & Deployment (Week 5)

1. **Testing**
   - Test on iOS simulator/device
   - Test on Android emulator/device
   - Test different screen sizes
   - Test dark/light modes

2. **Build & Deploy**
   - Create development build
   - Test internal distribution
   - Prepare for app store submission

## 💡 Development Tips

### Code Reuse from Web App

When implementing screens, refer to the web app for logic:

```javascript
// Web: frontend/src/pages/Dashboard.js
// Mobile: mobile/src/screens/main/DashboardScreen.js

// Reuse:
// - Data fetching logic
// - Business calculations
// - State management patterns

// Adapt:
// - UI components (View vs div, Text vs span)
// - Styling (StyleSheet vs CSS)
// - Navigation (React Navigation vs React Router)
```

### Component Structure

```javascript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function MyScreen() {
  const { isDarkMode } = useTheme();
  const { data, refreshData } = useData();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  useEffect(() => {
    // Load data
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Content */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ...
});
```

### Styling Best Practices

1. **Use theme colors**
   ```javascript
   { color: theme.text }
   { backgroundColor: theme.surface }
   ```

2. **Use spacing constants**
   ```javascript
   { padding: SPACING.md }
   { marginBottom: SPACING.lg }
   ```

3. **Responsive design**
   ```javascript
   import { Dimensions } from 'react-native';
   const { width, height } = Dimensions.get('window');
   ```

### Navigation Patterns

```javascript
// Navigate to screen
navigation.navigate('GroupDetails', { group: groupData });

// Go back
navigation.goBack();

// Access params
const { group } = route.params;
```

## 📱 Testing on Devices

### iOS Simulator
```bash
npm start
# Press 'i' in terminal
```

### Android Emulator
```bash
npm start
# Press 'a' in terminal
```

### Physical Device
1. Install Expo Go app from App Store/Play Store
2. Run `npm start`
3. Scan QR code with camera (iOS) or Expo Go (Android)

## 🔧 Useful Commands

```bash
# Start development
npm start

# Clear cache
npx expo start -c

# Check for updates
npx expo-doctor

# Upgrade dependencies
npx expo install --fix

# Generate native projects
npx expo prebuild

# Run on specific platform
npx expo run:ios
npx expo run:android
```

## 🎨 Design System

All UI should follow the design system defined in `src/constants/theme.js`:

- **Primary Color**: #14B8A6 (Teal)
- **Secondary Color**: #10B981 (Emerald)
- **Accent**: #FF6B6B (Coral)
- **Spacing Scale**: 4, 8, 16, 24, 32, 48px
- **Border Radius**: 8, 12, 16, 24px
- **Font Sizes**: 12, 14, 16, 18, 20, 24, 32px

## 🤔 Questions?

Refer to:
- Web app implementation: `frontend/src/`
- React Native docs: https://reactnative.dev/
- Expo docs: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
