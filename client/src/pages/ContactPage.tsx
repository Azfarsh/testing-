import { MapPin, Mail, Phone, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const ContactPage = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Contact Us</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions or need support? We're here to help you with all your printing needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mt-2">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Our Location</h3>
              <p className="text-gray-600">
                PrintMe Headquarters<br />
                123 Tech Park, Hinjewadi<br />
                Pune, Maharashtra 411057<br />
                India
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mt-2">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-1">General Inquiries:</p>
              <p className="text-primary">support@printme.com</p>
              <p className="text-gray-600 mb-1 mt-2">Business Partnerships:</p>
              <p className="text-primary">partners@printme.com</p>
              <p className="text-gray-600 mb-1 mt-2">Technical Support:</p>
              <p className="text-primary">techsupport@printme.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mt-2">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-1">Customer Support:</p>
              <p className="text-primary">+91 20 1234 5678</p>
              <p className="text-gray-600 mb-1 mt-2">Technical Support:</p>
              <p className="text-primary">+91 20 8765 4321</p>
              <p className="text-gray-600 mb-1 mt-2">Toll-Free Number:</p>
              <p className="text-primary">1800 123 4567</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16 max-w-3xl mx-auto">
          <div className="p-6 bg-green-50 text-green-700 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-lg mb-2">24/7 Online Services</h3>
              <p>
                Our online platform is available 24/7 for document uploads, token bookings, and print configurations. While our online system operates round-the-clock, print processing and collection are subject to shop business hours.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
              <p className="mt-3 text-lg text-gray-600">
                Have questions about our services or need a custom printing solution? Send us a message.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</Label>
                  <div className="mt-1">
                    <Input type="text" id="firstName" name="firstName" className="py-3 px-4 block w-full shadow-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</Label>
                  <div className="mt-1">
                    <Input type="text" id="lastName" name="lastName" className="py-3 px-4 block w-full shadow-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
                  <div className="mt-1">
                    <Input type="email" id="email" name="email" className="py-3 px-4 block w-full shadow-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</Label>
                  <div className="mt-1">
                    <Input type="text" id="phone" name="phone" className="py-3 px-4 block w-full shadow-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</Label>
                  <div className="mt-1">
                    <Input type="text" id="subject" name="subject" className="py-3 px-4 block w-full shadow-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex justify-between">
                    <Label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</Label>
                    <span id="message-max" className="text-sm text-gray-500">Max. 500 characters</span>
                  </div>
                  <div className="mt-1">
                    <Textarea id="message" name="message" rows={4} className="py-3 px-4 block w-full shadow-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Checkbox id="terms" name="terms" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    </div>
                    <div className="ml-3">
                      <p className="text-base text-gray-500">
                        By selecting this, you agree to our
                        <a href="#" className="font-medium text-primary hover:text-primary-dark underline ml-1">Privacy Policy</a>
                        and
                        <a href="#" className="font-medium text-primary hover:text-primary-dark underline ml-1">Terms of Service</a>.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Send Message
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ContactPage;
