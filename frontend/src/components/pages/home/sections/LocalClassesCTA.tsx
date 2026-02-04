// @ts-nocheck
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* =============================================================================
   LOCAL CLASSES CTA - Bold, Engaging Banner
   ============================================================================= */

export const LocalClassesCTA = () => {
  return (
    <section className="py-10 bg-[#F8FAFB]">
      <div className="container mx-auto px-[3%]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#9fd6cb] to-[#9fb3c1]"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                {/* <pattern id="circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="white" />
                </pattern> */}
              </defs>
              <rect width="100%" height="100%" fill="url(#circles)" />
            </svg>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center">
            {/* Image */}
            <div className="w-full lg:w-2/5 p-8 lg:p-12">
              <motion.div whileHover={{ scale: 1.02 }} className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/Testimonials/Kevin.svg"
                  alt="Korean Language Class"
                  className="w-full h-[280px] lg:h-[380px] object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop';
                  }}
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <Play className="w-6 h-6 text-[#FF6B6B] ml-1" />
                  </motion.div> */}
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-3/5 p-8 lg:p-12 text-white">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4">
                🎓 Free Korean Language Classes Available
              </span>
              <h3 className="text-3xl lg:text-3xl font-bold mb-4 leading-tight">
                Join Free Korean Classes
                <br /> with Kevin Park
              </h3>
              <p className="text-white/90 text-lg mb-8 max-w-lg">
                Meet fellow community members, learn Korean Language, and participate in volunteer activities. All levels are welcome!
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://invite.kakao.com/tc/zPLgnWBMnk" target="_blank">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white text-[#FF6B6B] rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Join Free Class
                  </motion.button>
                </a>
                <Link href="/community">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Join Community
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
};
