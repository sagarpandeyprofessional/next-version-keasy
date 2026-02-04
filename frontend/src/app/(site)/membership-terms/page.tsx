// File path: src/pages/static/policies/MembershipTermsOfService.jsx
// Purpose: Membership Terms of Service page - defines paid membership terms, billing, refunds, and acceptable use
// Connected files: App.jsx (routing), Layout.jsx (page wrapper), Footer.jsx (linked from footer)

import React from 'react';

const MembershipTermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: May 15, 2025</p>

        <div className="prose prose-gray max-w-none">
          {/* Introduction */}
          <p className="text-gray-700 mb-4">
            Keasy Platform is operated by <strong>Montem Flumen Inc.</strong> ("Keasy," "we," "us," or "our").
          </p>

          <p className="text-gray-700 mb-6">
            Keasy offers access to certain premium features, content, tools, programs, and resources through paid memberships (<strong>"Member Services"</strong>).
          </p>

          {/* Agreement Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-gray-700">
              By purchasing or using any Member Service, you agree to these Membership Terms of Service, Keasy's <strong>Terms of Service</strong>, <strong>Privacy Policy</strong>, and any other applicable policies (collectively, the <strong>"Terms"</strong>).
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
            <p className="text-sm text-gray-700">
              If you do not agree to these Terms, you must not use the Member Services.
            </p>
          </div>

          {/* Service Description Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description Summary</h2>
            <div className="bg-gray-100 p-6 rounded">
              <p className="text-gray-700 mb-3">
                <strong>Keasy</strong> is a subscription-based digital platform that provides users with access to online services including community participation, event creation and management, marketplace listings, professional and business profiles, booking tools, and AI-assisted features.
              </p>
              <p className="text-gray-700 mb-3">
                Subscriptions are billed on a recurring basis via credit card. Upon successful payment, users receive immediate access to the features included in their selected membership plan for the duration of the billing cycle.
              </p>
              <p className="text-gray-700">
                Detailed plan features and pricing are displayed on the <a href="/pricing" className="text-blue-600 hover:underline font-medium">Keasy Pricing page</a> prior to payment.
              </p>
            </div>
          </section>

          {/* Billing & Service Period Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Billing & Service Period Summary</h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
              <p className="text-gray-700 mb-3">
                Keasy memberships are provided through <strong>automatic recurring credit card billing (정기결제 / billing payment)</strong>.
              </p>
              <p className="text-gray-700 mb-3">
                Each successful payment grants access to the selected membership plan for <strong>one (1) month</strong>. Subscriptions renew automatically on a monthly basis unless canceled by the user.
              </p>
              <p className="text-gray-700">
                The maximum service provision period per payment does not exceed <strong>twelve (12) months</strong>.
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <nav className="bg-gray-100 p-4 rounded mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contents</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Membership Plans & Fees</li>
              <li>Payment & Billing</li>
              <li>Taxes</li>
              <li>Cancellation Policy</li>
              <li>Refund Policy</li>
              <li>Free Trials (If Offered)</li>
              <li>Acceptable Use & Restrictions</li>
              <li>Suspension & Termination</li>
              <li>Content Availability</li>
              <li>Changes to These Terms</li>
              <li>Communications</li>
              <li>Disclaimer & Limitation of Liability</li>
              <li>Dispute Resolution</li>
              <li>Governing Law</li>
              <li>Contact Information</li>
            </ol>
          </nav>

          {/* Section 1: Membership Plans & Fees */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Membership Plans & Fees</h2>
            <p className="text-gray-700 mb-3">
              Keasy offers free and paid membership plans. Paid memberships are offered on a <strong>monthly recurring subscription basis</strong>. Annual plans, if offered, are billed as monthly installments or as a single payment covering a service period not exceeding twelve (12) months.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Subscriptions begin upon successful payment.</li>
              <li>Recurring subscriptions renew automatically unless canceled.</li>
              <li>Billing occurs on the same calendar day each billing cycle.</li>
              <li>If a billing date does not exist in a given month, billing will occur on the last day of that month.</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Membership services are digital services provided online, and access to paid features may begin immediately upon successful payment.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>Maximum Service Period:</strong> Each payment provides access to the selected membership for one (1) month per billing cycle. The total service provision period per payment does not exceed twelve (12) months.
              </p>
            </div>
          </section>

          {/* Section 2: Payment & Billing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Payment & Billing</h2>
            <p className="text-gray-700 mb-3">
              Keasy accepts payments through supported payment providers, which may include credit/debit cards, local payment services, and third-party processors.
            </p>
            <p className="text-gray-700 mb-3">
              By subscribing, you authorize Keasy to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Charge the payment method on file for recurring fees</li>
              <li>Charge applicable taxes, currency conversion fees, or bank fees where required</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You agree to maintain valid and up-to-date payment information.
            </p>

            <p className="text-gray-700 mb-4">
              Recurring subscriptions are billed automatically via <strong>credit card billing</strong> using authorized payment processors.
            </p>

            <div className="bg-gray-100 p-4 rounded">
              <p className="text-gray-700 mb-2"><strong>Failed Payments</strong></p>
              <p className="text-gray-700 mb-2">If a payment fails:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>We may retry the charge</li>
                <li>Access to paid features may be suspended or downgraded</li>
                <li>After repeated failures, your subscription may be canceled</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Taxes */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Taxes</h2>
            <p className="text-gray-700 mb-3">
              Where required by law, Keasy will collect applicable taxes at checkout.
            </p>
            <p className="text-gray-700">
              You are responsible for any additional taxes, duties, or fees imposed by your jurisdiction.
            </p>
          </section>

          {/* Section 4: Cancellation Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellation Policy</h2>
            <p className="text-gray-700 mb-3">
              You may cancel your membership at any time through your account settings.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Cancellation stops future billing.</li>
              <li>You will retain access until the end of the current billing period.</li>
              <li>Cancellation does not automatically result in a refund for the current period.</li>
            </ul>
          </section>

          {/* Section 5: Refund Policy */}
          <section id="refund-policy" className="mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Policy</h2>
            
            <div className="bg-gray-100 p-3 rounded mb-4">
              <p className="text-sm text-gray-600 italic">
                This section constitutes Keasy's official refund policy for membership services.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">General Rule</h3>
            <p className="text-gray-700 mb-3">
              Membership fees are <strong>non-refundable</strong>, except where required by applicable law or explicitly stated otherwise.
            </p>
            <p className="text-gray-700 mb-4">
              Once access to digital membership services has begun, refunds may be limited or unavailable, except where required by applicable consumer protection laws.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exceptions</h3>
            <p className="text-gray-700 mb-2">Refunds may be granted in the following cases:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Duplicate or erroneous charges</li>
              <li>Unauthorized payments</li>
              <li>Technical failures that prevent reasonable access to paid services</li>
              <li>Where consumer protection laws require refunds (e.g., statutory cooling-off periods)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Refund requests are reviewed on a case-by-case basis and are not guaranteed. <strong>Refund requests must be submitted within 7 days of payment via customer support.</strong>
            </p>

            {/* Cooling-Off Rights */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Cooling-Off Rights (Statutory Right to Withdrawal)</strong>
              </p>
              <p className="text-sm text-gray-700 mb-2">
                In accordance with the Act on Consumer Protection in Electronic Commerce, users may request cancellation (cooling-off) within <strong>seven (7) days</strong> from the date of payment.
              </p>
              <p className="text-sm text-gray-700">
                However, if the provision of digital content or membership benefits has already begun, or if access to paid services has been provided, the right to cooling-off may be restricted as permitted by applicable law.
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>App Store Subscriptions:</strong> If you subscribed via Apple App Store or Google Play, refund requests must be made directly through the respective platform, and their policies apply.
              </p>
            </div>
          </section>

          {/* Section 6: Free Trials */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Free Trials (If Offered)</h2>
            <p className="text-gray-700 mb-3">
              Keasy may offer free trials to eligible users.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Free trials automatically convert to paid subscriptions unless canceled before the trial ends.</li>
              <li>No refunds are issued for charges resulting from failure to cancel a free trial.</li>
            </ul>
          </section>

          {/* Section 7: Acceptable Use & Restrictions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Acceptable Use & Restrictions</h2>
            <p className="text-gray-700 mb-3">You may not:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Share your account or login credentials</li>
              <li>Resell, sublicense, or redistribute Member Services</li>
              <li>Circumvent security or access controls</li>
              <li>Use the platform for unlawful or fraudulent activities</li>
              <li>Misrepresent your identity or location to bypass restrictions</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>Warning:</strong> Violation of these rules may result in suspension or termination without refund.
              </p>
            </div>
          </section>

          {/* Section 8: Suspension & Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Suspension & Termination</h2>
            <p className="text-gray-700 mb-3">Keasy reserves the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Suspend or terminate access to Member Services for violations of these Terms</li>
              <li>Modify or discontinue any membership feature at any time</li>
            </ul>
            <p className="text-gray-700">
              Termination due to policy violations does not entitle you to a refund.
            </p>
          </section>

          {/* Section 9: Content Availability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Content Availability</h2>
            <p className="text-gray-700 mb-3">Some content or features may become unavailable due to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Legal requirements</li>
              <li>Licensing restrictions</li>
              <li>Platform updates or discontinuation</li>
            </ul>
            <p className="text-gray-700">
              Keasy is not liable for content removal or service changes.
            </p>
          </section>

          {/* Section 10: Changes to These Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to These Terms</h2>
            <p className="text-gray-700">
              We may update these Membership Terms from time to time. Continued use of Member Services after changes take effect constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Section 11: Communications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Communications</h2>
            <p className="text-gray-700 mb-3">By using Keasy, you consent to receive:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Service-related communications</li>
              <li>Membership updates</li>
              <li>Promotional emails (you may unsubscribe at any time)</li>
            </ul>
          </section>

          {/* Section 12: Disclaimer & Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Disclaimer & Limitation of Liability</h2>
            <p className="text-gray-700 mb-3">
              Member Services are provided <strong>"as is"</strong> and <strong>"as available."</strong>
            </p>
            <p className="text-gray-700 mb-2">To the maximum extent permitted by law:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Keasy is not liable for indirect, incidental, or consequential damages</li>
              <li>Total liability shall not exceed the amount you paid for the Member Services during the applicable billing period</li>
            </ul>
          </section>

          {/* Section 13: Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
            <p className="text-gray-700 mb-3">
              In the event of a dispute related to Member Services, users agree to first attempt to resolve the issue through good-faith communication with Keasy's support team.
            </p>
            <p className="text-gray-700">
              If the dispute cannot be resolved amicably, it shall be handled in accordance with the governing law specified below.
            </p>
          </section>

          {/* Section 14: Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
            <p className="text-gray-700">
              These Membership Terms are governed by the laws of the <strong>Republic of Korea</strong>, without regard to conflict-of-law principles.
            </p>
          </section>

          {/* Section 15: Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <div className="bg-gray-100 p-6 rounded">
              <p className="text-gray-700 mb-2"><strong>Montem Flumen Inc.</strong></p>
              <p className="text-gray-700 mb-4">Republic of Korea</p>
              <p className="text-gray-700 mb-2">
                📧 Support: <a href="mailto:keasy.contact@gmail.com" className="text-blue-600 hover:underline">keasy.contact@gmail.com</a>
              </p>
              <p className="text-gray-700">
                🌐 Website: <a href="https://koreaeasy.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://koreaeasy.org</a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default MembershipTermsOfService;