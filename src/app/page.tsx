"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const services = [
  { name: "Bathrooms", slug: "bathrooms", image: "/icons/bathrooms.png" },
  { name: "Concrete", slug: "concrete", image: "/icons/concrete.png" },
  { name: "Decks", slug: "decks", image: "/icons/decks.png" },
  { name: "Drainage & Retaining Walls", slug: "drainage-retaining-walls", image: "/icons/drainage-retaining.png" },
  { name: "Drywalling", slug: "drywalling", image: "/icons/drywalling.png" },
  { name: "Electrical Work", slug: "electrical-work", image: "/icons/electrical.png" },
  { name: "Fences", slug: "fences", image: "/icons/fences.png" },
  { name: "Flooring", slug: "flooring", image: "/icons/flooring.png" },
  { name: "Gutter Cleaning", slug: "gutter-cleaning", image: "/icons/gutter-cleaning.png" },
  { name: "HVAC", slug: "hvac", image: "/icons/hvac.png" },
  { name: "Junk Removal", slug: "junk-removal", image: "/icons/junk-removal.png" },
  { name: "Kitchens", slug: "kitchens", image: "/icons/kitchens.png" },
  { name: "Landscaping", slug: "landscaping", image: "/icons/landscaping.png" },
  { name: "Masonry", slug: "masonry", image: "/icons/masonry.png" },
  { name: "Painting", slug: "painting", image: "/icons/painting.png" },
  { name: "Plumbing", slug: "plumbing", image: "/icons/plumbing.png" },
  { name: "Powerwashing", slug: "powerwashing", image: "/icons/powerwashing.png" },
  { name: "Remodeling", slug: "remodeling", image: "/icons/remodeling.png" },
  { name: "Roofing", slug: "roofing", image: "/icons/roofing.png" },
  { name: "Sheds & Gates", slug: "sheds-gates", image: "/icons/sheds.png" },
  { name: "Siding", slug: "siding", image: "/icons/siding.png" },
  { name: "Snow Removal", slug: "snow-removal", image: "/icons/snow-removal.png" },
  { name: "Stairs", slug: "stairs", image: "/icons/stairs.png" },
  { name: "Tree Trimming", slug: "tree-trimming", image: "/icons/tree-trimming.png" },
  { name: "Waterproofing", slug: "waterproofing", image: "/icons/waterproofing.png" },
];

const faqs = [
  {
    question: "What areas do you serve?",
    answer: "We proudly serve the entire DMV area - Washington D.C., Maryland, and Virginia. Contact us to confirm if we service your specific location.",
  },
  {
    question: "Are you licensed and insured?",
    answer: "Yes! Variety Amaya LLC is fully licensed and insured. We take pride in our professional standards and protecting our customers.",
  },
  {
    question: "Do you offer free estimates?",
    answer: "Absolutely! We provide free estimates for all our services. Fill out our request form or give us a call to schedule yours.",
  },
  {
    question: "Do you offer any discounts?",
    answer: "Yes, we offer discounts for service members and seniors. Ask us about our special pricing when you request your estimate.",
  },
];

