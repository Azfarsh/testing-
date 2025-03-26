import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onSignOut: () => Promise<void>;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, isAuthenticated, onSignOut, onClose }: MobileMenuProps) => {
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const handleClick = () => {
    onClose();
  };

  const handleSignOut = async () => {
    await onSignOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={menuVariants}
          className="md:hidden bg-white border-b border-gray-200"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/#features" onClick={handleClick}>
              <a className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Features
              </a>
            </Link>
            <Link href="/#pricing" onClick={handleClick}>
              <a className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Pricing
              </a>
            </Link>
            <Link href="/#contact" onClick={handleClick}>
              <a className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Contact
              </a>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={handleClick}>
                  <a className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    Dashboard
                  </a>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={handleClick}>
                  <a className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    Login
                  </a>
                </Link>
                <Link href="/signup" onClick={handleClick}>
                  <a className="block px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-md">
                    Sign Up
                  </a>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
