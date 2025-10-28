import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as DeployIcon,
  Pause as PauseIcon,
  ContentCopy as CopyIcon,
  BarChart as StatsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Chatbot, ChatbotCreate } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Chatbots = () => {
  const navigate = useNavigate();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [newChatbot, setNewChatbot] = useState<ChatbotCreate>({
    name: '',
    description: '',
    greeting_message: 'Hi! How can I help you today?',
    model_preset: 'balanced',
  });

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Chatbot[]>('/chatbots/');
      setChatbots(data);
    } catch (error: any) {
      console.error('Failed to fetch chatbots:', error);
      toast.error(error.message || 'Failed to load chatbots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newChatbot.name.trim()) {
      toast.error('Please enter a chatbot name');
      return;
    }

    try {
      await apiService.post('/chatbots/', newChatbot);
      toast.success('Chatbot created successfully!');
      setCreateDialogOpen(false);
      setNewChatbot({
        name: '',
        description: '',
        greeting_message: 'Hi! How can I help you today?',
        model_preset: 'balanced',
      });
      fetchChatbots();
    } catch (error: any) {
      console.error('Failed to create chatbot:', error);
      toast.error(error.message || 'Failed to create chatbot');
    }
  };

  const handleDelete = async () => {
    if (!selectedChatbot) return;

    try {
      await apiService.delete(`/chatbots/${selectedChatbot.id}`);
      toast.success('Chatbot deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedChatbot(null);
      fetchChatbots();
    } catch (error: any) {
      console.error('Failed to delete chatbot:', error);
      toast.error(error.message || 'Failed to delete chatbot');
    }
  };

  const handleDeploy = async (chatbot: Chatbot) => {
    const newStatus = chatbot.deploy_status === 'deployed' ? 'paused' : 'deployed';
    try {
      await apiService.post(`/chatbots/${chatbot.id}/deploy`, { deploy_status: newStatus });
      toast.success(`Chatbot ${newStatus === 'deployed' ? 'deployed' : 'paused'} successfully`);
      fetchChatbots();
    } catch (error: any) {
      console.error('Failed to update deploy status:', error);
      toast.error(error.message || 'Failed to update deploy status');
    }
  };

  const handleCopyEmbedCode = async (chatbotId: string) => {
    try {
      const data = await apiService.get<{ embed_code: string }>(`/chatbots/${chatbotId}/embed-code`);
      await navigator.clipboard.writeText(data.embed_code);
      toast.success('Embed code copied to clipboard!');
    } catch (error: any) {
      console.error('Failed to copy embed code:', error);
      toast.error(error.message || 'Failed to copy embed code');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'success';
      case 'paused':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" noWrap>
          {params.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'deploy_status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'model_preset',
      headerName: 'Preset',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'total_conversations',
      headerName: 'Conversations',
      width: 140,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'total_messages',
      headerName: 'Messages',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'avg_satisfaction',
      headerName: 'Satisfaction',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? `${(params.value * 100).toFixed(0)}%` : '—'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const chatbot = params.row as Chatbot;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title={chatbot.deploy_status === 'deployed' ? 'Pause' : 'Deploy'}>
              <IconButton
                size="small"
                color={chatbot.deploy_status === 'deployed' ? 'warning' : 'success'}
                onClick={() => handleDeploy(chatbot)}
              >
                {chatbot.deploy_status === 'deployed' ? <PauseIcon fontSize="small" /> : <DeployIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="View Statistics">
              <IconButton
                size="small"
                color="info"
                onClick={() => navigate(`/admin/chatbots/${chatbot.id}/stats`)}
              >
                <StatsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Embed Code">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleCopyEmbedCode(chatbot.id)}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/admin/chatbots/${chatbot.id}/edit`)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedChatbot(chatbot);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Chatbots
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchChatbots}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Chatbot
          </Button>
        </Box>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Manage your chatbots here. Deploy to make them live, pause for maintenance, or delete when no longer needed.
      </Alert>

      {/* DataGrid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={chatbots}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Chatbot</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Name"
              value={newChatbot.name}
              onChange={(e) => setNewChatbot({ ...newChatbot, name: e.target.value })}
              fullWidth
              required
              helperText="2-100 characters"
            />
            <TextField
              label="Description"
              value={newChatbot.description}
              onChange={(e) => setNewChatbot({ ...newChatbot, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Optional description (max 500 characters)"
            />
            <TextField
              label="Greeting Message"
              value={newChatbot.greeting_message}
              onChange={(e) => setNewChatbot({ ...newChatbot, greeting_message: e.target.value })}
              fullWidth
              helperText="First message shown to users"
            />
            <FormControl fullWidth>
              <InputLabel>Model Preset</InputLabel>
              <Select
                value={newChatbot.model_preset}
                label="Model Preset"
                onChange={(e) => setNewChatbot({ ...newChatbot, model_preset: e.target.value as any })}
              >
                <MenuItem value="fast">Fast (Quick responses)</MenuItem>
                <MenuItem value="balanced">Balanced (Recommended)</MenuItem>
                <MenuItem value="accurate">Accurate (Best quality)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!newChatbot.name.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Chatbot</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The chatbot widget will stop working immediately.
          </Alert>
          <Typography>
            Are you sure you want to delete <strong>{selectedChatbot?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            This will soft-delete the chatbot. Conversation history will be preserved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Chatbots;
