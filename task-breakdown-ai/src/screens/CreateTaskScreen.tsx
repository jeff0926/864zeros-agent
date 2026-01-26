import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import { AppDispatch, RootState } from '../store/store';
import { createTaskWithBreakdown } from '../store/slices/tasksSlice';
import { useTheme } from '../contexts/ThemeContext';

interface CreateTaskScreenProps {
  navigation: any;
}

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation }) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.tasks);
  const { id: userId } = useSelector((state: RootState) => state.user);
  const { theme } = useTheme();

  const handleGeneratePreview = async () => {
    if (!taskDescription.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    setIsGenerating(true);
    try {
      // Import AI service dynamically to get preview
      const { aiService } = await import('../services/aiService');
      const subtasks = await aiService.breakdownTask(taskDescription);
      setPreview(subtasks);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate task breakdown. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskDescription.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      await dispatch(createTaskWithBreakdown({
        taskDescription: taskDescription.trim(),
        userId,
      })).unwrap();

      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const renderPreviewItem = (item: any, index: number) => (
    <View key={index} style={[styles.previewItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.previewItemHeader}>
        <Text style={[styles.previewOrder, { color: theme.colors.primary }]}>
          {item.order + 1}.
        </Text>
        <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <View style={styles.durationBadge}>
          <Icon name="clock" size={12} color={theme.colors.textSecondary} />
          <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
            {item.estimated_duration}m
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={[styles.previewDescription, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
      )}
    </View>
  );

  const totalEstimatedTime = preview.reduce((sum, item) => sum + (item.estimated_duration || 0), 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Create New Task
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Describe your task and let AI break it down into actionable steps
        </Text>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Task Description
          </Text>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholder="e.g., Plan my wedding, Build a mobile app, Organize my closet..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.previewButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: (!taskDescription.trim() || isGenerating) ? 0.6 : 1,
              },
            ]}
            onPress={handleGeneratePreview}
            disabled={!taskDescription.trim() || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Icon name="zap" size={16} color="white" />
            )}
            <Text style={styles.previewButtonText}>
              {isGenerating ? 'Generating...' : 'Generate Breakdown'}
            </Text>
          </TouchableOpacity>
        </View>

        {preview.length > 0 && (
          <View style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewSectionTitle, { color: theme.colors.text }]}>
                AI Generated Breakdown
              </Text>

              {totalEstimatedTime > 0 && (
                <View style={styles.totalTimeContainer}>
                  <Icon name="clock" size={14} color={theme.colors.primary} />
                  <Text style={[styles.totalTimeText, { color: theme.colors.primary }]}>
                    ~{totalEstimatedTime} min total
                  </Text>
                </View>
              )}
            </View>

            {preview.map(renderPreviewItem)}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                onPress={() => setPreview([])}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                  Clear Preview
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  {
                    backgroundColor: theme.colors.success,
                    opacity: loading ? 0.6 : 1,
                  },
                ]}
                onPress={handleCreateTask}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Icon name="plus" size={16} color="white" />
                )}
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {preview.length === 0 && taskDescription.trim() && (
          <View style={styles.hintContainer}>
            <Icon name="info" size={16} color={theme.colors.primary} />
            <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
              Click "Generate Breakdown" to see how AI will break down your task into steps
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 80,
    marginBottom: 16,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  previewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  previewSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalTimeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  previewItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  previewOrder: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  durationText: {
    fontSize: 12,
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  hintText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default CreateTaskScreen;
