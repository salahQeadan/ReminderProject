import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, TextField, Button, IconButton, Typography, Box, List, ListItem,
  Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel,
  Drawer, List as MUIList, ListItem as MUIListItem, ListItemIcon, ListItemText as MUIListItemText,
  Switch, Checkbox, FormControlLabel, AppBar, Toolbar
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon,
  Mic as MicIcon, AccessibilityNew as AccessibilityNewIcon, TextFields as TextFieldsIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { onMessageListener } from './firebase';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

const Home = () => {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [editReminder, setEditReminder] = useState(null);
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('fontSize')) || 16);
  const [highContrast, setHighContrast] = useState(JSON.parse(localStorage.getItem('highContrast')) || false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [listening, setListening] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(JSON.parse(localStorage.getItem('screenReaderEnabled')) || false);
  const [filterOption, setFilterOption] = useState('today');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('none');
  const [currentView, setCurrentView] = useState('home');
  const [colorBlindModeEnabled, setColorBlindModeEnabled] = useState(JSON.parse(localStorage.getItem('colorBlindModeEnabled')) || false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        console.log('Message received. ', payload);
        alert(`Notification: ${payload.notification.title}`);
      })
      .catch((err) => console.log('failed: ', err));
  }, []);

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    filterReminders();
  }, [filterOption, reminders]);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reminders/${userId}`);
      setReminders(response.data);
    } catch (error) {
      console.error('Failed to fetch reminders', error);
    }
  };

  const filterReminders = () => {
    let filtered = reminders;

    if (filterOption === 'today') {
      const today = new Date();
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate.toDateString() === today.toDateString();
      });
    } else if (filterOption === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate.toDateString() === tomorrow.toDateString();
      });
    } else if (filterOption === 'selectDate' && newDate) {
      const selectedDate = new Date(newDate);
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate.toDateString() === selectedDate.toDateString();
      });
    }

    setFilteredReminders(filtered);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  const addReminder = async (text) => {
    if (text || newReminder.trim()) {
      try {
        const reminderDate = newDate && newTime ? new Date(`${newDate}T${newTime}`) : new Date();
        const reminderText = text || newReminder;
        const newReminderData = {
          userId,
          text: reminderText,
          priority: newPriority,
          date: reminderDate,
          recurring: isRecurring ? recurringFrequency : 'none',
        };
        const response = await axios.post('http://localhost:5000/api/reminders', newReminderData);
        setReminders([...reminders, response.data]);
        setNewReminder('');
        setNewPriority('Medium');
        setNewDate('');
        setNewTime('');
        setIsRecurring(false);
        setRecurringFrequency('none');
        setCurrentView('home');
      } catch (error) {
        console.error('Failed to add reminder', error);
      }
    }
  };

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
      recognition.stop();
    };

    recognition.onend = () => {
      setListening(false);
      recognition.stop();
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/reminders/${id}`);
      setReminders(reminders.filter((reminder) => reminder._id !== id));
    } catch (error) {
      console.error('Failed to delete reminder', error);
    }
  };

  const startEditingReminder = (reminder) => {
    setEditReminder(reminder);
    setCurrentView('addReminder');
  };

  const updateReminder = async () => {
    if (editReminder && editReminder.text.trim()) {
      try {
        const response = await axios.put(`http://localhost:5000/api/reminders/${editReminder._id}`, {
          text: editReminder.text,
          priority: editReminder.priority,
          recurring: isRecurring ? recurringFrequency : 'none',
        });
        setReminders(
          reminders.map((reminder) =>
            reminder._id === editReminder._id ? response.data : reminder
          )
        );
        setEditReminder(null);
        setIsRecurring(false);
        setRecurringFrequency('none');
        setCurrentView('home');
      } catch (error) {
        console.error('Failed to update reminder', error);
      }
    }
  };

  const handleEditInputChange = (e) => {
    setEditReminder({ ...editReminder, text: e.target.value });
  };

  const handleEditPriorityChange = (e) => {
    setEditReminder({ ...editReminder, priority: e.target.value });
  };

  const increaseFontSize = () => {
    setFontSize((prevFontSize) => {
      const newSize = prevFontSize + 2;
      document.documentElement.style.fontSize = `${newSize}px`;
      localStorage.setItem('fontSize', newSize);
      return newSize;
    });
  };

  const decreaseFontSize = () => {
    setFontSize((prevFontSize) => {
      const newSize = Math.max(prevFontSize - 2, 10);
      document.documentElement.style.fontSize = `${newSize}px`;
      localStorage.setItem('fontSize', newSize);
      return newSize;
    });
  };

  const toggleHighContrast = () => {
    setHighContrast((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('highContrast', newMode);
      return newMode;
    });
  };

  const toggleScreenReader = () => {
    setScreenReaderEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem('screenReaderEnabled', newState);
      return newState;
    });
  };

  const toggleColorBlindMode = () => {
    setColorBlindModeEnabled((prev) => {
      const newMode = !prev;
      document.body.style.filter = newMode ? 'grayscale(100%)' : 'none';
      return newMode;
    });
  };

  const readTodaysReminders = () => {
    const today = new Date().toDateString();
    const todaysReminders = reminders.filter(reminder => new Date(reminder.date).toDateString() === today);
    if (todaysReminders.length > 0) {
      todaysReminders.forEach(reminder => speakText(reminder.text));
    } else {
      speakText("You have no reminders for today.");
    }
  };

  const toggleTextToSpeech = () => {
    if (reminders.length > 0) {
      reminders.forEach(reminder => {
        const utterance = new SpeechSynthesisUtterance(reminder.text);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      });
    } else {
      const utterance = new SpeechSynthesisUtterance("You have no reminders.");
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  useEffect(() => {
    if (screenReaderEnabled) {
      speakText('Screen reader mode activated.');
    }
  }, [screenReaderEnabled]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        backgroundColor: highContrast ? '#000' : '#fff',
        color: highContrast ? '#fff' : '#000',
        minHeight: '100vh',
        padding: '20px',
        transition: 'background-color 0.3s, color 0.3s',
        fontSize: `${fontSize}px`,
        position: 'relative'
      }}
    >
      <AppBar position="static" sx={{ marginBottom: '20px', backgroundColor: highContrast ? '#333' : '#3f51b5' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Reminders App
          </Typography>
          <Button color="inherit" onClick={() => setCurrentView('home')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => setCurrentView('addReminder')}>
            Add Reminder
          </Button>
        </Toolbar>
      </AppBar>

      <IconButton
        onClick={toggleDrawer(true)}
        sx={{ position: 'fixed', left: 10, bottom: 10 }}
      >
        <AccessibilityNewIcon sx={{ fontSize: 40, color: '#FF5722' }} />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <MUIList>
            <MUIListItem button onClick={decreaseFontSize}>
              <ListItemIcon><TextFieldsIcon /></ListItemIcon>
              <MUIListItemText primary="Decrease Font Size" />
            </MUIListItem>
            <MUIListItem button onClick={increaseFontSize}>
              <ListItemIcon><TextFieldsIcon /></ListItemIcon>
              <MUIListItemText primary="Increase Font Size" />
            </MUIListItem>
            <MUIListItem button onClick={toggleHighContrast}>
              <ListItemIcon>{highContrast ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
              <MUIListItemText primary={highContrast ? "Normal Contrast" : "High Contrast"} />
            </MUIListItem>
            <MUIListItem button onClick={toggleColorBlindMode}>
              <ListItemIcon><TextFieldsIcon /></ListItemIcon>
              <MUIListItemText primary="Toggle Color Blind Mode" />
              <Switch checked={colorBlindModeEnabled} />
            </MUIListItem>
            <MUIListItem button onClick={toggleTextToSpeech}>
              <ListItemIcon><VolumeUpIcon /></ListItemIcon>
              <MUIListItemText primary="Read All Reminders Aloud" />
            </MUIListItem>
            <MUIListItem button onClick={readTodaysReminders}>
              <ListItemIcon><VolumeUpIcon /></ListItemIcon>
              <MUIListItemText primary="Read Today's Reminders" />
            </MUIListItem>
          </MUIList>
        </Box>
      </Drawer>

      {currentView === 'home' && (
        <Box>
          <Typography component="h1" variant="h5" align="center">
            My Reminders
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: highContrast ? '#fff' : '#000' }}>Filter Reminders</InputLabel>
              <Select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
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
                <MenuItem value="selectDate">Select a Date</MenuItem>
              </Select>
            </FormControl>
            {filterOption === 'selectDate' && (
              <TextField
                label="Filter by Date"
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
                }}
                InputLabelProps={{
                  shrink: true,
                  style: { color: highContrast ? '#fff' : '#000' }
                }}
              />
            )}
          </Box>
          <List sx={{ mt: 4 }}>
            {filteredReminders.map((reminder, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                {/* Display the date above the reminder */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: highContrast ? '#aaa' : '#555' }}>
                  {new Date(reminder.date).toLocaleDateString()}
                </Typography>

                <ListItem
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
                  {/* Display the reminder text and time inline */}
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body1" sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: highContrast ? '#fff' : '#000', marginRight: '10px' }}>
                      {reminder.text}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: highContrast ? '#ccc' : '#888' }}>
                      {new Date(reminder.date).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </ListItem>
              </Box>
            ))}
          </List>

        </Box>
      )}

      {currentView === 'addReminder' && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            }}
          />
          <Button
            variant="contained"
            startIcon={<MicIcon />}
            onClick={startListening}
            sx={{ mt: 2, backgroundColor: highContrast ? '#555' : '#3f51b5', color: highContrast ? '#fff' : '#fff' }}
          >
            {listening ? 'Listening...' : 'Record Voice'}
          </Button>
          <FormControl sx={{ mt: 2, minWidth: 120 }}>
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
              mt: 2,
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
          <TextField
            label="Reminder Time"
            type="time"
            fullWidth
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            sx={{
              mt: 2,
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
          <FormControlLabel
            control={<Checkbox checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />}
            label="Repeat"
            sx={{ mt: 2, color: highContrast ? '#fff' : '#000' }}
          />
          {isRecurring && (
            <FormControl sx={{ mt: 2, minWidth: 120 }}>
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
          <Button variant="contained" sx={{ mt: 2, backgroundColor: highContrast ? '#555' : '#3f51b5', color: highContrast ? '#fff' : '#fff' }} onClick={() => addReminder(newReminder)}>
            {editReminder ? 'Update Reminder' : 'Add Reminder'}
          </Button>
        </Box>
      )}

      <Dialog open={!!editReminder} onClose={() => setEditReminder(null)} PaperProps={{ style: { backgroundColor: highContrast ? '#333' : '#fff', color: highContrast ? '#fff' : '#000' } }}>
        <DialogTitle>Edit Reminder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reminder Text"
            type="text"
            fullWidth
            variant="outlined"
            value={editReminder ? editReminder.text : ''}
            onChange={handleEditInputChange}
            sx={{
              backgroundColor: highContrast ? '#333' : '#fff',
              input: { color: highContrast ? '#fff' : '#000' },
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: highContrast ? '#fff' : '#000',
              },
            }}
          />
          <FormControl sx={{ mt: 2, minWidth: 120 }}>
            <InputLabel sx={{ color: highContrast ? '#fff' : '#000' }}>Priority</InputLabel>
            <Select
              value={editReminder ? editReminder.priority : ''}
              onChange={handleEditPriorityChange}
              sx={{ color: highContrast ? '#fff' : '#000', borderColor: highContrast ? '#fff' : '#000' }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditReminder(null)} sx={{ color: highContrast ? '#fff' : '#000' }}>
            Cancel
          </Button>
          <Button onClick={updateReminder} sx={{ color: highContrast ? '#fff' : '#000' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Home;
