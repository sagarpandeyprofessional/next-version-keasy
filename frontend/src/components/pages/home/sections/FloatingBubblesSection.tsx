// @ts-nocheck
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { FiArrowRight } from '../icons';

export const FloatingBubblesSection = () => {
  const [topGuides, setTopGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMostViewedGuides = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('guide')
          .select('id, name, view')
          .eq('approved', true)
          .order('view', { ascending: false })
          .limit(8);

        if (!error) setTopGuides(data || []);
      } catch (err) {
        console.error('Error:', err);
      }
      setIsLoading(false);
    };

    fetchMostViewedGuides();
  }, []);

  const fallbackGuides = [
    { id: null, name: 'Bank Account Setup' },
    { id: null, name: 'Finding Apartments' },
    { id: null, name: 'Phone Verification' },
    { id: null, name: 'Healthcare Guide' },
    { id: null, name: 'Transportation' },
    { id: null, name: 'Visa Information' },
    { id: null, name: 'Job Search' },
    { id: null, name: 'Language Learning' },
  ];

  const guides = topGuides.length > 0 ? topGuides : fallbackGuides;

  if (isLoading) {
    return (
      <section className="py-20 bg-[#FAFAFA] border-y border-[#E4E4E7]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="keasy-home-font py-20 bg-[#FAFAFA] border-y border-[#E4E4E7]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div>
            <h2 className="text-2xl font-semibold text-[#0A0A0B] mb-2">
              Popular Topics
            </h2>
            <p className="text-[#71717A]">
              Quick access to our most viewed resources
            </p>
          </div>
          <Link
            href="/guides"
            className="text-[#0066FF] font-medium flex items-center gap-2 hover:underline"
          >
            View all guides
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {guides.map((guide, index) => (
            <motion.div
              key={guide.id || index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={guide.id ? `/guides/guide/${guide.id}` : '/guides'}>
                <div className="bg-white p-4 rounded-lg border border-[#E4E4E7] hover:border-[#0066FF] hover:shadow-sm transition-all cursor-pointer">
                  <p className="text-[#18181B] font-medium text-sm line-clamp-1">
                    {guide.name}
                  </p>
                  {guide.view && (
                    <p className="text-[#A1A1AA] text-xs mt-1">{guide.view} views</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
