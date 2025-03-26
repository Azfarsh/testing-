import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LoadingOverlay from "../ui/loading-overlay";
import ToastContainer from "../ui/toast-container";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, onAuthChange } from "@/lib/firebase";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check auth state on mount
    const unsubscribe = onAuthChange((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Sign out is handled in the Navbar component
      setIsAuthenticated(false);
      setLocation("/");
      toast({
        title: "Successfully logged out",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
      <ToastContainer />
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default Layout;
