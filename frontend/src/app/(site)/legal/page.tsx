import Link from "next/link";

const legalLinks = [
  {
    title: "Privacy Policy",
    description: "How we collect, use, and protect your data.",
    href: "/legal/privacy",
  },
  {
    title: "Terms of Service",
    description: "Rules and conditions for using Keasy.",
    href: "/legal/terms",
  },
  {
    title: "Marketplace Policy",
    description: "Guidelines for buying and selling in the marketplace.",
    href: "/legal/marketplace",
  },
  {
    title: "Membership Terms",
    description: "Billing, renewals, and membership policies.",
    href: "/legal/membership",
  },
];

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-900">Legal</h1>
          <p className="mt-2 text-gray-600">
            Policies and terms for using Keasy.
          </p>

          <div className="mt-8 space-y-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-2xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition"
              >
                <div className="text-lg font-semibold text-gray-900">{link.title}</div>
                <p className="text-sm text-gray-600 mt-1">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
