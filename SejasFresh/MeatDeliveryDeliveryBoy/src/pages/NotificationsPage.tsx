import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    screen?: string;
    status?: string;
  };
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);
    
    if (notification.metadata?.orderId) {
      navigate('/orders');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Notifications
        </Typography>
        {unreadNotifications.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<CheckIcon />}
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            Mark All Read
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll see notifications here when new orders are assigned to you
          </Typography>
        </Paper>
      ) : (
        <>
          {unreadNotifications.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Unread ({unreadNotifications.length})
              </Typography>
              <Paper>
                <List>
                  {unreadNotifications.map((notification, index) => (
                    <Box key={notification._id}>
                      <ListItem
                        disablePadding
                        sx={{
                          bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                        }}
                      >
                        <ListItemButton onClick={() => handleNotificationClick(notification)}>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {notification.title}
                                </Typography>
                                {!notification.isRead && (
                                  <Chip
                                    label="New"
                                    color="error"
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  {formatDate(notification.createdAt)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < unreadNotifications.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          {readNotifications.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Read ({readNotifications.length})
              </Typography>
              <Paper>
                <List>
                  {readNotifications.map((notification, index) => (
                    <Box key={notification._id}>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => handleNotificationClick(notification)}>
                          <ListItemText
                            primary={notification.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  {formatDate(notification.createdAt)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < readNotifications.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

