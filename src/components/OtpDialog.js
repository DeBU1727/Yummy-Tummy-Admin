import React, { useState, useEffect, useRef } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Typography, Box, CircularProgress,
    Slide, Avatar, Alert, Stack
} from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import api from '../api';

const BRAND = {
    primary: '#eb4d4b',    
    secondary: '#f0932b',  
    bg: '#fffaf0',         
    surface: '#ffffff',
    text: '#2d3436'
};

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const OtpDialog = ({ open, email, onSuccess, onClose }) => {
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const timerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setOtp('');
            setError('');
            startTimer();
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [open]);

    const startTimer = () => {
        setTimer(30);
        setCanResend(false);
        stopTimer();
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleVerify = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/otp/verify', { email, code: otp });
            onSuccess();
        } catch (err) {
            setError(err.response?.data || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/otp/send', { email });
            startTimer();
            if (inputRef.current) {
                inputRef.current.focus();
            }
        } catch (err) {
            setError('Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            disableEscapeKeyDown
            TransitionComponent={Transition}
            keepMounted
            PaperProps={{
                sx: {
                    borderRadius: 6,
                    p: { xs: 2, md: 3 },
                    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                    minWidth: { xs: 'auto', sm: '420px' },
                    maxWidth: { xs: '95vw', sm: 'fit-content' },
                    textAlign: 'center',
                    bgcolor: BRAND.surface
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 1 }}>
                <Avatar 
                    sx={{ 
                        bgcolor: 'rgba(240, 147, 43, 0.1)', 
                        color: BRAND.secondary, 
                        width: 65, 
                        height: 65,
                        boxShadow: '0 8px 20px rgba(240, 147, 43, 0.15)'
                    }}
                >
                    <VpnKeyOutlinedIcon sx={{ fontSize: 32 }} />
                </Avatar>
            </Box>

            <DialogTitle sx={{ fontWeight: 900, color: BRAND.text, pb: 1, fontSize: '1.4rem' }}>
                Admin OTP Verification
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.6, mb: 3 }}>
                        Please enter the secure code sent to <br/>
                        <strong style={{ color: BRAND.text, wordBreak: 'break-all' }}>{email}</strong>
                    </Typography>
                    
                    {error && (
                        <Alert 
                            severity="error" 
                            variant="filled"
                            sx={{ mb: 3, borderRadius: 4, bgcolor: BRAND.primary, '& .MuiAlert-icon': { color: '#fff' } }}
                        >
                            {error}
                        </Alert>
                    )}
                    
                    <Box 
                        onClick={() => inputRef.current?.focus()}
                        sx={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%', mt: 2, mb: 1, cursor: 'text' }}
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
                            inputRef={inputRef}
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
                    
                    <Box sx={{ mt: 3 }}>
                        {!canResend ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Resend secure code in <span style={{ color: BRAND.secondary }}>{timer}s</span>
                            </Typography>
                        ) : (
                            <Button 
                                onClick={handleResend} 
                                disabled={loading}
                                sx={{ 
                                    textTransform: 'none', 
                                    fontWeight: 800, 
                                    color: BRAND.secondary,
                                    '&:hover': { bgcolor: 'rgba(240, 147, 43, 0.1)' }
                                }}
                            >
                                Resend Code
                            </Button>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 0, gap: 1.5 }}>
                <Button 
                    onClick={onClose} 
                    variant="outlined" 
                    disabled={loading}
                    sx={{ 
                        borderRadius: '30px', 
                        px: 3, 
                        py: 1.2, 
                        fontWeight: 800, 
                        color: 'text.secondary', 
                        borderColor: '#ddd',
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        '&:hover': { bgcolor: '#f8f9fa', borderColor: '#bbb' }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleVerify} 
                    variant="contained" 
                    disabled={otp.length !== 6 || loading}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    sx={{ 
                        borderRadius: '30px', 
                        px: 4, 
                        py: 1.2, 
                        fontWeight: 800,
                        bgcolor: BRAND.primary, 
                        color: '#fff', 
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        boxShadow: '0 8px 20px rgba(235, 77, 75, 0.3)',
                        '&:hover': { 
                            bgcolor: '#d44646', 
                            transform: 'translateY(-2px)', 
                            boxShadow: '0 10px 25px rgba(235, 77, 75, 0.4)' 
                        },
                        '&:disabled': {
                            bgcolor: '#ffb3b2',
                            color: '#fff'
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    Verify & Login
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OtpDialog;