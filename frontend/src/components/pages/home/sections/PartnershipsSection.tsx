// @ts-nocheck
"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const PartnershipsSection = () => {
  const partners = [
    { name: 'The Realtor Guy' },
    { name: 'Woosong University' },
    { name: 'Ws_Phoneshop' },
  ];

  return (
    <section className="keasy-home-font py-12 bg-[#FAFAFA] border-t border-[#E4E4E7]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-8"
        >
          <span className="text-sm text-[#71717A] uppercase tracking-wider font-medium">
            Trusted Partners
          </span>

          <div className="h-px w-12 bg-[#E4E4E7] hidden md:block" />

          <div className="flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner, index) => (
              <span
                key={index}
                className="text-[#71717A] font-medium hover:text-[#18181B] transition-colors"
              >
                {partner.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
