import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: "🟢",
    title: "Token System",
    description: "Normal (Free) & Priority (Paid) for efficient queues."
  },
  {
    icon: "📄",
    title: "Document Upload",
    description: "Upload files with custom print settings."
  },
  {
    icon: "💳",
    title: "Payments",
    description: "Secure transactions via UPI, Cards & Wallets."
  },
  {
    icon: "📲",
    title: "Notifications",
    description: "Instant updates via SMS, Email & App."
  },
  {
    icon: "🗺️",
    title: "Shop Locator",
    description: "Find nearby Xerox shops easily."
  },
  {
    icon: "📊",
    title: "Admin Panel",
    description: "Manage prints, tokens & revenue."
  }
];

const ServicesSection = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Services</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive printing solutions designed for your convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-gray-50 hover:shadow-md transition duration-300">
              <CardContent className="p-6">
                <div className="text-secondary text-xl mb-3">{service.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/services" className="inline-flex items-center text-primary font-medium hover:underline">
            Learn More
            <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
