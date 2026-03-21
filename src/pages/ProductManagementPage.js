import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, CircularProgress, Stack, Avatar, Fade
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import api from '../api';
import { API_BASE_URL } from '../config';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../components/ConfirmationDialog';

// Branding Palette from "Foody" Reference
const BRAND = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  bg: '#fffaf0',         // Soft Cream
  surface: '#ffffff',
  text: '#2d3436'
};

const ProductManagementPage = () => {
  const confirm = useConfirmation();
  const { showNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', categoryId: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (product = null) => {
    setSelectedFile(null);
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description || '',
        categoryId: product.categoryId || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', description: '', categoryId: '' });
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
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('categoryId', formData.categoryId);
    if (selectedFile) {
      data.append('file', selectedFile);
    }

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Product added successfully');
      }
      fetchInitialData();
      handleClose();
    } catch (err) {
      console.error(err);
      showNotification('Failed to save product', 'error');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm('Delete Product', 'Are you sure you want to delete this product? This action cannot be undone.');
    if (isConfirmed) {
      try {
        await api.delete(`/products/${id}`);
        showNotification('Product deleted successfully');
        fetchInitialData();
      } catch (err) {
        console.error(err);
        showNotification('Failed to delete product', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', bgcolor: BRAND.bg }}>
        <CircularProgress sx={{ color: BRAND.primary, mb: 2 }} />
        <Typography sx={{ fontWeight: 800, color: BRAND.text }}>Loading inventory...</Typography>
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
                <ShoppingBasketOutlinedIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: BRAND.text }}>
                  Product <span style={{ color: BRAND.primary }}>Inventory</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your menu items, pricing, and categories.
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
              Add Product
            </Button>
          </Stack>

          {/* Products Table Container */}
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
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>IMAGE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>PRODUCT NAME</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>CATEGORY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>PRICE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                        <ShoppingBasketOutlinedIcon sx={{ fontSize: 60, color: BRAND.text, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND.text }}>No products found!</Typography>
                        <Typography variant="body2">Click "Add Product" to create your first menu item.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const imageSrc = product.image?.startsWith('http') ? product.image : (product.image?.startsWith('/uploads') ? `${API_BASE_URL}${product.image}` : product.image);
                    return (
                      <TableRow key={product.id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#fffbf2' } }}>
                        <TableCell>
                          <Avatar
                            src={imageSrc}
                            alt={product.name}
                            sx={{ width: 50, height: 50, bgcolor: 'transparent', border: '1px solid rgba(0,0,0,0.05)' }}
                            imgProps={{ sx: { objectFit: 'contain' } }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: BRAND.text, fontSize: '1rem' }}>{product.name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', bgcolor: '#f8f9fa', px: 1.5, py: 0.5, borderRadius: 2, display: 'inline-block' }}>
                            {product.categoryName || 'Uncategorized'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900, color: BRAND.primary, fontSize: '1.05rem' }}>
                          ₹{product.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              onClick={() => handleOpen(product)}
                              sx={{ color: '#0369a1', bgcolor: 'rgba(3, 105, 161, 0.1)', '&:hover': { bgcolor: 'rgba(3, 105, 161, 0.2)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                              title="Edit Product"
                              size="small"
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(product.id)}
                              sx={{ color: BRAND.primary, bgcolor: 'rgba(235, 77, 75, 0.1)', '&:hover': { bgcolor: 'rgba(235, 77, 75, 0.2)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                              title="Delete Product"
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

          {/* Add/Edit Product Dialog */}
          <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 900, color: BRAND.text, pb: 1 }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                    name="name"
                    label="Product Name"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="filled"
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                  />

                  <TextField
                    name="price"
                    label="Price (₹)"
                    type="number"
                    fullWidth
                    value={formData.price}
                    onChange={handleChange}
                    required
                    variant="filled"
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                  />

                  <TextField
                    name="description"
                    label="Description / Details"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    variant="filled"
                    placeholder="Enter ingredients, special notes, or a delicious description..."
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}
                  />

                  <FormControl fullWidth required variant="filled">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      disableUnderline
                      sx={{ borderRadius: 4, bgcolor: '#f8f9fa' }}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id} sx={{ fontWeight: 500 }}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Custom File Upload Box */}
                  <Box sx={{ p: 2, border: '2px dashed #ddd', borderRadius: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
                      Product Image
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
                        {selectedFile ? 'Change File' : 'Upload Image'}
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
                  Save Product
                </Button>
              </DialogActions>
            </form>
          </Dialog>

        </Box>
      </Fade>
    </Box>
  );
};

export default ProductManagementPage;