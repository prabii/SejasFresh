import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import { LocalShipping as DeliveryIcon } from '@mui/icons-material';
import api from '../services/api';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  } | null;
  status: string;
  pricing: {
    total: number;
  };
  createdAt: string;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface DeliveryUser {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<string>('30 minutes');

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/admin/orders');
      return response.data.data;
    },
  });

  // Get delivery users for assignment
  const { data: deliveryUsers } = useQuery<DeliveryUser[]>({
    queryKey: ['delivery-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      const allUsers = response.data.data || [];
      return allUsers.filter((user: any) => user.role === 'delivery' && user.isActive);
    },
  });

  const assignDeliveryMutation = useMutation({
    mutationFn: async ({ orderId, deliveryBoyId, estimatedTime }: { orderId: string; deliveryBoyId: string; estimatedTime: string }) => {
      const response = await api.patch(`/admin/orders/${orderId}/assign`, {
        assignedTo: deliveryBoyId,
        estimatedTime,
        notes: `Assigned to delivery agent. ETA: ${estimatedTime}`
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedDeliveryBoy('');
      setEstimatedTime('30 minutes');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) => {
      const response = await api.patch(`/admin/orders/${orderId}/status`, { status, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setNotes('');
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'info',
      'out-for-delivery': 'primary',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const handleStatusChange = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNotes('');
    setDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus) {
      updateStatusMutation.mutate({
        orderId: selectedOrder._id,
        status: newStatus,
        notes: notes.trim() || undefined,
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Orders
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivery Agent</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    {order.customer.firstName} {order.customer.lastName}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {order.customer.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>₹{order.pricing.total.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.assignedTo ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {order.assignedTo.firstName} {order.assignedTo.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.assignedTo.phone}
                        </Typography>
                      </Box>
                    ) : (
                      <Chip
                        label="Not Assigned"
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexDirection="column">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleStatusChange(order)}
                        disabled={updateStatusMutation.isPending}
                        fullWidth
                      >
                        Update Status
                      </Button>
                      {(order.status === 'preparing' || order.status === 'confirmed') && !order.assignedTo && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DeliveryIcon />}
                          onClick={() => {
                            setSelectedOrder(order);
                            setAssignDialogOpen(true);
                          }}
                          disabled={assignDeliveryMutation.isPending}
                          fullWidth
                          sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
                        >
                          Assign Delivery
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Order: {selectedOrder?.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer: {selectedOrder?.customer.firstName} {selectedOrder?.customer.lastName}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                New Status
              </Typography>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                displayEmpty
              >
                {ORDER_STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 3 }}
              placeholder="Add any notes about this status change..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={!newStatus || updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Delivery Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Delivery Agent</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Order: {selectedOrder?.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer: {selectedOrder?.customer.firstName} {selectedOrder?.customer.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Total: ₹{selectedOrder?.pricing.total.toLocaleString('en-IN')}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Delivery Agent</InputLabel>
              <Select
                value={selectedDeliveryBoy}
                onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                label="Select Delivery Agent"
              >
                {deliveryUsers?.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} - {user.phone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Estimated Delivery Time"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g., 30 minutes"
              helperText="Estimated time for delivery"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedOrder && selectedDeliveryBoy) {
                assignDeliveryMutation.mutate({
                  orderId: selectedOrder._id,
                  deliveryBoyId: selectedDeliveryBoy,
                  estimatedTime,
                });
              }
            }}
            variant="contained"
            disabled={!selectedDeliveryBoy || assignDeliveryMutation.isPending}
            sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
          >
            {assignDeliveryMutation.isPending ? 'Assigning...' : 'Assign Delivery'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

