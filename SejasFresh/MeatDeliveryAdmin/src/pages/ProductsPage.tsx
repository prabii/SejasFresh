import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import api from '../services/api';

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'https://meat-delivery-backend.onrender.com/uploads';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  subcategory?: string;
  image?: string;
  images?: Array<{ url: string; alt?: string }>;
  isActive: boolean;
  availability: {
    inStock: boolean;
    quantity: number;
  };
  weight: {
    value: number;
    unit: string;
  };
  rating?: number;
  deliveryTime?: string;
}

export default function ProductsPage() {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discountedPrice: 0,
    category: 'normal',
    subcategory: '',
    isActive: true,
    availability: { inStock: true, quantity: 0 },
    weight: { value: 1, unit: 'kg' },
    deliveryTime: '60-90 minutes',
  });
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/admin/products');
      return response.data.data;
    },
  });

  // Group products by category - only include active products and filter correctly
  const groupedProducts = (products || []).reduce((acc, product) => {
    // Only process products that are active and have a valid category
    if (!product.isActive) return acc;
    
    const category = product.category || 'other';
    // Only include valid categories (premium, normal, exclusive)
    if (!['premium', 'normal', 'exclusive'].includes(category)) {
      return acc;
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Get all unique subcategories from products
  const allSubcategories = Array.from(
    new Set(
      products
        ?.filter((p) => p.subcategory)
        .map((p) => p.subcategory!)
        .sort()
    )
  ) || [];

  // Category mapping for display
  const categoryDisplayMap: Record<string, string> = {
    premium: 'Premium Cuts',
    normal: 'Instant Deliverables',
    exclusive: 'Exclusive Collection',
  };

  // Get categories with display names - always show all three main categories
  const mainCategories = ['premium', 'normal', 'exclusive'];
  const categoryTabs: Array<{ value: string; label: string; count?: number }> = [
    { value: 'all', label: 'All' },
    ...mainCategories.map((cat) => ({
      value: cat,
      label: categoryDisplayMap[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
      count: groupedProducts[cat]?.length || 0,
    })),
  ];

  // Get displayed products based on selected category - ensure proper filtering
  const displayedProducts = selectedCategory === 'all' 
    ? (products || []).filter(p => p.isActive !== false)
    : (groupedProducts[selectedCategory] || []).filter(p => 
        p.category === selectedCategory && p.isActive !== false
      );

  // Group displayed products by subcategory for better organization
  const productsBySubcategory = displayedProducts.reduce((acc, product) => {
    const subcat = product.subcategory || 'Uncategorized';
    if (!acc[subcat]) {
      acc[subcat] = [];
    }
    acc[subcat].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/admin/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.refetchQueries({ queryKey: ['products'] });
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.put(`/admin/products/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      discountedPrice: 0,
      category: 'normal',
      subcategory: '',
      isActive: true,
      availability: { inStock: true, quantity: 0 },
      weight: { value: 1, unit: 'kg' },
      deliveryTime: '60-90 minutes',
    });
    setEditingProduct(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleOpen = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        discountedPrice: product.discountedPrice,
        category: product.category,
        subcategory: product.subcategory || '',
        isActive: product.isActive,
        availability: product.availability,
        weight: product.weight,
        deliveryTime: product.deliveryTime,
      });
      // Set image preview if exists
      const imageUrl = product.image || (product.images && product.images[0]?.url);
      if (imageUrl) {
        setImagePreview(imageUrl.startsWith('http') ? imageUrl : `${UPLOADS_URL}/${imageUrl}`);
      }
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'availability' || key === 'weight') {
        formDataToSend.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formDataToSend.append(key, String(value));
      }
    });

    // Append image if selected
    if (selectedImage) {
      formDataToSend.append('image', selectedImage);
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: formDataToSend });
    } else {
      createMutation.mutate(formDataToSend);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const getImageUrl = (product: Product) => {
    if (product.image) {
      return product.image.startsWith('http') ? product.image : `${UPLOADS_URL}/${product.image}`;
    }
    if (product.images && product.images.length > 0) {
      const url = product.images[0].url;
      return url.startsWith('http') ? url : `${UPLOADS_URL}/${url}`;
    }
    return `${UPLOADS_URL}/Beef-brisket.jpg`; // Default image
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Products ({products?.length || 0})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ bgcolor: '#D13635', '&:hover': { bgcolor: '#b02a2a' } }}
        >
          Add Product
        </Button>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedCategory} onChange={(_e, newValue) => setSelectedCategory(newValue)}>
          {categoryTabs.map((tab) => (
            <Tab
              key={tab.value}
              label={`${tab.label} (${tab.value === 'all' ? (products?.filter(p => p.isActive !== false).length || 0) : (tab.count || 0)})`}
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>

      {/* Subcategory Summary */}
      {selectedCategory !== 'all' && displayedProducts.length > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Subcategories in {categoryDisplayMap[selectedCategory] || selectedCategory}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {Object.keys(productsBySubcategory).map((subcat) => (
              <Chip
                key={subcat}
                label={`${subcat} (${productsBySubcategory[subcat].length})`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Discounted</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProducts.length > 0 ? (
                displayedProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Avatar
                        src={getImageUrl(product)}
                        alt={product.name}
                        variant="rounded"
                        sx={{ width: 56, height: 56 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {product.name}
                      </Typography>
                      {product.subcategory && (
                        <Typography variant="caption" color="text.secondary">
                          {product.subcategory}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categoryDisplayMap[product.category] || product.category}
                        size="small"
                        color={
                          product.category === 'premium'
                            ? 'primary'
                            : product.category === 'exclusive'
                            ? 'secondary'
                            : 'default'
                        }
                      />
                      {product.subcategory && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {product.subcategory}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>
                      {product.discountedPrice ? (
                        <Typography variant="body2" color="success.main">
                          ₹{product.discountedPrice}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {product.availability?.quantity || 0} {product.weight?.unit || 'kg'}
                      </Typography>
                      <Chip
                        label={product.availability?.inStock ? 'In Stock' : 'Out of Stock'}
                        size="small"
                        color={product.availability?.inStock ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={product.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(product)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No products found in this category. Click "Add Product" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {selectedImage ? 'Change Image' : 'Upload Product Image'}
                  </Button>
                </label>
                {imagePreview && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Avatar
                      src={imagePreview}
                      variant="rounded"
                      sx={{ width: 200, height: 200, mx: 'auto' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="premium">Premium Cuts</MenuItem>
                  <MenuItem value="normal">Instant Deliverables</MenuItem>
                  <MenuItem value="exclusive">Exclusive Collection</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={formData.subcategory || ''}
                  label="Subcategory"
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  renderValue={(value) => value || 'Select or type new'}
                >
                  <MenuItem value="">
                    <em>Select existing or type new below</em>
                  </MenuItem>
                  {allSubcategories.map((subcat) => (
                    <MenuItem key={subcat} value={subcat}>
                      {subcat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Or Enter New Subcategory"
                value={formData.subcategory || ''}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="e.g., steak, roast, organ, curry, ribs, ground"
                helperText="Type a new subcategory name or select from dropdown above"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Or Enter New Subcategory"
                value={formData.subcategory || ''}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="e.g., steak, roast, organ"
                helperText="Type a new subcategory name or select from dropdown above"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Discounted Price (₹)"
                type="number"
                value={formData.discountedPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountedPrice: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight Value"
                type="number"
                value={formData.weight?.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: { ...formData.weight!, value: Number(e.target.value) },
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Weight Unit</InputLabel>
                <Select
                  value={formData.weight?.unit}
                  label="Weight Unit"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: { ...formData.weight!, unit: e.target.value },
                    })
                  }
                >
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="lb">lb</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.availability?.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availability: {
                      ...formData.availability!,
                      quantity: Number(e.target.value),
                    },
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Delivery Time"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                placeholder="e.g., 60-90 minutes"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.availability?.inStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availability: {
                          ...formData.availability!,
                          inStock: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="In Stock"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
                sx={{ ml: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{ bgcolor: '#D13635', '&:hover': { bgcolor: '#b02a2a' } }}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={20} />
            ) : editingProduct ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
