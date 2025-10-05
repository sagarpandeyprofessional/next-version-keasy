import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black py-8 text-white">
      <div className="container">
        {/* Instagram carousel placeholder
        <div className="mb-8 overflow-hidden rounded-lg bg-gray-900 p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Follow us on Instagram</h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-32 w-32 flex-shrink-0 rounded-md bg-gray-800"
                aria-label="Instagram post"
              />
            ))}
          </div>
        </div> */}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">About KEasy</h3>
            <p className="text-sm text-gray-300">
              Keasy is a platform designed to help foreigners navigate life in South Korea, providing resources, community, and services.
            </p>

              <div className="mt-6 space-x-4 text-sm">
                <p className='mb-1 max-w-80'>MontemFlumen Inc.</p>
                <p className='mb-1 max-w-80'>Business Registration Number: 280-81-04090</p>
                <p className='mb-1 max-w-80'>CEO & Founder: Sagar Pandey</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-300 hover:text-white hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-300 hover:text-white hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/guides" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Guide
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/nearby" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Nearby Places
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">About us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className=''>Address: </li>
              <li className='mb-4 max-w-60'>66-24 Jayang-dong Dong-gu Daejeon, 34644, Republic of Korea</li>
              <li className='gap-10 max-w-60'>
                <span>Phone: </span>
                <a href="callto:1096959805" className="hover:text-white hover:underline text-white">
                  +82 10-96959805
                </a>
              </li>
              <li className='gap-10 max-w-60'>
                <span>Email: </span>
                <a href="mailto:keasy.contact@gmail.com" className="hover:text-white hover:underline text-white">
                  keasy.contact@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} KEasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
