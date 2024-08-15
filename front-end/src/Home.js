import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, IconButton, Drawer, Box, List as MUIList, ListItem as MUIListItem, ListItemIcon, ListItemText as MUIListItemText, Switch, Button, Typography, Toolbar, AppBar } from '@mui/material';
import { AccessibilityNew as AccessibilityNewIcon, TextFields as TextFieldsIcon, VolumeUp as VolumeUpIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';
import AddReminders from './AddReminders';
import MyReminders from './MyReminders';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

const Home = () => {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('fontSize')) || 16); // Default font size
  const [highContrast, setHighContrast] = useState(JSON.parse(localStorage.getItem('highContrast')) || false); // High contrast mode state
  const [drawerOpen, setDrawerOpen] = useState(false); // State for Drawer
  const [filter, setFilter] = useState('today'); // Default filter
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(JSON.parse(localStorage.getItem('screenReaderEnabled')) || false); // Screen reader state
  const [editReminder, setEditReminder] = useState(null); // State for editing a reminder
  const [currentView, setCurrentView] = useState('myReminders'); // State to control which component is displayed
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(false);
  const [colorBlindModeEnabled, setColorBlindModeEnabled] = useState(false);

  const userId = localStorage.getItem('userId');  // Retrieve the user ID from localStorage

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    filterReminders();
  }, [filter, reminders]);


  const toggleTextToSpeech = () => {
    setTextToSpeechEnabled((prev) => !prev);
    if (!textToSpeechEnabled) {
      const reminderTexts = reminders.map(reminder => `${reminder.text}, scheduled for ${new Date(reminder.date).toLocaleString()}`);
      const utterance = new SpeechSynthesisUtterance(reminderTexts.join('. '));
      speechSynthesis.speak(utterance);
    } else {
      speechSynthesis.cancel(); // Stops the speech if it's already running
    }
  };


  const fetchReminders = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reminders/${userId}`);
      setReminders(response.data);
    } catch (error) {
      console.error('Failed to fetch reminders', error);
    }
  };

  const filterReminders = () => {
    const now = new Date();
    let filtered = [];

    if (filter === 'today') {
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate.toDateString() === now.toDateString();
      });
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate.toDateString() === tomorrow.toDateString();
      });
    } else {
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate > now;
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

  const addReminder = async (text, priority, date, time, recurring) => {
    try {
      const reminderDate = date && time ? new Date(`${date}T${time}`) : new Date();
      const newReminderData = {
        userId,
        text,
        priority,
        date: reminderDate,
        recurring: recurring || 'none',
      };
      const response = await axios.post('http://localhost:5000/api/reminders', newReminderData);
      setReminders([...reminders, response.data]);
      setCurrentView('myReminders');
    } catch (error) {
      console.error('Failed to add reminder', error);
    }
  };

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
    setCurrentView('addReminder'); // Switch to the add/edit reminder view when editing
  };

  const toggleColorBlindMode = () => {
    setColorBlindModeEnabled((prev) => {
      const newMode = !prev;
      document.body.style.filter = newMode ? 'grayscale(100%)' : 'none';
      return newMode;
    });
  };


  const updateReminder = async (updatedReminder) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/reminders/${updatedReminder._id}`, updatedReminder);
      setReminders(reminders.map((reminder) => (reminder._id === updatedReminder._id ? response.data : reminder)));
      setEditReminder(null);
      setCurrentView('myReminders'); // Switch back to the reminders list view after updating
    } catch (error) {
      console.error('Failed to update reminder', error);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
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

  const increaseFontSize = () => {
    setFontSize((prevFontSize) => {
      const newSize = prevFontSize + 2;
      localStorage.setItem('fontSize', newSize);
      return newSize;
    });
  };
  const readTodaysReminders = () => {
    const today = new Date().toDateString();
    const todaysReminders = reminders
      .filter(reminder => new Date(reminder.date).toDateString() === today)
      .map(reminder => `${reminder.text}, scheduled for ${new Date(reminder.date).toLocaleTimeString()}`);

    if (todaysReminders.length > 0) {
      const utterance = new SpeechSynthesisUtterance(todaysReminders.join('. '));
      speechSynthesis.speak(utterance);
    } else {
      const utterance = new SpeechSynthesisUtterance("There are no reminders scheduled for today.");
      speechSynthesis.speak(utterance);
    }
  };

  const decreaseFontSize = () => {
    setFontSize((prevFontSize) => {
      const newSize = Math.max(prevFontSize - 2, 10);
      localStorage.setItem('fontSize', newSize);
      return newSize;
    });
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <MUIList>
        {/*
                <MUIListItem button onClick={toggleScreenReader}>
          <ListItemIcon><VolumeUpIcon /></ListItemIcon>
          <MUIListItemText primary="Toggle Screen Reader" />
          <Switch checked={screenReaderEnabled} />
        </MUIListItem>*/}

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
        <MUIListItem button onClick={toggleTextToSpeech}>
          <ListItemIcon><VolumeUpIcon /></ListItemIcon>
          <MUIListItemText primary="Read All Reminders Aloud" />
        </MUIListItem>
        <MUIListItem button onClick={readTodaysReminders}>
          <ListItemIcon><VolumeUpIcon /></ListItemIcon>
          <MUIListItemText primary="Read Today's Reminders" />
        </MUIListItem>
        <MUIListItem button onClick={toggleColorBlindMode}>
          <ListItemIcon><TextFieldsIcon /></ListItemIcon>
          <MUIListItemText primary="Toggle Color Blind Mode" />
          <Switch checked={colorBlindModeEnabled} />
        </MUIListItem>
      </MUIList>

    </Box>
  );

  return (
    <Container
      maxWidth="md"
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
          <Button color="inherit" onClick={() => setCurrentView('myReminders')}>
            My Reminders
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
        {list()}
      </Drawer>

      {currentView === 'myReminders' && (
        <MyReminders
          reminders={filteredReminders}
          speakText={speakText}
          deleteReminder={deleteReminder}
          startEditingReminder={startEditingReminder}
          filter={filter}
          setFilter={setFilter}
          highContrast={highContrast}
          fontSize={fontSize}
        />
      )}

      {currentView === 'addReminder' && (
        <AddReminders
          addReminder={addReminder}
          highContrast={highContrast}
          fontSize={fontSize}
          editReminder={editReminder}
          updateReminder={updateReminder}
        />
      )}
    </Container>
  );
}

