import React, { useState, useEffect } from 'react';
import { 
    Box, Button, TextField, Typography, Container, Paper, 
    Alert, CircularProgress, Fade, Avatar, Stack, InputAdornment, IconButton 
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api';
import OtpDialog from '../components/OtpDialog';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Branding Palette matching the "Foody" Reference
const BRAND = {
    primary: '#eb4d4b',    // Coral Red
    secondary: '#f0932b',  // Golden Orange
    bg: '#fffaf0',         // Soft Cream
    surface: '#ffffff',
    text: '#2d3436'
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    
    // NEW: Track consecutive failed login attempts
    const [failedAttempts, setFailedAttempts] = useState(0); 
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const roles = JSON.parse(jsonPayload).roles || [];
                if (roles.includes('ROLE_ADMIN')) {
                    navigate('/dashboard');
                }
            } catch (e) {
                // Invalid token, ignore
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                setFailedAttempts(0); // Reset attempts on successful login
                navigate('/dashboard');
            } else if (response.status === 202) {
                setShowOtpDialog(true);
            }
        } catch (err) {
            if (err.response?.status === 202) {
                setShowOtpDialog(true);
            } else {
                const msg = err.response?.data?.message || err.response?.data || "Invalid credentials";
                setError(typeof msg === 'string' ? msg : "An error occurred during login");
                setFailedAttempts(prev => prev + 1); // Increment failed attempts
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSuccess = async () => {
        setShowOtpDialog(false);
        setLoading(true);
        try {
            // Re-login after OTP is verified
            const response = await api.post('/auth/login', { email, password });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                setFailedAttempts(0);
                // Ensure token is stored before navigating
                setTimeout(() => navigate('/dashboard'), 100);
            } else {
                setError('OTP verified, but failed to retrieve access token. Please try logging in again.');
            }
        } catch (err) {
            console.error("Login after OTP error:", err);
            setError('Authentication failed after OTP verification.');
            setFailedAttempts(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: BRAND.bg }}>
            <Container maxWidth="xs" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                <Fade in={true} timeout={1000}>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        
                        {/* Branding Header */}
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: BRAND.primary, width: 50, height: 50, boxShadow: '0 4px 15px rgba(235, 77, 75, 0.3)' }}>
                                <AdminPanelSettingsOutlinedIcon fontSize="medium" />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: BRAND.text, letterSpacing: '-1px' }}>
                                Yummy-Tummy<span style={{ color: BRAND.primary }}></span>
                            </Typography>
                        </Box>

                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: { xs: 4, sm: 5 }, 
                                width: '100%', 
                                borderRadius: 8, 
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                                backgroundColor: BRAND.surface,
                                border: '1px solid rgba(0,0,0,0.02)'
                            }}
                        >
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Typography component="h1" variant="h5" sx={{ fontWeight: 800, color: BRAND.text }}>
                                    Secure Login
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                    Please sign in to access the control panel.
                                </Typography>
                            </Box>

                            {error && (
                                <Alert 
                                    severity="error" 
                                    variant="filled"
                                    sx={{ mb: 3, borderRadius: 4, bgcolor: BRAND.primary, '& .MuiAlert-icon': { color: '#fff' } }}
                                >
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Stack spacing={2.5}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Admin Email Address"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        variant="filled"
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: { borderRadius: 4, backgroundColor: '#f8f9fa' }
                                        }}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Security Password"
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        variant="filled"
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: { borderRadius: 4, backgroundColor: '#f8f9fa' },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Stack>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ 
                                        mt: 4, 
                                        mb: 3, 
                                        py: 1.8, 
                                        fontWeight: 800, 
                                        borderRadius: 5,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        backgroundColor: BRAND.primary,
                                        boxShadow: '0 10px 20px rgba(235, 77, 75, 0.3)',
                                        '&:hover': {
                                            backgroundColor: '#d44646',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 25px rgba(235, 77, 75, 0.4)'
                                        },
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Authenticate'}
                                </Button>

                                <Box textAlign="center">
                                    {/* HIDDEN LOGIC: Only reveals after 3 failed attempts */}
                                    {failedAttempts >= 3 && (
                                        <Typography variant="body2" sx={{ mb: 1.5 }}>
                                            <RouterLink 
                                                to="/forgot-password" 
                                                style={{ color: BRAND.primary, fontWeight: 700, textDecoration: 'none' }}
                                            >
                                                Forgot Security Password?
                                            </RouterLink>
                                        </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        New Administrator? 
                                        <RouterLink 
                                            to="/register" 
                                            style={{ 
                                                textDecoration: 'none', 
                                                color: BRAND.secondary, 
                                                fontWeight: 800,
                                                marginLeft: '6px'
                                            }}
                                        >
                                            Register Here
                                        </RouterLink>
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Fade>
            </Container>

            <OtpDialog 
                open={showOtpDialog} 
                email={email} 
                onSuccess={handleOtpSuccess} 
                onClose={() => setShowOtpDialog(false)} 
            />
        </Box>
    );
};

export default LoginPage;