/**
 * Activity Screen
 * Recent activity and notifications
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function ActivityScreen() {
  const { isDarkMode } = useTheme();
  const { activity, isLoading } = useData();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Activity</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Recent activity • Coming soon...
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
  },
});
