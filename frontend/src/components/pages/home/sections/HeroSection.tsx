// @ts-nocheck
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from '../icons';

export const HeroSection = () => {
  return (
    <section className="keasy-home-font relative min-h-[90vh] flex items-center bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#0066FF] text-sm font-semibold tracking-wide uppercase mb-4">
              Community Platform for Internationals
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0A0A0B] leading-[1.1] tracking-tight mb-6">
              Navigate life in
              <br />
              South Korea with
              <br />
              <span className="text-[#0066FF]">confidence</span>
            </h1>

            <p className="text-lg text-[#71717A] max-w-lg mb-8 leading-relaxed">
              Join 250+ internationals accessing verified guides, professional services,
              and a supportive community to make your transition seamless.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052CC] transition-colors"
                >
                  Get Started Free
                </motion.button>
              </Link>
              <Link href="/guides">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-[#F4F4F5] text-[#18181B] font-semibold rounded-lg hover:bg-[#E4E4E7] transition-colors flex items-center gap-2"
                >
                  Browse Guides
                  <FiArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12">
              <div>
                <p className="text-3xl font-semibold text-[#0A0A0B]">250+</p>
                <p className="text-sm text-[#71717A]">Active Members</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#0A0A0B]">80+</p>
                <p className="text-sm text-[#71717A]">Countries</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#0A0A0B]">50+</p>
                <p className="text-sm text-[#71717A]">Guides</p>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <img
                src="/founder-image.png"
                alt="KEasy Community"
                className="w-full h-[600px] object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=900&fit=crop';
                }}
              />

              {/* Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <p className="text-sm text-[#71717A] mb-2">Featured Member</p>
                <p className="text-[#18181B] font-medium">
                  "KEasy helped me navigate my first months in Korea with confidence."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
