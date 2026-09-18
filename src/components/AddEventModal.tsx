import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Button, Dialog, Portal, TextInput, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveEvent } from '../storage/events';

interface AddEventModalProps {
  visible: boolean;
  onDismiss: () => void;
  onEventAdded?: () => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ visible, onDismiss, onEventAdded }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleAdd = async () => {
    if (!name) {
      return;
    }
    await saveEvent({ name, date: date.toISOString() });
    setName('');
    setDate(new Date());
    onDismiss();
    onEventAdded && onEventAdded();
  };

  const onValueChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onPickerDismiss = () => {
    setShowPicker(false);
  };

  const onNeutralButtonPress = () => {
    setShowPicker(false);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: theme.colors.surface }}>
        <Dialog.Title style={{ color: '#fff' }}>Add New Event</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Event Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={{ marginBottom: 16 }}
            placeholder="Enter event name"
            placeholderTextColor="#ccc"
            textColor="#fff"
            theme={{
              colors: {
                text: '#fff',
                placeholder: '#ccc',
                background: '#222',
                primary: '#fff',
                onSurface: '#fff',
                onSurfaceVariant: '#ccc'
              }
            }}
          />
          <Button
            mode="outlined"
            onPress={() => setShowPicker(true)}
            labelStyle={{ color: '#fff' }}
            style={{ borderColor: '#fff' }}
          >
            Choose Date: {date.toDateString()}
          </Button>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onValueChange={onValueChange}
              onDismiss={onPickerDismiss}
              onNeutralButtonPress={onNeutralButtonPress}
            />
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={onDismiss}
            labelStyle={{ color: '#fff' }}
            style={{ borderColor: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onPress={handleAdd}
            labelStyle={{ color: '#fff' }}
            style={{ borderColor: '#fff' }}
          >
            Add
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};