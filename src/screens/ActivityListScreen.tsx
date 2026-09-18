import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { Activity } from '../models/Activity';
import { loadActivities, addActivity, deleteActivity, getCurrentStreak } from '../storage/activities';
import { colors } from '../../assets/neon-palette';

interface ActivityListScreenProps {
  onActivitySelect: (activity: Activity) => void;
}

export const ActivityListScreen: React.FC<ActivityListScreenProps> = ({ onActivitySelect }) => {
  const theme = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const loaded = await loadActivities();
    setActivities(loaded);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleAddActivity = async () => {
    if (!newActivityName.trim()) {
      Alert.alert('Error', 'Please enter an activity name');
      return;
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      name: newActivityName.trim(),
      description: newActivityDescription.trim() || undefined,
      createdAt: new Date().toISOString(),
      streakEntries: [],
    };

    await addActivity(newActivity);
    setNewActivityName('');
    setNewActivityDescription('');
    setModalVisible(false);
    await fetchActivities();
  };

  const handleDeleteActivity = async (id: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteActivity(id);
            await fetchActivities();
          },
        },
      ]
    );
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const currentStreak = getCurrentStreak(item);
    
    return (
      <TouchableOpacity
        style={styles.activityItem}
        onPress={() => onActivitySelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.activityDescription}>{item.description}</Text>
          )}
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>Current Streak:</Text>
            <Text style={[styles.streakCount, { color: colors.neonGreen }]}>
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteActivity(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Activities</Text>
        
        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first activity</Text>
          </View>
        ) : (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Activity</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Activity name"
                placeholderTextColor="#666"
                value={newActivityName}
                onChangeText={setNewActivityName}
                autoFocus
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                placeholderTextColor="#666"
                value={newActivityDescription}
                onChangeText={setNewActivityDescription}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setNewActivityName('');
                    setNewActivityDescription('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleAddActivity}
                >
                  <Text style={styles.addButtonText}>Add Activity</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120, // More space for bottom navigation
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDescription: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLabel: {
    color: '#999',
    fontSize: 12,
    marginRight: 4,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: colors.neonGreen,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});