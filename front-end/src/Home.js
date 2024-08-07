import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const Home = () => {
    const [reminders, setReminders] = useState([]);
    const [newReminder, setNewReminder] = useState('');

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
                    text: newReminder
                });
                setReminders([...reminders, response.data]);
                setNewReminder('');
            } catch (error) {
                console.error('Failed to add reminder', error);
            }
        }
    };

    const deleteReminder = (index) => {
        setReminders(reminders.filter((_, i) => i !== index));
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Typography component="h1" variant="h5" align="center">
                    My Reminders
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TextField
                        label="New Reminder"
                        variant="outlined"
                        fullWidth
                        value={newReminder}
                        onChange={(e) => setNewReminder(e.target.value)}
                    />
                    <Button variant="contained" sx={{ mt: 2 }} onClick={addReminder}>
                        Add Reminder
                    </Button>
                </Box>
                <List sx={{ mt: 4 }}>
                    {reminders.map((reminder, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => deleteReminder(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={reminder.text} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Container>
    );
};

export default Home;
