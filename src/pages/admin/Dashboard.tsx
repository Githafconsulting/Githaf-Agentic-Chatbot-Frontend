/**
 * Material UI Dashboard Home Page
 *
 * Main dashboard for Githaforge multi-tenant platform
 * Shows company overview, quick stats, and recent activity
 */
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Description as DocumentIcon,
  QuestionAnswer as ChatIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalChatbots: number;
  totalDocuments: number;
  totalConversations: number;
  monthlyMessages: number;
  maxBots: number;
  maxDocuments: number;
  maxMonthlyMessages: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalChatbots: 0,
    totalDocuments: 0,
    totalConversations: 0,
    monthlyMessages: 0,
    maxBots: 1,
    maxDocuments: 50,
    maxMonthlyMessages: 1000
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // TODO: Call API to fetch dashboard stats
      // const response = await apiService.getDashboardStats();
      // setStats(response);

      // Mock data for now
      setTimeout(() => {
        setStats({
          totalChatbots: 1,
          totalDocuments: 12,
          totalConversations: 245,
          monthlyMessages: 456,
          maxBots: 5,
          maxDocuments: 500,
          maxMonthlyMessages: 10000
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    max,
    icon,
    color,
    onClick
  }: {
    title: string;
    value: number;
    max?: number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }) => {
    const percentage = max ? (value / max) * 100 : 0;

    return (
      <Card
        sx={{
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s',
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: 3
          } : {}
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
              {icon}
            </Avatar>
            {max && (
              <Chip
                label={`${value}/${max}`}
                size="small"
                color={percentage > 80 ? 'error' : percentage > 50 ? 'warning' : 'success'}
              />
            )}
          </Box>

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {value.toLocaleString()}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>

          {max && (
            <Box mt={2}>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: percentage > 80 ? 'error.main' : percentage > 50 ? 'warning.main' : 'success.main'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {percentage.toFixed(0)}% of limit
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's an overview of your chatbots and activity.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <IconButton onClick={fetchDashboardStats}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/chatbots/new')}
            size="large"
          >
            New Chatbot
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Chatbots"
            value={stats.totalChatbots}
            max={stats.maxBots}
            icon={<BotIcon />}
            color="#1976d2"
            onClick={() => navigate('/admin/chatbots')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Knowledge Base Documents"
            value={stats.totalDocuments}
            max={stats.maxDocuments}
            icon={<DocumentIcon />}
            color="#2e7d32"
            onClick={() => navigate('/admin/documents')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Conversations"
            value={stats.totalConversations}
            icon={<ChatIcon />}
            color="#ed6c02"
            onClick={() => navigate('/admin/conversations')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Messages"
            value={stats.monthlyMessages}
            max={stats.maxMonthlyMessages}
            icon={<TrendingIcon />}
            color="#9c27b0"
            onClick={() => navigate('/admin/analytics')}
          />
        </Grid>
      </Grid>

      {/* Quick Actions & Recent Activity */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              <ListItem
                button
                onClick={() => navigate('/admin/chatbots')}
                sx={{ borderRadius: 1, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BotIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Create New Chatbot"
                  secondary="Build and deploy a custom AI assistant"
                />
              </ListItem>

              <ListItem
                button
                onClick={() => navigate('/admin/documents')}
                sx={{ borderRadius: 1, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <DocumentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Upload Documents"
                  secondary="Add knowledge base content for your bots"
                />
              </ListItem>

              <ListItem
                button
                onClick={() => navigate('/admin/settings')}
                sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <SettingsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Company Settings"
                  secondary="Configure your workspace and branding"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              <ListItem>
                <ListItemText
                  primary="Welcome to Githaforge!"
                  secondary="Your multi-tenant chatbot platform is ready"
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItem>

              <Divider component="li" />

              <ListItem>
                <ListItemText
                  primary="Getting Started"
                  secondary="Create your first chatbot to begin serving customers"
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItem>

              <Divider component="li" />

              <ListItem>
                <ListItemText
                  primary="Need Help?"
                  secondary="Check out our documentation or contact support"
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItem>
            </List>

            <Box mt={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/admin/conversations')}
              >
                View All Activity
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
