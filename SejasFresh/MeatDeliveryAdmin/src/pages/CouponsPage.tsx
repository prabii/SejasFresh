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
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../services/api';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
}

export default function CouponsPage() {
  const [open, setOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    minimumOrderValue: 0,
    maximumDiscount: undefined,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    usageLimit: undefined,
    isActive: true,
  });
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const response = await api.get('/admin/coupons');
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Coupon>) => api.post('/admin/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Coupon> }) =>
      api.put(`/admin/coupons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      minimumOrderValue: 0,
      maximumDiscount: undefined,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: undefined,
      isActive: true,
    });
    setEditingCoupon(null);
  };

  const handleOpen = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minimumOrderValue: coupon.minimumOrderValue || 0,
        maximumDiscount: coupon.maximumDiscount,
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validTo: new Date(coupon.validTo).toISOString().split('T')[0],
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      value: Number(formData.value),
      minimumOrderValue: Number(formData.minimumOrderValue || 0),
      maximumDiscount: formData.maximumDiscount ? Number(formData.maximumDiscount) : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Coupons ({coupons?.length || 0})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ bgcolor: '#D13635', '&:hover': { bgcolor: '#b02a2a' } }}
        >
          Add Coupon
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Min Order</TableCell>
                <TableCell>Valid From</TableCell>
                <TableCell>Valid To</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons && coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {coupon.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{coupon.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={coupon.type}
                        size="small"
                        color={coupon.type === 'percentage' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                    </TableCell>
                    <TableCell>₹{coupon.minimumOrderValue || 0}</TableCell>
                    <TableCell>{new Date(coupon.validFrom).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(coupon.validTo).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {coupon.usedCount || 0}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={coupon.isActive ? 'Active' : 'Inactive'}
                        color={coupon.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(coupon)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(coupon._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No coupons found. Click "Add Coupon" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Coupon Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                disabled={!!editingCoupon}
                helperText={editingCoupon ? 'Code cannot be changed' : 'Will be converted to uppercase'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={formData.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                required
                inputProps={{ min: 0, max: formData.type === 'percentage' ? 100 : undefined }}
              />
            </Grid>
            {formData.type === 'percentage' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Discount (₹)"
                  type="number"
                  value={formData.maximumDiscount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maximumDiscount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  helperText="Optional: Limit maximum discount amount"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Order Value (₹)"
                type="number"
                value={formData.minimumOrderValue}
                onChange={(e) =>
                  setFormData({ ...formData, minimumOrderValue: Number(e.target.value) })
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Usage Limit"
                type="number"
                value={formData.usageLimit || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usageLimit: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                helperText="Leave empty for unlimited"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valid From"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valid To"
                type="date"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
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
            ) : editingCoupon ? (
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
