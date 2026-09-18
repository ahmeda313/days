import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, ActivityIndicator, useTheme } from 'react-native-paper';
import { Event } from '../models/Event';
import { loadEvents, deleteEvent } from '../storage/events';
import { generateGrid } from '../utils/dateUtils';
import { EventCarousel } from '../components/EventCarousel';
import { DayGrid } from '../components/DayGrid';
import { AddEventModal } from '../components/AddEventModal';

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const loaded = await loadEvents();
    setEvents(loaded);
    if (loaded.length > 0) {
      setSelectedEventId(loaded[0].id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelect = (id: string) => {
    setSelectedEventId(id);
  };

  const handleCarouselScroll = (index: number) => {
    if (events[index]) {
      setSelectedEventId(events[index].id);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
    // Refresh list after deletion
    await fetchEvents();
    // If the deleted event was selected, select the first available event
    if (selectedEventId === id) {
      const loaded = await loadEvents();
      if (loaded.length > 0) {
        setSelectedEventId(loaded[0].id);
      } else {
        setSelectedEventId(null);
      }
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId) || null;

  // Create grid data – from today to event date
  const gridBoxes = selectedEvent ? generateGrid(new Date(selectedEvent.date)) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        ) : (
          <>
            <DayGrid boxes={gridBoxes} />
            <EventCarousel
              events={events}
              selectedEventId={selectedEventId}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onScrollToIndex={handleCarouselScroll}
            />
          </>
        )}
        <FAB
          style={[styles.fab]}
          icon={() => <Text style={{ color: '#000', fontSize: 38, fontWeight: 'bold', lineHeight: 25, marginInlineStart:2 }}>+</Text>}
          onPress={() => setModalVisible(true)}
        />
        <AddEventModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          onEventAdded={fetchEvents}
        />
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
    flex: 0.8,
    paddingHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    backgroundColor: '#fff',
    margin: 16,
    right: 0,
    bottom: -60,
  },
});