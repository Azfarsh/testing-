import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Printer } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { signOut } from "@/lib/firebase";

interface NavbarProps {
  isAuthenticated: boolean;
  onSignOut: () => Promise<void>;
}

const Navbar = ({ isAuthenticated, onSignOut }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      await onSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white/90 border-b border-gray-200 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Printer className="h-8 w-8 text-black" />
              <span className="ml-2 text-xl font-bold font-heading">PrintX</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-700 hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-gray-700 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-black transition-colors">
              Contact
            </Link>
            
            {isAuthenticated ? (
              <div className="flex space-x-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-black transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-black transition-colors">
                  Login
                </Link>
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Link 
                    href="/signup" 
                    className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-black focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
