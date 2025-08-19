import React, { useState } from 'react';
import styles from './Contact.module.css'; // Your CSS module

export default function Contact() {
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Simulate async submission - replace with your real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    <div className={`container ${styles.contactContainer} py-5`}>
      <h1 className="mb-4 display-4 text-dark">Contact Us</h1>
      <div className="row">
        {/* Contact Info */}
        <div className="col-md-6 mb-4">
          <h2 className="mb-3">Get in Touch</h2>
          <p>
            Have questions about KEasy or need help? We're here to assist. Fill out the form or reach us through the contact information below.
          </p>
          <div className={styles.contactInfo}>
            <div className="d-flex align-items-start mb-3">
              <div className={styles.iconCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-mail">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"/>
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                </svg>
              </div>
              <div>
                <p className="mb-0 font-weight-bold">Email</p>
                <a href="mailto:info@keasy.com" className="text-decoration-none text-secondary">
                  info@keasy.com
                </a>
              </div>
            </div>
            <div className="d-flex align-items-start">
              <div className={styles.iconCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-map-pin">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
              </div>
              <div>
                <p className="mb-0 font-weight-bold">Location</p>
                <p className="mb-0 text-secondary">Seoul, South Korea</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            {submitSuccess ? (
              <div className={`alert alert-success ${styles.alertCustom}`} role="alert">
                <h5 className="alert-heading">Message sent successfully</h5>
                <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
                <hr />
                <button 
                  type="button" 
                  className="btn btn-success btn-sm"
                  onClick={() => setSubmitSuccess(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Your Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Your Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
