import React, { useState } from 'react';
import { 
    Box, Button, TextField, Typography, Container, Paper, 
    Alert, CircularProgress, Fade, Avatar, Stack, InputAdornment, IconButton 
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api';
import OtpDialog from '../components/OtpDialog';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
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

const RegistrationPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // UI States for better UX
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/otp/send', { email });
            setShowOtpDialog(true);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Failed to send OTP.";
            setError(typeof msg === 'string' ? msg : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleRegistration = async () => {
        setShowOtpDialog(false);
        setLoading(true);
        try {
            const response = await api.post('/auth/register', { fullName, email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: BRAND.bg }}>
            <Container maxWidth="xs" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                <Fade in={true} timeout={1000}>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        
                        {/* Branding Header */}
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: BRAND.primary, width: 50, height: 50, boxShadow: '0 4px 15px rgba(235, 77, 75, 0.3)' }}>
                                <PersonAddAlt1Icon fontSize="medium" />
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
                                    Create Account
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                    Register a new administrator profile
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

                            <Box component="form" onSubmit={handleSendOtp} noValidate>
                                <Stack spacing={2.5}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Full Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        variant="filled"
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: { borderRadius: 4, backgroundColor: '#f8f9fa' }
                                        }}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="Email Address"
                                        type="email"
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
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        variant="filled"
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: { borderRadius: 4, backgroundColor: '#f8f9fa' },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        variant="filled"
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: { borderRadius: 4, backgroundColor: '#f8f9fa' },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                                </Button>

                                <Box textAlign="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Already an admin? 
                                        <RouterLink 
                                            to="/login" 
                                            style={{ 
                                                textDecoration: 'none', 
                                                color: BRAND.secondary, 
                                                fontWeight: 800,
                                                marginLeft: '6px'
                                            }}
                                        >
                                            Login Here
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
                onSuccess={handleRegistration} 
                onClose={() => setShowOtpDialog(false)} 
            />
        </Box>
    );
};

export default RegistrationPage;