import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Chip, Stack, Avatar, Fade
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import api from '../api';
import { API_BASE_URL } from '../config';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../components/ConfirmationDialog';

// Branding Palette matching the "Foody" Reference
const BRAND = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  bg: '#fffaf0',         // Soft Cream
  surface: '#ffffff',
  text: '#2d3436'
};

const OfferManagementPage = () => {
  const confirm = useConfirmation();
  const { showNotification } = useNotification();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', discountPercentage: '', offerCode: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/offers');
      setOffers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (offer = null) => {
    setSelectedFile(null);
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title,
        description: offer.description,
        discountPercentage: offer.discountPercentage,
        offerCode: offer.offerCode
      });
    } else {
      setEditingOffer(null);
      setFormData({ title: '', description: '', discountPercentage: '', offerCode: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('discountPercentage', formData.discountPercentage);
    data.append('offerCode', formData.offerCode);
    if (selectedFile) {
      data.append('file', selectedFile);
    }

    try {
      if (editingOffer) {
        await api.put(`/offers/${editingOffer.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Offer updated successfully');
      } else {
        await api.post('/offers', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Offer added successfully');
      }
      fetchOffers();
      handleClose();
    } catch (err) {
      console.error(err);
      showNotification('Failed to save offer', 'error');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm('Delete Offer', 'Are you sure you want to delete this offer? This will remove the promotion from the website.');
    if (isConfirmed) {
      try {
        await api.delete(`/offers/${id}`);
        showNotification('Offer deleted successfully');
        fetchOffers();
      } catch (err) {
        console.error(err);
        showNotification('Failed to delete offer', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', bgcolor: BRAND.bg }}>
        <CircularProgress sx={{ color: BRAND.primary, mb: 2 }} />
        <Typography sx={{ fontWeight: 800, color: BRAND.text }}>Loading promotions...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: BRAND.bg, minHeight: '100vh', p: { xs: 2, md: 5 } }}>
      <Fade in={true} timeout={800}>
        <Box maxWidth="xl" sx={{ mx: 'auto' }}>

          {/* Page Header */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: BRAND.primary, width: 55, height: 55, boxShadow: '0 4px 12px rgba(235, 77, 75, 0.3)' }}>
                <LocalOfferOutlinedIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: BRAND.text }}>
                  Offer <span style={{ color: BRAND.primary }}>Management</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and manage active deals and coupon codes.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{
                bgcolor: BRAND.primary,
                borderRadius: '30px',
                px: 3,
                py: 1.2,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(235, 77, 75, 0.3)',
                '&:hover': { bgcolor: '#d44646', transform: 'translateY(-2px)' },
                transition: 'all 0.2s'
              }}
            >
              Add Offer
            </Button>
          </Stack>

          {/* Offers Table Container */}
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
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>BANNER</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>TITLE & DESCRIPTION</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>COUPON CODE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: 'text.secondary' }}>DISCOUNT</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                        <ReceiptLongOutlinedIcon sx={{ fontSize: 60, color: BRAND.text, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND.text }}>No active offers!</Typography>
                        <Typography variant="body2">Click "Add Offer" to start a new promotion.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  offers.map((offer) => {
                    const imageSrc = offer.imageUrl?.startsWith('http') ? offer.imageUrl : (offer.imageUrl?.startsWith('/uploads') ? `${API_BASE_URL}${offer.imageUrl}` : offer.imageUrl);
                    return (
                      <TableRow key={offer.id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#fffbf2' } }}>
                        <TableCell>
                          <Avatar
                            src={imageSrc}
                            alt={offer.title}
                            variant="rounded"
                            sx={{ width: 80, height: 50, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 2 }}
                            imgProps={{ sx: { objectFit: 'cover' } }}
                          >
                            {!imageSrc && <LocalOfferOutlinedIcon sx={{ color: '#ccc' }} />}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 800, color: BRAND.text, fontSize: '1rem' }}>{offer.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {offer.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={offer.offerCode || 'NO CODE'}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: 1,
                              bgcolor: offer.offerCode ? 'rgba(235, 77, 75, 0.1)' : '#f8f9fa',
                              color: offer.offerCode ? BRAND.primary : 'text.disabled',
                              border: `1px dashed ${offer.offerCode ? 'rgba(235, 77, 75, 0.4)' : '#ddd'}`,
                              borderRadius: 1
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 900, color: BRAND.secondary, fontSize: '1.1rem' }}>
                            {offer.discountPercentage}% OFF
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              onClick={() => handleOpen(offer)}
                              sx={{ color: '#0369a1', bgcolor: 'rgba(3, 105, 161, 0.1)', '&:hover': { bgcolor: 'rgba(3, 105, 161, 0.2)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                              title="Edit Offer"
                              size="small"
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(offer.id)}
                              sx={{ color: BRAND.primary, bgcolor: 'rgba(235, 77, 75, 0.1)', '&:hover': { bgcolor: 'rgba(235, 77, 75, 0.2)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                              title="Delete Offer"
                              size="small"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add/Edit Offer Dialog */}
          <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 900, color: BRAND.text, pb: 1 }}>
              {editingOffer ? 'Edit Offer' : 'Add New Offer'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                    name="title"
                    label="Offer Title"
                    fullWidth
                    value={formData.title}
                    onChange={handleChange}
                    required
                    variant="filled"
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                  />
                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    variant="filled"
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <TextField
                      name="discountPercentage"
                      label="Discount (%)"
                      type="number"
                      fullWidth
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      required
                      variant="filled"
                      InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                    />
                    <TextField
                      name="offerCode"
                      label="Offer Code (e.g., SAVE20)"
                      fullWidth
                      value={formData.offerCode}
                      onChange={handleChange}
                      required
                      variant="filled"
                      InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                    />
                  </Stack>

                  {/* Custom File Upload Box */}
                  <Box sx={{ p: 3, border: '2px dashed #ddd', borderRadius: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
                      Offer Banner Image
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="raised-button-file">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadOutlinedIcon />}
                        sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600, color: BRAND.secondary, borderColor: BRAND.secondary, '&:hover': { borderColor: BRAND.primary, color: BRAND.primary } }}
                      >
                        {selectedFile ? 'Change Banner' : 'Upload Banner'}
                      </Button>
                    </label>
                    {selectedFile && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 600, color: BRAND.text }}>
                        {selectedFile.name}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                  onClick={handleClose}
                  sx={{ color: 'text.secondary', fontWeight: 700, borderRadius: '30px', px: 3 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: BRAND.primary,
                    borderRadius: '30px',
                    px: 4,
                    fontWeight: 800,
                    boxShadow: '0 8px 20px rgba(235, 77, 75, 0.3)',
                    '&:hover': { bgcolor: '#d44646' },
                  }}
                >
                  Save Offer
                </Button>
              </DialogActions>
            </form>
          </Dialog>

        </Box>
      </Fade>
    </Box>
  );
};

export default OfferManagementPage;
