import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
//import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Container, TextField,Button, IconButton, Typography, Box, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';

const Home = () => {
    const [reminders, setReminders] = useState([]);
    const [newReminder, setNewReminder] = useState('');
    const [newPriority, setNewPriority] = useState('Medium'); // Default priority
    const [editReminder, setEditReminder] = useState(null);
    const [fontSize, setFontSize] = useState(16); // Default font size
    const [highContrast, setHighContrast] = useState(false); // High contrast mode state

    const userId = localStorage.getItem('userId');  // Retrieve the user ID from localStorage

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/reminders/${userId}`);
            setReminders(response.data);
        } catch (error) {
            console.error('Failed to fetch reminders', error);
        }
    };

    const addReminder = async () => {
        if (newReminder.trim()) {
            try {
                const response = await axios.post('http://localhost:5000/api/reminders', {
                    userId,
                    text: newReminder,
                    priority: newPriority
                });
                setReminders([...reminders, response.data]);
                setNewReminder('');
                setNewPriority('Medium'); // Reset priority to default
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
                    priority: editReminder.priority
                });
                setReminders(
                    reminders.map((reminder) =>
                        reminder._id === editReminder._id ? response.data : reminder
                    )
                );
                setEditReminder(null);
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
        setFontSize((prevFontSize) => prevFontSize + 2);
    };

    const decreaseFontSize = () => {
        setFontSize((prevFontSize) => Math.max(prevFontSize - 2, 10)); // Minimum font size is 10px
    };

    const toggleHighContrast = () => {
        setHighContrast((prevMode) => !prevMode);
    };

    return (
        <Container 
            maxWidth="sm" 
            sx={{ 
                backgroundColor: highContrast ? '#000' : '#fff', 
                color: highContrast ? '#fff' : '#000',
                minHeight: '100vh',
                padding: '20px',
                transition: 'background-color 0.3s, color 0.3s'
            }}
        >
            <Box sx={{ mt: 8 }}>
                <Typography component="h1" variant="h5" align="center">
                    My Reminders
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <IconButton 
                        onClick={toggleHighContrast} 
                        sx={{ 
                            color: highContrast ? '#fff' : '#000' 
                        }}
                    >
                        {highContrast ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </Box>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button variant="outlined" onClick={decreaseFontSize} sx={{ color: highContrast ? '#fff' : '#000', borderColor: highContrast ? '#fff' : '#000' }}>
                        Decrease Font Size
                    </Button>
                    <Button variant="outlined" onClick={increaseFontSize} sx={{ color: highContrast ? '#fff' : '#000', borderColor: highContrast ? '#fff' : '#000' }}>
                        Increase Font Size
                    </Button>
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
                            input: { color: highContrast ? '#fff' : '#000' }
                        }}
                    />
                    <FormControl sx={{ mt: 2, minWidth: 120 }}>
                        <InputLabel sx={{ color: highContrast ? '#fff' : '#000' }}>Priority</InputLabel>
                        <Select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value)}
                            sx={{ color: highContrast ? '#fff' : '#000', borderColor: highContrast ? '#fff' : '#000' }}
                        >
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={addReminder}>
                        Add Reminder
                    </Button>
                </Box>
                <List sx={{ mt: 4 }}>
                    {reminders.map((reminder, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <>
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
                                primaryTypographyProps={{ style: { fontSize: `${fontSize}px`, color: highContrast ? '#fff' : '#000' } }} 
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Edit Reminder Dialog */}
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
                            input: { color: highContrast ? '#fff' : '#000' }
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
                    <Button onClick={() => setEditReminder(null)} color="primary" sx={{ color: highContrast ? '#fff' : '#000' }}>
                        Cancel
                    </Button>
                    <Button onClick={updateReminder} color="primary" sx={{ color: highContrast ? '#fff' : '#000' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Home;
