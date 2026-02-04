// @ts-nocheck
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check } from '../icons';

function formatPrice(price) {
  if (price == null) return '';
  return Number(price).toLocaleString('en-US');
}

export const PricingCTASection = ({ currentUserId }) => {
  const router = useRouter();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Essential features to get started',
      features: ['Marketplace access', 'Community forums', 'Job applications', 'Basic AI assistant'],
      highlighted: false,
    },
    {
      id: 'creator',
      name: 'Creator',
      price: 9999,
      description: 'For active community contributors',
      features: ['Extended listings', 'Event creation', 'Community management', 'Priority AI support'],
      highlighted: true,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 19999,
      description: 'For service providers',
      features: ['Professional profile', 'Service listings', 'Booking system', 'Analytics dashboard'],
      highlighted: false,
    },
    {
      id: 'business',
      name: 'Business',
      price: 49999,
      description: 'For organizations',
      features: ['Business profile', 'Job postings', 'Team management', 'Dedicated support'],
      highlighted: false,
    },
  ];

  const handleClick = () => {
    router.push(currentUserId ? '/plans' : '/signup');
  };

  return (
    <section className="keasy-home-font py-20 bg-[#FAFAFA]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#0A0A0B] mb-3">
            Plans & Pricing
          </h2>
          <p className="text-[#71717A] max-w-lg mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={handleClick}
              className={`relative bg-white rounded-lg p-6 cursor-pointer transition-all duration-300 ${
                plan.highlighted
                  ? 'border-2 border-[#0066FF] shadow-lg'
                  : 'border border-[#E4E4E7] hover:border-[#0066FF] hover:shadow-md'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0066FF] text-white text-xs font-medium rounded-full">
                  Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#0A0A0B] mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-[#71717A]">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-semibold text-[#0A0A0B]">
                  {plan.price === 0 ? 'Free' : `₩${formatPrice(plan.price)}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-[#71717A] text-sm">/month</span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#3F3F46]">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-[#0066FF] text-white hover:bg-[#0052CC]'
                    : 'bg-[#F4F4F5] text-[#18181B] hover:bg-[#E4E4E7]'
                }`}
              >
                {plan.id === 'free' ? 'Get Started' : 'Choose Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={handleClick}
            className="text-[#0066FF] font-medium hover:underline"
          >
            Compare all features
          </button>
        </div>
      </div>
    </section>
  );
};
