import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

// Branding Palette matching the "Foody" Reference
const BRAND = {
  primary: '#eb4d4b',    // Coral Red (Error)
  secondary: '#f0932b',  // Golden Orange (Warning)
  success: '#22c55e',    // Mint Green (Success)
  info: '#3b82f6',       // Bright Blue (Info)
  text: '#ffffff'        // White text for filled alerts
};

// Smooth slide-in transition from the right edge
const SlideTransition = React.forwardRef(function SlideTransition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'info', 'warning'
  });

  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  // Map MUI severities to our custom vibrant brand colors
  const getAlertColor = (sev) => {
    switch (sev) {
      case 'success': return BRAND.success;
      case 'error': return BRAND.primary;
      case 'warning': return BRAND.secondary;
      case 'info': return BRAND.info;
      default: return '#333333';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
        sx={{ 
          mt: { xs: 2, sm: 8 }, 
          mr: { xs: 0, sm: 2 },
          zIndex: (theme) => theme.zIndex.snackbar + 9999 // Ensure it floats above nav/modals
        }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            bgcolor: getAlertColor(notification.severity),
            color: BRAND.text,
            borderRadius: '16px', // Premium rounded corners matching Foody cards
            fontWeight: 700,
            fontSize: '0.95rem',
            alignItems: 'center',
            boxShadow: `0 12px 30px ${getAlertColor(notification.severity)}60`, // Dynamic glowing shadow
            '& .MuiAlert-icon': {
              color: BRAND.text,
              opacity: 0.9,
              fontSize: '1.5rem'
            },
            '& .MuiAlert-action': {
              pt: 0,
              pb: 0,
              alignItems: 'center',
              '& svg': { color: BRAND.text }
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};