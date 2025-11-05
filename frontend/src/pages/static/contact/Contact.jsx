import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    // Simulate form submission
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">Contact Us</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Contact Information */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Get in Touch</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Have questions about KEasy or need help? We're here to assist. Fill out the form or reach us through the contact information below.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email</p>
                <a href="mailto:info@keasy.com" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                  info@keasy.com
                </a>
              </div>
            </div>
<<<<<<< HEAD

            {/* Image */}
            <div
              className="animate-on-scroll opacity-0 transition-all duration-1000"
              id="contact-image"
              style={{
                opacity: isVisible['contact-image'] ? 1 : 0,
                transform: isVisible['contact-image'] ? 'translateX(0)' : 'translateX(50px)',
              }}
            >
              <div className="relative group rounded-2xl overflow-hidden shadow-2xl h-full min-h-[400px] lg:min-h-[600px]">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop"
                  alt="Beautiful coastal landscape"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-top from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
=======
            <div className="flex items-start">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Location</p>
                <p className="text-gray-700 dark:text-gray-300">Seoul, South Korea</p>
>>>>>>> parent of e480564 (update)
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          {submitSuccess ? (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Message sent successfully</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-200">
                    <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500"
                  required
                ></textarea>
              </div>
              {submitError && (
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-200">
                        <p>{submitError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-primary-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;