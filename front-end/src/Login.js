import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import {Link, useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password
            });

            setMessage(response.data.message || 'Login successful');
            setError('');

            const userId = response.data.userId; // Extract userId from response
            localStorage.setItem('userId', userId); // Store userId in localStorage or state
            onLogin();  // Trigger login state change
            navigate('/home');  // Redirect to Home page
        } catch (error) {
            setError(error.response?.data?.message || 'Error occurred');
            setMessage('');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box 
                sx={{ 
                    mt: 8, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center' 
                }}
            >
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>
                </Box>
                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <Box>
                    <p>
                        To Sign Up, please <Link to="/register" style={{ color: 'blue', cursor: 'pointer' }}>click here</Link>.
                    </p>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
