"use client";

import { useEffect, useState } from "react";
import { Globe, Linkedin, Mail } from "lucide-react";

type TeamMemberProps = {
  name: string;
  title: string;
  image: string;
  delay: number;
  website: string;
  linkedin: string;
  email: string;
};

type CertificationCardProps = {
  name: string;
  title: string;
  image: string;
  delay: number;
  date: string;
};

// Team Member Component
const TeamMember = ({ name, title, image, delay, website, linkedin, email }: TeamMemberProps) => (
  <div
    className="bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
    style={{ animation: `fadeInUp 0.6s ease-out ${delay}s both` }}
  >
    <div className="aspect-square bg-gray-200">
      <img src={image} alt={name} className="w-full h-full object-cover" />
    </div>
    <div className="p-6 text-center">
      <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-600 mb-4">{title}</p>
      <div className="flex justify-center gap-3">
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Globe className="w-4 h-4 text-gray-600" />
        </a>
        <a href={`mailto:${email}`} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Mail className="w-4 h-4 text-gray-600" />
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Linkedin className="w-4 h-4 text-gray-600" />
        </a>
      </div>
    </div>
  </div>
);

// Team Section Component
const TeamSection = () => {
  const teamMembers = [
    {
      name: "Sagar Pandey",
      title: "CEO & Founder",
      image: "/team/sagar.png",
      website: "https://www.linkedin.com/in/sagaa",
      linkedin: "https://www.linkedin.com/in/sagar1998m",
      email: "sagar.pandey.professional@gmail.com",
    },
    {
      name: "Firdavs Salokhiddinov",
      title: "CTO & Co-Founder",
      image: "/team/fred.png",
      website: "https://firdavssalokhiddinov.github.io/MyPortfolio/",
      linkedin: "https://www.linkedin.com/in/firdavs-salokhiddinov-0288b1215/",
      email: "firdavssalokhiddinov@gmail.com",
    },
    {
      name: "Gevariya Sahil Nandlalbhai",
      title: "AI & Software Engineer",
      image: "/team/sahil.png",
      website: "https://yoosahil06.github.io/Resume/",
      linkedin:
        "https://www.linkedin.com/in/sahil-nandlalbhai-gevariya-98a3163a2?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      email: "sahil.gevariya06@gmail.com ",
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16" style={{ animation: "fadeIn 0.8s ease-out" }}>
          Meet the team who dares to create differently.
        </h1>›

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
          {teamMembers.map((member, index) => (
            <TeamMember key={member.name} {...member} delay={0.1 + index * 0.1} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CertificationCard = ({ name, title, image, delay, date }: CertificationCardProps) => (
  <div className=" rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2" style={{ animation: `fadeInUp 0.6s ease-out ${delay}s both` }}>
    <div className="aspect-square">
      <img src={image} alt={name} className="w-full h-full object-cover" />
    </div>
    <div className=" text-center">
      <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
      <h4 className="text-base font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-4  pb-6">{date}</p>
    </div>
  </div>
);

// Team Section Component
const CertificationSection = () => {
  const certifications = [
    {
      name: "Korea Entreprenuership",
      title: "Foundation(U300+)",
      image: "./u300.png",
      date: "2024",
    },
    {
      name: "Korea Invention",
      title: "Promotion Association",
      image: "./oasis1.svg",
      date: "2024",
    },
    {
      name: "Korea Invention",
      title: "Promotion Association",
      image: "./oasis8.svg",
      date: "2025",
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16" style={{ animation: "fadeIn 0.8s ease-out" }}>
          Certifications & Awards
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
          {certifications.map((cert, index) => (
            <CertificationCard key={cert.name} {...cert} delay={0.1 + index * 0.1} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main About Us Component
const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sections = [
    {
      title: "OUR STORY",
      content: `Moving to a new country is exciting but also overwhelming. As international students and expats ourselves, we faced the confusion, the language barriers, and the struggle to find real help. We searched across Facebook groups, outdated forums, and cluttered platforms that weren't built with us in mind.

So we built something better.

Keasy began with a simple mission: to make life easier, more connected, and more enjoyable for anyone navigating their journey in Korea.`,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    },
    {
      title: "OUR MISSION",
      content: `To help global citizens feel confident, informed, and at home abroad — starting with Korea.

We aim to bring together trustworthy information, real community, and helpful tools so you can navigate life, not just survive it.`,
      image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop",
    },
    {
      title: "WHY WE EXIST",
      content: `There's no reason to go through it alone. Whether you're finding your first home, searching for a job, or just looking for good food — we're here to help. Our platform unifies what's scattered and makes the complicated simple.

Keasy is more than a service — it's a space to belong, grow, and thrive.`,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About Us</h1>
          <p className="text-xl text-gray-700 max-w-3xl">
            We're not just building an app — we're building a home for foreigners in Korea.
          </p>
        </div>

        {/* Content Sections */}
        <div className="mt-16 space-y-16">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-start ${idx % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
              style={{
                animation: `fadeInUp 0.8s ease-out ${0.2 + idx * 0.2}s both`,
              }}
            >
              <div className={`${idx % 2 === 1 ? "lg:col-start-2" : ""} space-y-4`}>
                <div className="inline-block">
                  <h2 className="text-blue-500 font-bold text-sm tracking-wider mb-2">{section.title}</h2>
                  <div className="h-1 w-16 bg-blue-500"></div>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{section.content}</p>
              </div>
              <div className={`${idx % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""} overflow-hidden rounded-lg shadow-lg group`}>
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>

        {/* What Makes Us Different */}
        <div className="mt-16 bg-white rounded-lg p-8 lg:p-12 shadow-sm" style={{ animation: "fadeInUp 0.8s ease-out 1s both" }}>
          <div className="inline-block mb-6">
            <h2 className="text-blue-500 font-bold text-sm tracking-wider mb-2">WHAT MAKES US DIFFERENT</h2>
            <div className="h-1 w-16 bg-blue-500"></div>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-3 text-blue-500">•</span>
              <span>We're foreigner-first — built by people who've lived it.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-blue-500">•</span>
              <span>
                We combine <span className="font-semibold">Community + AI + Real-world Tools</span> in one app.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-blue-500">•</span>
              <span>We care about clarity, connection, and creating real value.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Team Section */}
      <TeamSection />
      <CertificationSection />
    </div>
  );
};

export default AboutUs;
