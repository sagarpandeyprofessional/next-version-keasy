import React from 'react'

const FAQ = () => {
  const faqs = [
    {
      question: "What is KEasy?",
      answer:
        "KEasy is a platform designed to help foreigners living in South Korea. We provide a marketplace, events calendar, blog, and community resources to make life easier for expats in Korea."
    },
    {
      question: "Is KEasy free to use?",
      answer:
        "Yes, KEasy is completely free to use. You can browse listings, post items, find events, and access community resources without any cost."
    },
    {
      question: "How do I create an account?",
      answer:
        "You can sign up using your email address. Simply click on the 'Sign Up' button in the top right corner and follow the instructions."
    },
    {
      question: "Can I sell items on the marketplace?",
      answer:
        "Yes, once you have an account, you can post items for sale, trade, or giveaway on the marketplace. Just navigate to the Marketplace section and click 'Post Item'."
    },
    {
      question: "How do I join KakaoTalk groups through KEasy?",
      answer:
        "We provide QR codes and links to various KakaoTalk groups organized by location and interest. Visit the Community section to find and join groups relevant to you."
    },
    {
      question: "Can I post an event?",
      answer:
        "Yes, registered users can submit events to our calendar. We review submissions before they appear publicly to ensure quality and relevance."
    },
    {
      question: "I found a bug or have a suggestion. How can I report it?",
      answer:
        "We appreciate your feedback! Please use the Contact form to let us know about any issues or suggestions you have for improving KEasy."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
            <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