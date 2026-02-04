// @ts-nocheck
"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

import { HeroSection } from './home/sections/HeroSection';
import { GuidesSection } from './home/sections/GuidesSection';
import { PricingCTASection } from './home/sections/PricingCTASection';
import { TestimonialsSection } from './home/sections/TestimonialsSection';
import { PartnershipsSection } from './home/sections/PartnershipsSection';
import { AIChatbot } from './home/sections/AIChatbot';

export default function Home() {
  const [guides, setGuides] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: user } = await supabase.auth.getUser();
      setCurrentUserId(user?.user?.id || null);

      const { data: guidesData } = await supabase
        .from('guide')
        .select('id, created_at, name, description, img_url, view')
        .eq('approved', true)
        .order('view', { ascending: false })
        .limit(10);
      setGuides(guidesData || []);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <GuidesSection guides={guides} />
      <PricingCTASection currentUserId={currentUserId} />
      <TestimonialsSection />
      <PartnershipsSection />
      <AIChatbot currentUserId={currentUserId} />
    </div>
  );
}
