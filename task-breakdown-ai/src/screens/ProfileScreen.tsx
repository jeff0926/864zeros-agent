import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import { RootState } from '../store/store';
import { useTheme } from '../contexts/ThemeContext';

const ProfileScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { theme, toggleTheme, isDark: isDarkMode } = useTheme();

  // Calculate user stats
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const totalSubtasks = tasks.reduce((sum, task) => sum + (task.subtasks?.length || 0), 0);
  const completedSubtasks = tasks.reduce((sum, task) =>
    sum + (task.subtasks?.filter(st => st.status === 'completed').length || 0), 0
  );

  const handleNotificationPress = () => {
    Alert.alert('Coming Soon', 'Notification settings will be available in a future update.');
  };

  const handleBackupPress = () => {
    Alert.alert('Coming Soon', 'Data backup feature will be available in a future update.');
  };

  const handleSupportPress = () => {
    Alert.alert('Support', 'Need help? Contact us at support@864zeros.com');
  };

  const handleAboutPress = () => {
    Alert.alert(
      'About UnStuck',
      'Version 1.0.0\n\nOIA \u2014 Organize your Internal Architecture\n\nAI-powered task management that breaks down overwhelming tasks into just the next step.\n\nBuilt for ADHD people by ADHD people.\n\n864zeros LLC',
      [{ text: 'OK' }]
    );
  };

  const StatCard: React.FC<{ title: string; value: number; icon: string }> = ({ title, value, icon }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Icon name={icon} size={24} color={theme.colors.primary} />
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
    </View>
  );

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    icon: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }> = ({ title, subtitle, icon, onPress, rightComponent }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Icon name={icon} size={20} color={theme.colors.text} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightComponent || (
        <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        </View>

        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user.email || 'Anonymous User'}
        </Text>

        <Text style={[styles.userSubtitle, { color: theme.colors.textSecondary }]}>
          Task Management Pro
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Your Statistics
        </Text>

        <View style={styles.statsGrid}>
          <StatCard title="Completed Tasks" value={completedTasks} icon="check-circle" />
          <StatCard title="Active Tasks" value={inProgressTasks} icon="play-circle" />
          <StatCard title="Total Subtasks" value={totalSubtasks} icon="list" />
          <StatCard title="Completed Steps" value={completedSubtasks} icon="check" />
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Settings
        </Text>

        <View style={styles.settingsGroup}>
          <SettingItem
            title="Dark Mode"
            subtitle="Toggle between light and dark themes"
            icon="moon"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
          />

          <SettingItem
            title="Notifications"
            subtitle="Manage notification preferences"
            icon="bell"
            onPress={handleNotificationPress}
          />

          <SettingItem
            title="Data & Privacy"
            subtitle="Backup and privacy settings"
            icon="shield"
            onPress={handleBackupPress}
          />
        </View>
      </View>

      {/* Support */}
      <View style={styles.supportSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Support
        </Text>

        <View style={styles.settingsGroup}>
          <SettingItem
            title="Help & Support"
            subtitle="Get help with using the app"
            icon="help-circle"
            onPress={handleSupportPress}
          />

          <SettingItem
            title="About"
            subtitle="App version and information"
            icon="info"
            onPress={handleAboutPress}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerBrand, { color: theme.colors.textSecondary }]}>
          UnStuck v1.0.0
        </Text>
        <Text style={[styles.footerOia, { color: theme.colors.textSecondary }]}>
          OIA — Organize your Internal Architecture
        </Text>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          864zeros LLC
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 16,
  },
  statsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingsSection: {
    padding: 20,
  },
  supportSection: {
    padding: 20,
    paddingTop: 0,
  },
  settingsGroup: {
    gap: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 60,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerOia: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 11,
    marginVertical: 2,
  },
});

export default ProfileScreen;
