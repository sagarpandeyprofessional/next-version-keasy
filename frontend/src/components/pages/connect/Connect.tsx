// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase/client';
import { X, MapPin, Globe, Instagram, Facebook, FileText, ExternalLink, BadgeCheck, Filter, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from 'next/navigation';
import { RiTiktokLine } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";

type FilterType = 'all' | 'professionals' | 'talents' | 'freelancers' | 'projects';

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'talents', label: 'Talents' },
  { value: 'freelancers', label: 'Freelancers' },
  { value: 'projects', label: 'Projects' },
];

export default function Connect() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const filter = searchParams?.get('filter') as FilterType | null;
    if (filter && filterOptions.some(opt => opt.value === filter)) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setIsFilterOpen(false);
  };

  const currentFilterLabel = filterOptions.find(opt => opt.value === activeFilter)?.label || 'All';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-12 pb-8 lg:pt-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
                Connect
              </h1>
              <p className="text-gray-600 max-w-xl">
                Find professionals, talents, freelancers, and project teams ready to collaborate.
              </p>
            </div>

            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-black">{currentFilterLabel}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        activeFilter === option.value
                          ? 'bg-gray-100 text-black font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-16">
        <div className="container mx-auto px-6 space-y-12">
          {(activeFilter === 'all' || activeFilter === 'professionals') && (
            <Professionals isMobile={isMobile} showHeader={activeFilter === 'all'} />
          )}
          {(activeFilter === 'all' || activeFilter === 'talents') && (
            <Talents isMobile={isMobile} showHeader={activeFilter === 'all'} />
          )}
          {(activeFilter === 'all' || activeFilter === 'freelancers') && (
            <Freelancers isMobile={isMobile} showHeader={activeFilter === 'all'} />
          )}
          {(activeFilter === 'all' || activeFilter === 'projects') && (
            <Projects isMobile={isMobile} showHeader={activeFilter === 'all'} />
          )}
        </div>
      </section>
    </div>
  );
}

// Professionals Section
const Professionals = ({ isMobile, showHeader = true }) => {
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [professionalsError, setProfessionalsError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user === undefined) return;
      if (!user || !user.id) {
        setLoadingUserProfile(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('connect_professional')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user profile:', error);
        } else if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      } finally {
        setLoadingUserProfile(false);
      }
    };
    checkUserProfile();
  }, [user]);

  const loadProfessionals = async () => {
    setLoadingProfessionals(true);
    setProfessionalsError(null);
    try {
      const { data, error } = await supabase
        .from('connect_professional')
        .select('*')
        .eq('show', true);
      if (error) {
        setProfessionalsError('Unable to load professionals right now.');
        setProfessionals([]);
      } else {
        setProfessionals(data || []);
      }
    } catch (error) {
      setProfessionalsError('Unable to load professionals right now.');
      setProfessionals([]);
    } finally {
      setLoadingProfessionals(false);
    }
  };

  useEffect(() => {
    loadProfessionals();
  }, []);

  const handleProfileAction = () => {
    if (userProfile) {
      router.push('/connect/professional/edit');
    } else {
      router.push('/connect/professional/new');
    }
  };

  return (
    <div>
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-black">Professionals</h2>
            <p className="text-sm text-gray-600">Verified specialists ready to help</p>
          </div>
          {!loadingUserProfile && user && (
            <button
              onClick={handleProfileAction}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              {userProfile ? 'Edit Profile' : 'Become Professional'}
            </button>
          )}
        </div>
      )}

      {loadingProfessionals ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: isMobile ? 2 : 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-100" />
              <div className="p-4">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : professionalsError ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-4">{professionalsError}</p>
          <button onClick={loadProfessionals} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Try again
          </button>
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No professionals listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onClick={() => setSelectedProfessional(professional.id)}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      <ProfessionalModal
        professionalId={selectedProfessional}
        isOpen={!!selectedProfessional}
        onClose={() => setSelectedProfessional(null)}
        isMobile={isMobile}
      />
    </div>
  );
};

