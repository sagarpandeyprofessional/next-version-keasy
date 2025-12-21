import React from 'react';
import { Globe, Linkedin, Mail } from 'lucide-react';
import { link } from 'framer-motion/client';

const TeamMember = ({ name, title, image, delay, website, linkedin, email }) => (
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
        <a href={website} target='_blank' rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <Globe className="w-4 h-4 text-gray-600" />
        </a>
        <a href={`mailto:${email}`} target='_blank' rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <Mail className="w-4 h-4 text-gray-600" />
        </a>
        <a href={linkedin} target='_blank' rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <Linkedin className="w-4 h-4 text-gray-600" />
        </a>
      </div>
    </div>
  </div>
);

export default function TeamPage() {
  const teamMembers = [
    { 
      name: 'Sagar Pandey', 
      title: 'CEO & Founder', 
      image: '/team/sagar_pandey.jpg', 
      website: 'https://www.montemflumen.org/', 
      linkedin: 'https://www.linkedin.com/in/sagar1998m/', 
      email: 'sagar.pandey.professional@gmail.com' 
    },
    { 
      name: 'Firdavs Salokhiddinov', 
      title: 'Co-Founder | AI & Software Engineer', 
      image: '/team/firdavs_salokhiddinov.jpg', 
      website: 'https://firdavssalokhiddinov.github.io/MyPortfolio/', 
      linkedin: 'https://www.linkedin.com/in/firdavs-salokhiddinov-0288b1215/', 
      email: 'firdavssalokhiddinov@gmail.com' 
    }
  ];

  return (
    <>
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16"
            style={{ animation: 'fadeIn 0.8s ease-out' }}
          >
            Meet the team who dares to create differently.
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
            {teamMembers.map((member, index) => (
              <TeamMember 
                key={member.name} 
                {...member} 
                delay={0.1 + (index * 0.1)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}