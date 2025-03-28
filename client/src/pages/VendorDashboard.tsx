import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowUpIcon,
  Clock,
  DollarSign,
  FileCheck,
  MoreVertical,
  Printer,
  RefreshCcw,
  Tag,
  Trash2,
  Plus,
  Home,
  BarChart3,
  Calendar,
  Bell,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Key,
  Shield,
  ChevronRight,
  Menu,
  X,
  Upload,
  File
} from "lucide-react";

// Types for our dashboard data
interface PrintRequest {
  id: string;
  name: string;
  initial: string;
  printerModel: string;
  status: 'pending' | 'printing' | 'completed';
  time: string;
  price: number;
  queuePosition: number;
  paperLevel: number;
  tonerLevel: number;
}

interface PrinterStatus {
  id: string;
  model: string;
  status: 'operational' | 'low paper' | 'low toner' | 'error';
  queueCount: number;
  dailyJobs: number;
  paperLevel: number;
  tonerLevel: number;
}

// Interface for notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}



// Initial data for development
const initialPrintRequests: PrintRequest[] = [
  {
    id: "pr1",
    name: "Emily Chen",
    initial: "E",
    printerModel: "HP LaserJet Pro",
    status: "pending",
    time: "10:15 AM",
    price: 18.50,
    queuePosition: 2,
    paperLevel: 85,
    tonerLevel: 65
  },
  {
    id: "pr2",
    name: "Marcus Wong",
    initial: "M",
    printerModel: "Xerox WorkCentre",
    status: "printing",
    time: "10:30 AM",
    price: 7.50,
    queuePosition: 1,
    paperLevel: 25,
    tonerLevel: 45
  },
  {
    id: "pr3",
    name: "Sarah Miller",
    initial: "S",
    printerModel: "Canon ImageRunner",
    status: "completed",
    time: "10:45 AM",
    price: 32.50,
    queuePosition: 0,
    paperLevel: 90,
    tonerLevel: 10
  }
];

const initialPrinters: PrinterStatus[] = [
  {
    id: "pr1",
    model: "HP LaserJet Pro",
    status: "operational",
    queueCount: 2,
    dailyJobs: 14,
    paperLevel: 85,
    tonerLevel: 65
  },
  {
    id: "pr2",
    model: "Xerox WorkCentre",
    status: "low paper",
    queueCount: 1,
    dailyJobs: 9,
    paperLevel: 25,
    tonerLevel: 45
  },
  {
    id: "pr3",
    model: "Canon ImageRunner",
    status: "low toner",
    queueCount: 0,
    dailyJobs: 7,
    paperLevel: 90,
    tonerLevel: 10
  }
];

// Initial notifications
const initialNotifications: Notification[] = [
  {
    id: "n1",
    title: "Low Toner Alert",
    message: "Canon ImageRunner is running low on toner (10%).",
    time: "10 min ago",
    read: false
  },
  {
    id: "n2",
    title: "Low Paper Alert",
    message: "Xerox WorkCentre is running low on paper (25%).",
    time: "15 min ago",
    read: false
  },
  {
    id: "n3",
    title: "Print Job Completed",
    message: "All scheduled print jobs have been completed.",
    time: "30 min ago",
    read: true
  }
];

