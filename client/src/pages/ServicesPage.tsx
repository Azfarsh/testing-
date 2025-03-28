import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const serviceData = {
  document: [
    { feature: "Black & White Printing", standard: true, priority: true },
    { feature: "Color Printing", standard: true, priority: true },
    { feature: "Single/Double Sided (Duplex)", standard: true, priority: true },
    { feature: "Standard Paper Sizes (A4, A3, Letter, Legal)", standard: true, priority: true },
    { feature: "Engineering Sizes (A2, A1, A0)", standard: false, priority: true },
    { feature: "Custom Size Support", standard: false, priority: true },
    { feature: "Queue Priority", standard: false, priority: true },
    { feature: "Express Processing", standard: false, priority: true },
  ],
};

const ServicePage = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">PrintMe Services</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Automated printing and Xerox booking system designed to streamline the document printing process for students and vendors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl">Standard Token</CardTitle>
              <CardDescription>For regular printing needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">Free</div>
              <p className="text-gray-600 mb-6">Wait in queue based on first-come, first-served</p>
              <ul className="space-y-3">
                {serviceData.document.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className={`h-5 w-5 mr-2 ${item.standard ? 'text-primary' : 'text-gray-300'}`} />
                    <span className={item.standard ? 'text-gray-700' : 'text-gray-400'}>
                      {item.feature}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Choose Standard
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white border-2 border-primary relative">
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Priority Token</CardTitle>
              <CardDescription>For urgent printing needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">₹49</div>
              <p className="text-gray-600 mb-6">Skip the queue with priority service</p>
              <ul className="space-y-3">
                {serviceData.document.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-gray-700">{item.feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Choose Priority
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gray-50 border-2 border-gray-200 lg:col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium">Upload Document & Select Options</h4>
                  <p className="text-gray-600 text-sm">Upload your file and customize print settings (PDF, DOCX, Images)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium">Choose Token Type</h4>
                  <p className="text-gray-600 text-sm">Select standard (free) or priority (paid) service</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium">Make Payment</h4>
                  <p className="text-gray-600 text-sm">Process payment via UPI, Credit/Debit card, or Digital Wallets</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium">Track & Collect</h4>
                  <p className="text-gray-600 text-sm">Receive notifications and collect your printed document</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Print Options Section */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Document Print Customization</h3>
            <p className="text-gray-600 mt-2">Comprehensive options for your document printing needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="p-6">
              <h4 className="font-medium text-lg mb-3">Paper Size Selection</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Standard Sizes: A4, A3, Legal, Letter</li>
                <li>• Engineering & Architectural Sizes: A2, A1, A0</li>
                <li>• Custom Size Support</li>
              </ul>
            </div>
            <div className="p-6">
              <h4 className="font-medium text-lg mb-3">Print Quality & Type</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Draft Mode (fast, ink-saving)</li>
                <li>• Standard Quality</li>
                <li>• High Quality</li>
                <li>• Black & White / Grayscale</li>
                <li>• Color Printing</li>
              </ul>
            </div>
            <div className="p-6">
              <h4 className="font-medium text-lg mb-3">Binding & Finishing</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Single/Double-Sided (Duplex)</li>
                <li>• Staple Binding</li>
                <li>• Spiral Binding</li>
                <li>• Clip Binding</li>
                <li>• Hardcover Binding</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;