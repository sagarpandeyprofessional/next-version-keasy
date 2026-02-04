"use client";

import { useEffect, useState, type ChangeEvent, type MouseEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type ContactFormData = {
  user_id: string | null;
  name: string;
  email: string;
  phone_number: string;
  message: string;
};

const ContactPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ContactFormData>({
    user_id: user ? user.id : null,
    name: "",
    email: "",
    phone_number: "",
    message: "",
  });
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.startsWith("82")) {
      const withoutCountry = numbers.slice(2);

      if (withoutCountry.length === 0) {
        return "+82";
      } else if (withoutCountry.length <= 3) {
        return `+82 (${withoutCountry}`;
      } else if (withoutCountry.length <= 7) {
        return `+82 (${withoutCountry.slice(0, 3)}) ${withoutCountry.slice(3)}`;
      } else {
        return `+82 (${withoutCountry.slice(0, 3)}) ${withoutCountry.slice(3, 7)} ${withoutCountry.slice(7, 11)}`;
      }
    }

    if (numbers.length === 0) return "";
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    }
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 7)} ${numbers.slice(7, 11)}`;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formatted = formatPhoneNumber(value);
      setFormData({
        ...formData,
        phone_number: formatted,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      } as ContactFormData);
    }
  };

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Add your form submission logic here
    supabase.from("contacts").insert([formData]).then(({ data, error }) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error inserting data:", error);
      } else {
        // eslint-disable-next-line no-console
        console.log("Data inserted successfully:", data);
        setFormData({ name: "", email: "", phone_number: "", message: "", user_id: user ? user.id : null });
      }
    });
  };

  if (!user) {
    alert("You need to be signed in to access the contact page.");
    router.push("/signin");
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Contact Form */}
            <div
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 animate-on-scroll opacity-0 transition-all duration-1000"
              id="contact-form"
              style={{
                opacity: isVisible["contact-form"] ? 1 : 0,
                transform: isVisible["contact-form"] ? "translateX(0)" : "translateX(-50px)",
              }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Contact Us</h1>
              <p className="text-gray-600 mb-8 text-sm sm:text-base">If you have any questions please fill out the form</p>

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                      focusedField === "name"
                        ? "border-blue-500 shadow-lg shadow-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email and Phone Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                        focusedField === "email"
                          ? "border-blue-500 shadow-lg shadow-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone_number}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                        focusedField === "phone"
                          ? "border-blue-500 shadow-lg shadow-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="+82 (010) 1234 1234"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Your Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    rows={6}
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none resize-none transition-all duration-300 ${
                      focusedField === "message"
                        ? "border-blue-500 shadow-lg shadow-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl uppercase tracking-wider text-sm sm:text-base"
                >
                  Send Message
                </button>
              </div>
            </div>

            {/* Image */}
            <div
              className="animate-on-scroll opacity-0 transition-all duration-1000"
              id="contact-image"
              style={{
                opacity: isVisible["contact-image"] ? 1 : 0,
                transform: isVisible["contact-image"] ? "translateX(0)" : "translateX(50px)",
              }}
            >
              <div className="relative group rounded-2xl overflow-hidden shadow-2xl h-full min-h-[400px] lg:min-h-[600px]">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop"
                  alt="Beautiful coastal landscape"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      `}</style>
    </div>
  );
};

export default ContactPage;
