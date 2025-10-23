import axios from 'axios';
import type {
  ChatResponse,
  Conversation,
  Document,
  Analytics,
  FlaggedQuery,
  LoginCredentials,
  AuthResponse,
  Feedback,
  DailyStats,
  CountryStats,
  SystemSettings,
  FeedbackInsights,
  GenerateDraftRequest,
  GenerateDraftResponse,
  PendingDraftsResponse,
  DraftDocumentReview,
  DeletedItemsResponse,
  SoftDeleteResponse,
  RecoverResponse,
  PermanentDeleteResponse,
  UpdateConversationRequest,
  UpdateMessageRequest,
  UpdateFeedbackRequest,
  ChatbotConfig,
  ChatbotConfigUpdate,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private api: ReturnType<typeof axios.create>;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        console.error('API Error Response:', error.response);
        console.error('API Error Config:', error.config);

        if (error.response?.status === 401) {
          console.warn('401 Unauthorized - Token may be invalid or expired');
          console.warn('Current path:', window.location.pathname);
          console.warn('Token exists:', !!localStorage.getItem('access_token'));

          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            console.warn('Redirecting to login...');
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Public APIs
  async sendMessage(message: string, sessionId: string): Promise<ChatResponse> {
    const response = await this.api.post('/api/v1/chat/', {
      message,
      session_id: sessionId,
    });
    return response.data;
  }

  async endConversation(sessionId: string): Promise<void> {
    await this.api.post('/api/v1/conversations/end', {
      session_id: sessionId,
    });
  }

  async submitFeedback(feedback: Feedback): Promise<void> {
    await this.api.post('/api/v1/feedback/', feedback);
  }

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // OAuth2 Password Flow expects x-www-form-urlencoded, NOT JSON
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Store token with correct key
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }

    return response.data;
  }

  // Document APIs
  async getDocuments(): Promise<Document[]> {
    const response = await this.api.get('/api/v1/documents/');
    // Backend returns { documents: [...], total: N }
    return response.data.documents || response.data;
  }

  async getDocument(id: string): Promise<Document> {
    const response = await this.api.get(`/api/v1/documents/${id}`);
    return response.data;
  }

  async uploadDocument(file: File, category?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);  // Field name MUST be 'file'
    if (category) {
      formData.append('category', category);
    }

    const response = await this.api.post('/api/v1/documents/upload', formData, {
      headers: {
        // DO NOT set Content-Type - browser sets it with boundary
        'Content-Type': undefined as any,
      },
    });
    // Backend returns { success: true, document: {...} }
    return response.data.document || response.data;
  }

  async addDocumentFromUrl(url: string, category?: string): Promise<Document> {
    // URL endpoint expects form-urlencoded, NOT JSON
    const formData = new URLSearchParams();
    formData.append('url', url);
    if (category) {
      formData.append('category', category);
    }

    const response = await this.api.post('/api/v1/documents/url', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // Backend returns { success: true, document: {...} }
    return response.data.document || response.data;
  }

  async getDocumentContent(id: string): Promise<string> {
    const response = await this.api.get(`/api/v1/documents/${id}/content`);
    return response.data.content;
  }

  async updateDocument(id: string, updates: {
    title?: string;
    content?: string;
    category?: string;
  }): Promise<Document> {
    const response = await this.api.put(`/api/v1/documents/${id}`, updates);
    return response.data.document || response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.api.delete(`/api/v1/documents/${id}`);
  }

  // Conversation APIs
  async getConversations(): Promise<Conversation[]> {
    const response = await this.api.get('/api/v1/conversations/');
    // Backend returns { conversations: [...], total: N }
    return response.data.conversations || response.data;
  }

  async getConversation(id: string): Promise<any> {
    const response = await this.api.get(`/api/v1/conversations/${id}`);
    return response.data;
  }

  // Analytics APIs
  async getAnalytics(): Promise<Analytics> {
    const response = await this.api.get('/api/v1/analytics/');
    return response.data;
  }

  async getFlaggedQueries(params?: {
    rating?: number; // 0 = thumbs down, 1 = thumbs up
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<FlaggedQuery[]> {
    const response = await this.api.get('/api/v1/analytics/flagged', {
      params: params || {},
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // User Management APIs
  async getUsers(): Promise<any[]> {
    const response = await this.api.get('/api/v1/users/');
    return response.data;
  }

  async createUser(userData: {
    email: string;
    password: string;
    full_name?: string;
    is_admin?: boolean;
  }): Promise<any> {
    const response = await this.api.post('/api/v1/users/', userData);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/api/v1/users/${userId}`);
  }

  // New Analytics APIs
  async getDailyStats(startDate: string, endDate: string): Promise<DailyStats[]> {
    const response = await this.api.get('/api/v1/analytics/daily', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.daily_stats || response.data;
  }

  async getCountryStats(startDate?: string, endDate?: string): Promise<CountryStats[]> {
    const response = await this.api.get('/api/v1/analytics/countries', {
      params: startDate && endDate ? { start_date: startDate, end_date: endDate } : {},
    });
    return response.data.country_stats || response.data;
  }

  // System Settings APIs
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await this.api.get('/api/v1/settings/');
    return response.data;
  }

  async updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
    const response = await this.api.put('/api/v1/settings/', settings);
    return response.data;
  }

  // Learning System APIs
  async getFeedbackInsights(startDate?: string, endDate?: string): Promise<FeedbackInsights> {
    const response = await this.api.get('/api/v1/learning/insights', {
      params: startDate && endDate ? { start_date: startDate, end_date: endDate } : {},
    });
    return response.data;
  }

  async generateDraft(request: GenerateDraftRequest): Promise<GenerateDraftResponse> {
    const response = await this.api.post('/api/v1/learning/generate-draft', request);
    return response.data;
  }

  async getPendingDrafts(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PendingDraftsResponse> {
    const response = await this.api.get('/api/v1/learning/drafts', {
      params: params || { status: 'pending', limit: 20, offset: 0 },
    });
    return response.data;
  }

  async approveDraft(draftId: string, review: DraftDocumentReview): Promise<any> {
    const response = await this.api.post(`/api/v1/learning/drafts/${draftId}/approve`, review);
    return response.data;
  }

  async rejectDraft(draftId: string, review: DraftDocumentReview): Promise<any> {
    const response = await this.api.post(`/api/v1/learning/drafts/${draftId}/reject`, review);
    return response.data;
  }

  async updateDraft(draftId: string, updates: {
    title?: string;
    content?: string;
    category?: string;
  }): Promise<any> {
    const response = await this.api.put(`/api/v1/learning/drafts/${draftId}`, updates);
    return response.data;
  }

  async deleteDraft(draftId: string): Promise<any> {
    const response = await this.api.delete(`/api/v1/learning/drafts/${draftId}`);
    return response.data;
  }

  async triggerLearningJob(): Promise<any> {
    const response = await this.api.post('/api/v1/learning/trigger-job');
    return response.data;
  }

  // Soft Delete APIs
  // Soft Delete Operations
  async softDeleteConversation(conversationId: string): Promise<SoftDeleteResponse> {
    const response = await this.api.delete(`/api/v1/soft-delete/conversation/${conversationId}`);
    return response.data;
  }

  async softDeleteMessage(messageId: string): Promise<SoftDeleteResponse> {
    const response = await this.api.delete(`/api/v1/soft-delete/message/${messageId}`);
    return response.data;
  }

  async softDeleteFeedback(feedbackId: string): Promise<SoftDeleteResponse> {
    const response = await this.api.delete(`/api/v1/soft-delete/feedback/${feedbackId}`);
    return response.data;
  }

  async softDeleteDraft(draftId: string): Promise<SoftDeleteResponse> {
    const response = await this.api.delete(`/api/v1/soft-delete/draft/${draftId}`);
    return response.data;
  }

  // Recovery Operations
  async recoverConversation(conversationId: string): Promise<RecoverResponse> {
    const response = await this.api.post(`/api/v1/soft-delete/conversation/${conversationId}/recover`);
    return response.data;
  }

  async recoverMessage(messageId: string): Promise<RecoverResponse> {
    const response = await this.api.post(`/api/v1/soft-delete/message/${messageId}/recover`);
    return response.data;
  }

  async recoverFeedback(feedbackId: string): Promise<RecoverResponse> {
    const response = await this.api.post(`/api/v1/soft-delete/feedback/${feedbackId}/recover`);
    return response.data;
  }

  async recoverDraft(draftId: string): Promise<RecoverResponse> {
    const response = await this.api.post(`/api/v1/soft-delete/draft/${draftId}/recover`);
    return response.data;
  }

  // Permanent Delete Operations
  async permanentDeleteConversation(conversationId: string): Promise<PermanentDeleteResponse> {
    const response = await this.api.delete(`/api/v1/soft-delete/conversation/${conversationId}/permanent?confirm=true`);
    return response.data;
  }

  async permanentDeleteMessage(messageId: string): Promise<PermanentDeleteResponse> {
    const response = await this.api.delete(`/api/v1/soft-delete/message/${messageId}/permanent?confirm=true`);
    return response.data;
  }

  async permanentDeleteFeedback(feedbackId: string): Promise<PermanentDeleteResponse> {
    const response = await this.api.delete(`/api/v1/soft-delete/feedback/${feedbackId}/permanent?confirm=true`);
    return response.data;
  }

  async permanentDeleteDraft(draftId: string): Promise<PermanentDeleteResponse> {
    const response = await this.api.delete(`/api/v1/soft-delete/draft/${draftId}/permanent?confirm=true`);
    return response.data;
  }

  // Update Operations
  async updateConversation(conversationId: string, data: UpdateConversationRequest): Promise<any> {
    const response = await this.api.put(`/api/v1/soft-delete/conversation/${conversationId}`, data);
    return response.data;
  }

  async updateMessage(messageId: string, data: UpdateMessageRequest): Promise<any> {
    const response = await this.api.put(`/api/v1/soft-delete/message/${messageId}`, data);
    return response.data;
  }

  async updateFeedback(feedbackId: string, data: UpdateFeedbackRequest): Promise<any> {
    const response = await this.api.put(`/api/v1/soft-delete/feedback/${feedbackId}`, data);
    return response.data;
  }

  // Get Deleted Items
  async getDeletedItems(params?: {
    item_type?: 'conversation' | 'message' | 'feedback';
    limit?: number;
    offset?: number;
  }): Promise<DeletedItemsResponse> {
    const response = await this.api.get('/api/v1/soft-delete/items', {
      params: params || { limit: 100, offset: 0 },
    });
    return response.data;
  }

  // Manual Cleanup
  async triggerCleanup(): Promise<any> {
    const response = await this.api.post('/api/v1/soft-delete/cleanup');
    return response.data;
  }

  // Widget Settings APIs (Public endpoint for get, Protected for update)
  async getWidgetSettings(): Promise<any> {
    const response = await this.api.get('/api/v1/widget/');
    return response.data;
  }

  async updateWidgetSettings(settings: any): Promise<any> {
    const response = await this.api.put('/api/v1/widget/', settings);
    return response.data;
  }

  async resetWidgetSettings(): Promise<any> {
    const response = await this.api.post('/api/v1/widget/reset');
    return response.data;
  }

  // Chatbot Configuration APIs
  async getChatbotConfig(): Promise<ChatbotConfig> {
    const response = await this.api.get('/api/v1/chatbot-config/');
    return response.data;
  }

  async updateChatbotConfig(updates: ChatbotConfigUpdate): Promise<any> {
    const response = await this.api.put('/api/v1/chatbot-config/', updates);
    return response.data;
  }

  async resetChatbotConfig(): Promise<any> {
    const response = await this.api.post('/api/v1/chatbot-config/reset');
    return response.data;
  }
}

export const apiService = new ApiService();
