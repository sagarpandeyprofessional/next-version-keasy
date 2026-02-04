// @ts-nocheck
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiEye } from '../icons';

const FeaturedGuide = ({ id, name, description, img_url, view }) => {
  return (
    <Link href={`/guides/guide/${id}`}>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="group grid md:grid-cols-2 gap-8 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg overflow-hidden hover:border-[#0066FF] transition-all"
      >
        <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-[#F4F4F5]">
          {img_url ? (
            <img
              src={img_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full min-h-[240px] flex items-center justify-center bg-[#F4F4F5]">
              <span className="text-[#A1A1AA]">No image</span>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-[#0066FF] text-white text-xs font-medium rounded">
              Featured
            </span>
            <span className="flex items-center gap-1 text-[#71717A] text-sm">
              <FiEye className="w-4 h-4" />
              {view || 0} views
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-semibold text-[#0A0A0B] mb-3 group-hover:text-[#0066FF] transition-colors line-clamp-2">
            {name}
          </h3>

          <p className="text-[#71717A] mb-6 line-clamp-3 leading-relaxed">
            {description || 'Learn essential tips for living in Korea.'}
          </p>

          <span className="text-[#0066FF] font-medium flex items-center gap-2">
            Read guide
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </motion.article>
    </Link>
  );
};

const GuideCard = ({ id, name, view, index }) => {
  return (
    <Link href={`/guides/guide/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group flex items-center justify-between p-4 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#0066FF] hover:bg-[#FAFAFA] transition-all"
      >
        <span className="text-[#18181B] font-medium group-hover:text-[#0066FF] transition-colors line-clamp-1 flex-1 mr-4">
          {name}
        </span>
        <span className="text-[#A1A1AA] text-sm whitespace-nowrap">
          {view || 0} views
        </span>
      </motion.div>
    </Link>
  );
};

export const GuidesSection = ({ guides }) => {
  const allGuides = guides || [];
  const featuredGuide = allGuides[0];
  const otherGuides = allGuides.slice(1, 9);

  return (
    <section className="keasy-home-font py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-semibold text-[#0A0A0B] mb-3">
              Guides & Resources
            </h2>
            <p className="text-[#71717A] max-w-xl">
              Comprehensive guides created by our community to help you navigate life in Korea.
            </p>
          </div>
          <Link
            href="/guides"
            className="text-[#0066FF] font-medium flex items-center gap-2 hover:underline whitespace-nowrap"
          >
            Browse all guides
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Guide - Takes 2 columns */}
          <div className="lg:col-span-2">
            {featuredGuide && <FeaturedGuide {...featuredGuide} />}
          </div>

          {/* Guide List - 1 column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#71717A] uppercase tracking-wider mb-4">
              Most Viewed
            </h3>
            {otherGuides.map((guide, index) => (
              <GuideCard key={guide.id} {...guide} index={index} />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {allGuides.length === 0 && (
          <div className="text-center py-16 text-[#71717A]">
            <p>No guides available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};
