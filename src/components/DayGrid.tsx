import React, { useState } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text, TouchableOpacity, Pressable } from 'react-native';
import { BoxInfo } from '../utils/dateUtils';
import { colors } from '../../assets/neon-palette';

interface DayGridProps {
  boxes: BoxInfo[];
}

interface MonthData {
  name: string;
  shortName: string;
  boxes: BoxInfo[];
  year: number;
  monthIndex: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const groupBoxesByMonth = (boxes: BoxInfo[]): MonthData[] => {
  const groups = new Map<string, BoxInfo[]>();

  boxes.forEach(box => {
    const year = box.date.getUTCFullYear();
    const month = box.date.getUTCMonth();
    const key = `${year}-${month}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(box);
  });

  const result: MonthData[] = [];
  groups.forEach((monthBoxes, key) => {
    const [yearStr, monthStr] = key.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10);

    monthBoxes.sort((a, b) => a.date.getTime() - b.date.getTime());

    result.push({
      name: MONTH_NAMES[monthIndex],
      shortName: SHORT_MONTH_NAMES[monthIndex],
      boxes: monthBoxes,
      year,
      monthIndex
    });
  });

  result.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthIndex - b.monthIndex;
  });

  return result;
};

const renderMonthGrid = (
  monthData: MonthData,
  boxSize: number,
  dayMargin: number,
  dayGap: number,
  selectedBox: BoxInfo | null,
  onSelectBox: (box: BoxInfo) => void
) => {
  const { boxes, shortName, year, monthIndex } = monthData;

  const dayMap = new Map<number, BoxInfo>();
  boxes.forEach(box => {
    const day = box.date.getUTCDate();
    dayMap.set(day, box);
  });

  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const startDayOfWeek = firstDay.getUTCDay(); // 0 = Sunday
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const rows: (BoxInfo | null)[][] = [];
  let currentRow: (BoxInfo | null)[] = [];

  // Add null placeholders for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    currentRow.push(null);
  }

  // Fill in days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const box = dayMap.get(day) || {
      date: new Date(Date.UTC(year, monthIndex, day)),
      status: 'past' as const
    };
    currentRow.push(box);

    if (currentRow.length === 7) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  // Fill remaining cells in last row with null
  while (currentRow.length > 0 && currentRow.length < 7) {
    currentRow.push(null);
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  const isSelected = (box: BoxInfo): boolean => {
    return selectedBox !== null && 
           box.date.getTime() === selectedBox.date.getTime();
  };

  return (
    <View key={`${year}-${monthIndex}`} style={styles.monthContainer}>
      <Text style={styles.monthLabel}>{shortName}</Text>
      <View style={styles.monthGrid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.monthWeekRow}>
            {row.map((box, colIndex) => {
              if (box === null) {
                // Empty placeholder - render transparent spacer
                return (
                  <View
                    key={`empty-${rowIndex}-${colIndex}`}
                    style={{
                      width: boxSize,
                      height: boxSize,
                      marginHorizontal: dayGap,
                      marginVertical: dayMargin,
                    }}
                  />
                );
              }

              let background = colors.grey;
              if (box.status === 'future') background = colors.neonGreen;
              else if (box.status === 'event') background = colors.neonRed;

              const boxIsSelected = isSelected(box);

              return (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  onPress={() => onSelectBox(box)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayBox,
                      styles.dayBoxSelected,
                      {
                        width: boxSize,
                        height: boxSize,
                        backgroundColor: background,
                        marginHorizontal: dayGap,
                        marginVertical: dayMargin,
                        borderWidth: boxIsSelected ? 2 : 0,
                        borderColor: boxIsSelected ? '#fff' : 'transparent',
                      }
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export const DayGrid: React.FC<DayGridProps> = ({ boxes }) => {
  const { width, height } = Dimensions.get('window');
  const [selectedBox, setSelectedBox] = useState<BoxInfo | null>(null);

  const handleSelectBox = (box: BoxInfo) => {
    setSelectedBox(box);
  };

  const handleClearSelection = () => {
    setSelectedBox(null);
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Layout: 3 columns, as many rows as needed
  const monthsPerRow = 3;

  // Spacing constants
  const containerPadding = 16;
  const monthGap = 8; // Gap between month columns
  const monthVPadding = 8; // Vertical padding between month rows
  const monthHPadding = 6; // Horizontal padding inside month
  const dayMargin = 1; // Vertical margin between day rows
  const dayGap = 2; // Horizontal gap between day columns

  // Available width for 3 months
  const availableWidth = width - containerPadding * 2;
  const monthWidth = (availableWidth - (monthsPerRow - 1) * monthGap) / monthsPerRow;

  // Box size: 7 columns per month with consistent gaps
  const boxSize = Math.floor((monthWidth - 2 * monthHPadding - 7 * dayGap * 2) / 7);
  const finalBoxSize = Math.max(boxSize, 4);

  // Group all months
  const months = groupBoxesByMonth(boxes);

  // Group months into rows of 3
  const monthRows: MonthData[][] = [];
  for (let i = 0; i < months.length; i += monthsPerRow) {
    monthRows.push(months.slice(i, i + monthsPerRow));
  }

  const renderMonthRows = () => {
    return monthRows.map((rowMonths, rowIndex) => (
      <View key={rowIndex} style={[styles.monthRow, { marginBottom: rowIndex < monthRows.length - 1 ? monthVPadding : 0 }]}>
        {rowMonths.map(month =>
          renderMonthGrid(month, finalBoxSize, dayMargin, dayGap, selectedBox, handleSelectBox)
        )}
        {/* Fill empty slots if less than 3 months in last row */}
        {rowMonths.length < monthsPerRow &&
          Array.from({ length: monthsPerRow - rowMonths.length }).map((_, i) => (
            <View key={`empty-${rowIndex}-${i}`} style={[styles.monthContainer, { width: monthWidth }]} />
          ))}
      </View>
    ));
  };

  // Always use ScrollView for vertical scrolling when there are many months
  const content = (
    <Pressable style={styles.gridContainer} onPress={handleClearSelection}>
      {renderMonthRows()}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
      >
        {content}
      </ScrollView>
      {selectedBox && (
        <View style={styles.dateOverlay}>
          <Text style={styles.dateOverlayText}>{formatDate(selectedBox.date)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20, // Reduced from 40 to make room for carousel
    alignItems: 'center',
  },
  gridContainer: {
    width: '100%',
    alignItems: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  monthContainer: {
    flex: 1,
    maxWidth: '33.33%',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  monthLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  monthGrid: {
    width: '100%',
    alignItems: 'center',
  },
  monthWeekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dayBox: {
    borderRadius: 1,
  },
  dayBoxSelected: {
    borderRadius: 2,
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neonGreen,
  },
  dateOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});