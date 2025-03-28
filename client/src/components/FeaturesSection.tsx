import { Card, CardContent } from "@/components/ui/card";
import { Printer, FileText, MapPin } from "lucide-react";

const features = [
  {
    title: "Smart Token System",
    description: "Normal Token: Free, wait in queue.\nPriority Token: Paid, instant service.",
    icon: <Printer className="h-12 w-12 text-primary" />
  },
  {
    title: "Automated Printing Process",
    description: "Direct communication with the Xerox shop's printer using CUPS (Common Unix Printing System) API for smooth print execution.",
    icon: <FileText className="h-12 w-12 text-primary" />
  },
  {
    title: "Map Integration for Nearby Xerox Shops",
    description: "Integrated with Google Maps API to help users find the nearest printing centers easily.",
    icon: <MapPin className="h-12 w-12 text-primary" />
  }
];

const FeaturesSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Key Features</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform offers powerful tools to streamline your printing experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white shadow-sm hover:shadow-md transition duration-300">
              <CardContent className="p-6">
                <div className="text-primary text-4xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4 whitespace-pre-line">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
