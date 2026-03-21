import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Stack, Avatar, Fade
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import api from '../api';
import { useConfirmation } from '../components/ConfirmationDialog';
import { useNotification } from '../context/NotificationContext';

// Branding Palette from "Foody" Reference
const BRAND = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  bg: '#fffaf0',         // Soft Cream
  surface: '#ffffff',
  text: '#2d3436'
};

const CategoryManagementPage = () => {
  const confirm = useConfirmation();
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name });
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        showNotification('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        showNotification('Category added successfully');
      }
      fetchCategories();
      handleClose();
    } catch (err) {
      console.error(err);
      showNotification('Failed to save category', 'error');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Category', 
      'Are you sure you want to delete this category? This will fail if there are products assigned to it.'
    );
    if (isConfirmed) {
      try {
        await api.delete(`/categories/${id}`);
        showNotification('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        const errorMsg = err.response?.data || 'Failed to delete category. Ensure it has no products.';
        showNotification(errorMsg, 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', bgcolor: BRAND.bg }}>
        <CircularProgress sx={{ color: BRAND.primary, mb: 2 }} />
        <Typography sx={{ fontWeight: 800, color: BRAND.text }}>Loading categories...</Typography>
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
                <CategoryOutlinedIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: BRAND.text }}>
                  Category <span style={{ color: BRAND.primary }}>Management</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organize your menu by managing food categories.
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
              Add Category
            </Button>
          </Stack>

          {/* Categories Table Container */}
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
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>CATEGORY NAME</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                        <ListAltIcon sx={{ fontSize: 60, color: BRAND.text, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND.text }}>No categories found!</Typography>
                        <Typography variant="body2">Click "Add Category" to create your first menu category.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#fffbf2' } }}>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>#{category.id}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: BRAND.text, fontSize: '1rem' }}>{category.name}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            onClick={() => handleOpen(category)}
                            sx={{ color: '#0369a1', bgcolor: 'rgba(3, 105, 161, 0.1)', '&:hover': { bgcolor: 'rgba(3, 105, 161, 0.2)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                            title="Edit Category"
                            size="small"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(category.id)}
                            sx={{ color: BRAND.primary, bgcolor: 'rgba(235, 77, 75, 0.1)', '&:hover': { bgcolor: 'rgba(235, 77, 75, 0.2)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                            title="Delete Category"
                            size="small"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add/Edit Category Dialog */}
          <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 900, color: BRAND.text, pb: 1 }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                    name="name"
                    label="Category Name"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="filled"
                    placeholder="e.g. Burgers, Pizza, Desserts"
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                  />
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
                  Save Category
                </Button>
              </DialogActions>
            </form>
          </Dialog>

        </Box>
      </Fade>
    </Box>
  );
};

export default CategoryManagementPage;
