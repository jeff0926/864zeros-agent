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
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import { RootState } from '../store/store';
import { useTheme } from '../contexts/ThemeContext';
import { OIAColors } from '../theme/OIATheme';

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
      'About Thaw',
      'Version 1.0.0\n\nOIA \u2014 Organize your Internal Architecture\n\nAI-powered task management that breaks down overwhelming tasks into just the next step.\n\nBuilt for ADHD people by ADHD people.\n\nthawapp.io\n864zeros LLC',
      [{ text: 'OK' }]
    );
  };

  const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
      <Icon name={icon} size={24} color={color} />
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
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.sage + '15' }]}>
          <Icon name={icon} size={18} color={theme.colors.sage} />
        </View>
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
        <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.sage }]}>
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
          <StatCard title="Completed" value={completedTasks} icon="check-circle" color={OIAColors.completed} />
          <StatCard title="Active" value={inProgressTasks} icon="play-circle" color={OIAColors.inProgress} />
          <StatCard title="Total Steps" value={totalSubtasks} icon="list" color={OIAColors.dustyBlue} />
          <StatCard title="Steps Done" value={completedSubtasks} icon="check" color={OIAColors.sage} />
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Settings
        </Text>

        <View style={[styles.settingsGroup, { ...theme.shadows.sm }]}>
          <SettingItem
            title="Dark Mode"
            subtitle="Toggle between light and dark themes"
            icon="moon"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.taupe + '60', true: theme.colors.sage + '80' }}
                thumbColor={isDarkMode ? theme.colors.sage : OIAColors.warmWhite}
              />
            }
          />

          <View style={[styles.settingDivider, { backgroundColor: theme.colors.background }]} />

          <SettingItem
            title="Notifications"
            subtitle="Manage notification preferences"
            icon="bell"
            onPress={handleNotificationPress}
          />

          <View style={[styles.settingDivider, { backgroundColor: theme.colors.background }]} />

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

        <View style={[styles.settingsGroup, { ...theme.shadows.sm }]}>
          <SettingItem
            title="Help & Support"
            subtitle="Get help with using the app"
            icon="help-circle"
            onPress={handleSupportPress}
          />

          <View style={[styles.settingDivider, { backgroundColor: theme.colors.background }]} />

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
        <Text style={[styles.footerBrand, { color: theme.colors.coral }]}>
          Thaw v1.0.0
        </Text>
        <Text style={[styles.footerOia, { color: theme.colors.textSecondary }]}>
          OIA — Organize your Internal Architecture
        </Text>
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
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
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FDFCFA',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 16,
  },
  statsSection: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingsSection: {
    padding: 24,
  },
  supportSection: {
    padding: 24,
    paddingTop: 0,
  },
  settingsGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  settingDivider: {
    height: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
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
