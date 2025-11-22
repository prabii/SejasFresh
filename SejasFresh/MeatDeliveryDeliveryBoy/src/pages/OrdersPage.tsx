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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import {
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  Assignment as AssignmentIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: string;
  pricing: {
    total: number;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    priceAtTime: number;
  }>;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  const { data: ordersData, isLoading, error: ordersError } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: async () => {
      try {
        const response = await api.get('/delivery/orders');
        console.log('Delivery orders response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching delivery orders:', error);
        throw error;
      }
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1,
  });

  const orders = (ordersData?.data || []) as Order[];

  // Get delivered orders history
  const { data: deliveredOrders, isLoading: isLoadingDelivered, error: deliveredError } = useQuery<Order[]>({
    queryKey: ['delivered-orders'],
    queryFn: async () => {
      try {
        const response = await api.get('/delivery/orders/delivered');
        console.log('Delivered orders response:', response.data);
        return response.data.data || [];
      } catch (error: any) {
        console.error('Error fetching delivered orders:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && tabValue === 2, // Only fetch when authenticated and on delivered tab
    retry: 1,
  });

  const { data: availableOrders, isLoading: isLoadingAvailable, error: availableError } = useQuery<Order[]>({
    queryKey: ['available-orders'],
    queryFn: async () => {
      try {
        const response = await api.get('/delivery/orders/available');
        console.log('Available orders response:', response.data);
        return response.data.data || [];
      } catch (error: any) {
        console.error('Error fetching available orders:', error);
        throw error;
      }
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1,
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/delivery/orders/${orderId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivered-orders'] });
      setErrorMessage(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to accept order. Please try again.';
      console.error('Accept order error:', {
        message,
        status: error.response?.status,
        data: error.response?.data
      });
      setErrorMessage(message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await api.patch(`/delivery/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivered-orders'] });
      setDialogOpen(false);
      setSelectedOrder(null);
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

  const handleMarkDelivered = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleConfirmDelivery = () => {
    if (selectedOrder) {
      updateStatusMutation.mutate({
        orderId: selectedOrder._id,
        status: 'delivered',
      });
    }
  };

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleAcceptOrder = (order: Order) => {
    acceptOrderMutation.mutate(order._id);
  };

  if (isLoading || isLoadingAvailable) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Orders
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab icon={<ShippingIcon />} iconPosition="start" label="My Orders" />
          <Tab icon={<AssignmentIcon />} iconPosition="start" label={`Available (${availableOrders?.length || 0})`} />
          <Tab icon={<CheckIcon />} iconPosition="start" label={`Delivered (${deliveredOrders?.length || 0})`} />
        </Tabs>
      </Box>

      {/* My Assigned Orders Tab */}
      {tabValue === 0 && (
        <>
          {isMobile ? (
            <Box>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            Order #{order.orderNumber}
                          </Typography>
                          <Chip
                            label={order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                            color={getStatusColor(order.status) as any}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        <Typography variant="h6" color="primary">
                          ₹{order.pricing.total.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box mb={2}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Customer
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {order.customer.firstName} {order.customer.lastName}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCallCustomer(order.customer.phone)}
                            sx={{ color: '#4CAF50' }}
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {order.customer.phone}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Address
                        </Typography>
                        <Typography variant="body2">{order.deliveryAddress.street}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                        </Typography>
                        {order.deliveryAddress.landmark && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Near {order.deliveryAddress.landmark}
                          </Typography>
                        )}
                      </Box>
                      {order.status === 'out-for-delivery' && (
                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          startIcon={<CheckIcon />}
                          onClick={() => handleMarkDelivered(order)}
                          sx={{ bgcolor: '#4CAF50', mt: 2 }}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">No orders assigned yet</Typography>
                </Paper>
              )}
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order Number</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {order.customer.firstName} {order.customer.lastName}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => handleCallCustomer(order.customer.phone)}
                              sx={{ color: '#4CAF50' }}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" color="textSecondary">
                              {order.customer.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{order.deliveryAddress.street}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                          </Typography>
                          {order.deliveryAddress.landmark && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              Near {order.deliveryAddress.landmark}
                            </Typography>
                          )}
                        </Box>
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
                        {order.status === 'out-for-delivery' && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleMarkDelivered(order)}
                            sx={{ bgcolor: '#4CAF50' }}
                          >
                            Mark Delivered
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Available Orders Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableOrders && availableOrders.length > 0 ? (
                availableOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.customer.firstName} {order.customer.lastName}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => handleCallCustomer(order.customer.phone)}
                            sx={{ color: '#4CAF50' }}
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" color="textSecondary">
                            {order.customer.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{order.deliveryAddress.street}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state}
                        </Typography>
                      </Box>
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
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={() => handleAcceptOrder(order)}
                        disabled={acceptOrderMutation.isPending}
                        sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
                      >
                        Accept Order
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary" sx={{ py: 4 }}>
                      No available orders at the moment
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delivered Orders History Tab */}
      {tabValue === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Delivered Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingDelivered || !deliveredOrders ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : deliveredOrders.length > 0 ? (
                deliveredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.customer.firstName} {order.customer.lastName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.customer.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{order.deliveryAddress.street}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>₹{order.pricing.total.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      {order.statusHistory && order.statusHistory.length > 0
                        ? new Date(
                            order.statusHistory
                              .filter((h) => h.status === 'delivered')
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp
                          ).toLocaleDateString()
                        : order.updatedAt
                        ? new Date(order.updatedAt).toLocaleDateString()
                        : new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="textSecondary" sx={{ py: 4 }}>
                      No delivered orders yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Delivery</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark order #{selectedOrder?.orderNumber} as delivered?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelivery}
            variant="contained"
            color="success"
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? 'Updating...' : 'Confirm Delivery'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

