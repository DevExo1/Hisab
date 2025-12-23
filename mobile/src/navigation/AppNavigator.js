/**
 * App Navigator
 * Main navigation structure for the app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../constants/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import FriendsScreen from '../screens/main/FriendsScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import ActivityScreen from '../screens/main/ActivityScreen';

// Detail Screens
import GroupDetailsScreen from '../screens/details/GroupDetailsScreen';
import SettlementScreen from '../screens/details/SettlementScreen';
import SettleDebtScreen from '../screens/details/SettleDebtScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main screens
const MainTabs = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'time' : 'time-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        contentStyle: {
          backgroundColor: theme.background,
        },
        headerBackTitleVisible: false,
        presentation: 'card',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ 
          title: 'Create Account',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Stack Navigator
const AppStack = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        contentStyle: {
          backgroundColor: theme.background,
        },
        headerBackTitleVisible: false,
        presentation: 'card',
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="GroupDetails" 
        component={GroupDetailsScreen}
        options={{ 
          title: 'Group Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Settlement" 
        component={SettlementScreen}
        options={{ 
          title: 'Settle Up',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="SettleDebt" 
        component={SettleDebtScreen}
        options={{ 
          title: 'Record Payment',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile Settings',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  if (isLoading) {
    return null; // Could show splash screen here
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
