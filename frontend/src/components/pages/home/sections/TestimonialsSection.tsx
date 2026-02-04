// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Abhishek Sharma',
      role: 'Graduate Student',
      location: 'Nepal',
      image: '/testimonials/Abhishek.svg',
      quote: "KEasy's guides were invaluable during my first months in Korea. The community support helped me navigate everything from banking to housing.",
    },
    {
      name: 'Nada Hassan',
      role: 'Marketing Professional',
      location: 'Egypt',
      image: '/testimonials/Nada.svg',
      quote: 'I found reliable services and made genuine connections through KEasy. The platform made settling into Korea much smoother than I expected.',
    },
    {
      name: 'Kevin Park',
      role: 'Community Volunteer',
      location: 'Korea',
      image: '/testimonials/Kevin.svg',
      quote: "As a local, I appreciate how KEasy bridges the gap between Koreans and internationals. It's become an essential community resource.",
    },
    {
      name: 'Vedika Patel',
      role: 'Software Engineer',
      location: 'India',
      image: '/testimonials/Vedika.svg',
      quote: 'From job hunting to finding an apartment, KEasy has been my go-to resource. The verified information saves so much time and stress.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const current = testimonials[currentIndex];

  return (
    <section className="keasy-home-font py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#0A0A0B] mb-3">
            Trusted by Internationals
          </h2>
          <p className="text-[#71717A]">
            Hear from our community members
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg p-8 md:p-12"
            >
              <blockquote className="text-lg md:text-xl text-[#18181B] leading-relaxed mb-8 text-center">
                "{current.quote}"
              </blockquote>

              <div className="flex flex-col items-center">
                <img
                  src={current.image}
                  alt={current.name}
                  className="w-14 h-14 rounded-full object-cover mb-4"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${current.name}`;
                  }}
                />
                <p className="font-semibold text-[#0A0A0B]">{current.name}</p>
                <p className="text-sm text-[#71717A]">
                  {current.role} · {current.location}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#0066FF] w-8'
                    : 'bg-[#E4E4E7] w-2 hover:bg-[#A1A1AA]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
