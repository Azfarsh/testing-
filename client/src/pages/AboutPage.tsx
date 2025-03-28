import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const AboutPage = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">About PrintMe</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our mission is to make printing services accessible to everyone, anywhere.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6">
              PrintMe was founded with a simple idea: make printing convenient and hassle-free. We realized that traditional printing shops often meant waiting in long lines, limited operating hours, and inconsistent service quality.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our platform bridges the gap between customers and print shops, creating a seamless experience where users can upload documents, customize print settings, and choose between standard or priority service—all from their devices.
            </p>
            <p className="text-lg text-gray-600">
              Today, we're proud to connect thousands of users with local print shops, saving time and improving accessibility for everyone.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <img 
              className="w-full h-auto" 
              src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Modern printing service" 
            />
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose PrintMe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-primary text-3xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Time-Saving</h3>
              <p className="text-gray-600">
                Skip the lines and manage your printing needs remotely, saving valuable time.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-primary text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flexibility</h3>
              <p className="text-gray-600">
                Choose between standard or priority service based on your urgency and budget.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-primary text-3xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-600">
                Access printing services 24/7 from anywhere with our user-friendly platform.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/services">
            <Button size="lg" className="mx-2">
              Explore Our Services
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="mx-2 mt-4 sm:mt-0">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
