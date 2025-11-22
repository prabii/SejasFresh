import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import {
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  People as UsersIcon,
  AttachMoney as RevenueIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        // Use the dedicated dashboard stats endpoint
        const response = await api.get('/admin/dashboard/stats');
        
        if (response.data.success && response.data.data) {
          return {
            totalOrders: response.data.data.totalOrders || 0,
            totalRevenue: response.data.data.totalRevenue || 0,
            totalProducts: response.data.data.totalProducts || 0,
            totalUsers: response.data.data.totalUsers || 0,
          };
        }
        
        // Fallback: try individual endpoints if dashboard endpoint doesn't exist
        const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
          api.get('/orders/stats'),
          api.get('/admin/products'),
          api.get('/admin/users'),
        ]);

        const ordersData = ordersRes.status === 'fulfilled' 
          ? ordersRes.value.data?.data || ordersRes.value.data 
          : { totalOrders: 0, totalRevenue: 0 };
        
        const productsData = productsRes.status === 'fulfilled' 
          ? productsRes.value.data?.data || productsRes.value.data || []
          : [];
        
        const usersData = usersRes.status === 'fulfilled' 
          ? usersRes.value.data?.data || usersRes.value.data || []
          : [];

        return {
          totalOrders: ordersData.totalOrders || 0,
          totalRevenue: ordersData.totalRevenue || 0,
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        };
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        // Return default values on error
        return {
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          totalUsers: 0,
        };
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Dashboard
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography color="error">
            Error loading dashboard data. Please try again.
          </Typography>
        </Box>
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: <OrdersIcon />, color: '#1976d2' },
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <RevenueIcon />, color: '#2e7d32' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: <ProductsIcon />, color: '#ed6c02' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: <UsersIcon />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4">{card.value}</Typography>
                  </Box>
                  <Box sx={{ color: card.color, fontSize: 48 }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

