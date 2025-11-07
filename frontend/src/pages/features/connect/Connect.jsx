import React, { useState, useEffect } from "react";
import { supabase } from '../../../api/supabase-client';
import { X, MapPin, Briefcase, Calendar, Globe, Instagram, Facebook, Video as VideoIcon, FileText, ExternalLink } from "lucide-react";
// Mock data

const id = "0d4d00cd-c74a-4fa7-b47c-f7f39a5647e2"
const talents = [
  {
    id: 1,
    name: "Monica Chen",
    role: "Financial Advisor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    quote: "I have a clear roadmap.",
    description: "Monica has 5 years of experience in financial planning and investment strategy. She's passionate about helping people achieve their financial goals through personalized advice and comprehensive planning.\n\nHer approach focuses on creating customized financial strategies that align with your life goals, whether you're planning for retirement, saving for a major purchase, or building long-term wealth. Monica believes in educating her clients about every aspect of their financial decisions, ensuring they feel confident and empowered.\n\nWith certifications in both CFP and CFA, Monica brings a deep understanding of market dynamics and financial instruments. She has successfully helped over 200 clients optimize their investment portfolios and achieve their financial milestones. Her clients appreciate her ability to break down complex financial concepts into easy-to-understand language.Monica has 5 years of experience in financial planning and investment strategy. She's passionate about helping people achieve their financial goals through personalized advice and comprehensive planning.\n\nHer approach focuses on creating customized financial strategies that align with your life goals, whether you're planning for retirement, saving for a major purchase, or building long-term wealth. Monica believes in educating her clients about every aspect of their financial decisions, ensuring they feel confident and empowered.\n\nWith certifications in both CFP and CFA, Monica brings a deep understanding of market dynamics and financial instruments. She has successfully helped over 200 clients optimize their investment portfolios and achieve their financial milestones. Her clients appreciate her ability to break down complex financial concepts into easy-to-understand language.Monica has 5 years of experience in financial planning and investment strategy. She's passionate about helping people achieve their financial goals through personalized advice and comprehensive planning.\n\nHer approach focuses on creating customized financial strategies that align with your life goals, whether you're planning for retirement, saving for a major purchase, or building long-term wealth. Monica believes in educating her clients about every aspect of their financial decisions, ensuring they feel confident and empowered.\n\nWith certifications in both CFP and CFA, Monica brings a deep understanding of market dynamics and financial instruments. She has successfully helped over 200 clients optimize their investment portfolios and achieve their financial milestones. Her clients appreciate her ability to break down complex financial concepts into easy-to-understand language.Monica has 5 years of experience in financial planning and investment strategy. She's passionate about helping people achieve their financial goals through personalized advice and comprehensive planning.\n\nHer approach focuses on creating customized financial strategies that align with your life goals, whether you're planning for retirement, saving for a major purchase, or building long-term wealth. Monica believes in educating her clients about every aspect of their financial decisions, ensuring they feel confident and empowered.\n\nWith certifications in both CFP and CFA, Monica brings a deep understanding of market dynamics and financial instruments. She has successfully helped over 200 clients optimize their investment portfolios and achieve their financial milestones. Her clients appreciate her ability to break down complex financial concepts into easy-to-understand language.",
    style: ["Analytical", "Patient", "Detail-oriented"],
    video: 'https://www.youtube.com/watch?v=RFgbivd82sQ',
    rating: 5
  },
  {
    id: 2,
    name: "Amy Rodriguez",
    role: "Business Consultant",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    quote: "It's given me a lot of peace and clarity around my finances.",
    description: "Amy specializes in helping small businesses optimize their operations and financial processes. With 8 years of consulting experience, she brings clarity and actionable strategies to complex business challenges.\n\nHer methodology involves deep-dive analysis of business operations, identifying inefficiencies, and implementing sustainable solutions that drive growth. Amy has worked with startups, family businesses, and mid-sized companies across various industries including retail, technology, and healthcare.\n\nWhat sets Amy apart is her hands-on approach. She doesn't just provide recommendations—she works alongside your team to ensure successful implementation. Her clients have reported average revenue increases of 35% within the first year of working together. Amy's expertise spans strategic planning, process optimization, financial management, and team development.",
    style: ["Strategic", "Supportive", "Results-driven"],
    video: 'https://www.youtube.com/watch?v=RFgbivd82sQ',
    rating: 5
  },
  {
    id: 3,
    name: "Eli Thompson",
    role: "Career Coach",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    quote: "I don't feel like I'm flying by the seat of my pants.",
    description: "Eli helps professionals navigate career transitions and achieve their professional goals. His approach combines practical advice with motivational support to help clients find their true calling.\n\nWith a background in HR and organizational psychology, Eli understands the complexities of modern career paths. He specializes in helping mid-career professionals who feel stuck, recent graduates finding their direction, and executives preparing for leadership roles. His coaching program includes personality assessments, skills mapping, industry research, and strategic networking guidance.\n\nEli's clients have successfully transitioned into new industries, negotiated significant salary increases, and launched their own businesses. He provides ongoing support through resume optimization, interview preparation, and personal branding strategies. His holistic approach addresses both professional development and work-life balance, ensuring sustainable career success.",
    style: ["Motivational", "Empathetic", "Action-oriented"],
    video: 'https://www.youtube.com/watch?v=RFgbivd82sQ',
    rating: 5
  },
  {
    id: 4,
    name: "Kathleen Martinez",
    role: "Life Coach",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    quote: "It has been pivotal with major life decisions.",
    description: "Kathleen specializes in helping individuals make confident decisions during life's major transitions. Her holistic approach integrates personal values with practical goal-setting strategies.\n\nWhether you're navigating a career change, relationship transition, relocation, or personal transformation, Kathleen provides the clarity and support you need. Her coaching philosophy centers on self-discovery, helping you identify what truly matters and creating actionable plans to get there.\n\nKathleen combines various methodologies including cognitive behavioral techniques, mindfulness practices, and values-based decision-making frameworks. She has guided hundreds of clients through major life transitions, helping them overcome self-doubt and fear of change. Her sessions create a safe space for exploring difficult emotions while maintaining focus on forward progress.\n\nClients describe Kathleen as intuitive, wise, and incredibly supportive. She has a gift for asking the right questions that lead to breakthrough moments.",
    style: ["Holistic", "Encouraging", "Insightful"],
    video: 'https://www.youtube.com/watch?v=RFgbivd82sQ',
    rating: 5
  },
  {
    id: 5,
    name: "David Park",
    role: "Marketing Strategist",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    quote: "Transforming brands into market leaders.",
    description: "David has helped over 50 companies scale their marketing efforts. He specializes in digital strategy, content marketing, and brand positioning for growing businesses.\n\nHis expertise spans SEO, social media marketing, email campaigns, content strategy, and marketing automation. David believes in data-driven decision making and builds campaigns that deliver measurable ROI. He's particularly skilled at identifying untapped market opportunities and creating strategies to capitalize on them.\n\nDavid's approach starts with deep market research and competitor analysis, followed by developing a unique brand voice and positioning strategy. He then creates integrated marketing campaigns that leverage multiple channels for maximum impact. His clients have experienced average growth rates of 150% in their marketing-driven revenue.\n\nBeyond strategy, David helps build in-house marketing capabilities, training teams and establishing processes that ensure long-term success. He stays ahead of industry trends and continuously adapts strategies to leverage emerging platforms and technologies.",
    style: ["Creative", "Data-driven", "Innovative"],
    video: 'https://www.youtube.com/watch?v=RFgbivd82sQ',
    rating: 5
  },
  {
    id: 6,
    name: "Sarah Johnson",
    role: "Wellness Coach",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    quote: "Health is wealth, and balance is key.",
    description: "Sarah combines nutrition science with mindfulness practices to help clients achieve holistic wellness. Her programs focus on sustainable lifestyle changes rather than quick fixes.\n\nWith a Master's degree in Nutrition and certifications in yoga and meditation instruction, Sarah offers a comprehensive approach to health. She recognizes that true wellness encompasses physical health, mental clarity, emotional balance, and spiritual fulfillment. Her programs are customized to each client's unique needs, preferences, and lifestyle.\n\nSarah specializes in helping busy professionals who struggle to prioritize self-care, individuals recovering from burnout, and anyone seeking to establish healthier habits. Her methodology includes personalized nutrition plans, stress management techniques, movement practices, and sleep optimization strategies.\n\nClients working with Sarah report increased energy levels, better stress management, improved sleep quality, and a more positive relationship with food and exercise. She emphasizes progress over perfection and creates supportive accountability structures that make lasting change achievable.",
    style: ["Compassionate", "Knowledgeable", "Balanced"],
    video: 'https://www.youtube.com/watch?v=RFgbivd82sQ',
    rating: 4.5
  },
  {
    id: 7,
    name: "Michael Lee",
    role: "Tech Consultant",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    quote: "Simplifying technology for everyone.",
    description: "Michael helps businesses adopt new technologies efficiently. With expertise in cloud solutions and digital transformation, he makes complex tech accessible to non-technical teams.\n\nHis consulting practice focuses on helping small to medium-sized businesses leverage technology to improve operations, reduce costs, and scale effectively. Michael specializes in cloud migration, cybersecurity, workflow automation, and software integration. He has successfully guided over 40 companies through digital transformation initiatives.\n\nWhat makes Michael exceptional is his ability to bridge the gap between technical possibilities and business needs. He takes time to understand your operations, pain points, and goals before recommending solutions. His implementations are pragmatic, focusing on tools that deliver immediate value while building toward long-term capabilities.\n\nMichael provides comprehensive support from initial assessment through implementation and training. He ensures your team feels confident using new systems and establishes processes for ongoing optimization. His clients appreciate his patient teaching style and his commitment to making technology an enabler rather than a source of frustration.",
    style: ["Patient", "Technical", "Pragmatic"],
    video: 'https://www.youtube.com/watch?v=RFgbivd82sQ',
    rating: 3
  },
  {
    id: 8,
    name: "Jessica Brown",
    role: "Real Estate Advisor",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    quote: "Finding your perfect space is my mission.",
    description: "Jessica has guided hundreds of families through the home-buying process. Her market knowledge and negotiation skills help clients find their dream properties at the right price.\n\nWith 12 years of experience in residential real estate, Jessica brings deep expertise in market analysis, property valuation, and negotiation strategy. She represents both buyers and sellers, always prioritizing her clients' best interests. Her intimate knowledge of local neighborhoods, school districts, and market trends gives her clients a significant advantage.\n\nJessica's approach is consultative and educational. She takes time to understand your needs, preferences, and constraints before showing properties. For buyers, she guides you through every step from pre-approval to closing. For sellers, she develops comprehensive marketing strategies that showcase your property's best features and attract qualified buyers.\n\nHer clients value her responsiveness, attention to detail, and calm presence during what can be a stressful process. Jessica has consistently ranked in the top 5% of agents in her market and maintains a 98% client satisfaction rate. Many of her clients return to her for future transactions and refer their friends and family.",
    style: ["Attentive", "Trustworthy", "Proactive"],
    video: 'https://www.youtube.com/watch?v=RFgbivd82sQ',
    rating: 3
  }
];

