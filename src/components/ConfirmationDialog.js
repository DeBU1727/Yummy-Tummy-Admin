import React, { useState, createContext, useContext } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Slide, Box, Avatar
} from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

// Branding Palette matching the "Foody" Reference
const BRAND = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  bg: '#fffaf0',         // Soft Cream
  surface: '#ffffff',
  text: '#2d3436'
};

// Smooth slide-up transition for the dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmationContext = createContext();

export const useConfirmation = () => useContext(ConfirmationContext);

export const ConfirmationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState({ title: '', message: '', resolve: null });

  const confirm = (title, message) => {
    setOpen(true);
    return new Promise((resolve) => {
      setConfig({ title, message, resolve });
    });
  };

  const handleClose = (value) => {
    setOpen(false);
    if (config.resolve) config.resolve(value);
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{
          sx: {
            borderRadius: 6,
            p: { xs: 2, md: 3 },
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            maxWidth: '400px',
            textAlign: 'center',
            bgcolor: BRAND.surface
          }
        }}
      >
        {/* Visual Icon Header */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(235, 77, 75, 0.1)',
              color: BRAND.primary,
              width: 65,
              height: 65,
              boxShadow: '0 8px 20px rgba(235, 77, 75, 0.15)'
            }}
          >
            <HelpOutlineRoundedIcon sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <DialogTitle sx={{ fontWeight: 900, color: BRAND.text, pb: 1, fontSize: '1.4rem' }}>
          {config.title}
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.6 }}>
            {config.message}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1.5 }}>
          <Button
            onClick={() => handleClose(false)}
            variant="outlined"
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
            onClick={() => handleClose(true)}
            variant="contained"
            autoFocus
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
              transition: 'all 0.2s'
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmationContext.Provider>
  );
};