import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Container, Paper, 
  Alert, CircularProgress, Fade, Avatar, Stack, InputAdornment, IconButton 
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';

const BRAND = {
  primary: '#eb4d4b',
  secondary: '#f0932b',
  bg: '#fffaf0',
  surface: '#ffffff',
  text: '#2d3436'
};

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const isMatch = password === confirmPassword && password !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMatch) return;

    setLoading(true);
    setError('');

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password`, { email, password });
      setSuccess('Admin password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: BRAND.bg }}>
      <Container maxWidth="xs">
        <Fade in={true} timeout={1000}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={0} sx={{ p: 5, width: '100%', borderRadius: 10, bgcolor: BRAND.surface }}>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <LockResetIcon sx={{ fontSize: 50, color: BRAND.primary, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Reset Admin Password</Typography>
                <Typography variant="body2" color="text.secondary">For <b>{email}</b></Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 4 }}>{success}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    required
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="filled"
                    InputProps={{ 
                      disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="filled"
                    error={confirmPassword !== '' && password !== confirmPassword}
                    helperText={confirmPassword !== '' && password !== confirmPassword ? "Passwords do not match" : ""}
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                  />
                </Stack>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !isMatch}
                  sx={{ 
                    mt: 4, py: 1.8, borderRadius: 5, fontWeight: 800, textTransform: 'none',
                    bgcolor: BRAND.primary, '&:hover': { bgcolor: '#d44646' }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Change Admin Password'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
