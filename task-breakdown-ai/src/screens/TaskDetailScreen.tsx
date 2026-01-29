import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import { AppDispatch, RootState } from '../store/store';
import { updateTaskStatus, toggleSubtask, persistToggleSubtask, persistTaskStatus } from '../store/slices/tasksSlice';
import { useTheme } from '../contexts/ThemeContext';
import { Task, Subtask } from '../types/Task';

interface TaskDetailScreenProps {
  navigation: any;
  route: {
    params: {
      task: Task;
    };
  };
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ navigation, route }) => {
  const { task: routeTask } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();

  // Get live task from Redux state instead of route params snapshot
  const task = useSelector((state: RootState) =>
    state.tasks.tasks.find(t => t.id === routeTask.id)
  ) || routeTask;

  // Track which subtasks are animating
  const [animatingSubtasks, setAnimatingSubtasks] = useState<Set<string>>(new Set());
  const [statusButtonPressed, setStatusButtonPressed] = useState<string | null>(null);

  const completedSubtasks = task.subtasks?.filter(st => st.status === 'completed').length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleSubtaskToggle = useCallback((subtaskId: string) => {
    // Add to animating set for visual feedback
    setAnimatingSubtasks(prev => new Set(prev).add(subtaskId));

    // Immediate UI update via synchronous reducer
    dispatch(toggleSubtask({ taskId: task.id, subtaskId }));

    // Persist to storage
    dispatch(persistToggleSubtask({ taskId: task.id, subtaskId }));

    // Remove animation after short delay
    setTimeout(() => {
      setAnimatingSubtasks(prev => {
        const next = new Set(prev);
        next.delete(subtaskId);
        return next;
      });
    }, 300);
  }, [dispatch, task.id]);

  const handleStatusChange = useCallback((newStatus: Task['status']) => {
    setStatusButtonPressed(newStatus);

    // Immediate UI update via synchronous reducer
    dispatch(updateTaskStatus({ taskId: task.id, status: newStatus }));

    // Persist to storage in background
    dispatch(persistTaskStatus({ taskId: task.id, status: newStatus }));

    // Reset button press animation after delay
    setTimeout(() => setStatusButtonPressed(null), 500);
  }, [dispatch, task.id]);

  const renderSubtask = (subtask: Subtask) => {
    const isAnimating = animatingSubtasks.has(subtask.id);
    const isCompleted = subtask.status === 'completed';

    return (
      <TouchableOpacity
        key={subtask.id}
        style={[
          styles.subtaskItem,
          {
            backgroundColor: isAnimating
              ? (isCompleted ? theme.colors.success + '20' : theme.colors.surface)
              : theme.colors.surface,
            borderLeftColor: isCompleted ? theme.colors.success : theme.colors.border,
            borderLeftWidth: isAnimating ? 6 : 4,
            transform: [{ scale: isAnimating ? 0.98 : 1 }],
          },
        ]}
        onPress={() => handleSubtaskToggle(subtask.id)}
        activeOpacity={0.7}
      >
        <View style={styles.subtaskContent}>
          <View style={styles.subtaskHeader}>
            <View style={[
              styles.checkboxContainer,
              {
                backgroundColor: isCompleted ? theme.colors.success : 'transparent',
                borderColor: isCompleted ? theme.colors.success : theme.colors.textSecondary,
              }
            ]}>
              {isCompleted && (
                <Icon name="check" size={14} color="white" />
              )}
            </View>
            <Text style={[
              styles.subtaskTitle,
              {
                color: isCompleted ? theme.colors.textSecondary : theme.colors.text,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              },
            ]}>
              {subtask.title}
            </Text>
          </View>

          {subtask.description && (
            <Text style={[styles.subtaskDescription, { color: theme.colors.textSecondary }]}>
              {subtask.description}
            </Text>
          )}

          {subtask.estimated_duration && (
            <View style={styles.durationContainer}>
              <Icon name="clock" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
                {subtask.estimated_duration} min
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {task.title}
        </Text>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(task.status) },
          ]}>
            <Text style={styles.statusText}>{task.status.replace('_', ' ')}</Text>
          </View>
        </View>

        {task.description && task.description !== task.title && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {task.description}
          </Text>
        )}

        {totalSubtasks > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
                Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: theme.colors.text }]}>
                {Math.round(progress)}%
              </Text>
            </View>

            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: theme.colors.success,
                },
              ]} />
            </View>

            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {completedSubtasks} of {totalSubtasks} subtasks completed
            </Text>
          </View>
        )}
      </View>

      {totalSubtasks > 0 && (
        <View style={styles.subtasksSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Subtasks
          </Text>

          {task.subtasks?.map(renderSubtask)}
        </View>
      )}

      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Actions
        </Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              borderColor: theme.colors.warning,
              backgroundColor: statusButtonPressed === 'in_progress'
                ? theme.colors.warning
                : (task.status === 'in_progress' ? theme.colors.warning + '20' : 'transparent'),
            },
          ]}
          onPress={() => handleStatusChange('in_progress')}
          activeOpacity={0.7}
          disabled={task.status === 'in_progress'}
        >
          <Icon
            name={task.status === 'in_progress' ? 'check-circle' : 'play'}
            size={16}
            color={statusButtonPressed === 'in_progress' ? 'white' : theme.colors.warning}
          />
          <Text style={[
            styles.actionButtonText,
            { color: statusButtonPressed === 'in_progress' ? 'white' : theme.colors.warning },
          ]}>
            {task.status === 'in_progress' ? 'In Progress' : 'Start Task'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              borderColor: theme.colors.success,
              backgroundColor: statusButtonPressed === 'completed'
                ? theme.colors.success
                : (task.status === 'completed' ? theme.colors.success + '20' : 'transparent'),
            },
          ]}
          onPress={() => handleStatusChange('completed')}
          activeOpacity={0.7}
          disabled={task.status === 'completed'}
        >
          <Icon
            name="check-circle"
            size={16}
            color={statusButtonPressed === 'completed' ? 'white' : theme.colors.success}
          />
          <Text style={[
            styles.actionButtonText,
            { color: statusButtonPressed === 'completed' ? 'white' : theme.colors.success },
          ]}>
            {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
  },
  subtasksSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtaskItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subtaskContent: {
    flex: 1,
  },
  subtaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  subtaskDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
    marginBottom: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 32,
  },
  durationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionsSection: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TaskDetailScreen;