export default Home;


/*import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, TextField, Button, IconButton, Typography, Box, List, ListItem, ListItemText,
  Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel,
  Drawer, List as MUIList, ListItem as MUIListItem, ListItemIcon, ListItemText as MUIListItemText,
  Switch, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon,
  Mic as MicIcon, AccessibilityNew as AccessibilityNewIcon, TextFields as TextFieldsIcon,
  VolumeUp as VolumeUpIcon, FilterList as FilterListIcon
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
  const [newPriority, setNewPriority] = useState('Medium'); // Default priority
  const [editReminder, setEditReminder] = useState(null);
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('fontSize')) || 16); // Default font size
  const [highContrast, setHighContrast] = useState(JSON.parse(localStorage.getItem('highContrast')) || false); // High contrast mode state
  const [newDate, setNewDate] = useState(''); // New state for the date
  const [newTime, setNewTime] = useState(''); // New state for the time
  const [listening, setListening] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); // State for Drawer
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(JSON.parse(localStorage.getItem('screenReaderEnabled')) || false); // Screen reader state
  const [filter, setFilter] = useState('today'); // Default filter
  const [isRecurring, setIsRecurring] = useState(false); // State for recurring reminders
  const [recurringFrequency, setRecurringFrequency] = useState('none'); // Frequency for recurrence

  const userId = localStorage.getItem('userId');  // Retrieve the user ID from localStorage
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
  }, [filter, reminders]);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reminders/${userId}`);
      setReminders(response.data);
    } catch (error) {
      console.error('Failed to fetch reminders', error);
    }
  };

  const filterReminders = () => {
    const now = new Date();
    let filtered = [];

    if (filter === 'today') {
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate.toDateString() === now.toDateString();
      });
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate.toDateString() === tomorrow.toDateString();
      });
    } else {
      filtered = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate > now;
      });
    }

    setFilteredReminders(filtered);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // You can customize the language if needed
    utterance.rate = 1; // Speed of speech, adjust as needed
    utterance.pitch = 1; // Pitch of the voice, adjust as needed
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
      } catch (error) {
        console.error('Failed to add reminder', error);
      }
    }
  };

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
      localStorage.setItem('fontSize', newSize);
      return newSize;
    });
  };

  const decreaseFontSize = () => {
    setFontSize((prevFontSize) => {
      const newSize = Math.max(prevFontSize - 2, 10);
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

  const startListening = () => {
    if (!listening) {
      setListening(true);
      recognition.start();
    } else {
      console.log('Recognition is already running.');
    }
  };

  const toggleScreenReader = () => {
    setScreenReaderEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem('screenReaderEnabled', newState);
      return newState;
    });
  };

  // Ensure recognition is stopped when listening ends or when the component unmounts
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

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <MUIList>
        <MUIListItem button onClick={toggleScreenReader}>
          <ListItemIcon><VolumeUpIcon /></ListItemIcon>
          <MUIListItemText primary="Toggle Screen Reader" />
          <Switch checked={screenReaderEnabled} />
        </MUIListItem>
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
      </MUIList>
    </Box>
  );

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
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{ position: 'fixed', left: 10, bottom: 10 }}
      >
        <AccessibilityNewIcon sx={{ fontSize: 40, color: '#FF5722' }} />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>

      <Box sx={{ mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          My Reminders
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <FormControl>
            <InputLabel id="filter-label">Filter</InputLabel>
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
              <MenuItem value="farther">Farther</MenuItem>
            </Select>
          </FormControl>
        </Box>
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
            Add Reminder
          </Button>
        </Box>
        <List sx={{ mt: 4 }}>
          {filteredReminders.map((reminder, index) => (
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
                primary={`${reminder.text} (${reminder.priority})`}
                secondary={new Date(reminder.date).toLocaleString()}
                primaryTypographyProps={{ style: { fontSize: `${fontSize}px`, color: highContrast ? '#fff' : '#000' } }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

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
*/