// @ts-nocheck
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

function formatPrice(price) {
  if (price == null) return '';
  return Number(price).toLocaleString('en-US');
}

const Plans = () => {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Essential features to get started',
      features: [
        'Marketplace access',
        'Community forums',
        'Job applications',
        'Basic AI assistant',
        'Access to guides',
        'Event discovery',
      ],
      highlighted: false,
    },
    {
      id: 'creator',
      name: 'Creator',
      price: 9999,
      description: 'For active community contributors',
      features: [
        'Everything in Free',
        'Extended marketplace listings',
        'Create unlimited events',
        'Community management tools',
        'Priority AI support',
        'Profile badge',
      ],
      highlighted: true,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 19999,
      description: 'For service providers',
      features: [
        'Everything in Creator',
        'Professional profile page',
        'Service listings',
        'Booking & scheduling',
        'Analytics dashboard',
        'Client management',
      ],
      highlighted: false,
    },
    {
      id: 'business',
      name: 'Business',
      price: 49999,
      description: 'For organizations',
      features: [
        'Everything in Professional',
        'Business profile',
        'Unlimited job postings',
        'Team management',
        'API access',
        'Dedicated support',
      ],
      highlighted: false,
    },
  ];

  const handleSelectPlan = (planId) => {
    if (!currentUserId) {
      router.push('/signup');
      return;
    }

    // Handle plan selection/checkout
    router.push(`/subscription/checkout?plan=${planId}&billing=monthly`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-16 pb-12 bg-[#FAFAFA] border-b border-[#E4E4E7]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-[#0066FF] text-sm font-semibold tracking-wide uppercase mb-4">
              Pricing
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#0A0A0B] mb-4">
              Choose the right plan for you
            </h1>
            <p className="text-[#71717A] text-lg max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include access to our core platform features.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`relative bg-white rounded-lg p-6 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-[#0066FF] shadow-lg'
                    : 'border border-[#E4E4E7] hover:border-[#0066FF] hover:shadow-md'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0066FF] text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-[#0A0A0B] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#71717A]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-semibold text-[#0A0A0B]">
                    {plan.price === 0 ? 'Free' : `₩${formatPrice(plan.price)}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-[#71717A] text-sm">/month</span>
                  )}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 rounded-lg text-sm font-medium transition-colors mb-6 ${
                    plan.highlighted
                      ? 'bg-[#0066FF] text-white hover:bg-[#0052CC]'
                      : 'bg-[#F4F4F5] text-[#18181B] hover:bg-[#E4E4E7]'
                  }`}
                >
                  {plan.id === 'free' ? 'Get Started' : 'Choose Plan'}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#3F3F46]">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Contact Section */}
      <section className="py-16 bg-[#FAFAFA] border-t border-[#E4E4E7]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-[#E4E4E7] rounded-lg p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#0A0A0B] mb-2">
                  Need a custom plan?
                </h3>
                <p className="text-[#71717A]">
                  Contact us for enterprise solutions, custom integrations, or volume pricing.
                </p>
              </div>
              <Link
                href="/contact"
                className="px-6 py-3 bg-[#0A0A0B] text-white font-medium rounded-lg hover:bg-[#18181B] transition-colors whitespace-nowrap"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mt-12">
            <h2 className="text-2xl font-semibold text-[#0A0A0B] mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Can I switch plans later?',
                  a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
                },
                {
                  q: 'Is there a free trial?',
                  a: 'The Free plan gives you access to core features indefinitely. Paid plans can be cancelled anytime.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept major credit cards and Korean payment methods including KakaoPay and Naver Pay.',
                },
                {
                  q: 'Can I get a refund?',
                  a: 'We offer a 7-day refund policy for first-time subscribers. Contact support for assistance.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-[#E4E4E7] rounded-lg p-6"
                >
                  <h4 className="font-medium text-[#0A0A0B] mb-2">{faq.q}</h4>
                  <p className="text-sm text-[#71717A]">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Plans;
