import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto pt-16 lg:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
              Effortless Printing, <span className="text-primary">Anytime, Anywhere.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Skip the queues and manage your printing tasks on the go. Our automated system lets you book tokens, configure print settings, and pay securely — all from your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg">
                  Get started
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="inline-flex items-center gap-2">
                  Learn more
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-12 lg:mt-0">
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <img 
                className="w-full h-auto" 
                src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Person using printing app on smartphone" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
