import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Home from './Home';

function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
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