export default function Connect() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('professionals');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-15 pt-4 pb-12 md:pb-16">
        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('professionals')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'professionals'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            Professionals
          </button>
          <button
            onClick={() => setActiveTab('freelancers')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'freelancers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            Freelancers
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            Projects
          </button>
        </div>

        
      </div>
      {/* Persistent structure with dynamic body */}
        <div className="min-h-[400px] transition-all duration-300 pb-10">
          {activeTab === 'professionals' && <Professionals isMobile={isMobile} />}
          {activeTab === 'freelancers' && <Freelancers />}
          {activeTab === 'projects' && <Projects />}
        </div>
    </div>
  );
}

// for professionals (lawyers, real estate agents, consultants).
const Professionals = ({isMobile}) => {
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [professionals, setProfessionals] = useState([])

  // load professionals
  useEffect(() => {
    const getProfessionals = async () => {
      const { data, error } = await supabase
        .from('connect_professional')
        .select('*')
        .eq('show', true);

      if (error) {
        console.error('Error fetching professionals:', error.message);
      } else {
        setProfessionals(data);
        console.log('Fetched professionals:', data);
      }
    };

    getProfessionals();
  }, []);


  return (
    <>
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          We've helped thousands of members reach their goals
        </h1>
        <p className="text-sm md:text-xl text-gray-600">
          Don't just take it from us. Succeed with us!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6  w-full">
        {professionals.map((professional) => (
          <ProfessionalCard
              key={professional.id}
              professional={professional}
              onClick={() => setSelectedProfessional(professional.id)}
              isMobile={isMobile}
            />
        ))}
      </div>

      {/* Modal */}
      <ProfessionalModal
        professionalId={selectedProfessional}
        isOpen={!!selectedProfessional}
        onClose={() => setSelectedProfessional(null)}
        isMobile={isMobile}
      />
    </>
  )
}

