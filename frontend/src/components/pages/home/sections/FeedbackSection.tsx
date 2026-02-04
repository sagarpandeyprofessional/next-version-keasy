// @ts-nocheck
"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';

import { fadeInUp, staggerContainer } from '../shared';
import { Star } from '../icons';

/* =============================================================================
   FEEDBACK SECTION
   ============================================================================= */

export const FeedbackSection = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const feedbackTypes = [
    { id: 'general', label: 'General', icon: '💬' },
    { id: 'bug', label: 'Bug Report', icon: '🐛' },
    { id: 'feature', label: 'Feature', icon: '✨' },
    { id: 'improvement', label: 'Improve', icon: '🚀' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await supabase.from('feedback').insert([
        {
          rating,
          feedback_type: feedbackType,
          feedback_text: feedback,
          user_id: currentUserId,
        },
      ]);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setFeedback('');
        setFeedbackType('general');
      }, 3000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-[3%] max-w-2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-10"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block px-4 py-2 bg-[#9B59B6]/10 text-[#9B59B6] rounded-full text-sm font-semibold mb-4"
          >
            We Value Your Input
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-[#1A1917] mb-4">
            Share Your <span className="text-[#9B59B6]">Feedback</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#7D786F]">
            Help us make KEasy even better for the community
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

              {/* Feedback Type */}
              <div className="grid grid-cols-4 gap-2">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFeedbackType(type.id)}
                    className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      feedbackType === type.id
                        ? 'bg-[#9B59B6] text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="block text-lg mb-1">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Rating */}
              <div className="text-center">
                <p className="text-sm text-[#7D786F] mb-3">How's your experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || rating) ? 'text-[#FFE66D] fill-[#FFE66D]' : 'text-[#E8E6E1]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts with us..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#9B59B6] outline-none transition-all resize-none text-[#3D3A35] placeholder-gray-400"
              />

              <motion.button
                type="submit"
                disabled={!rating || !feedback.trim() || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 bg-[#9B59B6] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </motion.button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
              <div className="w-16 h-16 bg-[#4ECDC4]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1917] mb-2">Thank You!</h3>
              <p className="text-[#7D786F]">Your feedback helps us improve KEasy</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
