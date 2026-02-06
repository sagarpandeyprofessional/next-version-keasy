const MarketplacePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace Policy & FAQ</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: December 2025</p>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 mb-6">
            This Marketplace Policy explains the rules, guidelines, and procedures for using the <strong>KoreaEasy (KEASY)</strong> used goods marketplace. By using our marketplace services, you agree to comply with this policy.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> KoreaEasy (KEASY) operates as a communications sales intermediary (통신판매중개자) and is not a party to transactions between buyers and sellers. Responsibility for products, product information, and transactions lies solely with the transaction parties.
            </p>
          </div>

          <nav className="bg-gray-100 p-4 rounded mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contents</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Account Verification</li>
              <li>Seller Obligations</li>
              <li>Buyer Obligations</li>
              <li>Prohibited Items</li>
              <li>Allowed Categories</li>
              <li>Fees & Payment Methods</li>
              <li>Dispute Resolution</li>
              <li>User Trust & Rating System</li>
              <li>Account Restrictions & Penalties</li>
              <li>Safe Transaction Tips</li>
              <li>Privacy & Data Protection</li>
              <li>Community Guidelines</li>
              <li>Contact Information</li>
            </ol>
          </nav>

          {/* Section 1: Account Verification */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Account Verification</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Identity Verification</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Required for sellers listing items or buyers completing 3 or more purchases</li>
              <li>Must be verified via a mobile phone registered under the user's legal name</li>
              <li>Membership information must match the verified name</li>
              <li>Users must be at least <strong>14 years old</strong> to create an account (Korean Youth Protection Act)</li>
              <li>Users under 19 years old require parental consent for certain transactions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Mobile Phone Verification</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Re-verification required every 3 months or when the phone number changes</li>
              <li>Must use a reachable number (user or trusted acquaintance)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3 Business Seller Registration</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Registered businesses may sell on KEASY with valid business registration</li>
              <li>Business sellers must provide: Business registration number, representative name, and business address</li>
              <li>Business sellers are subject to additional compliance requirements under Korean e-commerce laws</li>
            </ul>
          </section>

          {/* Section 2: Seller Obligations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Seller Obligations</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Listing Items for Sale</h3>
            
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Safe Transaction Listings</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>One item per sale post; multiple items or duplicate listings for the same item are prohibited</li>
              <li>Maximum of three listings of the same model within one hour</li>
              <li>Sellers are fully responsible for the accuracy and completeness of the product description (including condition, defects, scratches, usage history, etc.)</li>
              <li>No compensation may be claimed by the seller for differences in value upon return</li>
              <li>Photos must reflect the actual item for sale; duplicates or stock images are prohibited</li>
              <li>Discrepancies between description/photos and actual condition resulting in return are fully the seller's responsibility</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mb-2">Direct Transaction Listings</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Maximum of three listings per day (including Safe Transaction listings)</li>
              <li>Direct transactions (contact seller) are conducted at users' own risk without KEASY escrow protection</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Posting contact information (phone, email, KakaoTalk ID) in listing descriptions or directing transactions outside KEASY is <strong>prohibited</strong> and may result in account suspension.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Photo Upload & Storage</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Upload clear, well-lit photos showing the actual item from multiple angles</li>
              <li>Include photos of any defects, scratches, or damage</li>
              <li>Minimum 3 photos required; up to 10 photos allowed per listing</li>
              <li>Keep original photos as records in case of disputes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Shipping Requirements</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Tracking number must be entered within 2 business days of payment confirmation</li>
              <li>Failure to enter tracking number by 21:00 on the next business day results in automatic cancellation and buyer refund</li>
              <li>Photograph and/or video record the item and packaging before shipping</li>
              <li>If the package is lost before delivery, the seller must file a claim with the courier and refund the buyer</li>
            </ul>
          </section>

          {/* Section 3: Buyer Obligations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Buyer Obligations</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Purchase & Inspection</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Review all photos and descriptions carefully before purchasing</li>
              <li>Upon receiving the item, inspect it immediately</li>
              <li>Record the unboxing with photos or video as evidence in case of disputes</li>
              <li><strong>Purchase decision period:</strong> 4 business days from tracking number registration</li>
              <li>If no action is taken within 4 business days, the purchase is automatically confirmed and payment is released to the seller</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Returns & Refunds</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Returns are allowed within the purchase decision period (7 business days)</li>
              <li><strong>Buyer's remorse (change of mind):</strong> Buyer pays round-trip shipping costs</li>
              <li><strong>Seller's fault (item not as described, defective):</strong> Seller pays round-trip shipping costs</li>
              <li>Items must be returned in original condition. Additional charges may apply for damage caused by the buyer</li>
            </ul>
          </section>

          {/* Section 4: Prohibited Items */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Items</h2>
            <p className="text-gray-700 mb-4">The following items are <strong>strictly prohibited</strong> from being listed on KEASY:</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Weapons & Ammunition</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Firearms, knives, swords, pepper spray, tasers, ammunition</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Drugs & Paraphernalia</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Illegal substances, drug pipes, bongs, drug-making equipment</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Alcohol & Tobacco</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Alcoholic beverages, cigarettes, e-cigarettes, vaping products</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Counterfeit/Replica Items</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Fake branded goods, unauthorized copies, bootleg products</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Stolen Property</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Items without proof of legitimate ownership</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Hazardous Materials</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Flammable liquids, explosives, toxic chemicals, radioactive materials</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Medical/Prescription Items</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Prescription drugs, controlled substances, unlicensed medical devices</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Wildlife & Endangered Species</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Live animals, ivory, exotic animal products, protected species</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Opened Cosmetics</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Used makeup, opened skincare products (hygiene reasons)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Virtual Currency & Gift Cards</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Cryptocurrency, prepaid cards, lottery tickets (fraud risk)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Recalled Products</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Items under safety recalls (especially children's items, car seats)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Adult Content</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Pornographic materials, sexually explicit items</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Perishable Food</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Fresh food, homemade food, items with expired dates</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Human Parts/Remains</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Any human body parts or remains</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Services</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Professional services, job postings, digital services</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Non-Certified Electronics</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Electronics without Korean radio certification (KC mark) for items purchased abroad within 1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Allowed Categories */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Allowed Categories</h2>
            <p className="text-gray-700 mb-4">KEASY allows listings in the following categories:</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Examples</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Digital & Electronics</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Phones, tablets, laptops, cameras, TVs</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Include model, condition, warranty status</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Home Appliances</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Refrigerators, washers, air conditioners</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Working condition required</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Furniture & Interior</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Sofas, tables, chairs, beds, decor</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Include dimensions</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Baby & Kids</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Toys, books, strollers, clothes</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Check for recalls</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Women's Fashion</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Clothing, shoes, bags, accessories</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Include size and brand</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Men's Fashion</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Clothing, shoes, watches, accessories</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Include size and brand</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Beauty</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Unopened cosmetics, tools, devices</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Sealed/unopened only</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Sports & Leisure</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Fitness equipment, camping gear, bikes</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Safety gear condition important</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Hobbies & Games</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Gaming consoles, collectibles, crafts</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Include completeness info</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Books & Tickets</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Books, albums, event tickets</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Check validity for tickets</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Pet Supplies</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Food, accessories, cages</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">No live animals</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Plants & Gardening</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Plants, pots, gardening tools</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Local pickup recommended</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Food & Groceries</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Packaged/sealed items only</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Check expiration dates</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Vehicles</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Cars, motorcycles, bicycles</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Title transfer required</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Other</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Items not fitting above categories</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Must comply with all policies</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Fees & Payment Methods */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Fees & Payment Methods</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Fee Structure</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Transaction Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Listing Fee (up to 3 items)</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700 font-semibold text-green-600">FREE</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Listing Fee (4+ items)</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Standard rates apply</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Safe Transaction Fee</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700"><strong>7%</strong> of sale price (paid by seller)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Direct Transaction Fee</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700 font-semibold text-green-600">FREE</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Payment Methods</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li><strong>Toss Payments:</strong> Credit/debit cards, bank transfer, mobile payment</li>
              <li><strong>Safe Transaction:</strong> Payment is held by KEASY until buyer confirms receipt</li>
              <li><strong>Direct Transaction:</strong> Payment arranged directly between buyer and seller (use at own risk)</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> We <strong>do not</strong> directly collect or store credit-card or banking data. All payments are processed securely through <strong>Toss Payments</strong>, subject to their privacy terms.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Payment Settlement</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>After purchase confirmation, payment is released to seller within 1 business day</li>
              <li>Automatic confirmation occurs 4 business days after tracking number registration if buyer takes no action</li>
              <li>Sellers can request delayed payment release for high-value items (₩1,000,000+) for fraud prevention</li>
            </ul>
          </section>

          {/* Section 7: Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Dispute Resolution Process</h3>
            <p className="text-gray-700 mb-3">KEASY facilitates dispute resolution between buyers and sellers. The process follows these steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li><strong>Direct Communication (48-72 hours):</strong> Buyer contacts seller directly through KEASY chat to resolve the issue</li>
              <li><strong>Open Dispute Case:</strong> If unresolved, buyer opens a dispute through the Resolution Center within the purchase decision period</li>
              <li><strong>Evidence Submission (5 days):</strong> Both parties submit photos, videos, chat logs, and other evidence</li>
              <li><strong>KEASY Review (5-7 days):</strong> KEASY reviews submitted evidence and makes a determination</li>
              <li><strong>Resolution:</strong> Refund, partial refund, or transaction completion as determined by KEASY</li>
              <li><strong>Appeal (Optional):</strong> Either party may appeal within 7 days with additional evidence</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Eligible Dispute Reasons</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Item not received</li>
              <li>Item significantly different from description</li>
              <li>Item damaged during shipping (with photo/video evidence of packaging)</li>
              <li>Counterfeit or unauthorized product</li>
              <li>Seller refuses to honor published refund policy</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 External Dispute Resolution</h3>
            <p className="text-gray-700 mb-2">For disputes that cannot be resolved through KEASY, users may contact:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li><strong>Korea Consumer Agency:</strong> 1372 or www.kca.go.kr</li>
              <li><strong>E-Commerce Dispute Resolution Committee:</strong> www.ecmc.or.kr</li>
              <li><strong>Personal Information Dispute Mediation Committee:</strong> 1833-6972 or www.kopico.go.kr</li>
            </ul>
          </section>

          {/* Section 8: User Trust & Rating System */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. User Trust & Rating System</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Trust Score ("Manner Temperature")</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>All users start with a baseline score of <strong>36.5°C</strong></li>
              <li>Score increases with positive reviews and successful transactions</li>
              <li>Score decreases with negative reviews, disputes, or policy violations</li>
              <li>Users with scores below 30°C may face listing restrictions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Review Guidelines</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Reviews must be based on actual transaction experience</li>
              <li>Fake reviews, review manipulation, or review exchange is prohibited</li>
              <li>Harassment, hate speech, or personal attacks in reviews are prohibited</li>
              <li>KEASY may remove reviews that violate community guidelines</li>
            </ul>
          </section>

          {/* Section 9: Account Restrictions & Penalties */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Account Restrictions & Penalties</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Tiered Penalty System</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Level</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Action</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Consequences</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Warning</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">First minor violation</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Written warning, listing removed</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Temporary Suspension</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Repeated violations or moderate offense</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">7-30 day account suspension</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Permanent Ban</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Serious violations, fraud, illegal activity</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Permanent account termination</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Prohibited Behaviors</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Fraud or scam attempts</li>
              <li>Proxy account creation or sales on behalf of others</li>
              <li>Directing transactions outside KEASY platform to avoid fees or protections</li>
              <li>Harassment, discrimination, or abusive language</li>
              <li>False or misleading product descriptions</li>
              <li>Posting contact information (phone, email, KakaoTalk ID) in listings</li>
              <li>Price manipulation or fake bidding</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.3 Appeal Process</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Users may appeal account suspensions within 14 days</li>
              <li>Submit appeal through KEASY Customer Support with supporting evidence</li>
              <li>Appeal decisions are typically made within 7 business days</li>
            </ul>
          </section>

          {/* Section 10: Safe Transaction Tips */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Safe Transaction Tips</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 For Local Meetups</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Meet in public, well-lit locations (cafes, convenience stores, subway stations)</li>
              <li>Consider meeting at police station safe trade zones if available</li>
              <li>Bring a friend or inform someone of your meeting details</li>
              <li>Inspect items thoroughly before completing payment</li>
              <li>Prefer cashless payments (Toss, bank transfer) for transaction records</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 For Shipped Items</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Always use Safe Transaction for shipped items</li>
              <li>Request detailed photos before purchasing</li>
              <li>Video record unboxing as evidence in case of disputes</li>
              <li>Check seller's trust score and review history</li>
              <li>Never pay outside the KEASY platform</li>
            </ul>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">🚨 Red Flags to Avoid</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                <li>Prices significantly below market value</li>
                <li>Sellers requesting payment outside KEASY</li>
                <li>Pressure to complete transaction quickly</li>
                <li>Sellers with low trust scores or no transaction history</li>
                <li>Stock photos or photos clearly copied from the internet</li>
                <li>Requests for personal information beyond what's needed for shipping</li>
              </ul>
            </div>
          </section>

          {/* Section 11: Privacy & Data Protection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Privacy & Data Protection</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 Data We Collect</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Account information (name, phone number, email)</li>
              <li>Transaction history and listings</li>
              <li>Chat messages between users</li>
              <li>Payment information (processed securely via Toss Payments)</li>
              <li>Device and usage information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 Data Retention</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Transaction records</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">5 years (Korean E-commerce law)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Completed listings</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Visible only to transaction parties</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Account data</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Until account deletion + 1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.3 Your Rights</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of personal data (with limitations)</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="text-gray-700">Submit requests to <strong>privacy@koreaeasy.org</strong>.</p>
          </section>

          {/* Section 12: Community Guidelines */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Community Guidelines</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">12.1 Code of Conduct</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Treat all users with respect and courtesy</li>
              <li>Communicate honestly and transparently</li>
              <li>Complete transactions as agreed</li>
              <li>Report suspicious activity or policy violations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">12.2 Prohibited Content & Behavior</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
              <li>Hate speech, discrimination, or harassment based on race, gender, religion, nationality, etc.</li>
              <li>Threatening or abusive language</li>
              <li>Spam or excessive promotional content</li>
              <li>Impersonation of other users or KEASY staff</li>
              <li>Sharing personal information of others without consent</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">12.3 Reporting Violations</h3>
            <p className="text-gray-700 mb-2">To report a user or listing:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4 mb-4">
              <li>Tap the three dots (⋮) on the listing or user profile</li>
              <li>Select "Report" and choose the appropriate reason</li>
              <li>Provide additional details or evidence if available</li>
              <li>KEASY will review and take appropriate action</li>
            </ol>
          </section>

          {/* Section 13: Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <div className="bg-gray-100 p-6 rounded">
              <p className="text-gray-900 font-semibold mb-2">Korea Easy (Operated by Montem Flumen Inc.)</p>
              <p className="text-gray-700">Marketplace Support: <strong>support@koreaeasy.org</strong></p>
              <p className="text-gray-700">Privacy Inquiries: <strong>privacy@koreaeasy.org</strong></p>
              <p className="text-gray-700">Address: 103, 1F, 162 Dongdaejeon-ro, Dong-gu, Daejeon, Republic of Korea</p>
              <p className="text-gray-700">Hours: Mon–Fri 09:30–12:00, 13:00–17:30 KST</p>
              <p className="text-gray-700">Closed: Weekends and Korean public holidays</p>
              <p className="text-gray-700">For Inquiries about koreaeasy marketplace policy, please contact: +82 10-9695-9805</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Disclaimer</h3>
            <p className="text-sm text-gray-700 mb-2">
              KoreaEasy (KEASY) operates as a communications sales intermediary (통신판매중개자) and is not a party to transactions between buyers and sellers. Responsibility for products, product information, and transactions lies solely with the transaction parties (buyers and sellers).
            </p>
            <p className="text-sm text-gray-700">
              This policy is subject to change without prior notice. Users are responsible for reviewing the current policy. Continued use of KEASY after policy updates constitutes acceptance of the revised terms.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm font-semibold text-gray-700">We do not sell your personal information.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplacePolicy
