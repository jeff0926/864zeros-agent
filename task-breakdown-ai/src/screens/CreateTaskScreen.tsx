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
import { Granularity } from '../services/aiService';
import { OIAColors } from '../theme/OIATheme';

interface CreateTaskScreenProps {
  navigation: any;
}

const GRANULARITY_OPTIONS: { key: Granularity; label: string; hint: string }[] = [
  { key: 'big', label: 'Big', hint: '3-4 steps' },
  { key: 'balanced', label: 'Balanced', hint: '6-8 steps' },
  { key: 'small', label: 'Small', hint: '10-15 steps' },
];

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation }) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [granularity, setGranularity] = useState<Granularity>('balanced');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.tasks);
  const { id: userId } = useSelector((state: RootState) => state.user);
  const { theme } = useTheme();

  const handleGeneratePreview = async () => {
    if (!taskDescription.trim()) {
      Alert.alert('Something went wrong', "Let's try that again - enter a task first");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const { aiService } = await import('../services/aiService');
      const subtasks = await aiService.breakdownTask(taskDescription, granularity);
      setPreview(subtasks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskDescription.trim() || !userId) return;

    try {
      await dispatch(createTaskWithBreakdown({
        taskDescription: taskDescription.trim(),
        userId,
        granularity,
      })).unwrap();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Something went wrong', "That didn't work - try again?");
    }
  };

  const renderPreviewItem = (item: any, index: number) => (
    <View key={index} style={[styles.previewItem, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
      <View style={styles.previewItemHeader}>
        <Text style={[styles.previewOrder, { color: theme.colors.sage }]}>
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
          What do you need to do?
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Describe it and let AI break it into steps
        </Text>

        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.taupe,
              },
            ]}
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholder="e.g., Plan my wedding, Build a mobile app, Organize my closet..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Granularity Selector */}
          <View style={styles.granularitySection}>
            <Text style={[styles.granularityLabel, { color: theme.colors.textSecondary }]}>
              Step size
            </Text>
            <View style={[styles.granularityTrack, { backgroundColor: theme.colors.surface, borderColor: theme.colors.taupe }]}>
              {GRANULARITY_OPTIONS.map((option) => {
                const isSelected = granularity === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.granularityOption,
                      isSelected && { backgroundColor: theme.colors.sage },
                    ]}
                    onPress={() => setGranularity(option.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.granularityOptionLabel,
                      { color: isSelected ? OIAColors.warmWhite : theme.colors.text },
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.granularityOptionHint,
                      { color: isSelected ? 'rgba(253,252,250,0.7)' : theme.colors.textSecondary },
                    ]}>
                      {option.hint}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.breakdownButton,
              {
                backgroundColor: theme.colors.sage,
                opacity: (!taskDescription.trim() || isGenerating) ? 0.6 : 1,
                ...theme.shadows.button,
              },
            ]}
            onPress={handleGeneratePreview}
            disabled={!taskDescription.trim() || isGenerating}
            activeOpacity={0.7}
          >
            {isGenerating ? (
              <ActivityIndicator color={OIAColors.warmWhite} size="small" />
            ) : (
              <Icon name="zap" size={16} color={OIAColors.warmWhite} />
            )}
            <Text style={styles.breakdownButtonText}>
              {isGenerating ? 'Breaking it down...' : 'Break it down'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error with retry */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '30' }]}>
            <Icon name="alert-circle" size={16} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error.includes('API Error') ? "That didn't work - try again?" : error}
            </Text>
            <TouchableOpacity onPress={handleGeneratePreview} style={styles.retryButton}>
              <Text style={[styles.retryText, { color: theme.colors.sage }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {preview.length > 0 && (
          <View style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewSectionTitle, { color: theme.colors.text }]}>
                Your steps
              </Text>
              {totalEstimatedTime > 0 && (
                <View style={styles.totalTimeContainer}>
                  <Icon name="clock" size={14} color={theme.colors.sage} />
                  <Text style={[styles.totalTimeText, { color: theme.colors.sage }]}>
                    ~{totalEstimatedTime} min
                  </Text>
                </View>
              )}
            </View>

            {preview.map(renderPreviewItem)}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.colors.taupe }]}
                onPress={() => { setPreview([]); setError(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                  Clear
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  {
                    backgroundColor: theme.colors.sage,
                    opacity: loading ? 0.6 : 1,
                    ...theme.shadows.button,
                  },
                ]}
                onPress={handleCreateTask}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color={OIAColors.warmWhite} size="small" />
                ) : (
                  <Icon name="plus" size={16} color={OIAColors.warmWhite} />
                )}
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {preview.length === 0 && !error && taskDescription.trim() && (
          <View style={styles.hintContainer}>
            <Icon name="info" size={16} color={theme.colors.info} />
            <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
              Tap "Break it down" to see how AI will split your task into steps
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
  inputSection: { marginBottom: 24 },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 80,
    marginBottom: 16,
  },
  granularitySection: { marginBottom: 16 },
  granularityLabel: { fontSize: 13, marginBottom: 8 },
  granularityTrack: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  granularityOption: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, minHeight: 48 },
  granularityOptionLabel: { fontSize: 13, fontWeight: '600' },
  granularityOptionHint: { fontSize: 10, marginTop: 1 },
  breakdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 12,
    gap: 8,
  },
  breakdownButtonText: { color: '#FDFCFA', fontSize: 16, fontWeight: '600', letterSpacing: 0.5, marginLeft: 8 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16, gap: 8 },
  errorText: { fontSize: 14, flex: 1 },
  retryButton: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 48, justifyContent: 'center' },
  retryText: { fontSize: 14, fontWeight: '600' },
  previewSection: { marginBottom: 24 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  previewSectionTitle: { fontSize: 20, fontWeight: '600' },
  totalTimeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  totalTimeText: { fontSize: 14, fontWeight: '600' },
  previewItem: { padding: 16, borderRadius: 16, marginBottom: 8 },
  previewItemHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  previewOrder: { fontSize: 16, fontWeight: '700', width: 24 },
  previewTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  durationText: { fontSize: 12 },
  previewDescription: { fontSize: 14, lineHeight: 21, marginLeft: 24 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  secondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '600' },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: { color: '#FDFCFA', fontSize: 16, fontWeight: '600' },
  hintContainer: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderRadius: 12, gap: 12 },
  hintText: { fontSize: 14, lineHeight: 21, flex: 1 },
});

export default CreateTaskScreen;
