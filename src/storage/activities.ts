import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, StreakEntry, StreakStatus } from '../models/Activity';

const ACTIVITIES_KEY = '@activities';

export const loadActivities = async (): Promise<Activity[]> => {
  try {
    const data = await AsyncStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading activities:', error);
    return [];
  }
};

export const saveActivities = async (activities: Activity[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving activities:', error);
  }
};

export const addActivity = async (activity: Activity): Promise<void> => {
  const activities = await loadActivities();
  activities.push(activity);
  await saveActivities(activities);
};

export const updateActivity = async (updatedActivity: Activity): Promise<void> => {
  const activities = await loadActivities();
  const index = activities.findIndex(a => a.id === updatedActivity.id);
  if (index !== -1) {
    activities[index] = updatedActivity;
    await saveActivities(activities);
  }
};

export const deleteActivity = async (id: string): Promise<void> => {
  const activities = await loadActivities();
  const filtered = activities.filter(a => a.id !== id);
  await saveActivities(filtered);
};

export const addStreakEntry = async (
  activityId: string,
  date: string,
  status: StreakStatus
): Promise<void> => {
  const activities = await loadActivities();
  const activity = activities.find(a => a.id === activityId);
  if (activity) {
    // Remove existing entry for this date if it exists
    activity.streakEntries = activity.streakEntries.filter(entry => entry.date !== date);
    // Add new entry
    activity.streakEntries.push({ date, status });
    // Sort entries by date
    activity.streakEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    await saveActivities(activities);
  }
};

export const getCurrentStreak = (activity: Activity): number => {
  if (activity.streakEntries.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter only completed entries and sort by date descending
  const completedEntries = activity.streakEntries
    .filter(entry => entry.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (completedEntries.length === 0) return 0;

  let streak = 0;
  let currentDate = today;

  for (const entry of completedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = new Date(entryDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};