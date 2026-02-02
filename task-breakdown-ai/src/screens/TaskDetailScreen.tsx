import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import { AppDispatch, RootState } from '../store/store';
import { updateTaskStatus, toggleSubtask, persistToggleSubtask, persistTaskStatus } from '../store/slices/tasksSlice';
import { useTheme } from '../contexts/ThemeContext';
import { Task, Subtask } from '../types/Task';
import { OIAColors } from '../theme/OIATheme';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return OIAColors.completed;
      case 'in_progress': return OIAColors.inProgress;
      default: return OIAColors.pending;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const renderSubtask = (subtask: Subtask) => {
    const isAnimating = animatingSubtasks.has(subtask.id);
    const isCompleted = subtask.status === 'completed';

    return (
      <TouchableOpacity
        key={subtask.id}
        style={[
          styles.subtaskItem,
          {
            backgroundColor: theme.colors.surface,
            borderLeftColor: isCompleted ? theme.colors.sage : theme.colors.taupe,
            borderLeftWidth: isAnimating ? 6 : 4,
            transform: [{ scale: isAnimating ? 0.98 : 1 }],
            ...theme.shadows.sm,
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
                backgroundColor: isCompleted ? theme.colors.sage : 'transparent',
                borderColor: isCompleted ? theme.colors.sage : theme.colors.taupe,
              }
            ]}>
              {isCompleted && (
                <Icon name="check" size={14} color={OIAColors.warmWhite} />
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {task.title}
        </Text>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(task.status) + '33' },
          ]}>
            <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
              {getStatusLabel(task.status)}
            </Text>
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
              <Text style={[styles.progressPercentage, { color: theme.colors.sage }]}>
                {Math.round(progress)}%
              </Text>
            </View>

            <View style={[styles.progressBar, { backgroundColor: theme.colors.taupe + '40' }]}>
              <View style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: theme.colors.sage,
                },
              ]} />
            </View>

            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {completedSubtasks} of {totalSubtasks} steps completed
            </Text>
          </View>
        )}
      </View>

      {totalSubtasks > 0 && (
        <View style={styles.subtasksSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Steps
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
              backgroundColor: task.status === 'in_progress'
                ? theme.colors.warning
                : 'transparent',
            },
          ]}
          onPress={() => handleStatusChange('in_progress')}
          activeOpacity={0.7}
        >
          <Icon
            name={task.status === 'in_progress' ? 'pause' : 'play'}
            size={16}
            color={task.status === 'in_progress' ? OIAColors.warmWhite : theme.colors.warning}
          />
          <Text style={[
            styles.actionButtonText,
            { color: task.status === 'in_progress' ? OIAColors.warmWhite : theme.colors.warning },
          ]}>
            {task.status === 'in_progress' ? 'In Progress' : 'Start Task'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              borderColor: theme.colors.sage,
              backgroundColor: task.status === 'completed'
                ? theme.colors.sage
                : 'transparent',
            },
          ]}
          onPress={() => handleStatusChange(task.status === 'completed' ? 'in_progress' : 'completed')}
          activeOpacity={0.7}
        >
          <Icon
            name={task.status === 'completed' ? 'rotate-ccw' : 'check-circle'}
            size={16}
            color={task.status === 'completed' ? OIAColors.warmWhite : theme.colors.sage}
          />
          <Text style={[
            styles.actionButtonText,
            { color: task.status === 'completed' ? OIAColors.warmWhite : theme.colors.sage },
          ]}>
            {task.status === 'completed' ? 'Undo — Back to In Progress' : 'Mark Complete'}
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
    padding: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 32,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
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
    fontWeight: '700',
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
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  subtaskItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
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
    width: 24,
    height: 24,
    borderRadius: 8,
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
    lineHeight: 21,
    marginLeft: 36,
    marginBottom: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 36,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  actionsSection: {
    padding: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;
