import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar,
  Toolbar, Typography, CssBaseline, Button, Avatar, Stack
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LogoutIcon from '@mui/icons-material/Logout';
import FastfoodIcon from '@mui/icons-material/Fastfood';

import DashboardPage from './pages/DashboardPage';
import ProductManagementPage from './pages/ProductManagementPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import OfferManagementPage from './pages/OfferManagementPage';
import SupportManagementPage from './pages/SupportManagementPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RegistrationPage from './pages/RegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfirmationProvider, useConfirmation } from './components/ConfirmationDialog';
import { NotificationProvider, useNotification } from './context/NotificationContext';

const drawerWidth = 260; // Slightly wider for a modern feel

// Branding Palette matching the reference image
const BRAND = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  bg: '#fffaf0',         // Soft Cream
  surface: '#ffffff',
  text: '#2d3436'
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirm = useConfirmation();
  const { showNotification } = useNotification();

  const handleLogout = async () => {
    const isConfirmed = await confirm(
      'Logout Confirmation',
      'Are you sure you want to log out?'
    );
    
    if (isConfirmed) {
      localStorage.removeItem('token');
      showNotification('Logged out successfully', 'info');
      navigate('/login');
    }
  };

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Categories', icon: <LocalOfferIcon />, path: '/categories' },
    { text: 'Products', icon: <ShoppingBasketIcon />, path: '/products' },
    { text: 'Offers', icon: <LocalOfferIcon />, path: '/offers' },
    { text: 'Support Messages', icon: <SupportAgentIcon />, path: '/support' },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: BRAND.bg, minHeight: '100vh' }}>
      <CssBaseline />

      {/* Top App Bar - Glassmorphism Style */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          color: BRAND.text
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: BRAND.primary, width: 40, height: 40, boxShadow: '0 4px 10px rgba(235, 77, 75, 0.3)' }}>
              <FastfoodIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 900, letterSpacing: '-0.5px', color: BRAND.text }}>
              Yummy-Tummy Admin
            </Typography>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: '30px',
              textTransform: 'none',
              fontWeight: 800,
              color: 'text.secondary',
              borderColor: '#ddd',
              '&:hover': { bgcolor: 'error.50', color: 'error.main', borderColor: 'error.main' },
              transition: 'all 0.2s'
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: BRAND.surface,
            borderRight: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
          },
        }}
      >
        <Toolbar /> {/* Spacer for the fixed AppBar */}
        <Box sx={{ overflow: 'auto', mt: 3 }}>
          <List sx={{ px: 2 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem
                  button
                  component={Link}
                  to={item.path}
                  key={item.text}
                  sx={{
                    borderRadius: 3,
                    mb: 1,
                    bgcolor: isActive ? 'rgba(235, 77, 75, 0.1)' : 'transparent',
                    color: isActive ? BRAND.primary : 'text.secondary',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(235, 77, 75, 0.15)' : 'rgba(0,0,0,0.03)',
                      transform: isActive ? 'none' : 'translateX(4px)'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? BRAND.primary : 'inherit',
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.95rem'
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Canvas */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
        <Toolbar /> {/* Spacer for the fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <NotificationProvider>
      <ConfirmationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegistrationPage />} />

            {/* Protected Routes inside Layout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
              <Route path="/categories" element={<Layout><CategoryManagementPage /></Layout>} />
              <Route path="/products" element={<Layout><ProductManagementPage /></Layout>} />
              <Route path="/offers" element={<Layout><OfferManagementPage /></Layout>} />
              <Route path="/support" element={<Layout><SupportManagementPage /></Layout>} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ConfirmationProvider>
    </NotificationProvider>
  );
}

export default App;