const ProfessionalCard = ({ professional, onClick, isMobile }) => {
  if (isMobile) {
    return (
      <div onClick={onClick} className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden flex items-stretch active:scale-[0.98] transition-all">
        <div className="w-24 h-28 flex-shrink-0">
          <img src={professional.img_url} alt={professional.full_name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-black line-clamp-1">{professional.full_name}</h3>
            {professional.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
          </div>
          <p className="text-xs text-gray-600 line-clamp-1">{professional.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 transition-transform">
      <div className="relative h-40 bg-gray-50">
        <img src={professional.img_url} alt={professional.full_name} className="w-full h-full object-cover" />
        {professional.verified && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-black">Verified</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">{professional.full_name}</h3>
        <p className="text-sm text-gray-600 line-clamp-1">{professional.role}</p>
      </div>
    </div>
  );
};

const ProfessionalModal = ({ professionalId, isOpen, onClose, isMobile }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const fetchProfessional = async () => {
      if (!professionalId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('connect_professional')
        .select('*')
        .eq('id', professionalId)
        .single();
      if (error) {
        console.log(error.message);
      } else {
        setProfessional(data);
      }
      setLoading(false);
    };
    if (isOpen && professionalId) {
      fetchProfessional();
    }
  }, [professionalId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
      if (isMobile) document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(false);
      if (isMobile) document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, isMobile]);

  const extractYouTubeId = (url) => {
    if (!url) return null;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtu.be")) return parsedUrl.pathname.slice(1);
      return parsedUrl.searchParams.get("v");
    } catch { return url; }
  };

  const getIndustryDisplay = (industry) => {
    return industry?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || '';
  };

  const getSocialIcon = (platform) => {
    switch(platform) {
      case 'instagram': return <Instagram className="w-4 h-4 text-gray-500" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-gray-500" />;
      case 'tiktok': return <RiTiktokLine className="w-4 h-4 text-gray-500" />;
      default: return <Globe className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  if (loading || !professional) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-lg p-8 shadow-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-black"></div>
        </div>
      </div>
    );
  }

  const videoId = extractYouTubeId(professional.video_url);
  const hasSocials = professional.socials && Object.keys(professional.socials).length > 0;
  const hasBusinessDocs = professional.business_data_url && professional.business_data_url.length > 0;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50" onClick={handleClose}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} />
        <div
          onClick={(e) => e.stopPropagation()}
          className={`fixed left-0 right-0 bottom-0 bg-white rounded-t-2xl transition-transform duration-300 flex flex-col ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ height: '90vh' }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <button onClick={handleClose} className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 overflow-y-auto">
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
              {professional.show_type === 'video' && videoId ? (
                <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`} title={professional.full_name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
              ) : (
                <img src={professional.banner_url || professional.img_url} alt={professional.full_name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4 mb-5">
                <img src={professional.img_url} alt={professional.full_name} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-black">{professional.full_name}</h2>
                    {professional.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-sm text-gray-600">{professional.role}</p>
                </div>
              </div>
              {professional.quote && (
                <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700 italic">"{professional.quote}"</p>
                </div>
              )}
              {professional.bio && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-black mb-2">About</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{professional.bio}</p>
                </div>
              )}
              {professional.location?.url && professional.location?.title && (
                <a href={professional.location.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-5 text-sm text-black hover:underline">
                  <MapPin className="w-4 h-4" />
                  {professional.location.title}
                </a>
              )}
              {hasSocials && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-black mb-3">Connect</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(professional.socials).map(([platform, url], idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-400">
                        {getSocialIcon(platform)}
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <a href={professional.contact_url} target={professional.contact_type === 'email' ? '_self' : '_blank'} rel="noopener noreferrer" className="block w-full text-center px-4 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800">
                Contact {professional.full_name.split(' ')[0]}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={handleClose}>
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-xl shadow-xl transition-all duration-300 max-w-4xl w-full max-h-[85vh] overflow-hidden ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex h-full max-h-[85vh]">
          <div className="w-2/5 bg-gray-100 flex items-center justify-center p-6">
            {professional.show_type === 'video' && videoId ? (
              <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-black">
                <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`} title={professional.full_name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
              </div>
            ) : (
              <img src={professional.banner_url || professional.img_url} alt={professional.full_name} className="w-full aspect-[3/4] object-cover rounded-lg" />
            )}
          </div>
          <div className="w-3/5 flex flex-col overflow-y-auto">
            <div className="p-6 flex-1">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-semibold text-black">{professional.full_name}</h2>
                  {professional.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                </div>
                <p className="text-gray-600 mb-3">{professional.role}</p>
                <div className="flex flex-wrap gap-2">
                  {professional.experience && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">{professional.experience}+ years</span>
                  )}
                  {professional.industry && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">{getIndustryDisplay(professional.industry)}</span>
                  )}
                </div>
              </div>
              {professional.quote && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 italic">"{professional.quote}"</p>
                </div>
              )}
              {professional.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-black mb-2">About</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{professional.bio}</p>
                </div>
              )}
              {professional.location?.url && professional.location?.title && (
                <a href={professional.location.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mb-6 text-sm text-black hover:underline">
                  <MapPin className="w-4 h-4" />
                  {professional.location.title}
                </a>
              )}
              {hasSocials && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-black mb-3">Connect</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(professional.socials).map(([platform, url], idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-400">
                        {getSocialIcon(platform)}
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {hasBusinessDocs && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-black mb-3">Documents</h3>
                  <div className="space-y-2">
                    {professional.business_data_url.map((doc, idx) => (
                      <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 group">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="flex-1 text-sm text-gray-700">{doc.name}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <a href={professional.contact_url} target={professional.contact_type === 'email' ? '_self' : '_blank'} rel="noopener noreferrer" className="block w-full text-center px-4 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800">
                Contact {professional.full_name.split(' ')[0]}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Talents Section
const Talents = ({ isMobile, showHeader = true }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTalents = async () => {
      try {
        const { data, error } = await supabase
          .from('talents')
          .select('*')
          .eq('status', 'approved');
        if (!error) setTalents(data || []);
      } catch (err) {
        console.error('Error loading talents:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTalents();
  }, []);

  return (
    <div>
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-black">Talents</h2>
            <p className="text-sm text-gray-600">Creators and makers</p>
          </div>
          {user && (
            <button onClick={() => router.push('/talents/new')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800">
              <FiPlus className="w-4 h-4" />
              Become Talent
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: isMobile ? 2 : 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-100" />
              <div className="p-4">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : talents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No talents listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {talents.map((talent) => (
            <div
              key={talent.id}
              onClick={() => router.push(`/talents/${talent.id}`)}
              className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 transition-transform"
            >
              <div className="relative h-40 bg-gray-50">
                <img
                  src={talent.profile_image_url || '/placeholder-avatar.png'}
                  alt={talent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">{talent.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{talent.title || talent.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Freelancers Section
const mockFreelancers = [
  { id: 1, name: "Monica Chen", role: "Financial Advisor", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", rating: 5 },
  { id: 2, name: "Amy Rodriguez", role: "Business Consultant", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop", rating: 5 },
  { id: 3, name: "Eli Thompson", role: "Career Coach", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", rating: 5 },
  { id: 4, name: "David Park", role: "Marketing Strategist", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop", rating: 4.5 },
];

const Freelancers = ({ isMobile, showHeader = true }) => {
  return (
    <div>
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-black">Freelancers</h2>
            <p className="text-sm text-gray-600">Independent talent for short-term work</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {mockFreelancers.map((freelancer) => (
          <div key={freelancer.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="relative h-40 bg-gray-50">
              <img src={freelancer.image} alt={freelancer.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-medium text-black">{freelancer.rating}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">{freelancer.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">{freelancer.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Projects Section
const mockProjects = [
  { id: 1, name: "Startup Accelerator", category: "Business", image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=400&fit=crop", status: "Active" },
  { id: 2, name: "Community Platform", category: "Technology", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop", status: "Recruiting" },
  { id: 3, name: "Creative Studio", category: "Design", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop", status: "Active" },
  { id: 4, name: "Social Impact Fund", category: "Finance", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop", status: "Recruiting" },
];

const Projects = ({ isMobile, showHeader = true }) => {
  return (
    <div>
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-black">Projects</h2>
            <p className="text-sm text-gray-600">Teams looking for collaborators</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {mockProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="relative h-40 bg-gray-50">
              <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-sm">
                <span className={`text-xs font-medium ${project.status === 'Recruiting' ? 'text-green-600' : 'text-black'}`}>
                  {project.status}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">{project.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">{project.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
