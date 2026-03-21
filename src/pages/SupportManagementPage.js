import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton,
  CircularProgress, Alert, Stack, Avatar, Fade
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import api from '../api';
import { useConfirmation } from '../components/ConfirmationDialog';
import { useNotification } from '../context/NotificationContext';

// Branding Palette matching the "Foody" Reference
const BRAND = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  bg: '#fffaf0',         // Soft Cream
  surface: '#ffffff',
  text: '#2d3436'
};

const SupportManagementPage = () => {
  const confirm = useConfirmation();
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/support/messages');
      setMessages(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load support messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm('Delete Support Message', 'Are you sure you want to delete this message record? This action is permanent.');
    if (isConfirmed) {
      try {
        await api.delete(`/support/messages/${id}`);
        showNotification('Message deleted successfully');
        setMessages(messages.filter(msg => msg.id !== id));
      } catch (err) {
        console.error(err);
        showNotification('Failed to delete the message.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', bgcolor: BRAND.bg }}>
        <CircularProgress sx={{ color: BRAND.primary, mb: 2 }} />
        <Typography sx={{ fontWeight: 800, color: BRAND.text }}>Loading messages...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: BRAND.bg, minHeight: '100vh', p: { xs: 2, md: 5 } }}>
      <Fade in={true} timeout={800}>
        <Box maxWidth="xl" sx={{ mx: 'auto' }}>

          {/* Page Header */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Avatar sx={{ bgcolor: BRAND.primary, width: 55, height: 55, boxShadow: '0 4px 12px rgba(235, 77, 75, 0.3)' }}>
              <SupportAgentIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: BRAND.text }}>
                Support <span style={{ color: BRAND.primary }}>Messages</span>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review and manage customer inquiries and feedback.
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert
              severity="error"
              variant="filled"
              sx={{ mb: 4, borderRadius: 4, bgcolor: BRAND.primary, '& .MuiAlert-icon': { color: '#fff' } }}
            >
              {error}
            </Alert>
          )}

          {/* Messages Table Container */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 6,
              boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.02)',
              bgcolor: BRAND.surface,
              overflow: 'hidden'
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>DATE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>CUSTOMER NAME</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>CONTACT INFO</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>MESSAGE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                        <MarkEmailReadOutlinedIcon sx={{ fontSize: 60, color: BRAND.text, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND.text }}>All caught up!</Typography>
                        <Typography variant="body2">There are no new support messages.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((msg) => (
                    <TableRow key={msg.id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#fffbf2' } }}>
                      <TableCell sx={{ minWidth: 120, color: 'text.secondary', fontWeight: 600 }}>
                        {new Date(msg.createdAt).toLocaleDateString()} <br />
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: BRAND.text }}>{msg.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{msg.email}</Typography>
                        <Typography variant="caption" color="text.secondary">{msg.phone}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 350 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            color: 'text.secondary',
                            lineHeight: 1.6,
                            bgcolor: '#f8f9fa',
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid rgba(0,0,0,0.03)'
                          }}
                        >
                          {msg.message}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleDelete(msg.id)}
                          sx={{
                            color: BRAND.primary,
                            bgcolor: 'rgba(235, 77, 75, 0.1)',
                            '&:hover': { bgcolor: 'rgba(235, 77, 75, 0.2)', transform: 'scale(1.1)' },
                            transition: 'all 0.2s'
                          }}
                          title="Delete Message"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Fade>
    </Box>
  );
};

export default SupportManagementPage;
