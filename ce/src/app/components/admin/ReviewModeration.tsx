import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  CheckCircle,
  XCircle,
  Star,
  User,
  Calendar,
  Package,
  MessageCircle,
} from 'lucide-react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: any;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = filterStatus === 'all'
        ? query(reviewsRef, orderBy('createdAt', 'desc'))
        : query(reviewsRef, where('status', '==', filterStatus), orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: 'approved',
      });
      toast.success('Review approved!');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: 'rejected',
      });
      toast.success('Review rejected');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Review Moderation</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">Moderate customer product reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">Total Reviews</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Pending</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.pending}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Approved</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.approved}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Rejected</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.rejected}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="all">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{review.userName}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{review.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-[var(--color-border)]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {review.createdAt && format(review.createdAt.toDate(), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">{review.title}</h4>
                  <p className="text-[var(--color-text-secondary)]">{review.comment}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        review.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : review.status === 'approved'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(review.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-[var(--color-surface)] rounded-lg p-12 text-center border border-[var(--color-border)]">
              <MessageCircle className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--color-text-secondary)]">No reviews found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
