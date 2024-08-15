import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';
import { Mic as MicIcon } from '@mui/icons-material';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

const AddReminders = ({ addReminder, editReminder, updateReminder, highContrast, fontSize }) => {
  const [newReminder, setNewReminder] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [listening, setListening] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('none');

  useEffect(() => {
    if (editReminder) {
      setNewReminder(editReminder.text);
      setNewPriority(editReminder.priority);
      const reminderDate = new Date(editReminder.date);
      setNewDate(reminderDate.toISOString().split('T')[0]);
      setNewTime(reminderDate.toTimeString().split(' ')[0].substring(0, 5));
      setIsRecurring(editReminder.recurring !== 'none');
      setRecurringFrequency(editReminder.recurring);
    }
  }, [editReminder]);

  const startListening = () => {
    if (!listening) {
      setListening(true);
      recognition.start();
    } else {
      console.log('Recognition is already running.');
    }
  };

  useEffect(() => {
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setNewReminder(speechToText);
      setListening(false);
      recognition.stop(); // Ensure recognition is stopped after processing
    };

    recognition.onend = () => {
      setListening(false);
      recognition.stop(); // Ensure recognition is stopped when it ends naturally
    };

    return () => {
      recognition.stop(); // Clean up: stop recognition if the component unmounts
    };
  }, []);

  const handleAddOrUpdateReminder = () => {
    const reminderData = {
      text: newReminder,
      priority: newPriority,
      date: `${newDate}T${newTime}:00`,
      recurring: isRecurring ? recurringFrequency : 'none',
    };

    if (editReminder) {
      updateReminder({ ...editReminder, ...reminderData });
    } else {
      addReminder(reminderData);
    }

    // Reset the form
    setNewReminder('');
    setNewPriority('Medium');
    setNewDate('');
    setNewTime('');
    setIsRecurring(false);
    setRecurringFrequency('none');
  };

  return (
    <Container
      sx={{
        fontSize: `${fontSize}px`,
        color: highContrast ? '#fff' : '#000',
        backgroundColor: highContrast ? '#333' : '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: highContrast ? '0 0 10px #fff' : '0 0 10px #000',
      }}
    >
      <TextField
        label="New Reminder"
        variant="outlined"
        fullWidth
        value={newReminder}
        onChange={(e) => setNewReminder(e.target.value)}
        sx={{
          backgroundColor: highContrast ? '#333' : '#fff',
          input: { color: highContrast ? '#fff' : '#000' },
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: highContrast ? '#fff' : '#000',
          },
          marginBottom: '16px'
        }}
      />
      <Button
        variant="contained"
        startIcon={<MicIcon />}
        onClick={startListening}
        sx={{ marginBottom: '16px', backgroundColor: highContrast ? '#555' : '#3f51b5', color: highContrast ? '#fff' : '#fff' }}
      >
        {listening ? 'Listening...' : 'Record Voice'}
      </Button>
      <FormControl sx={{ minWidth: 120, marginBottom: '16px' }}>
        <InputLabel sx={{ color: highContrast ? '#fff' : '#000' }}>Priority</InputLabel>
        <Select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          sx={{
            color: highContrast ? '#fff' : '#000',
            backgroundColor: highContrast ? '#333' : '#fff',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: highContrast ? '#fff' : '#000',
            },
          }}
        >
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="High">High</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Reminder Date"
        type="date"
        fullWidth
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        sx={{
          backgroundColor: highContrast ? '#333' : '#fff',
          input: { color: highContrast ? '#fff' : '#000' },
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: highContrast ? '#fff' : '#000',
          },
          marginBottom: '16px'
        }}
        InputLabelProps={{
          shrink: true,
          style: { color: highContrast ? '#fff' : '#000' }
        }}
      />
      <TextField
        label="Reminder Time"
        type="time"
        fullWidth
        value={newTime}
        onChange={(e) => setNewTime(e.target.value)}
        sx={{
          backgroundColor: highContrast ? '#333' : '#fff',
          input: { color: highContrast ? '#fff' : '#000' },
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: highContrast ? '#fff' : '#000',
          },
          marginBottom: '16px'
        }}
        InputLabelProps={{
          shrink: true,
          style: { color: highContrast ? '#fff' : '#000' }
        }}
      />
      <FormControlLabel
        control={<Checkbox checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />}
        label="Repeat"
        sx={{ marginBottom: '16px', color: highContrast ? '#fff' : '#000' }}
      />
      {isRecurring && (
        <FormControl sx={{ minWidth: 120, marginBottom: '16px' }}>
          <InputLabel sx={{ color: highContrast ? '#fff' : '#000' }}>Repeat Frequency</InputLabel>
          <Select
            value={recurringFrequency}
            onChange={(e) => setRecurringFrequency(e.target.value)}
            sx={{
              color: highContrast ? '#fff' : '#000',
              backgroundColor: highContrast ? '#333' : '#fff',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: highContrast ? '#fff' : '#000',
              },
            }}
          >
            <MenuItem value="daily">Every Day</MenuItem>
            <MenuItem value="weekly">Every Week</MenuItem>
          </Select>
        </FormControl>
      )}
      <Button
        variant="contained"
        onClick={handleAddOrUpdateReminder}
        sx={{ backgroundColor: highContrast ? '#555' : '#3f51b5', color: highContrast ? '#fff' : '#fff' }}
      >
        {editReminder ? 'Update Reminder' : 'Add Reminder'}
      </Button>
    </Container>
  );
}

export default AddReminders;
