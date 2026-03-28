import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, TextField, Typography, Container, Paper, 
  Alert, CircularProgress, Fade, Avatar, InputAdornment, IconButton, Stack
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNotification } from '../context/NotificationContext';

const BRAND = {
  primary: '#eb4d4b',
  secondary: '#f0932b',
  bg: '#fffaf0',
  surface: '#ffffff',
  text: '#2d3436'
};

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpInputRef = useRef(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        if (otpInputRef.current) {
          otpInputRef.current.focus();
        }
      }, 100);
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First verify if email exists in our system
      await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { email });
      
      // If email exists, proceed to send OTP
      await axios.post(`${API_BASE_URL}/api/auth/otp/send`, { email });
      showNotification('OTP sent to your email. Please check your inbox.', 'success');
      setStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to process request.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/api/auth/otp/verify`, { email, code: otp });
      showNotification('OTP verified successfully. You can now set your new password.', 'success');
      setStep(3);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Invalid or expired OTP.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      const errorMessage = "Passwords do not match.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      const errorMessage = "Password must be at least 8 characters long.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { email, password: newPassword });
      showNotification('Password reset successfully. You can now log in with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to reset password.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <Box component="form" onSubmit={handleSendOtp}>
            <TextField
              required
              fullWidth
              label="Registered Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="filled"
              InputProps={{ 
                disableUnderline: true, 
                sx: { borderRadius: 4, bgcolor: '#f8f9fa' },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: BRAND.text }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 1, py: 1.8, borderRadius: 5, fontWeight: 800, textTransform: 'none',
                bgcolor: BRAND.primary, '&:hover': { bgcolor: '#d44646' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box component="form" onSubmit={handleVerifyOtp}>
            <Box 
                onClick={() => otpInputRef.current?.focus()}
                sx={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%', mt: 1, mb: 4, cursor: 'text' }}
            >
                <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} sx={{ position: 'relative', zIndex: 1 }}>
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                        const isActive = otp.length === index && !loading;
                        const isFilled = otp.length > index;
                        
                        return (
                            <Box
                                key={index}
                                sx={{
                                    width: { xs: 40, sm: 48 },
                                    height: { xs: 50, sm: 58 },
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: isFilled ? 'rgba(235, 77, 75, 0.05)' : (isActive ? BRAND.surface : '#f8f9fa'),
                                    border: '2px solid',
                                    borderColor: isActive ? BRAND.primary : (isFilled ? 'rgba(235, 77, 75, 0.3)' : 'rgba(0,0,0,0.06)'),
                                    boxShadow: isActive ? '0 4px 15px rgba(235, 77, 75, 0.2)' : 'none',
                                    transform: isActive ? 'translateY(-2px)' : 'none',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Typography variant="h4" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center' }}>
                                    {isFilled ? (
                                        <Box component="span" sx={{ color: BRAND.primary }}>
                                            {otp[index]}
                                        </Box>
                                    ) : isActive ? (
                                        <Box component="span" sx={{ color: BRAND.secondary, fontWeight: 300 }}>
                                            |
                                        </Box>
                                    ) : (
                                        <Box component="span" sx={{ color: '#e0e0e0', fontSize: '1rem' }}>
                                            •
                                        </Box>
                                    )}
                                </Typography>
                            </Box>
                        );
                    })}
                </Stack>

                <TextField
                    inputRef={otpInputRef}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    autoComplete="one-time-code"
                    inputProps={{ 
                        inputMode: 'numeric', 
                        pattern: '[0-9]*',
                        maxLength: 6
                    }}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 2,
                        opacity: 0,
                        '& input': {
                            height: '100%',
                            cursor: 'text',
                            caretColor: 'transparent',
                        }
                    }}
                />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={otp.length !== 6 || loading}
              sx={{ 
                mt: 1, py: 1.8, borderRadius: 5, fontWeight: 800, textTransform: 'none',
                bgcolor: BRAND.primary, '&:hover': { bgcolor: '#d44646' },
                '&:disabled': { bgcolor: '#ffb3b2', color: '#fff' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={handleSendOtp} 
              disabled={loading}
              sx={{ mt: 2, textTransform: 'none', color: BRAND.primary, fontWeight: 800 }}
            >
              Resend OTP
            </Button>
          </Box>
        );
      case 3:
        return (
          <Box component="form" onSubmit={handleResetPassword}>
            <TextField
              required
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="filled"
              InputProps={{ 
                disableUnderline: true, 
                sx: { borderRadius: 4, bgcolor: '#f8f9fa' },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: BRAND.text }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              required
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="filled"
              InputProps={{ 
                disableUnderline: true, 
                sx: { borderRadius: 4, bgcolor: '#f8f9fa' },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: BRAND.text }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 1, py: 1.8, borderRadius: 5, fontWeight: 800, textTransform: 'none',
                bgcolor: BRAND.primary, '&:hover': { bgcolor: '#d44646' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: BRAND.bg }}>
      <Container maxWidth="xs">
        <Fade in={true} timeout={1000}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={0} sx={{ p: 5, width: '100%', borderRadius: 10, bgcolor: BRAND.surface }}>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: BRAND.primary, width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <RestaurantIcon fontSize="large" />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Forgot Password</Typography>
                <Typography variant="body2" color="text.secondary">Admin Verification</Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>{error}</Alert>}

              {renderForm()}
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;