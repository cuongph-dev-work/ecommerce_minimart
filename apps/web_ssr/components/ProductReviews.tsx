'use client';

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Send, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { reviewsService, type Review } from '../services/reviews.service';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as v from 'valibot';

interface ProductReviewsProps {
  productId: string;
}

const avatarColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { t, i18n } = useTranslation();
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    rating: 5,
    comment: '',
  });
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  // Load initial 5 reviews
  useEffect(() => {
    const abortController = new AbortController();
    
    const loadReviews = async () => {
      try {
        setLoading(true);
        const result = await reviewsService.getByProduct(productId, 1, 5, abortController.signal);
        
        if (!abortController.signal.aborted) {
          setAllReviews(result.reviews);
          setDisplayedReviews(result.reviews);
          setTotalPages(result.pagination.totalPages);
          setCurrentPage(1);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load reviews:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => abortController.abort();
  }, [productId]);

  const loadMoreReviews = async () => {
    if (loadingMore || currentPage >= totalPages) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await reviewsService.getByProduct(productId, nextPage, 5);
      
      setAllReviews(prev => [...prev, ...result.reviews]);
      setDisplayedReviews(prev => [...prev, ...result.reviews]);
      setCurrentPage(nextPage);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load more reviews:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getAverageRating = () => {
    if (allReviews.length === 0) return "0";
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / allReviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    allReviews.forEach((r) => {
      distribution[r.rating - 1]++;
    });
    return distribution.reverse();
  };

  const distribution = getRatingDistribution();
  const avgRating = getAverageRating();

  const getFieldError = (field: string) => {
    return validationErrors.find(err => err.field === field)?.message;
  };

  const getReviewSchema = () => {
    return v.object({
      userName: v.pipe(
        v.string(t('reviews.validation.name_required')),
        v.minLength(1, t('reviews.validation.name_empty')),
        v.maxLength(100, t('reviews.validation.name_max_length'))
      ),
      rating: v.pipe(
        v.number(t('reviews.validation.rating_required')),
        v.minValue(1, t('reviews.validation.rating_min')),
        v.maxValue(5, t('reviews.validation.rating_max'))
      ),
      comment: v.optional(
        v.pipe(
          v.string(),
          v.maxLength(2000, t('reviews.validation.comment_max_length'))
        )
      ),
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const schema = getReviewSchema();
    const result = v.safeParse(schema, formData);

    if (!result.success) {
      const errors: { field: string; message: string }[] = [];
      for (const issue of result.issues) {
        const field = issue.path?.[0]?.key as string;
        if (field) {
          errors.push({ field, message: issue.message });
        }
      }
      setValidationErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await reviewsService.create({
        productId,
        userName: formData.userName,
        rating: formData.rating,
        comment: formData.comment || undefined,
      });
      
      // Reload reviews
      const result = await reviewsService.getByProduct(productId, 1, 5);
      setAllReviews(result.reviews);
      setDisplayedReviews(result.reviews);
      setTotalPages(result.pagination.totalPages);
      setCurrentPage(1);
      
      // Reset form
      setFormData({ userName: '', rating: 5, comment: '' });
      setValidationErrors([]);
      toast.success(t('reviews.submit_success'));
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      // Show error in form instead of toast
      setValidationErrors([{ field: 'submit', message: error?.message || t('reviews.submit_error') }]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const getAvatarColor = (name: string) => {
    const charCode = name.charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
  };

  const getRatingLabel = (rating: number) => {
    return t(`reviews.form.rating_labels.${rating}`) || '';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="md:col-span-2 space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-6">{t('reviews.title')}</h3>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">{avgRating}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= parseFloat(avgRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">{t('reviews.review_count', { count: allReviews.length })}</p>
        </div>

        <div className="md:col-span-2">
          {[5, 4, 3, 2, 1].map((rating, index) => {
            const count = distribution[index];
            const percentage = allReviews.length > 0 
              ? (count / allReviews.length) * 100 
              : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Form */}
      <div className="mb-8 pb-8 border-b">
        <h4 className="text-lg font-semibold mb-4">{t('reviews.write_review')}</h4>
        
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('reviews.form.rating_label')} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= formData.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {getRatingLabel(formData.rating)}
              </span>
            </div>
            {getFieldError('rating') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('rating')}</p>
            )}
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('reviews.form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => {
                setFormData({ ...formData, userName: e.target.value });
                // Clear error when user starts typing
                if (getFieldError('userName')) {
                  setValidationErrors(prev => prev.filter(err => err.field !== 'userName'));
                }
              }}
              placeholder={t('reviews.form.name_placeholder')}
              style={{
                borderWidth: '2px',
                borderColor: getFieldError('userName') ? '#ef4444' : '#d1d5db',
              }}
              className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
              disabled={submitting}
            />
            {getFieldError('userName') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('userName')}</p>
            )}
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('reviews.form.comment_label')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => {
                setFormData({ ...formData, comment: e.target.value });
                // Clear error when user starts typing
                if (getFieldError('comment')) {
                  setValidationErrors(prev => prev.filter(err => err.field !== 'comment'));
                }
              }}
              placeholder={t('reviews.form.comment_placeholder')}
              rows={4}
              style={{
                borderWidth: '2px',
                borderColor: getFieldError('comment') ? '#ef4444' : '#d1d5db',
              }}
              className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all resize-none"
              disabled={submitting}
            />
            {getFieldError('comment') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('comment')}</p>
            )}
          </div>

          {/* Submit Error */}
          {getFieldError('submit') && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{getFieldError('submit')}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Send className="h-4 w-4" />
            {submitting ? t('reviews.submitting') : t('reviews.submit')}
          </button>
        </form>
      </div>

      {/* Review List */}
      {displayedReviews.length > 0 ? (
        <div className="space-y-6">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-b last:border-b-0 pb-6 last:pb-0"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className={`${getAvatarColor(review.userName)} text-white font-semibold`}>
                    {review.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold mb-1">{review.userName}</div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                  )}

                  {review.adminResponse && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{t('reviews.admin_response')}</p>
                      <p className="text-sm text-gray-700">{review.adminResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMoreReviews}
                disabled={loadingMore}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loadingMore ? t('reviews.loading_more') : t('reviews.load_more')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('reviews.no_reviews')}</h4>
          <p className="text-gray-600">{t('reviews.be_first')}</p>
        </div>
      )}
    </div>
  );
}
