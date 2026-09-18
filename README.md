# Event Countdown App

A cross-platform mobile app (iOS + Android) that displays a list of user-defined events and the number of days remaining until each event. The app features a neon-styled UI with a horizontal carousel for events and a visual grid timeline showing the countdown.

## Features

- **Event Management**: Add, view, and delete custom events
- **Visual Timeline**: Neon-styled grid showing days from today to event date
- **Horizontal Carousel**: Swipeable event cards with large day count display
- **Persistent Storage**: Events are saved locally using AsyncStorage
- **Neon Theme**: Dark background with neon green/red accents
- **Responsive Design**: Optimized for both iOS and Android

## Tech Stack

- **Framework**: Expo (managed workflow) with React Native
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Storage**: AsyncStorage for event persistence
- **Date Picker**: @react-native-community/datetimepicker
- **Safe Areas**: react-native-safe-area-context

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (on macOS) or use Expo Go app
- For Android: Android Studio or use Expo Go app

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd event-countdown-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
- **iOS**: Press `i` in the terminal or run `npx expo start --ios`
- **Android**: Press `a` in the terminal or run `npx expo start --android`
- **Web**: Press `w` in the terminal or run `npx expo start --web`
- **Expo Go**: Scan the QR code with the Expo Go app

## Project Structure

```
event-countdown-app/
├── src/
│   ├── App.tsx                          # Main app entry point
│   ├── models/
│   │   └── Event.ts                     # TypeScript interface for Event
│   ├── storage/
│   │   └── events.ts                    # AsyncStorage CRUD operations
│   ├── utils/
│   │   └── dateUtils.ts                 # Date calculation utilities
│   ├── components/
│   │   ├── EventCarousel.tsx            # Horizontal event carousel
│   │   ├── DayGrid.tsx                  # Visual timeline grid
│   │   └── AddEventModal.tsx            # Modal for adding events
│   └── screens/
│       └── HomeScreen.tsx               # Main screen component
├── assets/
│   └── neon-palette.ts                 # Color constants
├── package.json                         # Dependencies and scripts
└── app.json                            # Expo configuration
```

## Internals

### Core Components

#### 1. **App.tsx**
- Entry point of the application
- Sets up React Native Paper theme with neon colors
- Wraps the app in SafeAreaProvider for proper safe area handling
- Renders the main HomeScreen component

#### 2. **HomeScreen.tsx**
- Main screen that orchestrates all components
- Manages event state and loading states
- Handles event selection and deletion
- Coordinates between carousel, grid, and modal components
- Manages the FAB (Floating Action Button) for adding events

#### 3. **EventCarousel.tsx**
- Horizontal scrolling list of event cards
- Each card displays event name and days remaining
- Features pagination dots for navigation
- Implements snap-to-scroll behavior for smooth navigation
- Includes delete button on each card
- Highlights currently selected event

#### 4. **DayGrid.tsx**
- Visual representation of the timeline
- Shows boxes from today to the event date
- Green boxes for days leading up to event
- Red box for the event day itself
- Responsive grid that fits within screen bounds
- Calculates box sizes dynamically based on screen dimensions

#### 5. **AddEventModal.tsx**
- Modal dialog for creating new events
- Contains text input for event name
- Includes date picker for selecting event date
- Uses the new DateTimePicker API (non-deprecated)
- Validates input before saving

#### 6. **Storage (events.ts)**
- Uses AsyncStorage for persistent data storage
- Implements CRUD operations:
  - `loadEvents()`: Loads all events from storage
  - `saveEvent()`: Adds a new event
  - `deleteEvent()`: Removes an event by ID
- Auto-creates a default "End of Year" event on first launch
- Generates unique IDs using timestamp + random string

#### 7. **Date Utilities (dateUtils.ts)**
- `daysUntil()`: Calculates days between today and event date
- `generateGrid()`: Creates array of box data for timeline visualization
- Handles date normalization for accurate calculations
- Returns appropriate status for each day (future/event)

### Data Flow

1. **App Initialization**: 
   - HomeScreen loads events from AsyncStorage
   - Default event created if storage is empty
   - First event is automatically selected

2. **Adding Events**:
   - User taps FAB button → opens AddEventModal
   - User enters name and selects date
   - Modal calls `saveEvent()` → updates AsyncStorage
   - HomeScreen refreshes event list
   - Carousel updates to show new event

3. **Deleting Events**:
   - User taps delete button on event card
   - `deleteEvent()` removes from AsyncStorage
   - HomeScreen refreshes and selects next available event
   - Carousel updates to reflect changes

4. **Navigation**:
   - User swipes carousel → `onMomentumScrollEnd` detects new index
   - Updates `selectedEventId` in HomeScreen
   - DayGrid recalculates and re-renders for new event
   - Active dot indicator updates

### State Management

- **Events State**: Array of Event objects managed in HomeScreen
- **Selected Event**: Single event ID tracked for grid display
- **Loading State**: Boolean to show loading indicator
- **Modal State**: Boolean to control modal visibility
- **Active Index**: Carousel state for scroll position

### Styling Approach

- **Neon Theme**: Dark background (#000) with neon green (#39ff14) and red (#ff073a) accents
- **Responsive Design**: Uses Dimensions API for dynamic sizing
- **Paper Theme**: Custom React Native Paper theme for consistent styling
- **Color Palette**: Centralized in `neon-palette.ts` for easy theming

### Error Handling

- AsyncStorage operations wrapped in try-catch blocks
- Graceful fallbacks for storage failures
- Console logging for debugging
- UI remains functional even if storage fails

## Development Notes

### Key Implementation Decisions

1. **AsyncStorage over File System**: Chosen for simplicity and reliability in Expo managed workflow
2. **In-Memory ID Generation**: Custom ID generator avoids crypto dependency issues
3. **Grid Optimization**: Limits boxes to screen size to prevent unnecessary rendering
4. **Carousel Snap Behavior**: Uses snap-to-interval for smooth, predictable scrolling
5. **Non-Deprecating APIs**: Uses modern DateTimePicker API and AsyncStorage to avoid warnings

### Known Limitations

- Events persist only on the device (no cloud sync)
- Limited to 365-day timeline visualization
- No event editing capability (delete and recreate required)
- No recurring events support

## Credits

This project was developed using:
- **Devin AI** - AI-powered development assistant
- **Claude** - AI assistant from Anthropic  
- **Nemotron-3-Ultra** - Advanced AI model for code generation and problem-solving

The entire codebase, architecture decisions, and implementation were created through AI-assisted development, demonstrating the capabilities of modern AI tools in mobile app development.

## License

This project is for educational and demonstration purposes.