const VendorDashboard = () => {
  const [printRequests, setPrintRequests] = useState<PrintRequest[]>(initialPrintRequests);
  const [printers, setPrinters] = useState<PrinterStatus[]>(initialPrinters);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddPrinterDialog, setShowAddPrinterDialog] = useState(false);
  const [newPrinterName, setNewPrinterName] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'reports' | 'settings'>('dashboard');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { toast } = useToast();

  // Function to refresh dashboard data with mock updates
  const refreshData = async () => {
    setIsRefreshing(true);
    
    // In a real implementation, this would make API calls to fetch the latest data
    // For this implementation, we're simulating a network request with mock updates
    setTimeout(() => {
      // Update the printer statuses
      const updatedPrinters = printers.map(printer => {
        // Randomly adjust printer levels slightly to simulate real-time changes
        const paperDelta = Math.floor(Math.random() * 5) - 2; // -2 to +2 percent change
        const tonerDelta = Math.floor(Math.random() * 5) - 2;
        
        let paperLevel = printer.paperLevel + paperDelta;
        paperLevel = Math.max(0, Math.min(100, paperLevel)); // Keep within 0-100 range
        
        let tonerLevel = printer.tonerLevel + tonerDelta;
        tonerLevel = Math.max(0, Math.min(100, tonerLevel)); // Keep within 0-100 range
        
        // Update status based on new levels
        let status = printer.status;
        if (paperLevel <= 15) {
          status = 'low paper';
        } else if (tonerLevel <= 15) {
          status = 'low toner';
        } else if (paperLevel > 15 && tonerLevel > 15 && status !== 'error') {
          status = 'operational';
        }
        
        return {...printer, paperLevel, tonerLevel, status };
      });
      
      setPrinters(updatedPrinters);
      setIsRefreshing(false);
      
      toast({
        title: "Dashboard refreshed",
        description: "Latest data has been loaded",
      });
    }, 1000);
  };

  // Function to process a print request - update status to the next stage
  const processRequest = (requestId: string) => {
    setPrintRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        // Update the status based on current status
        if (request.status === 'pending') {
          toast({
            title: "Print job started",
            description: `Started printing job for ${request.name}`,
          });
          return { ...request, status: 'printing' };
        } else if (request.status === 'printing') {
          toast({
            title: "Print job completed",
            description: `Completed printing job for ${request.name}`,
          });
          return { ...request, status: 'completed' };
        }
      }
      return request;
    }));
    
    // Update the printer queue counts
    updatePrinterQueues();
  };
  
  // Function to update printer queue counts based on print requests
  const updatePrinterQueues = () => {
    // Create map of printers by model
    const printerModels = new Map<string, string>();
    printers.forEach(printer => {
      printerModels.set(printer.model, printer.id);
    });
    
    // Count pending requests by printer model
    const pendingByPrinter = new Map<string, number>();
    printRequests.forEach(request => {
      if (request.status === 'pending' || request.status === 'printing') {
        const count = pendingByPrinter.get(request.printerModel) || 0;
        pendingByPrinter.set(request.printerModel, count + 1);
      }
    });
    
    // Update the printer queue counts
    setPrinters(prev => prev.map(printer => {
      const queueCount = pendingByPrinter.get(printer.model) || 0;
      return { ...printer, queueCount };
    }));
  };

  // Function to clear completed print jobs
  const clearCompletedJobs = () => {
    setPrintRequests(prev => prev.filter(request => request.status !== "completed"));
    toast({
      title: "Completed jobs cleared",
      description: "All completed print jobs have been removed from the queue",
    });
  };

  // Printer maintenance functions
  const refillPaper = (printerId: string) => {
    setPrinters(prev => prev.map(printer => {
      if (printer.id === printerId) {
        // Create a type-safe updated printer object
        const newStatus: PrinterStatus['status'] = 
          printer.status === 'low paper' ? 'operational' : printer.status;
          
        const updatedPrinter: PrinterStatus = { 
          ...printer, 
          paperLevel: 100,
          status: newStatus
        };
        
        toast({
          title: "Paper Refilled",
          description: `${printer.model} paper level has been refilled to 100%`,
        });
        
        return updatedPrinter;
      }
      return printer;
    }));
  };
  
  const replaceToner = (printerId: string) => {
    setPrinters(prev => prev.map(printer => {
      if (printer.id === printerId) {
        // Create a type-safe updated printer object
        const newStatus: PrinterStatus['status'] = 
          printer.status === 'low toner' ? 'operational' : printer.status;
          
        const updatedPrinter: PrinterStatus = { 
          ...printer, 
          tonerLevel: 100,
          status: newStatus
        };
        
        toast({
          title: "Toner Replaced",
          description: `${printer.model} toner has been replaced, level is now 100%`,
        });
        
        return updatedPrinter;
      }
      return printer;
    }));
  };
  
  const resetPrinter = (printerId: string) => {
    setPrinters(prev => prev.map(printer => {
      if (printer.id === printerId) {
        const updatedPrinter: PrinterStatus = { 
          ...printer, 
          status: 'operational' as const
        };
        
        toast({
          title: "Printer Reset",
          description: `${printer.model} has been reset and is now operational`,
        });
        
        return updatedPrinter;
      }
      return printer;
    }));
  };
  
  const deletePrinter = (printerId: string) => {
    setPrinters(prev => prev.filter(printer => printer.id !== printerId));
    
    // Also filter out any print requests for this printer
    const printerToDelete = printers.find(p => p.id === printerId);
    if (printerToDelete) {
      setPrintRequests(prev => prev.filter(request => request.printerModel !== printerToDelete.model));
      
      toast({
        title: "Printer Removed",
        description: `${printerToDelete.model} has been removed from your network`,
      });
    }
  };

  // Function to add a new printer
  const addPrinter = () => {
    if (!newPrinterName.trim()) {
      toast({
        title: "Error",
        description: "Printer name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const newPrinter: PrinterStatus = {
      id: `pr${printers.length + 1}`,
      model: newPrinterName,
      status: "operational",
      queueCount: 0,
      dailyJobs: 0,
      paperLevel: 100,
      tonerLevel: 100
    };

    setPrinters(prev => [...prev, newPrinter]);
    setNewPrinterName("");
    setShowAddPrinterDialog(false);
    
    toast({
      title: "Printer Added",
      description: `${newPrinterName} has been added to your printer network`,
    });
  };

  // End of printer-related functions

  // Function to mark a notification as read
  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    }));
  };

  // Function to get badge color based on status
  const getStatusBadgeColor = (status: PrinterStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'low paper':
        return 'bg-yellow-100 text-yellow-800';
      case 'low toner':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get badge color based on print request status
  const getRequestStatusBadgeColor = (status: PrintRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
      case 'printing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Printing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center">
            <Printer className="h-6 w-6 mr-2 text-blue-500" />
            Print Service
          </h1>
        </div>
        <nav className="flex-1 px-2 py-4 bg-white space-y-1">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`group flex w-full items-center px-4 py-2 text-sm font-medium rounded-md ${
              activeSection === 'dashboard' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className={`h-5 w-5 mr-3 ${activeSection === 'dashboard' ? 'text-blue-500' : 'text-gray-500'}`} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveSection('reports')}
            className={`group flex w-full items-center px-4 py-2 text-sm font-medium rounded-md ${
              activeSection === 'reports' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className={`h-5 w-5 mr-3 ${activeSection === 'reports' ? 'text-blue-500' : 'text-gray-500'}`} />
            Reports
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`group flex w-full items-center px-4 py-2 text-sm font-medium rounded-md ${
              activeSection === 'settings' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className={`h-5 w-5 mr-3 ${activeSection === 'settings' ? 'text-blue-500' : 'text-gray-500'}`} />
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Avatar>
                <AvatarFallback className="bg-blue-500 text-white">AV</AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin Vendor</p>
              <p className="text-xs font-medium text-gray-500">admin@printservice.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 flex z-40" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            aria-hidden="true"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                type="button" 
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="p-6">
              <h1 className="text-xl font-bold flex items-center">
                <Printer className="h-6 w-6 mr-2 text-blue-500" />
                Print Service
              </h1>
            </div>
            
            <nav className="flex-1 px-2 py-4 bg-white space-y-1">
              <button
                onClick={() => {
                  setActiveSection('dashboard');
                  setShowMobileMenu(false);
                }}
                className={`group flex w-full items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'dashboard' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className={`h-5 w-5 mr-3 ${activeSection === 'dashboard' ? 'text-blue-500' : 'text-gray-500'}`} />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveSection('reports');
                  setShowMobileMenu(false);
                }}
                className={`group flex w-full items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'reports' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className={`h-5 w-5 mr-3 ${activeSection === 'reports' ? 'text-blue-500' : 'text-gray-500'}`} />
                Reports
              </button>
              <button
                onClick={() => {
                  setActiveSection('settings');
                  setShowMobileMenu(false);
                }}
                className={`group flex w-full items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'settings' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className={`h-5 w-5 mr-3 ${activeSection === 'settings' ? 'text-blue-500' : 'text-gray-500'}`} />
                Settings
              </button>
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarFallback className="bg-blue-500 text-white">AV</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Admin Vendor</p>
                  <p className="text-xs font-medium text-gray-500">admin@printservice.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="w-full py-4 px-6 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center md:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setShowMobileMenu(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 md:hidden">Dashboard</h1>
            <div className="flex items-center">
              <Popover open={showNotificationsPopover} onOpenChange={setShowNotificationsPopover}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${notification.read ? 'opacity-60' : ''}`}
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                          <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="ml-3 relative">
                <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <span className="sr-only">Open user menu</span>
                      <Avatar>
                        <AvatarFallback className="bg-blue-500 text-white">AV</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {activeSection === 'dashboard' && (
            <>
              {/* Dashboard header with refresh button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Printer Dashboard</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isRefreshing}
              className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Completed Print Jobs Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-green-100 text-green-600">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h2 className="font-semibold text-xl text-gray-900">
                      {printRequests.filter(req => req.status === 'completed').length}
                    </h2>
                    <p className="text-sm text-gray-500">Completed Jobs</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-green-600 flex items-center">
                    <FileCheck className="h-4 w-4 mr-1" />
                    {printers.every(printer => printer.status === 'operational') 
                      ? "All printers operational" 
                      : "Some printers need attention"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Printer Status Section */}
          <div className="flex items-center justify-between mt-8 mb-4">
            <h2 className="text-lg font-medium text-gray-900">Printer Status</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddPrinterDialog(true)}
              className="flex items-center text-xs px-2 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Printer
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {printers.map(printer => (
              <Card key={printer.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">{printer.model}</h3>
                      <Badge 
                        variant="outline" 
                        className={getStatusBadgeColor(printer.status)}
                      >
                        {printer.status.charAt(0).toUpperCase() + printer.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Queue Count</p>
                        <p className="text-lg font-medium text-gray-900">{printer.queueCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Daily Jobs</p>
                        <p className="text-lg font-medium text-gray-900">{printer.dailyJobs}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-500">Paper Level</p>
                        <p className="text-sm font-medium text-gray-900">{printer.paperLevel}%</p>
                      </div>
                      <Progress 
                        value={printer.paperLevel} 
                        className={`h-2 bg-gray-200 ${
                          printer.paperLevel <= 15 
                            ? "[&>div]:bg-yellow-500" 
                            : "[&>div]:bg-green-500"
                        }`}
                      />
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-500">Toner Level</p>
                        <p className="text-sm font-medium text-gray-900">{printer.tonerLevel}%</p>
                      </div>
                      <Progress 
                        value={printer.tonerLevel} 
                        className={`h-2 bg-gray-200 ${
                          printer.tonerLevel <= 15 
                            ? "[&>div]:bg-red-500" 
                            : "[&>div]:bg-blue-500"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-6 py-3">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => resetPrinter(printer.id)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => refillPaper(printer.id)}>
                            <span>Refill Paper</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => replaceToner(printer.id)}>
                            <span>Replace Toner</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deletePrinter(printer.id)}
                            className="text-red-600 focus:text-red-700"
                          >
                            <span>Remove Printer</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Print Requests Section */}
          <h2 className="text-lg font-medium text-gray-900 mt-8 mb-4">Print Requests</h2>
          <Card>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Recent Print Jobs</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCompletedJobs}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Completed
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Printer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {printRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No print requests
                      </td>
                    </tr>
                  ) : (
                    printRequests.map(request => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              {request.initial}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{request.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative w-96 h-[500px] border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
                            {request.id === 'pr1' && (
                              <div className="absolute inset-0 bg-white">
                                <div className="flex flex-col h-full">
                                  {/* Research Paper Header */}
                                  <div className="p-3 pb-1 text-center border-b border-gray-200">
                                    <div className="text-sm font-bold text-gray-800">Global Climate Change Research</div>
                                    <div className="text-xs text-gray-500 mt-1">Emily Chen | University of Science</div>
                                  </div>
                                  {/* Document Content */}
                                  <div className="p-3 flex-1">
                                    <div className="text-xs font-semibold mb-2 text-gray-700">Abstract</div>
                                    <div className="w-full h-2 bg-gray-300 mb-1 rounded-sm"></div>
                                    <div className="w-11/12 h-2 bg-gray-300 mb-1 rounded-sm"></div>
                                    <div className="w-full h-2 bg-gray-300 mb-1 rounded-sm"></div>
                                    <div className="w-10/12 h-2 bg-gray-300 mb-3 rounded-sm"></div>
                                    
                                    <div className="text-xs font-semibold mb-2 text-gray-700">Introduction</div>
                                    <div className="w-full h-1.5 bg-gray-200 mb-1 rounded-sm"></div>
                                    <div className="w-full h-1.5 bg-gray-200 mb-1 rounded-sm"></div>
                                    <div className="w-11/12 h-1.5 bg-gray-200 mb-1 rounded-sm"></div>
                                    <div className="w-full h-1.5 bg-gray-200 mb-1 rounded-sm"></div>
                                    <div className="w-10/12 h-1.5 bg-gray-200 mb-3 rounded-sm"></div>
                                    
                                    <div className="mx-auto mt-2 border border-gray-300 rounded bg-blue-50 p-2">
                                      <div className="h-3 w-20 bg-blue-200 mx-auto mb-2 rounded"></div>
                                      <div className="h-16 bg-blue-100 rounded flex items-center justify-center">
                                        <div className="h-10 w-20 bg-blue-300 rounded flex items-center justify-center">
                                          <div className="text-xs text-blue-800 font-medium">Figure 1</div>
                                        </div>
                                      </div>
                                      <div className="h-2 w-full bg-blue-200 mt-2 rounded"></div>
                                      <div className="h-2 w-4/5 bg-blue-200 mt-1 mx-auto rounded"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {request.id === 'pr2' && (
                              <div className="absolute inset-0 bg-white">
                                <div className="flex flex-col h-full">
                                  {/* Invoice Header */}
                                  <div className="bg-blue-600 text-white p-3">
                                    <div className="text-sm font-bold">INVOICE #387</div>
                                    <div className="flex justify-between items-center mt-1">
                                      <div className="text-xs opacity-80">March 15, 2025</div>
                                      <div className="text-xs font-semibold bg-blue-800 px-2 py-0.5 rounded">PENDING</div>
                                    </div>
                                  </div>
                                  
                                  {/* Company Info */}
                                  <div className="p-3 flex justify-between border-b border-gray-200">
                                    <div>
                                      <div className="text-xs text-gray-500">From:</div>
                                      <div className="text-xs font-semibold text-gray-800">Print Service Inc.</div>
                                      <div className="text-xs text-gray-600">123 Printing Ave</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-gray-500">To:</div>
                                      <div className="text-xs font-semibold text-gray-800">Marcus Wong</div>
                                      <div className="text-xs text-gray-600">456 Client St</div>
                                    </div>
                                  </div>
                                  
                                  {/* Invoice Items */}
                                  <div className="flex-1 p-2">
                                    <table className="w-full text-xs">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="py-1 text-left text-gray-600">Item</th>
                                          <th className="py-1 text-right text-gray-600">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr className="border-b border-gray-100">
                                          <td className="py-1 text-gray-800">Document Printing</td>
                                          <td className="py-1 text-right text-gray-800">$5.50</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                          <td className="py-1 text-gray-800">Color Pages (2)</td>
                                          <td className="py-1 text-right text-gray-800">$2.00</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    
                                    <div className="mt-2 p-2 bg-gray-50 rounded flex justify-between">
                                      <div className="text-xs font-bold text-gray-700">Total:</div>
                                      <div className="text-xs font-bold text-blue-700">$7.50</div>
                                    </div>
                                    
                                    <div className="mt-3 flex justify-end">
                                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded">
                                        Due on receipt
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {request.id === 'pr3' && (
                              <div className="absolute inset-0 bg-white">
                                <div className="flex flex-col h-full">
                                  {/* Presentation Header */}
                                  <div className="bg-purple-600 p-3">
                                    <div className="text-white text-sm font-bold text-center">
                                      Marketing Strategy 2025
                                    </div>
                                    <div className="text-purple-200 text-xs text-center mt-1">
                                      Sarah Miller - Marketing Director
                                    </div>
                                  </div>
                                  
                                  {/* Slide Content */}
                                  <div className="p-3 flex-1 flex flex-col">
                                    <div className="text-xs font-semibold mb-2 text-gray-700">Quarterly Objectives</div>
                                    
                                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                                      <div className="flex h-full">
                                        {/* Chart Side */}
                                        <div className="w-2/5 h-full bg-purple-50 mr-2 rounded-md p-1 flex flex-col justify-end">
                                          <div className="flex justify-between items-end mb-1 px-1">
                                            <div className="w-3 h-8 bg-purple-700 rounded-t"></div>
                                            <div className="w-3 h-12 bg-purple-600 rounded-t"></div>
                                            <div className="w-3 h-6 bg-purple-400 rounded-t"></div>
                                            <div className="w-3 h-14 bg-purple-500 rounded-t"></div>
                                          </div>
                                          <div className="h-0.5 w-full bg-purple-300"></div>
                                          <div className="flex justify-between mt-1">
                                            <div className="w-3 h-1 bg-purple-300"></div>
                                            <div className="w-3 h-1 bg-purple-300"></div>
                                            <div className="w-3 h-1 bg-purple-300"></div>
                                            <div className="w-3 h-1 bg-purple-300"></div>
                                          </div>
                                        </div>
                                        
                                        {/* Content Side */}
                                        <div className="w-3/5 flex flex-col">
                                          <div className="flex items-center mb-1.5">
                                            <div className="h-2 w-2 rounded-full bg-purple-700 mr-1.5"></div>
                                            <div className="h-1.5 w-28 bg-gray-800 rounded-sm"></div>
                                          </div>
                                          <div className="flex items-center mb-1.5">
                                            <div className="h-2 w-2 rounded-full bg-purple-600 mr-1.5"></div>
                                            <div className="h-1.5 w-24 bg-gray-800 rounded-sm"></div>
                                          </div>
                                          <div className="flex items-center mb-1.5">
                                            <div className="h-2 w-2 rounded-full bg-purple-400 mr-1.5"></div>
                                            <div className="h-1.5 w-20 bg-gray-800 rounded-sm"></div>
                                          </div>
                                          <div className="flex items-center mb-1.5">
                                            <div className="h-2 w-2 rounded-full bg-purple-500 mr-1.5"></div>
                                            <div className="h-1.5 w-28 bg-gray-800 rounded-sm"></div>
                                          </div>
                                          <div className="mt-2">
                                            <div className="h-1.5 w-full bg-gray-300 mb-1 rounded-sm"></div>
                                            <div className="h-1.5 w-full bg-gray-300 mb-1 rounded-sm"></div>
                                            <div className="h-1.5 w-3/4 bg-gray-300 rounded-sm"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 mb-1 flex justify-between">
                                      <div className="h-1.5 w-14 bg-gray-300 rounded-sm"></div>
                                      <div className="h-1.5 w-8 bg-gray-300 rounded-sm"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.printerModel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRequestStatusBadgeColor(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${request.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              onClick={() => processRequest(request.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Process
                            </Button>
                          )}
                          {request.status === 'printing' && (
                            <Button 
                              variant="ghost" 
                              onClick={() => processRequest(request.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Complete
                            </Button>
                          )}
                          {request.status === 'completed' && (
                            <Button 
                              variant="ghost" 
                              className="text-gray-500"
                            >
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
            </>
          )}
          
          {/* Reports Tab */}
          {activeSection === 'reports' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Print Reports</h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Print Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="space-y-2 text-center">
                        <BarChart3 className="h-10 w-10 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500">Monthly print volume report</p>
                        <Button variant="outline" size="sm">Generate Report</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Printer Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="space-y-2 text-center">
                        <Printer className="h-10 w-10 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500">Printer usage statistics</p>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <Printer className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">HP LaserJet Pro was low on paper</p>
                        <p className="text-xs text-gray-500">Today, 2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <FileCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Marketing presentation completed printing</p>
                        <p className="text-xs text-gray-500">Today, 1:15 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
                        <RefreshCcw className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Canon ImageRunner toner replaced</p>
                        <p className="text-xs text-gray-500">Today, 11:45 AM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Settings Tab */}
          {activeSection === 'settings' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Print Service Settings</h1>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">Email Notifications</h3>
                          <p className="text-xs text-gray-500">Receive email alerts for important events</p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">Low Toner Alerts</h3>
                          <p className="text-xs text-gray-500">Get notified when printer toner is low</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">Print Job Completion</h3>
                          <p className="text-xs text-gray-500">Notification when print jobs are completed</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Printer Default Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="default-printer">Default Printer</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select printer" />
                            </SelectTrigger>
                            <SelectContent>
                              {printers.map(printer => (
                                <SelectItem key={printer.id} value={printer.id}>
                                  {printer.model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price-per-page">Price Per Page</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              $
                            </span>
                            <Input 
                              type="number" 
                              id="price-per-page" 
                              placeholder="0.10" 
                              className="rounded-l-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-200 bg-gray-50 flex justify-end">
                    <Button>Save Settings</Button>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add Printer Dialog */}
      <Dialog open={showAddPrinterDialog} onOpenChange={setShowAddPrinterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Printer</DialogTitle>
            <DialogDescription>
              Enter details for the new printer to add to your network.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="printer-name" className="text-right">
                Printer Name
              </Label>
              <Input
                id="printer-name"
                value={newPrinterName}
                onChange={(e) => setNewPrinterName(e.target.value)}
                placeholder="Enter printer model name"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPrinterDialog(false)}>Cancel</Button>
            <Button onClick={addPrinter}>Add Printer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboard;
