# React Native Implementation Plan for EmergentSplitwise Mobile

## Executive Summary

**Timeline**: 8-10 weeks
**Approach**: Phased implementation with code reuse strategy
**Code Reuse**: 60-80% from existing web codebase
**Platforms**: iOS & Android (single codebase)

---

## Phase 0: Preparation & Setup (Week 1)

### Day 1-2: Environment Setup

**Install Required Tools:**
```bash
# 1. Install Node.js 16+ (already have)
# 2. Install Expo CLI
npm install -g expo-cli

# 3. Install EAS CLI (for builds)
npm install -g eas-cli

# 4. Install iOS Simulator (Mac only)
# Download Xcode from App Store

# 5. Install Android Studio
# Download from https://developer.android.com/studio
```

**Create Project Structure:**
```bash
cd "EmergentSplitwise"
npx create-expo-app mobile --template blank
cd mobile

# Install essential dependencies
npx expo install react-native-safe-area-context
npx expo install @react-navigation/native
npx expo install @react-navigation/native-stack
npx expo install @react-navigation/bottom-tabs
npx expo install axios
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store
```

**Project Structure:**
```
mobile/
├── src/
│   ├── shared/              # Code from web (60-80% reuse)
│   │   ├── hooks/           # ✅ Direct copy from web
│   │   ├── api/             # ✅ Direct copy from web
│   │   └── utils/           # ✅ Direct copy from web
│   ├── components/          # 🔄 Rewrite for mobile
│   │   ├── cards/
│   │   ├── modals/
│   │   └── common/          # Buttons, inputs, etc.
│   ├── screens/             # 🔄 Adapt from web pages
│   ├── navigation/          # New for mobile
│   ├── theme/               # Colors, spacing, typography
│   └── config/              # App configuration
├── assets/                  # Images, fonts, icons
├── app.json                 # Expo configuration
├── package.json
└── App.js                   # Root component
```

### Day 3: Copy Shared Code

**Step 1: Copy Reusable Code**
```bash
# From web to mobile
cp -r ../frontend/src/hooks ./src/shared/
cp -r ../frontend/src/api ./src/shared/
cp -r ../frontend/src/utils ./src/shared/
```

**Step 2: Adapt Shared Code (Minor Changes)**

**`src/shared/api/index.js` - Update storage:**
```javascript
// CHANGE: localStorage → AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// BEFORE (Web):
localStorage.setItem('token', access_token);

// AFTER (Mobile):
await SecureStore.setItemAsync('token', access_token);
```

**`src/shared/hooks/useAuth.js` - Update storage:**
```javascript
// Update to use SecureStore instead of localStorage
import * as SecureStore from 'expo-secure-store';
```

### Day 4-5: Create Theme System

**`src/theme/colors.js`:**
```javascript
export const colors = {
  // From your web CSS
  primary: {
    teal: '#14b8a6',
    tealDark: '#0f766e',
  },
  secondary: {
    coral: '#f87171',
    coralDark: '#dc2626',
  },
  background: {
    light: '#f8fafc',
    dark: '#0f172a',
  },
  card: {
    light: '#ffffff',
    dark: '#1e293b',
  },
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    primaryDark: '#ffffff',
    secondaryDark: '#cbd5e1',
  },
  border: {
    light: '#e2e8f0',
    dark: '#334155',
  },
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};
```

**`src/theme/spacing.js`:**
```javascript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

**`src/theme/typography.js`:**
```javascript
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
  tiny: {
    fontSize: 12,
    lineHeight: 16,
  },
};
```

---

## Phase 1: Core UI Components (Week 2-3)

### Week 2: Common Components

**Day 1-2: Base Components**

**`src/components/common/Button.js`:**
```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'medium', // small, medium, large
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  // Variants
  primary: {
    backgroundColor: colors.primary.teal,
  },
  secondary: {
    backgroundColor: colors.secondary.coral,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary.teal,
  },
  danger: {
    backgroundColor: colors.error,
  },
  // Sizes
  small: {
    paddingVertical: spacing.sm,
    ...typography.small,
  },
  medium: {
    paddingVertical: spacing.md,
    ...typography.body,
  },
  large: {
    paddingVertical: spacing.lg,
    fontSize: 18,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
  outlineText: {
    color: colors.primary.teal,
  },
});
```

**`src/components/common/Input.js`:**
```javascript
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  multiline = false,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.small,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    backgroundColor: '#fff',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.tiny,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
```

**`src/components/common/Card.js`:**
```javascript
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../theme';

