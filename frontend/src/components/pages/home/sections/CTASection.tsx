// @ts-nocheck
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { FiArrowRight } from '../icons';

/* =============================================================================
   CTA SECTION - Final Push
   ============================================================================= */

export const CTASection = ({ currentUserId }) => {
  return (
    <section className="py-0 pb-20 bg-[#F8FAFB]">
      <div className="container mx-auto px-[3%] bg-[#F8FAFB]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center max-w-3xl mx-auto"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#FFE66D]/30 rounded-full blur-2xl" />

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4ECDC4]/10 text-[#4ECDC4] rounded-full text-sm font-semibold mb-6"
          >
            <span className="w-2 h-2 bg-[#4ECDC4] rounded-full animate-pulse" />
            Join 1,000+ expats already thriving
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1917] mb-6">
            Ready to make Korea
            <br />
            <span className="text-[#FF6B6B]">feel like home?</span>
          </h2>

          <p className="text-xl text-[#7D786F] mb-10 max-w-xl mx-auto">
            Your community is waiting. Join KEasy today and start your journey to a more connected life in Korea.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={currentUserId ? '/community' : '/signup'}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255,107,107,0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="group px-10 py-5 bg-[#FF6B6B] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#FF6B6B]/25 flex items-center gap-3"
              >
                {currentUserId ? 'Go to Community' : 'Join for Free'}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="/guides">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-transparent border-2 border-[#E8E6E1] text-[#3D3A35] rounded-2xl font-semibold text-lg hover:border-[#4ECDC4] hover:text-[#4ECDC4] transition-all"
              >
                Browse Guides
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
