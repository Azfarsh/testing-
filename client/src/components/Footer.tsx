import { Link } from "wouter";
import { MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div>
              <h3 className="text-xl font-bold mb-4">PrintMe</h3>
              <p className="text-gray-300 text-sm">
                Making printing accessible and efficient for everyone, anywhere and anytime.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white text-sm">Home</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white text-sm">About</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-white text-sm">Services</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white text-sm">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-gray-300 hover:text-white text-sm">Document Printing</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-white text-sm">Photo Printing</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-white text-sm">Business Cards</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-white text-sm">Custom Orders</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Contact Info</h3>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                <span>123 Print Street, Digital City, 12345</span>
              </li>
              <li className="text-gray-300 text-sm flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                <span>support@printme.com</span>
              </li>
              <li className="text-gray-300 text-sm flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">© 2024 PrintMe. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-300 hover:text-white text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-300 hover:text-white text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
