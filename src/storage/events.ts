import { Event } from '../models/Event';
// @ts-ignore - expo-file-system types not in TS config but module exists at runtime
import * as FileSystem from 'expo-file-system';

const STORAGE_FILE = `${FileSystem.documentDirectory}events.json`;

// Simple ID generator without crypto dependency
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/** Load all saved events from file system */
export const loadEvents = async (): Promise<Event[]> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(STORAGE_FILE);
      const parsed = JSON.parse(content);
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

/** Save all events to file system */
const saveEvents = async (events: Event[]): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(events));
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