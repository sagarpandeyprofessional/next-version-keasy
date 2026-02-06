import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative z-50 bg-black py-8 text-white lg:px-20 md:px-10">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">About KEasy</h3>
            <p className="text-sm text-gray-300">
              Keasy is a platform designed to help foreigners navigate life in South Korea, providing resources, community, and services.
            </p>

            <div className="mt-6 space-x-4 text-sm">
              <p className="mb-1 max-w-80">MontemFlumen Inc.</p>
              <p className="mb-1 max-w-80">Business Registration: 280-81-04090</p>
              <p className="mb-1 max-w-80">E-Commerce Permit: _____</p>
              <p className="mb-1 max-w-80">CEO: Sagar Pandey</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-300 hover:text-white hover:underline">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/marketplace" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Marketplace Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/membership" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Membership Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/connect" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Connect
                </Link>
              </li>
              <li>
                <Link href="/plans" className="text-sm text-gray-300 hover:text-white hover:underline">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">About us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Address: </li>
              <li className="mb-4 max-w-60">103, 1F, 162 Dongdaejeon-ro, Dong-gu, Daejeon, Republic of Korea</li>
              <li className="gap-10 max-w-60">
                <span>Phone: </span>
                <a href="callto:1096959805" className="hover:text-white hover:underline text-white">
                  +82 10-96959805
                </a>
              </li>
              <li className="gap-10 max-w-60">
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
            &copy; {new Date().getFullYear()} koreaeasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
