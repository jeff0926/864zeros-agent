import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import { RootState, AppDispatch } from '../store/store';
import { fetchTasks } from '../store/slices/tasksSlice';
import { useTheme } from '../contexts/ThemeContext';
import { Task } from '../types/Task';
import { OIAColors } from '../theme/OIATheme';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { id: userId } = useSelector((state: RootState) => state.user);
  const { theme } = useTheme();

  useEffect(() => {
    if (userId) {
      dispatch(fetchTasks(userId));
    }
  }, [dispatch, userId]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: OIAColors.completed + '33', text: OIAColors.completed };
      case 'in_progress':
        return { bg: OIAColors.inProgress + '33', text: OIAColors.inProgress };
      default:
        return { bg: OIAColors.pending + '33', text: OIAColors.pending };
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    const completedSubtasks = item.subtasks?.filter(st => st.status === 'completed').length || 0;
    const totalSubtasks = item.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const badge = getStatusBadgeStyle(item.status);

    return (
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
        onPress={() => navigation.navigate('TaskDetail', { task: item })}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusText, { color: badge.text }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {totalSubtasks > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.taupe + '40' }]}>
              <View style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: theme.colors.sage },
              ]} />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {completedSubtasks}/{totalSubtasks} completed
            </Text>
          </View>
        )}

        {item.description && item.description !== item.title && (
          <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inbox" size={48} color={theme.colors.taupe} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No tasks yet</Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
        Ready when you are.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { borderColor: theme.colors.sage }]}
        onPress={() => navigation.navigate('CreateTask')}
        activeOpacity={0.7}
      >
        <Text style={[styles.emptyButtonText, { color: theme.colors.sage }]}>
          Add your first task
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.coral }]}>Thaw</Text>
          <Text style={[styles.headerTagline, { color: theme.colors.textSecondary }]}>
            Just the next step.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.sage, ...theme.shadows.button }]}
          onPress={() => navigation.navigate('CreateTask')}
          activeOpacity={0.7}
        >
          <Icon name="plus" size={24} color={OIAColors.warmWhite} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => userId && dispatch(fetchTasks(userId))}
            tintColor={theme.colors.sage}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, tasks.length === 0 && styles.listEmpty]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 32, fontWeight: '700', letterSpacing: 0.5 },
  headerTagline: { fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  addButton: { width: 56, height: 56, borderRadius: 9999, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  listEmpty: { flex: 1 },
  taskCard: { padding: 16, borderRadius: 16, marginBottom: 12 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  taskTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8, lineHeight: 24 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  progressContainer: { marginVertical: 8 },
  progressBar: { height: 8, borderRadius: 4, marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12 },
  taskDescription: { fontSize: 14, lineHeight: 21 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  emptyButton: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, borderWidth: 2, minHeight: 56, justifyContent: 'center' },
  emptyButtonText: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
});

export default HomeScreen;
