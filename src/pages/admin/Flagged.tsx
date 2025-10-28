import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, AlertCircle, User, Bot, ThumbsDown, ThumbsUp, MessageSquare, Hash, Clock, Lightbulb, Info, Filter, X, Edit, Trash2, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { type FlaggedQuery } from '../../types';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { DateRangePicker } from '../../components/DateRangePicker';
import { Card, Button, Badge } from '../../components/ui';

type RatingFilter = 'all' | 'positive' | 'negative';

export const FlaggedPage: React.FC = () => {
  const [flaggedQueries, setFlaggedQueries] = useState<FlaggedQuery[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<FlaggedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [satisfactionScore, setSatisfactionScore] = useState<number>(0);

  // Filter states
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date(),
  });
  const [showFilters, setShowFilters] = useState(true);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FlaggedQuery | null>(null);
  const [editedRating, setEditedRating] = useState<number>(0);
  const [editedComment, setEditedComment] = useState('');

  useEffect(() => {
    loadFlaggedQueries();
    loadSatisfactionScore();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [flaggedQueries, ratingFilter, dateRange]);

  const loadFlaggedQueries = async () => {
    try {
      setLoading(true);
      console.log('Loading all feedback...');

      // Load all feedback (backend will return all by default if no rating filter)
      const data = await apiService.getFlaggedQueries();
      console.log('Feedback loaded:', data);

      // Handle both array and object responses
      const feedbackList = Array.isArray(data) ? data : (data.flagged_queries || data.queries || []);

      // Debug: Log first item to check field names
      if (feedbackList.length > 0) {
        console.log('First feedback item:', feedbackList[0]);
        console.log('Available fields:', Object.keys(feedbackList[0]));
      }

      setFlaggedQueries(feedbackList);
      setError('');
    } catch (err: any) {
      console.error('Feedback error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const loadSatisfactionScore = async () => {
    try {
      console.log('Loading satisfaction score from analytics...');
      const analytics = await apiService.getAnalytics();
      const avgSatisfaction = analytics?.satisfaction_metrics?.avg_satisfaction || 0;
      setSatisfactionScore(avgSatisfaction * 100);
      console.log('Satisfaction score loaded:', avgSatisfaction * 100);
    } catch (err: any) {
      console.error('Failed to load satisfaction score:', err);
      // Fallback to 0 if analytics fails
      setSatisfactionScore(0);
    }
  };

  const applyFilters = () => {
    let filtered = [...flaggedQueries];

    // Rating filter
    if (ratingFilter === 'positive') {
      filtered = filtered.filter(q => q.rating === 1);
    } else if (ratingFilter === 'negative') {
      filtered = filtered.filter(q => q.rating === 0);
    }

    // Date filter
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter(q => {
      const date = new Date(q.created_at);
      return date >= start && date <= end;
    });

    setFilteredQueries(filtered);
  };

  const clearFilters = () => {
    setRatingFilter('all');
    setDateRange({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });
  };

  const handleEditFeedback = (feedback: FlaggedQuery) => {
    setSelectedFeedback(feedback);
    setEditedRating(feedback.rating);
    setEditedComment(feedback.comment || '');
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!selectedFeedback) return;

    try {
      setProcessingId(selectedFeedback.feedback_id);

      // Use the feedback_id for update operations
      await apiService.updateFeedback(selectedFeedback.feedback_id, {
        rating: editedRating,
        comment: editedComment || undefined,
      });

      await loadFlaggedQueries();
      await loadSatisfactionScore(); // Reload satisfaction score after update
      setShowEditModal(false);
      setSelectedFeedback(null);
      setEditedRating(0);
      setEditedComment('');
      alert('Feedback updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update feedback');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to soft delete this feedback? It can be recovered from the Deleted Items page within 30 days.')) return;

    try {
      setProcessingId(feedbackId);
      await apiService.softDeleteFeedback(feedbackId);
      await loadFlaggedQueries();
      await loadSatisfactionScore(); // Reload satisfaction score after deletion
      alert('Feedback soft-deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete feedback');
    } finally {
      setProcessingId(null);
    }
  };

  // Calculate overall stats from ALL feedback (not filtered)
  const getOverallStats = () => {
    const total = flaggedQueries.length;
    const positive = flaggedQueries.filter(q => q.rating === 1).length;
    const negative = flaggedQueries.filter(q => q.rating === 0).length;
    // Use satisfaction score from analytics (matches Analytics page calculation)
    const positiveRate = satisfactionScore.toFixed(1);

    return { total, positive, negative, positiveRate };
  };

  const stats = getOverallStats();

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
            <Flag className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">User Feedback</h1>
            <p className="text-theme-muted text-sm mt-0.5">Review all user feedback and ratings</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-theme-primary">{stats.positiveRate}%</div>
            <div className="text-xs text-theme-muted">Satisfaction Rate</div>
          </div>
          <div className="h-12 w-px bg-theme-secondary"></div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{stats.positive}</div>
            <div className="text-xs text-theme-muted">Positive</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-400">{stats.negative}</div>
            <div className="text-xs text-theme-muted">Negative</div>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <Card glass variant="elevated">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 py-4 flex items-center gap-3"
            >
              <AlertCircle size={20} className="text-red-500" />
              <span className="flex-1 text-theme-primary">{error}</span>
            </motion.div>
          </Card>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card glass variant="elevated" className="p-6">
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-theme-primary">Filters</h2>
            </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<X size={14} />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-400 hover:text-blue-300"
            >
              {showFilters ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Rating Type
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
                  className={`w-full px-4 py-2.5 bg-theme-secondary border-2 rounded-xl text-theme-primary focus:outline-none focus:ring-2 hover:bg-theme-secondary/80 transition-all ${
                    ratingFilter === 'all'
                      ? 'border-blue-500 focus:ring-blue-500'
                      : ratingFilter === 'positive'
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-red-500 focus:ring-red-500'
                  }`}
                >
                  <option value="all">All Feedback</option>
                  <option value="positive">👍 Positive</option>
                  <option value="negative">👎 Negative</option>
                </select>
              </div>

              {/* Date Range Picker */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Date Range
                </label>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </Card>

      {/* Results Count */}
      {!loading && (
        <motion.div variants={staggerItem} className="text-sm text-theme-muted">
          Showing <span className="font-semibold text-theme-primary">{filteredQueries.length}</span> of{' '}
          <span className="font-semibold text-theme-primary">{flaggedQueries.length}</span> feedback entries
        </motion.div>
      )}

      {/* Feedback List */}
      <Card glass variant="elevated" className="overflow-hidden">
        <motion.div variants={staggerItem}>
        {loading ? (
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
            />
            <p className="text-theme-secondary">Loading feedback...</p>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4"
            >
              <MessageSquare size={40} className="text-purple-600" />
            </motion.div>
            <p className="text-theme-secondary text-lg">
              {flaggedQueries.length === 0 ? 'No feedback yet' : 'No feedback matching filters'}
            </p>
            <p className="text-theme-muted text-sm mt-2">
              {flaggedQueries.length === 0
                ? 'User feedback will appear here once they rate responses'
                : 'Try adjusting your filters to see more results'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-theme">
            <AnimatePresence>
              {filteredQueries.map((query, index) => {
                const isPositive = query.rating === 1;

                return (
                  <motion.div
                    key={query.message_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-theme-secondary transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rating Icon */}
                      <div className="flex-shrink-0">
                        <motion.div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isPositive
                              ? 'bg-gradient-to-br from-green-100 to-emerald-200'
                              : 'bg-gradient-to-br from-red-100 to-red-200'
                          }`}
                          whileHover={{ scale: 1.1, rotate: isPositive ? 15 : -15 }}
                        >
                          {isPositive ? (
                            <ThumbsUp size={24} className="text-green-600" />
                          ) : (
                            <ThumbsDown size={24} className="text-red-600" />
                          )}
                        </motion.div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-theme-muted flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(query.created_at).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isPositive ? 'success' : 'danger'}
                              size="sm"
                            >
                              {isPositive ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                              <span className="ml-1">{isPositive ? 'Helpful' : 'Not Helpful'}</span>
                            </Badge>
                            {/* Action Buttons */}
                            <motion.button
                              onClick={() => handleEditFeedback(query)}
                              disabled={processingId === query.feedback_id}
                              className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit feedback"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {processingId === query.feedback_id ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <Edit size={18} />
                              )}
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteFeedback(query.feedback_id)}
                              disabled={processingId === query.feedback_id}
                              className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete feedback"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </div>

                        {/* User Query */}
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-theme-secondary mb-2 flex items-center gap-1.5">
                            <User size={16} className="text-blue-400" />
                            User Query:
                          </h3>
                          <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                            <p className="text-theme-primary">{query.query}</p>
                          </div>
                        </div>

                        {/* Bot Response */}
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-theme-secondary mb-2 flex items-center gap-1.5">
                            <Bot size={16} className="text-cyan-400" />
                            Bot Response:
                          </h3>
                          <div className="bg-theme-secondary border-l-4 border-theme p-4 rounded-lg">
                            <p className="text-theme-primary">{query.response}</p>
                          </div>
                        </div>

                        {/* User Comment */}
                        {query.comment && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-theme-secondary mb-2 flex items-center gap-1.5">
                              <MessageSquare size={16} className="text-yellow-400" />
                              User Feedback:
                            </h3>
                            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
                              <p className="text-theme-primary italic">"{query.comment}"</p>
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-theme-muted">
                          <span className="flex items-center gap-1">
                            <Hash size={12} />
                            Msg: {query.message_id.substring(0, 8)}...
                          </span>
                          {query.conversation_id && (
                            <span className="flex items-center gap-1">
                              <MessageSquare size={12} />
                              Conv: {query.conversation_id.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        </motion.div>
      </Card>

      {/* Action Items */}
      <AnimatePresence>
        {filteredQueries.length > 0 && (
          <Card glass variant="elevated">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              variants={staggerItem}
              className="p-6"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Lightbulb size={24} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-200 text-lg flex items-center gap-2">
                    <Info size={20} />
                    Insights & Actions
                  </h3>
                  <div className="space-y-2 mt-3">
                    {stats.negative > 0 && (
                      <p className="text-sm text-theme-secondary leading-relaxed">
                        • <strong>{stats.negative} negative feedback entries</strong> - Review these to identify knowledge gaps and improve responses.
                      </p>
                    )}
                    {stats.positive > 0 && (
                      <p className="text-sm text-theme-secondary leading-relaxed">
                        • <strong>{stats.positive} positive feedback entries</strong> - These indicate successful responses. Analyze patterns for best practices.
                      </p>
                    )}
                    <p className="text-sm text-theme-secondary leading-relaxed">
                      • Consider adding more relevant documentation to the knowledge base for queries with negative feedback.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Card>
        )}
      </AnimatePresence>

      {/* Edit Feedback Modal */}
      <AnimatePresence>
        {showEditModal && selectedFeedback && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !processingId && setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-strong max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Edit className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-50">Edit Feedback</h3>
                </div>

                {/* Edit Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Rating
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => setEditedRating(1)}
                        className={`px-4 py-3 rounded-xl border-2 transition-all font-medium flex items-center justify-center gap-2 ${
                          editedRating === 1
                            ? 'border-green-500 bg-green-500/20 text-green-300'
                            : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ThumbsUp size={20} />
                        Helpful
                      </motion.button>
                      <motion.button
                        onClick={() => setEditedRating(0)}
                        className={`px-4 py-3 rounded-xl border-2 transition-all font-medium flex items-center justify-center gap-2 ${
                          editedRating === 0
                            ? 'border-red-500 bg-red-500/20 text-red-300'
                            : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ThumbsDown size={20} />
                        Not Helpful
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      placeholder="User feedback comment..."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={4}
                      disabled={!!processingId}
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Original Query</h4>
                    <p className="text-sm text-slate-400">{selectedFeedback.query}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={submitEdit}
                    disabled={!!processingId}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!processingId ? { scale: 1.02 } : {}}
                    whileTap={!processingId ? { scale: 0.98 } : {}}
                  >
                    {processingId ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <ThumbsUp size={20} />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedFeedback(null);
                      setEditedRating(0);
                      setEditedComment('');
                    }}
                    disabled={!!processingId}
                    className="btn-outline flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50"
                    whileHover={!processingId ? { scale: 1.02 } : {}}
                    whileTap={!processingId ? { scale: 0.98 } : {}}
                  >
                    <X size={20} />
                    Cancel
                  </motion.button>
                </div>

                {/* Metadata Footer */}
                <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-slate-400 space-y-1">
                  <p>Feedback ID: {selectedFeedback.message_id.substring(0, 16)}...</p>
                  <p>Created: {new Date(selectedFeedback.created_at).toLocaleString()}</p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
