import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { PricingPlan } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { CheckIcon } from "lucide-react";

const Home = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiRequest('POST', '/api/contact', contactForm);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Message sent!",
          description: "We'll get back to you soon.",
          variant: "default",
        });
        
        // Reset form
        setContactForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };
  
  const pricingPlans: PricingPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      period: "",
      description: "Perfect for occasional printing needs.",
      features: [
        "10 pages per month",
        "Basic document customization",
        "Standard print quality",
        "Pay-per-print beyond free pages"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: 12.99,
      period: "/month",
      description: "Great for regular printing needs.",
      features: [
        "100 pages per month",
        "Advanced document customization",
        "Premium print quality",
        "Priority support",
        "Discounted rates beyond plan"
      ],
      isPopular: true
    },
    {
      id: "business",
      name: "Business",
      price: 29.99,
      period: "/month",
      description: "Ideal for small businesses and teams.",
      features: [
        "Unlimited pages",
        "Professional document customization",
        "Commercial print quality",
        "24/7 priority support",
        "Team management features",
        "API access"
      ]
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <motion.div 
                className="sm:text-center lg:text-left"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.h1 
                  className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl font-heading"
                  variants={fadeInUp}
                >
                  <span className="block">Smart Printing</span>
                  <span className="block text-black">Powered by AI</span>
                </motion.h1>
                <motion.p 
                  className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                  variants={fadeInUp}
                >
                  Upload, customize, and print your documents from anywhere. Find the nearest printer and get your prints delivered or pick them up.
                </motion.p>
                <motion.div 
                  className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                  variants={fadeInUp}
                >
                  <motion.div 
                    className="rounded-md shadow"
                    whileHover={{ y: -4 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link href="/signup">
                      <a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 md:py-4 md:text-lg md:px-10 transition-colors">
                        Get Started
                      </a>
                    </Link>
                  </motion.div>
                  <motion.div 
                    className="mt-3 sm:mt-0 sm:ml-3"
                    whileHover={{ y: -4 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link href="/#features">
                      <a className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors">
                        Learn More
                      </a>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <motion.img 
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Person printing documents"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-black font-semibold tracking-wide uppercase font-heading">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl font-heading">
              Smart Printing for Everyone
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              PrintX combines AI technology with convenient printing solutions to make document printing easier than ever.
            </p>
          </div>

          <motion.div 
            className="mt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <motion.div className="relative" variants={fadeInUp}>
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 font-heading">Easy Document Upload</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Upload any document format and get instant previews. Supports PDF, Word, Excel, PowerPoint, and more.
                </dd>
              </motion.div>

              {/* Feature 2 */}
              <motion.div className="relative" variants={fadeInUp}>
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 font-heading">AI-Powered Optimization</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Our AI automatically suggests the best print settings for your document type, saving you time and resources.
                </dd>
              </motion.div>

              {/* Feature 3 */}
              <motion.div className="relative" variants={fadeInUp}>
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 font-heading">Nearby Printer Locator</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Find the closest printing locations using our geolocation features. Choose pickup or delivery options.
                </dd>
              </motion.div>

              {/* Feature 4 */}
              <motion.div className="relative" variants={fadeInUp}>
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 font-heading">Secure Payment</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Pay securely with multiple payment options. Get accurate cost estimates before confirming your order.
                </dd>
              </motion.div>
            </dl>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-black font-semibold tracking-wide uppercase font-heading">Pricing</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl font-heading">
              Simple, Transparent Pricing
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Choose the plan that works best for your printing needs. No hidden fees.
            </p>
          </div>

          <motion.div 
            className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={plan.id}
                className={`relative p-8 ${plan.isPopular ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-2xl shadow-sm flex flex-col`}
                variants={fadeInUp}
                custom={index}
              >
                {plan.isPopular && (
                  <div className="absolute -top-5 -right-5 px-4 py-1 bg-black text-white rounded-full text-sm font-medium">
                    Popular
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold font-heading ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  
                  <p className={`mt-4 flex items-baseline ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-5xl font-extrabold tracking-tight">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.period && <span className="ml-1 text-xl font-semibold">{plan.period}</span>}
                  </p>
                  <p className={`mt-6 ${plan.isPopular ? 'text-gray-300' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  {/* Feature List */}
                  <ul role="list" className="mt-6 space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex">
                        <CheckIcon className={`flex-shrink-0 h-5 w-5 ${plan.isPopular ? 'text-green-400' : 'text-green-500'}`} />
                        <span className={`ml-3 ${plan.isPopular ? 'text-gray-300' : 'text-gray-500'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  whileTap={{ y: 0 }}
                  className="mt-8"
                >
                  <Link href="/signup">
                    <a className={`block w-full ${
                      plan.isPopular 
                        ? 'bg-white text-black hover:bg-gray-100' 
                        : 'bg-white border border-black text-black hover:bg-gray-50'
                    } text-center px-6 py-3 rounded-md font-medium transition-colors`}>
                      Get Started
                    </a>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-black font-semibold tracking-wide uppercase font-heading">Contact</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl font-heading">
              Get in Touch
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Have questions? We're here to help. Reach out to our support team.
            </p>
          </div>

          <motion.div 
            className="mt-12 max-w-lg mx-auto lg:max-w-none"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <form onSubmit={handleSubmitContactForm} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    className="py-3 px-4 block w-full shadow-sm focus:ring-black focus:border-black border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    className="py-3 px-4 block w-full shadow-sm focus:ring-black focus:border-black border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    required
                    className="py-3 px-4 block w-full shadow-sm focus:ring-black focus:border-black border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={handleInputChange}
                    required
                    className="py-3 px-4 block w-full shadow-sm focus:ring-black focus:border-black border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
              <div className="sm:col-span-2">
                <motion.button
                  type="submit"
                  whileHover={{ y: -4 }}
                  whileTap={{ y: 0 }}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
                >
                  Send Message
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