export const Card = ({ children, onPress, style }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
```

**Day 3-4: Card Components**

**`src/components/cards/BalanceCard.js`:**
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { formatCurrency } from '../../shared/utils/currency';
import { colors, spacing, typography } from '../../theme';

export const BalanceCard = ({ darkMode, currency, youOwe = 0, youAreOwed = 0 }) => {
  const totalBalance = youAreOwed - youOwe;

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Your Balance</Text>

      <View style={styles.balanceRow}>
        <View style={styles.balanceItem}>
          <Text style={[styles.amount, styles.owedAmount]}>
            {formatCurrency(youAreOwed, currency)}
          </Text>
          <Text style={styles.label}>You are owed</Text>
        </View>

        <View style={styles.balanceItem}>
          <Text style={[styles.amount, styles.oweAmount]}>
            {formatCurrency(youOwe, currency)}
          </Text>
          <Text style={styles.label}>You owe</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalContainer}>
        <Text style={[
          styles.totalAmount,
          totalBalance >= 0 ? styles.owedAmount : styles.oweAmount
        ]}>
          {formatCurrency(Math.abs(totalBalance), currency)}
        </Text>
        <Text style={styles.totalLabel}>
          {totalBalance === 0 ? 'Settled up' : totalBalance > 0 ? 'Total you are owed' : 'Total you owe'}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  balanceItem: {
    alignItems: 'center',
  },
  amount: {
    ...typography.h2,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  owedAmount: {
    color: colors.primary.teal,
  },
  oweAmount: {
    color: colors.secondary.coral,
  },
  label: {
    ...typography.small,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.lg,
  },
  totalContainer: {
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
});
```

**`src/components/cards/ExpenseCard.js`:**
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { formatCurrency } from '../../shared/utils/currency';
import { colors, spacing, typography } from '../../theme';

export const ExpenseCard = ({ expense, currency, onPress }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const expenseCurrency = expense.currency || currency;

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{expense.icon}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>{expense.description}</Text>
          <Text style={styles.subtitle}>
            Paid by {expense.paidBy} • {formatDate(expense.date)}
          </Text>
          {expense.group && (
            <Text style={styles.group}>
              {expense.group} • {expenseCurrency}
            </Text>
          )}
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatCurrency(expense.amount, expenseCurrency)}
          </Text>
          <Text style={[
            styles.status,
            expense.youOwe > 0 ? styles.oweStatus :
            expense.youAreOwed > 0 ? styles.owedStatus :
            styles.settledStatus
          ]}>
            {expense.youOwe > 0 ? `You owe ${formatCurrency(expense.youOwe, expenseCurrency)}` :
             expense.youAreOwed > 0 ? `Owed ${formatCurrency(expense.youAreOwed, expenseCurrency)}` :
             'Settled up'}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  description: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  group: {
    ...typography.tiny,
    color: colors.text.secondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.xs / 2,
  },
  status: {
    ...typography.small,
    fontWeight: '600',
  },
  oweStatus: {
    color: colors.secondary.coral,
  },
  owedStatus: {
    color: colors.primary.teal,
  },
  settledStatus: {
    color: colors.text.secondary,
  },
});
```

### Week 3: Continue Cards & Modals

**Day 1-2: GroupCard, FriendCard**

Similar pattern to ExpenseCard - create mobile versions with React Native components.

**Day 3-5: Modal Components**

**`src/components/modals/AddExpenseModal.js`:**
```javascript
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { colors, spacing, typography } from '../../theme';

export const AddExpenseModal = ({ visible, onClose, onSubmit, groups, friends, currency }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState('');
  // ... rest of state from web version

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Expense</Text>
          <Button title="✕" onPress={onClose} variant="outline" size="small" />
        </View>

        <ScrollView style={styles.content}>
          {/* Form fields - similar to web but with mobile components */}
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter expense description"
          />

          <Input
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          {/* Add remaining fields */}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Add Expense"
            onPress={handleSubmit}
            variant="primary"
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h3,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
```

---

## Phase 2: Navigation & Screens (Week 4-5)

### Week 4: Navigation Setup

**Day 1: Navigation Structure**

**`src/navigation/AppNavigator.js`:**
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { GroupDetailsScreen } from '../screens/GroupDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Expenses':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Groups':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Friends':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Activity':
              iconName = focused ? 'list' : 'list-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#14b8a6',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user } = useAuth(); // Use your hook

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="GroupDetails"
              component={GroupDetailsScreen}
              options={{ headerShown: true, title: 'Group Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

**Day 2-5: Screen Components**

**`src/screens/DashboardScreen.js`:**
```javascript
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useData } from '../shared/hooks';
import { BalanceCard } from '../components/cards/BalanceCard';
import { ExpenseCard } from '../components/cards/ExpenseCard';
import { calculateOverallBalance } from '../shared/api';
import { colors, spacing } from '../theme';

