import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/firebase";
import { getNearbyPrinters, getCurrentPosition, initGoogleMap } from "@/lib/geolocation";
import { useToast } from "@/hooks/use-toast";
import { DashboardStats, PrinterLocation, PrintJob, Document } from "@shared/types";
import {
  Upload,
  Printer,
  MapPin,
  CreditCard,
  Settings,
  FileText,
  Calendar,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userId, setUserId] = useState<number | null>(null);
  const [firebaseUser, setFirebaseUser] = useState(getCurrentUser());
  const [nearbyPrinters, setNearbyPrinters] = useState<PrinterLocation[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fade in animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Get user ID from API based on firebase user
  useEffect(() => {
    const fetchUserId = async () => {
      if (firebaseUser?.uid) {
        try {
          const response = await apiRequest('GET', `/api/users/firebase/${firebaseUser.uid}`);
          const data = await response.json();
          
          if (data.success && data.data) {
            setUserId(data.data.id);
          } else {
            // If not found, redirect to login
            toast({
              title: "Authentication required",
              description: "Please log in to access your dashboard",
              variant: "destructive",
            });
            setLocation("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error loading user data",
            description: "Please try logging in again",
            variant: "destructive",
          });
        }
      } else {
        // If no firebase user, redirect to login
        setLocation("/login");
      }
    };

    fetchUserId();
  }, [firebaseUser, setLocation, toast]);

  // Get user stats
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    error: statsError 
  } = useQuery({
    queryKey: [userId ? `/api/dashboard/stats/${userId}` : null],
    enabled: !!userId,
  });

  // Get recent print jobs
  const { 
    data: printJobsData, 
    isLoading: isLoadingPrintJobs,
    error: printJobsError
  } = useQuery({
    queryKey: [userId ? `/api/print-jobs?userId=${userId}` : null],
    enabled: !!userId,
  });

  // Get user documents
  const { 
    data: documentsData, 
    isLoading: isLoadingDocuments,
    error: documentsError
  } = useQuery({
    queryKey: [userId ? `/api/documents?userId=${userId}` : null],
    enabled: !!userId,
  });

  // Get nearby printers
  useEffect(() => {
    const loadNearbyPrinters = async () => {
      try {
        const position = await getCurrentPosition();
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(coords);
        
        const printers = await getNearbyPrinters(coords.lat, coords.lng, 10);
        setNearbyPrinters(printers);
        
        // Initialize map after everything is loaded
        setTimeout(() => {
          if (document.getElementById('map-container')) {
            initGoogleMap({
              mapContainerId: 'map-container',
              center: coords,
              zoom: 14,
              onPrinterSelect: (printer) => {
                toast({
                  title: "Printer selected",
                  description: `${printer.name} selected for your next print job`,
                });
              }
            }, printers);
          }
        }, 1000);
      } catch (error) {
        console.error("Error loading nearby printers:", error);
        toast({
          title: "Location error",
          description: "Unable to get your location. Please enable location services.",
          variant: "destructive",
        });
      }
    };

    if (userId) {
      loadNearbyPrinters();
    }
  }, [userId, toast]);

  const refreshNearbyPrinters = async () => {
    if (!userLocation) return;
    
    try {
      const printers = await getNearbyPrinters(userLocation.lat, userLocation.lng, 10);
      setNearbyPrinters(printers);
      
      toast({
        title: "Printers updated",
        description: `Found ${printers.length} printers near you`,
      });
      
      // Re-initialize map
      if (document.getElementById('map-container')) {
        initGoogleMap({
          mapContainerId: 'map-container',
          center: userLocation,
          zoom: 14,
          onPrinterSelect: (printer) => {
            toast({
              title: "Printer selected",
              description: `${printer.name} selected for your next print job`,
            });
          }
        }, printers);
      }
    } catch (error) {
      toast({
        title: "Error updating printers",
        description: "Failed to refresh nearby printers",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Format time for display
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const dashboardStats: DashboardStats = stats?.data || {
    printJobs: 0,
    pagesPrinted: 0,
    balance: 0
  };

  const printJobs: PrintJob[] = printJobsData?.data || [];
  const recentPrintJobs = printJobs.slice(0, 5); // Show only the most recent 5

  const documents: Document[] = documentsData?.data || [];
  const recentDocuments = documents.slice(0, 3); // Show only the most recent 3

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg">Please log in to view your dashboard</p>
          <Button onClick={() => setLocation("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 font-heading">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Dashboard Overview */}
            <div className="px-4 py-8 sm:px-0">
              <motion.div 
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {/* Stats Card 1 */}
                <motion.div variants={fadeInUp} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-black rounded-md p-3">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Print Jobs</dt>
                          <dd>
                            {isLoadingStats ? (
                              <Skeleton className="h-7 w-12" />
                            ) : (
                              <div className="text-lg font-medium text-gray-900">
                                {dashboardStats.printJobs}
                              </div>
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <Link href="/dashboard/history">
                        <a className="font-medium text-black hover:text-gray-900 flex items-center">
                          View all
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </Link>
                    </div>
                  </div>
                </motion.div>

                {/* Stats Card 2 */}
                <motion.div variants={fadeInUp} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-black rounded-md p-3">
                        <Printer className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pages Printed</dt>
                          <dd>
                            {isLoadingStats ? (
                              <Skeleton className="h-7 w-12" />
                            ) : (
                              <div className="text-lg font-medium text-gray-900">
                                {dashboardStats.pagesPrinted}
                              </div>
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <Link href="/dashboard/usage">
                        <a className="font-medium text-black hover:text-gray-900 flex items-center">
                          View usage
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </Link>
                    </div>
                  </div>
                </motion.div>

                {/* Stats Card 3 */}
                <motion.div variants={fadeInUp} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-black rounded-md p-3">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Balance</dt>
                          <dd>
                            {isLoadingStats ? (
                              <Skeleton className="h-7 w-16" />
                            ) : (
                              <div className="text-lg font-medium text-gray-900">
                                ${dashboardStats.balance.toFixed(2)}
                              </div>
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <Link href="/dashboard/billing">
                        <a className="font-medium text-black hover:text-gray-900 flex items-center">
                          Add funds
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="mt-8"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">Quick Actions</h2>
                <motion.div 
                  className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={fadeInUp} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-center flex-col text-center">
                        <div className="p-3 rounded-full bg-gray-100 mb-4">
                          <Upload className="h-6 w-6 text-black" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Document</h3>
                        <p className="text-sm text-gray-500">Upload files for printing</p>
                        <motion.div 
                          className="mt-4 w-full"
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                          <Button onClick={() => setLocation("/upload")} className="w-full">
                            Upload
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-center flex-col text-center">
                        <div className="p-3 rounded-full bg-gray-100 mb-4">
                          <MapPin className="h-6 w-6 text-black" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Find Printers</h3>
                        <p className="text-sm text-gray-500">Locate nearby printing services</p>
                        <motion.div 
                          className="mt-4 w-full"
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                          <Button onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full">
                            Search
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-center flex-col text-center">
                        <div className="p-3 rounded-full bg-gray-100 mb-4">
                          <Settings className="h-6 w-6 text-black" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Account Settings</h3>
                        <p className="text-sm text-gray-500">Manage your account preferences</p>
                        <motion.div 
                          className="mt-4 w-full"
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                          <Button onClick={() => setLocation("/dashboard/settings")} className="w-full">
                            Settings
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Recent Print Jobs */}
              <motion.div 
                className="mt-8"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">Recent Print Jobs</h2>
                <div className="mt-2 flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Document
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Copies
                              </th>
                              <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {isLoadingPrintJobs ? (
                              Array(3).fill(0).map((_, i) => (
                                <tr key={i}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <Skeleton className="h-10 w-10 rounded-md" />
                                      <div className="ml-4">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20 mt-1" />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16 mt-1" />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Skeleton className="h-4 w-4" />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Skeleton className="h-4 w-12 ml-auto" />
                                  </td>
                                </tr>
                              ))
                            ) : recentPrintJobs.length > 0 ? (
                              recentPrintJobs.map((job) => {
                                // Find the related document
                                const document = documents.find(d => d.id === job.documentId);
                                
                                return (
                                  <tr key={job.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
                                          <FileText className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {document?.name || 'Document'}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {document?.pages || 0} pages
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {formatDate(job.createdAt)}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {formatTime(job.createdAt)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {job.copies}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => {
                                          // Reprint functionality
                                          toast({
                                            title: "Reprint requested",
                                            description: "Your document has been added to the print queue"
                                          });
                                        }}
                                        className="text-black hover:text-gray-900"
                                      >
                                        Reprint
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                  No print jobs found. Upload a document to start printing.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <Link href="/dashboard/print-history">
                    <a className="text-sm font-medium text-black hover:text-gray-900 flex items-center justify-end">
                      View all print jobs
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </motion.div>

              {/* Nearby Printers Map */}
              <motion.div 
                id="map-section"
                className="mt-8"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-lg leading-6 font-medium text-gray-900 font-heading">Nearby Printers</h2>
                <div className="mt-2 bg-white shadow sm:rounded-lg overflow-hidden">
                  <div id="map-container" className="h-96 bg-gray-100 relative">
                    {/* Map will be rendered here */}
                    {!userLocation && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Available Printers</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          {nearbyPrinters.length > 0 
                            ? `Showing ${nearbyPrinters.length} nearby locations` 
                            : "Loading nearby printers..."
                          }
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={refreshNearbyPrinters}
                        className="inline-flex items-center"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                    <ul className="divide-y divide-gray-200 mt-4">
                      {nearbyPrinters.length > 0 ? (
                        nearbyPrinters.map((printer) => (
                          <li key={printer.id} className="py-4 flex">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
                              <Printer className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">{printer.name}</p>
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-2">{printer.distance.toFixed(1)} km</span>
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    printer.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {printer.isOpen ? 'Open' : 'Closed'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500">{printer.address}</p>
                              <div className="mt-2 flex">
                                <button className="text-sm font-medium text-black hover:text-gray-900 mr-4">
                                  View Details
                                </button>
                                <button 
                                  className="text-sm font-medium text-black hover:text-gray-900"
                                  onClick={() => {
                                    if (printer.isOpen) {
                                      toast({
                                        title: "Printer selected",
                                        description: `${printer.name} selected for your next print job`
                                      });
                                    } else {
                                      toast({
                                        title: "Printer unavailable",
                                        description: "This printer is currently closed",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                  disabled={!printer.isOpen}
                                >
                                  Select
                                </button>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="py-4 text-center text-gray-500">
                          Loading nearby printers...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
