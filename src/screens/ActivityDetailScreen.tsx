import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, StreakStatus } from '../models/Activity';
import { loadActivities, addStreakEntry, getCurrentStreak } from '../storage/activities';
import { colors } from '../../assets/neon-palette';

interface ActivityDetailScreenProps {
  activity: Activity;
  onBack: () => void;
  onActivityUpdated: (updatedActivity: Activity) => void;
}

interface DayInfo {
  date: Date;
  status: StreakStatus;
}

interface MonthData {
  key: string;
  label: string;
  days: DayInfo[];
}

export const ActivityDetailScreen: React.FC<ActivityDetailScreenProps> = ({ 
  activity: initialActivity, 
  onBack, 
  onActivityUpdated 
}) => {
  const [activity, setActivity] = useState<Activity>(initialActivity);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([]);
  const [months, setMonths] = useState<MonthData[]>([]);

  useEffect(() => {
    setCurrentStreak(getCurrentStreak(activity));
  }, [activity]);

  const reloadActivity = async () => {
    const activities = await loadActivities();
    const updated = activities.find(a => a.id === activity.id);
    if (updated) {
      setActivity(updated);
      onActivityUpdated(updated);
    }
  };

  const generateCalendarDays = (): DayInfo[] => {
    const days: DayInfo[] = [];
    const today = new Date();
    const startDate = new Date(activity.createdAt);
    
    // Start from 6 months before activity creation or activity creation date
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setDate(1);
    
    // End 6 months in the future
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 6);
    endDate.setDate(0); // Last day of that month

    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const streakEntry = activity.streakEntries.find(entry => entry.date === dateStr);
      
      days.push({
        date: new Date(current),
        status: streakEntry?.status || 'none'
      });
      
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Initialize calendar days when component mounts or activity changes
  useEffect(() => {
    const days = generateCalendarDays();
    setCalendarDays(days);
    setMonths(groupDaysByMonth(days));
  }, [activity]);

  const handleDatePress = (date: Date) => {
    // Prevent selecting future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateNormalized = new Date(date);
    selectedDateNormalized.setHours(0, 0, 0, 0);
    
    if (selectedDateNormalized > today) {
      return; // Don't allow future dates
    }
    
    setSelectedDate(date);
    setModalVisible(true);
  };

  const handleStreakStatus = async (status: StreakStatus) => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    await addStreakEntry(activity.id, dateStr, status);
    
    // Refresh activity data
    await reloadActivity();
    setModalVisible(false);
    setSelectedDate(null);
  };

  const handleAddToday = async () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    await addStreakEntry(activity.id, dateStr, 'completed');
    
    // Refresh activity data
    await reloadActivity();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{activity.name}</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakCount}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.todayButton} onPress={handleAddToday}>
          <Text style={styles.todayButtonText}>Add Today to Streak</Text>
        </TouchableOpacity>

        <ScrollView 
          style={styles.calendarContainer} 
          contentContainerStyle={styles.calendarContent}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        >
          {months.map((monthData) => (
            <View key={monthData.key} style={styles.monthContainer}>
              <Text style={styles.monthLabel}>{monthData.label}</Text>
              <View style={styles.weekDays}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <Text key={index} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {monthData.days.map((dayInfo, index) => {
                  // Check if this is an empty cell (invalid date)
                  const isEmptyCell = dayInfo.date.getDate() === 0;
                  
                  if (isEmptyCell) {
                    return (
                      <View key={index} style={styles.emptyCell} />
                    );
                  }

                  const statusColor = dayInfo.status === 'completed' 
                    ? colors.neonGreen 
                    : '#333';

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCell,
                        { backgroundColor: statusColor }
                      ]}
                      onPress={() => handleDatePress(dayInfo.date)}
                    >
                      <Text style={styles.dayText}>{dayInfo.date.getDate()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {modalVisible && selectedDate && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{formatDate(selectedDate)}</Text>
              <Text style={styles.modalSubtitle}>Mark your streak status:</Text>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.completedButton]}
                onPress={() => handleStreakStatus('completed')}
              >
                <Text style={styles.modalButtonText}>✓ Completed</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.noneButton]}
                onPress={() => handleStreakStatus('none')}
              >
                <Text style={styles.modalButtonText}>Clear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedDate(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

interface MonthData {
  key: string;
  label: string;
  days: DayInfo[];
}

const groupDaysByMonth = (days: DayInfo[]): MonthData[] => {
  const groups = new Map<string, DayInfo[]>();
  
  days.forEach(day => {
    const key = `${day.date.getFullYear()}-${day.date.getMonth()}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(day);
  });

  const result: MonthData[] = [];
  groups.forEach((monthDays, key) => {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month, 1);
    
    // Get the first day of the month to add empty cells for alignment
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    // Add empty cells for days before the first day of the month
    const alignedDays: DayInfo[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      alignedDays.push({
        date: new Date(year, month, 0), // Invalid date for empty cell
        status: 'none'
      });
    }
    
    // Add the actual days
    alignedDays.push(...monthDays);
    
    result.push({
      key,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      days: alignedDays
    });
  });

  return result.sort((a, b) => {
    const [aYear, aMonth] = a.key.split('-').map(Number);
    const [bYear, bMonth] = b.key.split('-').map(Number);
    if (aYear !== bYear) return aYear - bYear;
    return aMonth - bMonth;
  });
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: colors.neonGreen,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  streakBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  streakCount: {
    color: colors.neonGreen,
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakLabel: {
    color: colors.neonGreen,
    fontSize: 10,
    fontWeight: '600',
  },
  todayButton: {
    backgroundColor: colors.neonGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  todayButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarContainer: {
    flex: 1,
  },
  calendarContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  monthContainer: {
    width: 280, // Fixed width for horizontal scrolling
    marginRight: 12,
  },
  monthLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekDayText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
  },
  emptyCell: {
    width: 32,
    height: 32,
    margin: 3,
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    maxWidth: 320,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  completedButton: {
    backgroundColor: colors.neonGreen,
  },
  noneButton: {
    backgroundColor: '#333',
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});