const ProfessionalCard = ({ professional, onClick, isMobile }) => {
  // Mobile: Horizontal compact card
  professional.rating = 5
  if (isMobile) {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer rounded-3xl mx-3 overflow-hidden bg-white transition-all duration-300 hover:shadow-lg border-b border-gray-200 h-[140px] flex items-center"
      >
        {/* Left: Profile image */}
        <div className="w-[120px] h-full flex-shrink-0">
          <img
            src={professional.img_url}
            alt={professional.full_name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Right: Info */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-center">
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{professional.full_name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{professional.role}</p>
          <p className="text-sm text-gray-500 italic mb-2 line-clamp-2">"{professional.quote}"</p>
          
          {/* Star rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(professional.rating)
                    ? 'text-yellow-400 fill-current'
                    : star <= professional.rating
                    ? 'text-yellow-400 fill-current opacity-50'
                    : 'text-gray-300 fill-current'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-1 font-medium">{professional.rating}</span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Original card design
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
    >
      <div className="relative aspect-[3/4] w-full">
        <img
          src={professional.img_url}
          alt={professional.full_name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 sm:p-6">
          <div className="bg-blue-700/70 text-white/90 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
            {professional.quote}
          </div>
          
          <h3 className="text-white text-lg sm:text-xl font-bold mb-1">{professional.full_name}</h3>
          <p className="text-white/90 text-sm">{professional.role}</p>
        </div>
        <button className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-none hover:bg-black/10 rounded-full p-2 shadow-lg">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 5.7a1 1 0 011.4 0l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4-1.4L9.6 10 6.3 6.7a1 1 0 010-1.4z"/>
          </svg>
        </button>

        {/* Star rating - Top Right */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1">
          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-gray-900">{professional.rating}</span>
        </div>
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
    // Mock fetch - replace with actual Supabase call
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

      if(error){
        console.log(error.message)
        setLoading(false)
      }
      else{
        setProfessional(data)
        setLoading(false)
      }

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);
  
  

  const extractYouTubeId = (url) => {
    if (!url) return null;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtu.be")) return parsedUrl.pathname.slice(1);
      return parsedUrl.searchParams.get("v");
    } catch {
      return url;
    }
  };

  const getIndustryDisplay = (industry) => {
    return industry?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || '';
  };

  const getSocialIcon = (platform) => {
    switch(platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'tiktok': return <VideoIcon className="w-4 h-4" />;
      case 'website': return <Globe className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;
  
  if (loading || !professional) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const videoId = extractYouTubeId(professional.video_url);
  const hasSocials = professional.socials && Object.keys(professional.socials).length > 0;
  const hasBusinessDocs = professional.business_data_url && professional.business_data_url.length > 0;

  // Mobile layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50" onClick={handleClose}>
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-0'}`} />
        
        <div
          onClick={(e) => e.stopPropagation()}
          className={`fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 flex flex-col ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ height: '85vh' }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <button onClick={handleClose} className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 overflow-y-auto">
            {/* Media Section */}
            <div className="relative aspect-video bg-black overflow-hidden">
              {professional.show_type === 'video' && videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
                  title={professional.full_name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : professional.banner_url ? (
                <img src={professional.banner_url} alt={professional.full_name} className="w-full h-full object-cover" />
              ) : (
                <img src={professional.img_url} alt={professional.full_name} className="w-full h-full object-cover" />
              )}
              
              {professional.quote && (
                <div className="absolute bottom-4 left-4 bg-blue-700/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {professional.quote}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 pb-8">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <img src={professional.img_url} alt={professional.full_name} className="w-20 h-20 rounded-full object-cover shadow-lg" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{professional.full_name}</h2>
                  <div className="flex items-center text-sm text-gray-600 gap-2 mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{professional.role}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {professional.experience}+ years in {getIndustryDisplay(professional.industry)}
                    </span>
                    {professional.verified && (
                      <span className="px-3 py-1.5  text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                        ✓
                      </span>
                     )}
                  </div>
                </div>
                {professional.location?.url  && professional.location?.title && (
                <div className="">
                  <a
                  href={professional.location.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start rounded-4xl p-3 hover:bg-gray-100 transition border-1 border-blue-100/70"
                >
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                </a>
                </div>
              )}
              </div>

              {/* Bio */}
              {professional.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{professional.bio}</p>
                </div>
              )}

              {/* Professional Styles */}
              {professional.style && professional.style.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Professional Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {professional.style.map((item, idx) => (
                      <span key={idx} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 rounded-full text-sm font-medium border border-blue-100">
                        <span className="text-base">{item.emoji}</span>
                        <span>{item.text}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {hasSocials && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Connect</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(professional.socials).map(([platform, url], idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-all"
                      >
                        {getSocialIcon(platform)}
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Documents */}
              {hasBusinessDocs && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Documents</h3>
                  <div className="space-y-2">
                    {professional.business_data_url.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <FileText className="w-5 h-5 text-red-600" />
                        <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">{doc.name}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <a
                href={professional.contact_url}
                target={professional.contact_type === 'email' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Contact {professional.full_name.split(' ')[0]}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="fixed inset-0 z-50" onClick={handleClose}>
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-0'}`} />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 overflow-hidden ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '60%' }}
      >
        <button onClick={handleClose} className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors">
          <X className="w-6 h-6 text-gray-600" />
        </button>

        <div className="h-full overflow-y-auto">
          <div className="p-8 lg:p-12">
            {/* Media Section */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-8">
              {professional.show_type === 'video' && videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
                  title={professional.full_name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : professional.banner_url ? (
                <img src={professional.banner_url} alt={professional.full_name} className="w-full h-full object-cover" />
              ) : (
                <img src={professional.img_url} alt={professional.full_name} className="w-full h-full object-cover" />
              )}
              
              {professional.quote && (
                <div className="absolute bottom-6 left-6 bg-blue-700/80 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                  {professional.quote}
                </div>
              )}
            </div>

            {/* Header */}
            <div className="flex items-start gap-6 mb-8">
              <img src={professional.img_url} alt={professional.full_name} className="w-28 h-28 rounded-full object-cover shadow-lg border-2 border-violet-700/70" />
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{professional.full_name}</h2>
                <div className="flex items-center text-base text-gray-600 gap-2 mb-3">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">{professional.role}</span>
                </div>
                <div className="flex items-center gap-3">
                  {professional.verified && (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      {professional.experience}+ years in {getIndustryDisplay(professional.industry)}
                    </span>
                  )}
                  {professional.verified && (
                      <span className="px-3 py-1.5  text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                        ✓
                      </span>
                  )}
                </div>
              </div>
              {professional.location?.url  && professional.location?.title && (
                <div className="">
                  <a
                  href={professional.location.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start lg:gap-3 bg-none bg-gray-50 rounded-4xl p-4 hover:bg-gray-100 md:hover:bg-blue-700 transition  border border-blue-600/50 md:hover:border-white md:bg-blue-600 lg:bg-white lg:hover:bg-gray-100/50 lg:border-gray-100/50"
                >
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 md:text-white lg:text-blue-600"/>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm mt-0.5 md:hidden lg:block lg:text-blue-600 ">
                      {professional.location.title || 'View on Map'}
                    </p>
                  </div>
                </a>
                </div>
              )}
            </div>

            {/* Bio */}
            {professional.bio && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed">{professional.bio}</p>
              </div>
            )}

            {/* Professional Styles */}
              {professional.style && professional.style.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Style</h3>
                  <div className="flex flex-wrap gap-3">
                    {professional.style.map((item, idx) => (
                      <span key={idx} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 rounded-xl text-sm font-medium border border-blue-100">
                        <span className="text-lg">{item.emoji}</span>
                        <span>{item.text}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Social Links */}
            {hasSocials && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(professional.socials).map(([platform, url], idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all"
                    >
                      {getSocialIcon(platform)}
                      <span className="capitalize">{platform}</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Business Documents */}
            {hasBusinessDocs && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Documents</h3>
                <div className="grid gap-3">
                  {professional.business_data_url.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                    >
                      <FileText className="w-6 h-6 text-red-600" />
                      <span className="flex-1 font-medium text-gray-700 group-hover:text-gray-900">{doc.name}</span>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Button */}
            <a
              href={professional.contact_url}
              target={professional.contact_type === 'email' ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 text-lg"
            >
              Contact {professional.full_name.split(' ')[0]}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// for independent talent.
const Freelancers = ({isMobile}) => {
  const [selectedTalent, setSelectedTalent] = useState(null);
  return (
    <>
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          We've helped thousands of people reach their goals
        </h1>
        <p className="text-sm md:text-xl text-gray-600">
          Don't just take it from us. LEarn with us!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:px-50 md:px-50 w-full">
        {talents.map((talent) => (
          <FreelancerCard
              key={talent.id}
              talent={talent}
              onClick={() => setSelectedTalent(talent)}
              isMobile={isMobile}
            />
        ))}
      </div>

      {/* Modal */}
      <FreelancerModal
        talent={selectedTalent}
        isOpen={!!selectedTalent}
        onClose={() => setSelectedTalent(null)}
        isMobile={isMobile}
      />
    </>
  )
}

const FreelancerCard = ({ talent, onClick, isMobile }) => {
  // Mobile: Horizontal compact card
  if (isMobile) {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer rounded-3xl mx-3 overflow-hidden bg-white transition-all duration-300 hover:shadow-lg border-b border-gray-200 h-[140px] flex items-center"
      >
        {/* Left: Profile image */}
        <div className="w-[120px] h-full flex-shrink-0">
          <img
            src={talent.image}
            alt={talent.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Right: Info */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-center">
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{talent.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{talent.role}</p>
          <p className="text-sm text-gray-500 italic mb-2 line-clamp-2">"{talent.quote}"</p>
          
          {/* Star rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(talent.rating)
                    ? 'text-yellow-400 fill-current'
                    : star <= talent.rating
                    ? 'text-yellow-400 fill-current opacity-50'
                    : 'text-gray-300 fill-current'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-1 font-medium">{talent.rating}</span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Original card design
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
    >
      <div className="relative aspect-[3/4] w-full">
        <img
          src={talent.image}
          alt={talent.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 sm:p-6">
          <div className="bg-blue-700/70 text-white/90 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
            {talent.quote}
          </div>
          
          <h3 className="text-white text-lg sm:text-xl font-bold mb-1">{talent.name}</h3>
          <p className="text-white/90 text-sm">{talent.role}</p>
        </div>
        <button className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-none hover:bg-black/10 rounded-full p-2 shadow-lg">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 5.7a1 1 0 011.4 0l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4-1.4L9.6 10 6.3 6.7a1 1 0 010-1.4z"/>
          </svg>
        </button>

        {/* Star rating - Top Right */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1">
          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-gray-900">{talent.rating}</span>
        </div>
      </div>
    </div>
  );
};

const FreelancerModal = ({ talent, isOpen, onClose, isMobile }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
      // Prevent body scroll on mobile when modal is open
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      setIsAnimating(false);
      if (isMobile) {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  // Mobile layout (80% screen height from bottom)
  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 z-50"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isAnimating ? 'opacity-50' : 'opacity-0'
          }`}
        />
        
        {/* Modal - 80% height from bottom */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 flex flex-col ${
            isAnimating ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: '80vh' }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Video section */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${
                  new URL(talent.video).searchParams.get("v")
                }?autoplay=1&modestbranding=1&rel=0`}
                title={talent.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <div className="absolute bottom-4 left-4 bg-blue-700/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {talent.quote}
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{talent.name}</h2>
              <p className="text-base text-gray-600 mb-5">{talent.role}</p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                {talent.description}
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Style</h3>
                <div className="flex flex-wrap gap-2">
                  {talent.style.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {s === "Supportive" && "👋 "}
                      {s === "Proactive" && "✅ "}
                      {s === "Collaborative" && "🤝 "}
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-lg">
                Choose {talent.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (slides from right, 60% width)
  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
      />
      
      {/* Modal - slides from right */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 overflow-hidden ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '60%' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Scrollable content */}
        <div className="h-full overflow-y-auto">
          <div className="p-8 lg:p-12">
            {/* Video section */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${
                  new URL(talent.video).searchParams.get("v")
                }?autoplay=1&modestbranding=1&rel=0`}
                title={talent.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <div className="absolute bottom-4 left-4 bg-blue-700/70 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                {talent.quote}
              </div>
            </div>


            {/* Content section */}
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{talent.name}</h2>
            <p className="text-lg text-gray-600 mb-8">{talent.role}</p>
            
            <p className="text-gray-700 leading-relaxed mb-8 text-base">
              {talent.description}
            </p>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Style</h3>
              <div className="flex flex-wrap gap-2">
                {talent.style.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {s === "Supportive" && "👋 "}
                    {s === "Proactive" && "✅ "}
                    {s === "Collaborative" && "🤝 "}
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-900/90 transition-colors shadow-lg mb-6">
              Choose {talent.name.split(' ')[0]}
            </button>

            <div className="flex justify-between text-sm text-gray-500">
              <button className="hover:text-gray-700 transition-colors">
                ← Previous
              </button>
              <button className="hover:text-gray-700 transition-colors">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// for business and company-driven initiatives.
const Projects = ({isMobile}) => {
  const [selectedTalent, setSelectedTalent] = useState(null);
  return (
    <>
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          We've helped thousands of people reach their goals
        </h1>
        <p className="text-sm md:text-xl text-gray-600">
          Don't just take it from us. Join to our projects!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {talents.map((talent) => (
          <ProjectCard
              key={talent.id}
              talent={talent}
              onClick={() => setSelectedTalent(talent)}
              isMobile={isMobile}
            />
        ))}
      </div>

      {/* Modal */}
      <ProjectModal
        talent={selectedTalent}
        isOpen={!!selectedTalent}
        onClose={() => setSelectedTalent(null)}
        isMobile={isMobile}
      />
    </>
  )
}

const ProjectCard = ({ talent, onClick, isMobile }) => {
  // Mobile: Horizontal compact card
  if (isMobile) {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer rounded-3xl mx-3 overflow-hidden bg-white transition-all duration-300 hover:shadow-lg border-b border-gray-200 h-[140px] flex items-center"
      >
        {/* Left: Profile image */}
        <div className="w-[120px] h-full flex-shrink-0">
          <img
            src={talent.image}
            alt={talent.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Right: Info */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-center">
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{talent.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{talent.role}</p>
          <p className="text-sm text-gray-500 italic mb-2 line-clamp-2">"{talent.quote}"</p>
          
          {/* Star rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(talent.rating)
                    ? 'text-yellow-400 fill-current'
                    : star <= talent.rating
                    ? 'text-yellow-400 fill-current opacity-50'
                    : 'text-gray-300 fill-current'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-1 font-medium">{talent.rating}</span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Original card design
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
    >
      <div className="relative aspect-[3/4] w-full">
        <img
          src={talent.image}
          alt={talent.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 sm:p-6">
          <div className="bg-blue-700/70 text-white/90 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
            {talent.quote}
          </div>
          
          <h3 className="text-white text-lg sm:text-xl font-bold mb-1">{talent.name}</h3>
          <p className="text-white/90 text-sm">{talent.role}</p>
        </div>
        <button className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-none hover:bg-black/10 rounded-full p-2 shadow-lg">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 5.7a1 1 0 011.4 0l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4-1.4L9.6 10 6.3 6.7a1 1 0 010-1.4z"/>
          </svg>
        </button>

        {/* Star rating - Top Right */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1">
          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-gray-900">{talent.rating}</span>
        </div>
      </div>
    </div>
  );
};

const ProjectModal = ({ talent, isOpen, onClose, isMobile }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
      // Prevent body scroll on mobile when modal is open
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      setIsAnimating(false);
      if (isMobile) {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  // Mobile layout (80% screen height from bottom)
  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 z-50"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isAnimating ? 'opacity-50' : 'opacity-0'
          }`}
        />
        
        {/* Modal - 80% height from bottom */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 flex flex-col ${
            isAnimating ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: '80vh' }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Video section */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${
                  new URL(talent.video).searchParams.get("v")
                }?autoplay=1&modestbranding=1&rel=0`}
                title={talent.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <div className="absolute bottom-4 left-4 bg-blue-700/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {talent.quote}
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{talent.name}</h2>
              <p className="text-base text-gray-600 mb-5">{talent.role}</p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                {talent.description}
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Style</h3>
                <div className="flex flex-wrap gap-2">
                  {talent.style.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {s === "Supportive" && "👋 "}
                      {s === "Proactive" && "✅ "}
                      {s === "Collaborative" && "🤝 "}
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-lg">
                Choose {talent.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (slides from right, 60% width)
  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
      />
      
      {/* Modal - slides from right */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 overflow-hidden ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '60%' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Scrollable content */}
        <div className="h-full overflow-y-auto">
          <div className="p-8 lg:p-12">
            {/* Video section */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${
                  new URL(talent.video).searchParams.get("v")
                }?autoplay=1&modestbranding=1&rel=0`}
                title={talent.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <div className="absolute bottom-4 left-4 bg-blue-700/70 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                {talent.quote}
              </div>
            </div>


            {/* Content section */}
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{talent.name}</h2>
            <p className="text-lg text-gray-600 mb-8">{talent.role}</p>
            
            <p className="text-gray-700 leading-relaxed mb-8 text-base">
              {talent.description}
            </p>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Style</h3>
              <div className="flex flex-wrap gap-2">
                {talent.style.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {s === "Supportive" && "👋 "}
                    {s === "Proactive" && "✅ "}
                    {s === "Collaborative" && "🤝 "}
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-900/90 transition-colors shadow-lg mb-6">
              Choose {talent.name.split(' ')[0]}
            </button>

            <div className="flex justify-between text-sm text-gray-500">
              <button className="hover:text-gray-700 transition-colors">
                ← Previous
              </button>
              <button className="hover:text-gray-700 transition-colors">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};