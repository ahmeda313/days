import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text as RNText, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { Event } from '../models/Event';
import { daysUntil } from '../utils/dateUtils';

interface EventCarouselProps {
  events: Event[];
  selectedEventId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onScrollToIndex?: (index: number) => void;
}

export const EventCarousel: React.FC<EventCarouselProps> = ({
  events,
  selectedEventId,
  onSelect,
  onDelete,
  onScrollToIndex
}) => {

  const { width } = Dimensions.get('window');
  const flatListRef = useRef<FlatList<Event>>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Card dimensions
  const horizontalPadding = 24; // padding on left/right of screen
  const cardWidth = width - horizontalPadding * 2;
  const cardGap = 24; // gap between cards
  const snapInterval = cardWidth + cardGap;

  // Find initial active index - only scroll when events list changes significantly
  useEffect(() => {
    const index = events.findIndex(e => e.id === selectedEventId);
    if (index !== -1) {
      setActiveIndex(index);
      flatListRef.current?.scrollToIndex({ index, animated: false });
    }
  }, [events.length]); // Only when events array length changes (add/delete)

  // Update active index when selected event changes (without scrolling)
  useEffect(() => {
    const index = events.findIndex(e => e.id === selectedEventId);
    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [selectedEventId]);

  const handleMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / snapInterval);
    const clampedIndex = Math.max(0, Math.min(index, events.length - 1));
    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
      onScrollToIndex?.(clampedIndex);
    }
  };

  const renderItem = ({ item, index }: { item: Event; index: number }) => {
    const days = daysUntil(new Date(item.date));
    const absDays = Math.abs(days);
    const daysLabel = absDays === 1 ? 'day' : 'days';
    const direction = days >= 0 ? 'left' : 'ago';

    return (
      <TouchableOpacity
        onPress={() => onSelect(item.id)}
        activeOpacity={1}
        style={[styles.item, { width: cardWidth }]}
      >
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.daysContainer}>
            <Text style={styles.daysNumber}>{absDays}</Text>
            <Text style={styles.daysLabel}>{daysLabel} {direction}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          activeOpacity={0.7}
          style={styles.deleteButton}
        >
          <View style={styles.deleteIconContainer}>
            <RNText style={styles.deleteIcon}>x</RNText>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderDots = () => {
    if (events.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {events.map((_, index) => (
          <View
            key={index}
            style={[styles.dot,index === activeIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      {renderDots()}
      <FlatList
        ref={flatListRef}
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.listContainer}
        initialScrollIndex={activeIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 24, // screen padding
    gap: 16, // gap between cards
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
  },
  name: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  daysNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 48,
    lineHeight: 48,
  },
  daysLabel: {
    color: '#ccc',
    fontWeight: '500',
    fontSize: 16,
  },
  deleteButton: {
    position:'absolute',
    right:0,
    top:0
  },
  deleteIconContainer: {
    padding:0,
    width: 35,
    height: 130,
    borderBottomRightRadius:18,
    borderTopRightRadius:18,
    backgroundColor: '#ff073a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 25,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: '#555',
  },
});