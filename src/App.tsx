import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import './i18n'; // Initialize i18n

// Eager load critical routes (Home, Login)
import { Home } from './pages/Home';
import { Login } from './pages/Login';

// Lazy load admin routes (code splitting for better performance)
const AnalyticsPage = lazy(() => import('./pages/admin/Analytics'));
const DocumentsPage = lazy(() => import('./pages/admin/Documents'));
const ConversationsPage = lazy(() => import('./pages/admin/Conversations'));
const FlaggedPage = lazy(() => import('./pages/admin/Flagged'));
const UsersPage = lazy(() => import('./pages/admin/Users'));
const WidgetSettingsPage = lazy(() => import('./pages/admin/WidgetSettings'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettings'));
const DeletedItemsPage = lazy(() => import('./pages/admin/DeletedItems'));
const LearningPage = lazy(() => import('./pages/admin/Learning'));
const ChatbotSettings = lazy(() => import('./pages/admin/ChatbotSettings'));
const EmbedPage = lazy(() => import('./pages/Embed'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/embed" element={<EmbedPage />} />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AnalyticsPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="conversations" element={<ConversationsPage />} />
                  <Route path="flagged" element={<FlaggedPage />} />
                  <Route path="learning" element={<LearningPage />} />
                  <Route path="deleted" element={<DeletedItemsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="widget" element={<WidgetSettingsPage />} />
                  <Route path="chatbot" element={<ChatbotSettings />} />
                  <Route path="settings" element={<SystemSettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
