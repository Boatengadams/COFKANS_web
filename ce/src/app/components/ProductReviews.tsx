import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ThumbsUp, MessageCircle, User, Calendar, Flag, Edit2, Trash2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreUser } from '@/types/firestore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { sanitizeInput } from '@/services/security-service';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: Timestamp;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  user: FirestoreUser | null;
  onRequireAuth: () => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  user,
  onRequireAuth,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('productId', '==', productId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const sanitizedTitle = sanitizeInput(title);
      const sanitizedComment = sanitizeInput(comment);

      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        rating,
        title: sanitizedTitle,
        comment: sanitizedComment,
        helpful: 0,
        createdAt: serverTimestamp(),
        verified: false,
        status: 'pending',
      });

      toast.success('Review submitted! It will be visible after moderation.');
      setTitle('');
      setComment('');
      setRating(5);
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        helpful: review.helpful + 1,
      });

      toast.success('Thank you for your feedback!');
      fetchReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
      toast.error('Failed to update review');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100
      : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">Customer Reviews</h3>
          <p className="text-[var(--color-text-secondary)] mt-1">{productName}</p>
        </div>
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="text-center">
            <div className="text-5xl font-bold text-[var(--color-text-primary)] mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-[var(--color-border)]'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">Based on {reviews.length} reviews</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{stars}</span>
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                </div>
                <div className="flex-1 h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-[var(--color-text-secondary)] w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]"
          >
            <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Write Your Review</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-[var(--color-border)]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-[var(--color-text-secondary)]">
                    {rating} star{rating !== 1 && 's'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum up your experience in one line"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked or disliked about this product"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  maxLength={500}
                />
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  {comment.length}/500 characters
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setTitle('');
                    setComment('');
                    setRating(5);
                  }}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
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
                    {review.verified && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
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

              <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">{review.title}</h4>
              <p className="text-[var(--color-text-secondary)] mb-4">{review.comment}</p>

              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-[var(--color-surface)] rounded-lg p-12 text-center border border-[var(--color-border)]">
            <MessageCircle className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
            <p className="text-[var(--color-text-secondary)]">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};
