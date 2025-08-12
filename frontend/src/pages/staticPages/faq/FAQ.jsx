import React from 'react';
import styles from './FAQ.module.css';

export default function FAQ() {
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
    <div className={`container py-5 ${styles.faqContainer}`}>
      <h1 className="mb-4 display-4 text-dark">Frequently Asked Questions</h1>
      <div className="accordion" id="faqAccordion">
        {faqs.map((faq, idx) => (
          <div key={idx} className={`accordion-item ${styles.accordionItem}`}>
            <h2 className="accordion-header" id={`heading${idx}`}>
              <button
                className={`accordion-button collapsed ${styles.accordionButton}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${idx}`}
                aria-expanded="false"
                aria-controls={`collapse${idx}`}
              >
                {faq.question}
              </button>
            </h2>
            <div
              id={`collapse${idx}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading${idx}`}
              data-bs-parent="#faqAccordion"
            >
              <div className={`accordion-body ${styles.accordionBody}`}>
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