const testimonials = [
  {
    name: "Michael Thompson",
    location: "Fairfax, VA",
    rating: 5,
    text: "Rene and his team did an amazing job on our fence installation. They were professional, on time, and the quality of work exceeded our expectations. Highly recommend!",
    service: "Fence Installation",
  },
  {
    name: "Sarah Mitchell",
    location: "Burke, VA",
    rating: 5,
    text: "We hired Variety Amaya for a complete bathroom remodel. The attention to detail was impressive and they kept us informed throughout the entire process. Our bathroom looks brand new!",
    service: "Bathroom Remodel",
  },
  {
    name: "David & Linda Garcia",
    location: "Springfield, VA",
    rating: 5,
    text: "Best landscaping service in the area! They transformed our backyard into a beautiful outdoor space. Fair pricing and excellent communication. Will definitely use them again.",
    service: "Landscaping",
  },
  {
    name: "Robert Williams",
    location: "Centreville, VA",
    rating: 5,
    text: "Had them powerwash our driveway and deck - looks like new! Fast, efficient, and very affordable. As a veteran, I appreciated the military discount too.",
    service: "Powerwashing",
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    service: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");

    try {
      // Formspree form submission
      const response = await fetch("https://formspree.io/f/mykpqgbo", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          service: formData.service,
          message: formData.message,
          _subject: `New Estimate Request from ${formData.name}`,
        }),
      });

      if (response.ok) {
        setFormStatus("success");
        setFormData({ name: "", email: "", phone: "", address: "", service: "", message: "" });
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[#D4AF37]/30 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <a href="#" className="relative w-24 h-24">
              <Image
                src="/logo.png"
                alt="Variety Amaya LLC"
                fill
                className="object-contain"
                priority
              />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-white hover:text-gold transition-colors">Services</a>
              <a href="#about" className="text-white hover:text-gold transition-colors">About</a>
              <a href="#faq" className="text-white hover:text-gold transition-colors">FAQ</a>
              <a href="tel:7036770440" className="text-gold hover:text-white transition-colors font-semibold">
                (703) 677-0440
              </a>
              <a
                href="#requestForm"
                className="bg-gold hover:bg-[#B8960C] text-black font-semibold px-6 py-2 rounded-full transition-colors"
              >
                Free Estimate
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <nav className="flex flex-col gap-4">
                <a href="#services" className="text-white hover:text-gold transition-colors" onClick={() => setMobileMenuOpen(false)}>Services</a>
                <a href="#about" className="text-white hover:text-gold transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
                <a href="#faq" className="text-white hover:text-gold transition-colors" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <a href="tel:7036770440" className="text-gold font-semibold">(703) 677-0440</a>
                <a
                  href="#requestForm"
                  className="bg-gold text-black font-semibold px-6 py-2 rounded-full text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Free Estimate
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-black pt-28">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-30"></div>
        <div className="hero-overlay absolute inset-0"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] mx-auto mb-8 logo-glow">
            <Image
              src="/va-logo.png"
              alt="Variety Amaya LLC"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Trusted <span className="text-gold">General Contractor</span> Serving the DMV Area
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Depend on us for expert general labor services. Our skilled team delivers reliable,
            high-quality workmanship tailored to your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#requestForm"
              className="btn-premium bg-gold hover:bg-[#B8960C] text-black font-bold px-10 py-4 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-[#D4AF37]/30"
            >
              Get a Free Estimate →
            </a>
            <a
              href="tel:7036770440"
              className="border-2 border-gold text-gold hover:bg-[#B8960C] hover:border-[#B8960C] hover:text-white font-bold px-8 py-4 rounded-full text-lg transition-all"
            >
              Call (703) 677-0440
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-gray-400">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Licensed & Insured
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free Estimates
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Military & Senior Discounts
            </span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No job is too big or too small. We offer a wide range of services to meet all your home improvement needs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.name}
                href={`/services/${service.slug}`}
                className="service-card bg-white rounded-xl p-4 text-center shadow-md border border-gray-100 hover:border-[#D4AF37] overflow-hidden cursor-pointer"
              >
                <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">And much more! Contact us with your specific project needs.</p>
            <a
              href="#requestForm"
              className="inline-block bg-gold hover:bg-[#B8960C] text-black font-bold px-8 py-3 rounded-full transition-colors"
            >
              Request a Quote
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don&apos;t just take our word for it - hear from our satisfied customers across the DMV.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                  <span className="text-xs bg-[#D4AF37]/10 text-[#B8960C] px-3 py-1 rounded-full font-medium">
                    {testimonial.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                About <span className="text-gold">Variety Amaya LLC</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Based in Fairfax, Virginia, Variety Amaya LLC is your trusted partner for all general labor and home improvement needs.
                We take pride in delivering high-quality workmanship and exceptional customer service.
              </p>
              <p className="text-gray-300 text-lg mb-6">
                With a diverse array of services including landscaping, fence installation, pressure washing, and more,
                we provide a wide range of solutions tailored to meet your specific needs.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Licensed and Insured</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Discounts for Service Members & Seniors</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>No Job Too Big or Too Small</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto logo-glow">
                <Image
                  src="/va-logo.png"
                  alt="Variety Amaya LLC"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Got questions? We&apos;ve got answers.</p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section id="requestForm" className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Get Your Free Estimate</h2>
            <p className="text-xl text-gray-400">
              Fill out the form below and we&apos;ll get back to you with a free estimate for your project.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  placeholder="(703) 555-0123"
                />
              </div>
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Needed
                </label>
                <select
                  id="service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address (Optional)
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                placeholder="123 Main St, Fairfax, VA 22032"
              />
            </div>
            <div className="mt-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Project Details *
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell us about your project..."
              ></textarea>
            </div>
            <div className="mt-8">
              <button
                type="submit"
                disabled={formStatus === "submitting"}
                className="w-full bg-gold hover:bg-[#B8960C] disabled:bg-gray-400 text-black font-bold py-4 rounded-full text-lg transition-all transform hover:scale-[1.02]"
              >
                {formStatus === "submitting" ? "Sending..." : "Request Free Estimate"}
              </button>
            </div>
            {formStatus === "success" && (
              <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg text-center">
                Thank you! We&apos;ve received your request and will contact you soon.
              </div>
            )}
            {formStatus === "error" && (
              <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
                Something went wrong. Please try again or call us directly.
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Company Info */}
            <div>
              <div className="mb-6">
                <div className="relative w-48 h-48 logo-glow">
                  <Image
                    src="/va-logo.png"
                    alt="Variety Amaya LLC"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-gray-400">
                Your trusted general contractor serving the DMV area. Licensed, insured, and committed to quality.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
              <div className="space-y-4 text-gray-400">
                <p className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  9666 Thackery Square<br />Fairfax, VA 22032
                </p>
                <p className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:7036770440" className="hover:text-gold transition-colors">
                    (703) 677-0440
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href="https://varietyamaya.net" className="hover:text-gold transition-colors">
                    varietyamaya.net
                  </a>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <div className="space-y-3">
                <a href="#services" className="block text-gray-400 hover:text-gold transition-colors">Our Services</a>
                <a href="#about" className="block text-gray-400 hover:text-gold transition-colors">About Us</a>
                <a href="#faq" className="block text-gray-400 hover:text-gold transition-colors">FAQ</a>
                <a href="#requestForm" className="block text-gray-400 hover:text-gold transition-colors">Get a Quote</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Variety Amaya LLC. All rights reserved.</p>
            <p className="mt-2 text-sm">Licensed & Insured | Serving the DMV Area</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
