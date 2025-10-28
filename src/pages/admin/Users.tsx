import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User as UserIcon, Mail, Users } from 'lucide-react';
import { apiService } from '../../services/api';
import { Card, Button, Badge } from '../../components/ui';

interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    is_admin: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      const data = await apiService.getUsers();
      console.log('Users loaded:', data);
      // Handle both array and object responses
      const usersList = Array.isArray(data) ? data : (data.users || []);
      setUsers(usersList);
      setError('');
    } catch (err: any) {
      console.error('Users error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setCreating(true);
      setError('');
      await apiService.createUser(formData);
      await loadUsers();
      setShowCreateModal(false);
      setFormData({ email: '', password: '', full_name: '', is_admin: false });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) return;

    try {
      await apiService.deleteUser(userId);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Team Members</h1>
            <p className="text-theme-muted text-sm mt-0.5">Manage dashboard users and permissions</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={<UserPlus size={20} />}
          onClick={() => setShowCreateModal(true)}
        >
          Add User
        </Button>
      </div>

      {error && (
        <Card glass variant="elevated">
          <div className="px-6 py-4 flex items-center gap-3">
            <span className="flex-1 text-red-500">{error}</span>
          </div>
        </Card>
      )}

      {/* Users List */}
      <Card glass variant="elevated" className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-theme-secondary">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-theme-secondary">
            <UserIcon size={48} className="mx-auto mb-4 text-theme-muted" />
            <p>No users yet. Create your first team member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-theme">
              <thead className="bg-theme-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-theme-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-theme-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail size={20} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-theme-primary">
                            {user.full_name || 'No name'}
                          </div>
                          <div className="text-sm text-theme-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <Badge variant="primary" size="sm">
                          <Shield size={14} />
                          <span className="ml-1">Admin</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          <UserIcon size={14} />
                          <span className="ml-1">User</span>
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-muted">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={18} />}
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-red-400 hover:text-red-300"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card glass variant="elevated" className="p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-theme-primary mb-4">Create New User</h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Password * (min 8 characters)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={8}
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={formData.is_admin}
                  onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_admin" className="ml-2 block text-sm text-theme-secondary">
                  Grant admin privileges
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={creating}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ email: '', password: '', full_name: '', is_admin: false });
                    setError('');
                  }}
                  disabled={creating}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
