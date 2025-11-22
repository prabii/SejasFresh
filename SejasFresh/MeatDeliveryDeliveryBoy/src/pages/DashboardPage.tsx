import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Pending,
  AccessTime,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

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

  const orders = ordersData?.data || [];
  const deliveredCount = ordersData?.stats?.delivered || 0;

  const { data: availableOrders, error: availableOrdersError } = useQuery({
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

  const stats = {
    total: Array.isArray(orders) ? orders.length : 0,
    pending: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'out-for-delivery').length : 0,
    delivered: deliveredCount || 0, // Use count from backend
    preparing: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'preparing').length : 0,
  };
  
  // Debug logging
  console.log('Dashboard Stats:', {
    ordersData,
    orders,
    stats,
    ordersError,
    availableOrdersError,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error messages if API calls failed
  if (ordersError) {
    console.error('Orders error:', ordersError);
  }
  if (availableOrdersError) {
    console.error('Available orders error:', availableOrdersError);
  }

  return (
    <Box>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ mb: 3, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
      >
        Welcome, {user?.firstName}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <LocalShipping sx={{ fontSize: 40, color: '#D13635' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Deliveries
                  </Typography>
                  <Typography variant="h4">{stats.pending}</Typography>
                </Box>
                <AccessTime sx={{ fontSize: 40, color: '#FF9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Preparing
                  </Typography>
                  <Typography variant="h4">{stats.preparing}</Typography>
                </Box>
                <Pending sx={{ fontSize: 40, color: '#2196F3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Delivered
                  </Typography>
                  <Typography variant="h4">{stats.delivered}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#4CAF50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Assigned Orders
            </Typography>
            {orders && orders.length > 0 ? (
              <Box>
                {orders.slice(0, 5).map((order: any) => (
                  <Box key={order._id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body1" fontWeight="bold">
                      Order #{order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status: {order.status} | Total: ₹{order.pricing?.total || 0}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary">No orders assigned yet</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#fff3cd' }}>
            <Typography variant="h6" gutterBottom>
              Available Orders ({availableOrders?.length || 0})
            </Typography>
            {availableOrders && availableOrders.length > 0 ? (
              <Box>
                {availableOrders.slice(0, 5).map((order: any) => (
                  <Box key={order._id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body1" fontWeight="bold">
                      Order #{order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Customer: {order.customer?.firstName} {order.customer?.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total: ₹{order.pricing?.total || 0}
                    </Typography>
                  </Box>
                ))}
                {availableOrders.length > 5 && (
                  <Typography variant="body2" color="primary" sx={{ mt: 2, textAlign: 'center' }}>
                    +{availableOrders.length - 5} more available orders
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography color="textSecondary">No available orders</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

