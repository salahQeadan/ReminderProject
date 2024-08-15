import React, { useState } from 'react';
import {
  Box, List, ListItem, ListItemText, IconButton, Button, FormControl, InputLabel, Select, MenuItem, TextField, Typography
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon, VolumeUp as VolumeUpIcon
} from '@mui/icons-material';

const MyReminders = ({ reminders, speakText, deleteReminder, startEditingReminder, filter, setFilter, highContrast, fontSize }) => {
  const [selectedDate, setSelectedDate] = useState(''); // State for the selected custom date

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    if (event.target.value !== 'custom') {
      setSelectedDate(''); // Reset custom date if other filters are selected
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setFilter('custom'); // Set filter to custom when a date is selected
  };

  const filteredReminders = reminders.filter((reminder) => {
    const reminderDate = new Date(reminder.date).toDateString();
    const selectedDateString = new Date(selectedDate).toDateString();

    if (filter === 'today') {
      const today = new Date().toDateString();
      return reminderDate === today;
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return reminderDate === tomorrow.toDateString();
    } else if (filter === 'custom' && selectedDate) {
      return reminderDate === selectedDateString;
    }
    return true;
  });

  return (
    <Box sx={{ fontSize: `${fontSize}px`, color: highContrast ? '#fff' : '#000' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <FormControl>
          <InputLabel id="filter-label" sx={{ color: highContrast ? '#fff' : '#000' }}>Filter</InputLabel>
          <Select
            labelId="filter-label"
            id="filter"
            value={filter}
            onChange={handleFilterChange}
            sx={{
              color: highContrast ? '#fff' : '#000',
              backgroundColor: highContrast ? '#333' : '#fff',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: highContrast ? '#fff' : '#000',
              },
            }}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="tomorrow">Tomorrow</MenuItem>
            <MenuItem value="custom">Select Date</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filter === 'custom' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <TextField
            label="Select Date"
            type="date"
            fullWidth
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              backgroundColor: highContrast ? '#333' : '#fff',
              input: { color: highContrast ? '#fff' : '#000' },
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: highContrast ? '#fff' : '#000',
              },
            }}
            InputLabelProps={{
              shrink: true,
              style: { color: highContrast ? '#fff' : '#000' }
            }}
          />
        </Box>
      )}

      <List sx={{ backgroundColor: highContrast ? '#000' : '#fff', padding: '20px', borderRadius: '8px', boxShadow: highContrast ? '0 0 10px #fff' : '0 0 10px #000' }}>
        {filteredReminders.map((reminder, index) => {
          const reminderDate = new Date(reminder.date);
          const formattedDate = reminderDate.toLocaleDateString();
          const formattedTime = reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <ListItem
              key={index}
              secondaryAction={
                <>
                  <Button
                    variant="contained"
                    sx={{ marginRight: 1, backgroundColor: highContrast ? '#555' : '#3f51b5', color: highContrast ? '#fff' : '#fff' }}
                    onClick={() => speakText(reminder.text)}
                  >
                    Listen
                  </Button>
                  <IconButton edge="end" aria-label="edit" onClick={() => startEditingReminder(reminder)} sx={{ color: highContrast ? '#fff' : '#000' }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => deleteReminder(reminder._id)} sx={{ color: highContrast ? '#fff' : '#000' }}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={
                  <Typography variant="body1" component="div" sx={{ fontSize: `${fontSize + 2}px`, fontWeight: 'bold', color: highContrast ? '#fff' : '#000' }}>
                    {formattedDate}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" component="div" sx={{ fontSize: `${fontSize}px`, color: highContrast ? '#fff' : '#000' }}>
                    <span style={{ fontWeight: 'bold' }}>{reminder.text}</span> - {formattedTime}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

export default MyReminders;
