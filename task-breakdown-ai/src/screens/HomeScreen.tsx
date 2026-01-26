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

  const renderTask = ({ item }: { item: Task }) => {
    const completedSubtasks = item.subtasks?.filter(st => st.status === 'completed').length || 0;
    const totalSubtasks = item.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('TaskDetail', { task: item })}
      >
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status, theme) }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        {totalSubtasks > 0 && (
          <View style={styles.progressContainer}>
            <View style={[
              styles.progressBar,
              { backgroundColor: theme.colors.border }
            ]}>
              <View style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: theme.colors.primary
                }
              ]} />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {completedSubtasks}/{totalSubtasks} completed
            </Text>
          </View>
        )}
        
        <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string, theme: any) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Tasks
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('CreateTask')}
        >
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => userId && dispatch(fetchTasks(userId))}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomeScreen;