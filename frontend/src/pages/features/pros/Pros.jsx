import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// Mock data
const talents = [
  {
    id: 1,
    name: "Monica Chen",
    role: "Financial Advisor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    quote: "I have a clear roadmap.",
    description: "Monica has 5 years of experience in financial planning and investment strategy. She's passionate about helping people achieve their financial goals through personalized advice and comprehensive planning.",
    style: ["Analytical", "Patient", "Detail-oriented"]
  },
  {
    id: 2,
    name: "Amy Rodriguez",
    role: "Business Consultant",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    quote: "It's given me a lot of peace and clarity around my finances.",
    description: "Amy specializes in helping small businesses optimize their operations and financial processes. With 8 years of consulting experience, she brings clarity and actionable strategies to complex business challenges.",
    style: ["Strategic", "Supportive", "Results-driven"]
  },
  {
    id: 3,
    name: "Eli Thompson",
    role: "Career Coach",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    quote: "I don't feel like I'm flying by the seat of my pants.",
    description: "Eli helps professionals navigate career transitions and achieve their professional goals. His approach combines practical advice with motivational support to help clients find their true calling.",
    style: ["Motivational", "Empathetic", "Action-oriented"]
  },
  {
    id: 4,
    name: "Kathleen Martinez",
    role: "Life Coach",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    quote: "It has been pivotal with major life decisions.",
    description: "Kathleen specializes in helping individuals make confident decisions during life's major transitions. Her holistic approach integrates personal values with practical goal-setting strategies.",
    style: ["Holistic", "Encouraging", "Insightful"]
  },
  {
    id: 5,
    name: "David Park",
    role: "Marketing Strategist",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    quote: "Transforming brands into market leaders.",
    description: "David has helped over 50 companies scale their marketing efforts. He specializes in digital strategy, content marketing, and brand positioning for growing businesses.",
    style: ["Creative", "Data-driven", "Innovative"]
  },
  {
    id: 6,
    name: "Sarah Johnson",
    role: "Wellness Coach",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    quote: "Health is wealth, and balance is key.",
    description: "Sarah combines nutrition science with mindfulness practices to help clients achieve holistic wellness. Her programs focus on sustainable lifestyle changes rather than quick fixes.",
    style: ["Compassionate", "Knowledgeable", "Balanced"]
  },
  {
    id: 7,
    name: "Michael Lee",
    role: "Tech Consultant",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    quote: "Simplifying technology for everyone.",
    description: "Michael helps businesses adopt new technologies efficiently. With expertise in cloud solutions and digital transformation, he makes complex tech accessible to non-technical teams.",
    style: ["Patient", "Technical", "Pragmatic"]
  },
  {
    id: 8,
    name: "Jessica Brown",
    role: "Real Estate Advisor",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    quote: "Finding your perfect space is my mission.",
    description: "Jessica has guided hundreds of families through the home-buying process. Her market knowledge and negotiation skills help clients find their dream properties at the right price.",
    style: ["Attentive", "Trustworthy", "Proactive"]
  }
];

const ProCard = ({ talent, onClick }) => {
  
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
          <div className="bg-green-400 text-green-900 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
            {talent.quote}
          </div>
          <h3 className="text-white text-lg sm:text-xl font-bold mb-1">{talent.name}</h3>
          <p className="text-white/90 text-sm">{talent.role}</p>
        </div>
        <button className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 5.7a1 1 0 011.4 0l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4-1.4L9.6 10 6.3 6.7a1 1 0 010-1.4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

const ProModal = ({ talent, isOpen, onClose, isMobile }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
      />
      
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white shadow-2xl overflow-hidden transition-all duration-300 ${
          isMobile 
            ? `fixed left-0 right-0 rounded-t-2xl ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`
            : `w-full max-w-4xl mx-4 rounded-2xl ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`
        }`}
        style={isMobile ? { top: '32px', bottom: '-100px' } : { maxHeight: '90vh' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable content */}
        <div className="h-full overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image section */}
            <div className="relative h-64 md:h-full bg-gradient-to-br from-amber-50 to-orange-50">
              <img
                src={talent.image}
                alt={talent.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-green-400 text-green-900 text-sm font-semibold px-4 py-2 rounded-full">
                {talent.quote}
              </div>
            </div>

            {/* Content section */}
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{talent.name}</h2>
              <p className="text-lg text-gray-600 mb-6">{talent.role}</p>
              
              <p className="text-gray-700 leading-relaxed mb-8">
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

              <button className="w-full bg-green-700 text-white py-4 rounded-xl font-semibold hover:bg-green-800 transition-colors shadow-lg">
                Choose {talent.name.split(' ')[0]}
              </button>

              <div className="flex justify-between mt-6 text-sm text-gray-500">
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
    </div>
  );
};

export default function ProShowcase() {
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-15 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            We've helped 2,000+ members reach their goals
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Don't just take it from us. Hear their inspiring stories.*
          </p>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {talents.map((talent) => (
            <ProCard
              key={talent.id}
              talent={talent}
              onClick={() => setSelectedTalent(talent)}
              className="h-[762px] w-[658px]"
            />
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs md:text-sm text-gray-500 mt-12 max-w-4xl mx-auto">
          some text
          </p>
      </div>
      {/* These are current Members we paid in cash for participating in this series. This could create a conflict of interest. Each video is edited to be clear, concise and reflect the experiences of an individual Member, not others, at the time of filming. These testimonials don't guarantee future performance or success.
        </p> */}

      {/* Modal */}
      <ProModal
        talent={selectedTalent}
        isOpen={!!selectedTalent}
        onClose={() => setSelectedTalent(null)}
        isMobile={isMobile}
      />
    </div>
  );
}
