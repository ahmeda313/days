import { Event } from '../models/Event';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@events';

// Simple ID generator without crypto dependency
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/** Load all saved events from AsyncStorage */
export const loadEvents = async (): Promise<Event[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      const parsed = JSON.parse(jsonValue);
      if (parsed.length > 0) {
        return parsed;
      }
    }

    // Initialize with default event if empty
    const endOfYear = new Date(new Date().getFullYear(), 11, 31); // December 31st of current year
    const defaultEvent: Event = {
      id: generateId(),
      name: 'End of Year',
      date: endOfYear.toISOString()
    };
    await saveEvents([defaultEvent]);
    return [defaultEvent];
  } catch (e) {
    console.error('Failed to load events:', e);
    return [];
  }
};

/** Save all events to AsyncStorage */
const saveEvents = async (events: Event[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events:', e);
  }
};

/** Save a new event (generates a UUID) */
export const saveEvent = async (event: Omit<Event, 'id'>): Promise<void> => {
  try {
    const currentEvents = await loadEvents();
    const newEvent: Event = { ...event, id: generateId() };
    const updatedEvents = [...currentEvents, newEvent];
    await saveEvents(updatedEvents);
  } catch (e) {
    console.error('Failed to save event:', e);
  }
};

/** Delete an event by its id */
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const currentEvents = await loadEvents();
    const updatedEvents = currentEvents.filter(e => e.id !== id);
    await saveEvents(updatedEvents);
  } catch (e) {
    console.error('Failed to delete event:', e);
  }
};