export const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { groups, expenses, loading, loadAllData } = useData(user, 'USD');

  const overallBalance = calculateOverallBalance(groups);
  const recentExpenses = expenses.slice(0, 5);

  const onRefresh = React.useCallback(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        <BalanceCard
          youOwe={overallBalance.youOwe}
          youAreOwed={overallBalance.youAreOwed}
          currency="USD"
        />

        {recentExpenses.map(expense => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            currency="USD"
            onPress={() => {
              // Navigate to expense details
            }}
          />
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddExpense(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
```

### Week 5: Remaining Screens

Create similar screen components for:
- ExpensesScreen
- GroupsScreen
- GroupDetailsScreen
- FriendsScreen
- ActivityScreen
- LoginScreen

Each follows the same pattern:
1. Use SafeAreaView
2. Use custom hooks (useAuth, useData)
3. Use Card components
4. Implement pull-to-refresh
5. Handle navigation

---

## Phase 3: Features & Polish (Week 6-7)

### Week 6: Core Features

**Day 1-2: Authentication Flow**

Complete the login/logout flow with SecureStore for token persistence.

**Day 3-4: Offline Support**

**`src/services/offlineSync.js`:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export class OfflineSync {
  static async cacheData(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  static async getCachedData(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  static async isOnline() {
    const state = await NetInfo.fetch();
    return state.isConnected;
  }
}

// Usage in hooks:
// const cachedExpenses = await OfflineSync.getCachedData('expenses');
// if (cachedExpenses) setExpenses(cachedExpenses);
```

**Day 5: Push Notifications Setup**

```bash
npx expo install expo-notifications
```

**`src/services/notifications.js`:**
```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    alert('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  // Send token to backend
  // await api.post('/users/push-token', { token });

  return token;
}
```

### Week 7: Polish & Optimization

**Day 1-2: Loading States**

Add skeleton loaders using `react-native-skeleton-placeholder`:
```bash
npm install react-native-skeleton-placeholder
```

**Day 3-4: Error Handling**

Create error boundary and toast notifications:
```bash
npx expo install react-native-toast-message
```

**Day 5: Performance Optimization**

- Add React.memo to expensive components
- Implement FlatList for long lists
- Add image optimization

---

## Phase 4: Testing & Deployment (Week 8-10)

### Week 8: Testing

**Day 1-3: Manual Testing Checklist**

```markdown
## Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token persistence after app restart
- [ ] Logout clears data

## Dashboard
- [ ] Displays correct balances
- [ ] Shows recent expenses
- [ ] Pull to refresh works
- [ ] Navigation to other screens

## Expenses
- [ ] List all expenses
- [ ] Add new expense (equal split)
- [ ] Add new expense (exact split)
- [ ] Add new expense (percentage split)
- [ ] Expense validation works
- [ ] Expenses sync with backend

## Groups
- [ ] List all groups
- [ ] Create new group
- [ ] View group details
- [ ] Group balances display correctly

## Friends
- [ ] List all friends
- [ ] Friend balances display correctly

## Offline
- [ ] App works offline with cached data
- [ ] Data syncs when back online
- [ ] Shows offline indicator

## Performance
- [ ] App starts in < 3 seconds
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Handles 100+ expenses
```

**Day 4-5: Automated Testing**

```bash
npm install --save-dev @testing-library/react-native jest
```

**Example test:**
```javascript
// __tests__/components/BalanceCard.test.js
import React from 'react';
import { render } from '@testing-library/react-native';
import { BalanceCard } from '../../src/components/cards/BalanceCard';

describe('BalanceCard', () => {
  it('displays correct balance', () => {
    const { getByText } = render(
      <BalanceCard youOwe={100} youAreOwed={200} currency="USD" />
    );
    expect(getByText('$100.00')).toBeTruthy();
    expect(getByText('$200.00')).toBeTruthy();
  });
});
```

### Week 9: App Store Preparation

**Day 1: Create App Icons & Splash Screen**

```bash
# Generate icons
npx expo install expo-icon
# Use https://www.appicon.co/ to generate all sizes
```

**Update `app.json`:**
```json
{
  "expo": {
    "name": "EmergentSplit",
    "slug": "emergent-split",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#14b8a6"
    },
    "ios": {
      "bundleIdentifier": "com.emergentsplit.app",
      "buildNumber": "1",
      "supportsTablet": true
    },
    "android": {
      "package": "com.emergentsplit.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#14b8a6"
      }
    }
  }
}
```

**Day 2-3: Build for iOS**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Create iOS build
eas build --platform ios --profile production
```

**Day 4-5: Build for Android**

```bash
# Create Android build
eas build --platform android --profile production

# Generate signed APK for testing
eas build --platform android --profile preview
```

### Week 10: Submission & Launch

**Day 1-2: App Store Submission (iOS)**

1. Create App Store Connect account
2. Upload build via EAS
3. Fill metadata:
   - Description
   - Screenshots (6.5" and 5.5" iPhone)
   - Privacy policy
   - Support URL
4. Submit for review

**Day 3-4: Play Store Submission (Android)**

1. Create Google Play Console account ($25 one-time)
2. Upload APK/AAB
3. Fill store listing:
   - Description
   - Screenshots
   - Feature graphic
   - Privacy policy
4. Submit for review

**Day 5: Post-Launch**

- Monitor crash reports (Sentry)
- Set up analytics
- Plan first update

---

## Code Migration Checklist

### ✅ Can Reuse Directly (Copy & Paste)

```
hooks/
  ├── useAuth.js          ✅ (minor AsyncStorage changes)
  └── useData.js          ✅ (minor AsyncStorage changes)

api/
  └── index.js            ✅ (update storage methods)

utils/
  └── currency.js         ✅ (works as-is)
```

### 🔄 Need Adaptation

```
components/
  ├── modals/             🔄 Use React Native Modal
  ├── cards/              🔄 Use View/Text instead of div/span
  └── layout/             🔄 Different navigation pattern

pages/
  └── *.js                🔄 Adapt to screens with navigation
```

### ❌ Need Complete Rewrite

```
App.css                   ❌ Replace with StyleSheet
React Router              ❌ Replace with React Navigation
HTML forms                ❌ Replace with React Native inputs
```

---

## Team & Resources

### Required Team

**Option 1: Solo Developer**
- 1 React/React Native developer
- Timeline: 10 weeks full-time

**Option 2: Team**
- 1 Lead developer (React Native)
- 1 UI/UX designer (for mobile-specific designs)
- Timeline: 6 weeks

### Budget Estimate

**Development:**
- Solo: $15k-$25k (10 weeks × $1,500-$2,500/week)
- Team: $20k-$35k (6 weeks × 2 people)

**App Store Fees:**
- Apple Developer: $99/year
- Google Play: $25 one-time

**Additional Services:**
- Push notifications (Expo): Free tier (then $99/month)
- Error tracking (Sentry): Free tier
- Analytics (Firebase): Free

**Total First Year: $16k-$36k**

---

## Risk Mitigation

### Risk 1: Unexpected API Changes
**Mitigation:** Keep backend contract stable, version API

### Risk 2: Platform-Specific Bugs
**Mitigation:** Test on real devices early, use Expo managed workflow

### Risk 3: App Store Rejection
**Mitigation:** Follow guidelines strictly, prepare privacy policy, test thoroughly

### Risk 4: Performance Issues
**Mitigation:** Profile early, use FlatList for lists, optimize images

### Risk 5: Timeline Delays
**Mitigation:** Build MVP first (Dashboard + Expenses only), iterate

---

## Success Metrics

**Week 2:** Common components complete, theme system working
**Week 4:** Navigation working, 2+ screens functional
**Week 6:** All 6 screens complete, modals working
**Week 8:** Testing complete, app stable
**Week 10:** Live in stores

**Post-Launch (Month 1):**
- Install rate: Track vs web users
- Crash-free rate: > 99%
- User retention: > 60% day 7

---

## Next Steps

1. **Review & Approve** this plan
2. **Set up development environment** (Day 1-2)
3. **Create project** and copy shared code (Day 3)
4. **Start Week 1 tasks** immediately

### Quick Start Commands

```bash
# Week 1 Day 1
npm install -g expo-cli eas-cli

# Week 1 Day 2
cd EmergentSplitwise
npx create-expo-app mobile --template blank
cd mobile

# Week 1 Day 3
cp -r ../frontend/src/hooks ./src/shared/
cp -r ../frontend/src/api ./src/shared/
cp -r ../frontend/src/utils ./src/shared/

# Start development
npm start
```

---

## Additional Resources

**Documentation:**
- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/

**Tools:**
- Expo Snack (Online Playground): https://snack.expo.dev/
- React Native Debugger: https://github.com/jhen0409/react-native-debugger

**Communities:**
- Expo Discord: https://chat.expo.dev/
- React Native Community: https://www.reactnative.cc/

---

**Plan Created:** December 17, 2025
**Version:** 1.0
**Status:** Ready for Implementation
