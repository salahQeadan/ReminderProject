import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import { requestNotificationPermission } from './firebase';

function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    const handleLogin = async () => {
        setIsAuthenticated(true);
        const token = await requestNotificationPermission();
        if (token) {
            console.log('FCM Token stored:', token);

            // Assuming you have the user's ID stored in local storage or passed from the login response
            const userId = localStorage.getItem('userId'); 

            // Save the token to the backend
            fetch('http://localhost:5000/api/save-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, fcmToken: token })
            })
            .then(response => response.json())
            .then(data => console.log('FCM token saved:', data))
            .catch(error => console.error('Error saving FCM token:', error));
        }
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={isAuthenticated ? <Home /> : <Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
