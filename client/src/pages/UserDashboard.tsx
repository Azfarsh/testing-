import { useState, useRef, useEffect, useCallback } from "react";
import { Printer, File, XCircle, MapPin, CreditCard, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types for the dashboard data
interface PrintBalance {
  availableCredits: number;
  totalAllocation: number;
  percentRemaining: number;
}

interface Notification {
  id: string;
  type: "warning" | "success" | "info" | "error";
  title: string;
  message: string;
  timestamp: Date;
}

interface Document {
  id: string;
  name: string;
  status: "ready" | "printing" | "error" | "completed" | "processing";
  location: string;
  timeLeft?: string;
  pages?: number;
  size?: string;
  timestamp: Date;
  options?: PrintOptions;
}

interface PrinterLocation {
  id: string;
  name: string;
  location: string;
  status: "available" | "busy" | "maintenance";
  distance?: string;
  capabilities?: {
    color: boolean;
    duplex: boolean;
    maxPageSize: string;
    ppm: number;
  };
}

interface PrintOptions {
  copies: number;
  color: boolean;
  duplex: boolean;
  pageSize: string;
  pageRange?: string;
}

interface TokenType {
  id: string;
  type: "normal" | "priority";
  pageLimit: number;
  cost: number;
  available: boolean;
}

const UserDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  
  // State for the dashboard data
  const [balance, setBalance] = useState<PrintBalance>({
    availableCredits: 25.50,
    totalAllocation: 50,
    percentRemaining: 51,
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Print job completed",
      message: "Lecture Notes.pdf",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: "2",
      type: "warning",
      title: "Low balance warning",
      message: "Less than $5 remaining",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
  ]);

  // State for UI controls
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [addBalanceAmount, setAddBalanceAmount] = useState<number>(10);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<"normal" | "priority">("normal");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null);
  
  // Print options
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    copies: 1,
    color: false,
    duplex: true,
    pageSize: "letter",
    pageRange: "",
  });

  // Token Arrays
  const [normalTokens, setNormalTokens] = useState<boolean[]>(
    Array.from({ length: 50 }, (_, i) => i % 3 !== 0) // About 30% are busy
  );
  
  const [priorityTokens, setPriorityTokens] = useState<boolean[]>(
    Array.from({ length: 50 }, (_, i) => i % 7 !== 0) // About 15% are busy
  );

  // Fetch documents
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/documents'],
    select: (data: Document[]) => {
      return data.map(doc => ({
        ...doc,
        timestamp: new Date(doc.timestamp)
      }));
    }
  });

  // Fetch nearby printers
  const { data: printers = [], isLoading: isLoadingPrinters } = useQuery({
    queryKey: ['/api/printers', userLocation?.latitude, userLocation?.longitude],
    enabled: !!userLocation,
    select: (data: PrinterLocation[]) => {
      return data.sort((a, b) => {
        if (!a.distance || !b.distance) return 0;
        return parseInt(a.distance) - parseInt(b.distance);
      });
    }
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/documents/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setSelectedPrinter("");
      setTokenType("normal");
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been sent to the printer",
      });
      
      // Add notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "info",
        title: "Print job submitted",
        message: selectedFile?.name || "Document",
        timestamp: new Date()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add balance mutation
  const addBalanceMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest('POST', '/api/balance/add', { amount });
      return response.json();
    },
    onSuccess: (data) => {
      setBalance(prev => ({
        ...prev,
        availableCredits: prev.availableCredits + addBalanceAmount,
        percentRemaining: ((prev.availableCredits + addBalanceAmount) / prev.totalAllocation) * 100
      }));
      
      setIsAddBalanceModalOpen(false);
      
      toast({
        title: "Balance added successfully",
        description: `Added $${addBalanceAmount.toFixed(2)} to your account`,
      });
      
      // Add notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "success",
        title: "Balance updated",
        message: `Added $${addBalanceAmount.toFixed(2)} to your account`,
        timestamp: new Date()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    },
    onError: (error) => {
      toast({
        title: "Failed to add balance",
        description: error.message || "Failed to add balance. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Cancel document mutation
  const cancelDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await apiRequest('DELETE', `/api/documents/${documentId}`);
      return response.json();
    },
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsDetailModalOpen(false);
      
      toast({
        title: "Print job cancelled",
        description: "Your document has been removed from the print queue",
      });
      
      // Add notification
      const doc = documents.find(d => d.id === documentId);
      if (doc) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "info",
          title: "Print job cancelled",
          message: `${doc.name} has been cancelled`,
          timestamp: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel print job",
        description: error.message || "Failed to cancel print job. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Request user location at component mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  // Setup drag and drop event listeners
  useEffect(() => {
    const dragArea = dragAreaRef.current;
    if (!dragArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        
        // Validate file type and size
        if (validateFile(file)) {
          setSelectedFile(file);
          setError(null);
        }
      }
    };

    dragArea.addEventListener('dragover', handleDragOver);
    dragArea.addEventListener('dragenter', handleDragEnter);
    dragArea.addEventListener('dragleave', handleDragLeave);
    dragArea.addEventListener('drop', handleDrop);

    return () => {
      dragArea.removeEventListener('dragover', handleDragOver);
      dragArea.removeEventListener('dragenter', handleDragEnter);
      dragArea.removeEventListener('dragleave', handleDragLeave);
      dragArea.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Request user's location
  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationPermissionGranted(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationPermissionGranted(false);
          toast({
            title: "Location access denied",
            description: "Please enable location services to find nearby printers",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      });
      setLocationPermissionGranted(false);
    }
  };

  // Handler for document upload button
  const handleUploadClick = () => {
    setError(null);
    setSelectedFile(null);
    setSelectedPrinter("");
    setPrintOptions({
      copies: 1,
      color: false,
      duplex: true,
      pageSize: "letter",
      pageRange: "",
    });
    setTokenType("normal");
    setIsUploadModalOpen(true);
  };

  // File validation
  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, or TXT files.");
      return false;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum file size is 10MB.");
      return false;
    }
    
    return true;
  };

  // Handler for file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  // Handler for printer selection
  const handlePrinterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrinter(e.target.value);
    
    // Update print options based on printer capabilities
    const printer = printers.find(p => p.id === e.target.value);
    if (printer && printer.capabilities) {
      setPrintOptions(prev => ({
        ...prev,
        color: printer.capabilities?.color ? prev.color : false,
        duplex: printer.capabilities?.duplex ? prev.duplex : false,
      }));
    }
  };

  // Handler for print options changes
  const handlePrintOptionsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setPrintOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handler for token type selection
  const handleTokenTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenType(e.target.value as "normal" | "priority");
  };

  // Handler for printer location finder
  const handleFindPrinter = () => {
    requestUserLocation();
  };

  // Handler for add balance
  const handleAddBalance = () => {
    setIsAddBalanceModalOpen(true);
  };

  // Handler for document details
  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDetailModalOpen(true);
  };

  // Handler for document cancellation
  const handleCancelDocument = (docId: string) => {
    if (docId) {
      cancelDocumentMutation.mutate(docId);
    }
  };

  // Handler for closing modals
  const closeModal = () => {
    setIsUploadModalOpen(false);
    setIsPrinterModalOpen(false);
    setIsAddBalanceModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedFile(null);
    setSelectedPrinter("");
    setSelectedDocument(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  };

  // Calculate estimated print cost
  const calculatePrintCost = useCallback((): number => {
    if (!selectedFile) return 0;
    
    // Estimate pages based on file size (very rough estimate)
    const estimatedPages = Math.ceil(selectedFile.size / (150 * 1024)); // ~150KB per page
    
    const baseCostPerPage = printOptions.color ? 0.25 : 0.10;
    const duplexDiscount = printOptions.duplex ? 0.9 : 1; // 10% discount for duplex
    const copies = printOptions.copies || 1;
    
    let cost = estimatedPages * baseCostPerPage * duplexDiscount * copies;
    
    // Add priority fee if applicable
    if (tokenType === "priority") {
      cost += 1.50; // Priority token fee
    }
    
    return parseFloat(cost.toFixed(2));
  }, [selectedFile, printOptions, tokenType]);

  // Validate print job before submission
  const validatePrintJob = (): boolean => {
    if (!selectedFile) {
      setError("Please select a file to print");
      return false;
    }
    
    if (!selectedPrinter) {
      setError("Please select a printer");
      return false;
    }
    
    // Estimate pages for checking against limits
    const estimatedPages = Math.ceil(selectedFile.size / (150 * 1024));
    
    // Check page limits based on token type
    if (tokenType === "normal" && estimatedPages > 20) {
      setError("Normal token allows maximum 20 pages. Please use priority token or reduce pages.");
      return false;
    }
    
    if (tokenType === "priority" && estimatedPages > 80) {
      setError("Priority token allows maximum 80 pages. Please reduce pages.");
      return false;
    }
    
    // Check if enough tokens are available
    if (tokenType === "normal" && !normalTokens.some(t => t)) {
      setError("No normal tokens available. Please try again later or use priority token.");
      return false;
    }
    
    if (tokenType === "priority" && !priorityTokens.some(t => t)) {
      setError("No priority tokens available. Please try again later.");
      return false;
    }
    
    // Check balance for priority token and color printing
    const cost = calculatePrintCost();
    if (cost > balance.availableCredits) {
      setError(`Insufficient balance. Required: $${cost.toFixed(2)}, Available: $${balance.availableCredits.toFixed(2)}`);
      return false;
    }
    
    return true;
  };

  // Initialize Razorpay payment
  const initializeRazorpay = (cost: number) => {
    if (typeof window.Razorpay === 'undefined') {
      // Load Razorpay script if not available
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      script.onload = () => createRazorpayOrder(cost);
    } else {
      createRazorpayOrder(cost);
    }
  };
  
  // Create Razorpay order
  const createRazorpayOrder = async (cost: number) => {
    try {
      // In production, you would create an order on your server
      const orderResponse = await apiRequest('POST', '/api/payments/create-order', { 
        amount: cost * 100 // Convert to smallest currency unit
      });
      const orderData = await orderResponse.json();
      
      const options = {
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_key", // Replace with your actual key from environment variables
        amount: cost * 100,
        currency: "INR",
        name: "PrintMe",
        description: "Payment for print job",
        order_id: orderData.id,
        handler: function (response: any) {
          // Handle payment success
          handlePaymentSuccess(response);
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#000000"
        }
      };
      
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      toast({
        title: "Payment initialization failed",
        description: "Failed to initialize payment gateway. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      // Submit the print job with payment details
      await submitPrintJob(paymentResponse);
    } catch (error) {
      console.error('Error submitting print job:', error);
      toast({
        title: "Print job submission failed",
        description: "Your payment was successful but there was an error submitting the print job.",
        variant: "destructive",
      });
    }
  };

  // Handler for form submission
  const handlePrintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePrintJob()) return;
    
    const cost = calculatePrintCost();
    
    // For priority token, process payment
    if (tokenType === "priority") {
      initializeRazorpay(cost);
    } else {
      // For normal token, just submit the print job
      submitPrintJob();
    }
  };
  
  // Submit print job
  const submitPrintJob = async (paymentDetails?: any) => {
    if (!selectedFile || !selectedPrinter) return;
    
    try {
      setIsUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('printer', selectedPrinter);
      formData.append('tokenType', tokenType);
      formData.append('options', JSON.stringify(printOptions));
      
      if (paymentDetails) {
        formData.append('payment', JSON.stringify(paymentDetails));
      }
      
      // Upload the document
      uploadMutation.mutate(formData);
      
      // Update token availability
      if (tokenType === "normal") {
        const newTokens = [...normalTokens];
        const availableIndex = newTokens.findIndex(t => t);
        if (availableIndex >= 0) {
          newTokens[availableIndex] = false;
          setNormalTokens(newTokens);
        }
      } else {
        const newTokens = [...priorityTokens];
        const availableIndex = newTokens.findIndex(t => t);
        if (availableIndex >= 0) {
          newTokens[availableIndex] = false;
          setPriorityTokens(newTokens);
        }
      }
      
      // Deduct balance
      const cost = calculatePrintCost();
      setBalance(prev => {
        const newBalance = prev.availableCredits - cost;
        const newPercent = (newBalance / prev.totalAllocation) * 100;
        return {
          ...prev,
          availableCredits: newBalance,
          percentRemaining: newPercent
        };
      });
      
    } catch (error) {
      console.error('Error submitting print job:', error);
      setError("Failed to submit print job. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper for formatting timestamps
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  // Render notification icon based on type
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Render status badge class based on status
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "printing":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Printer className="h-8 w-8 text-black" />
                <span className="ml-2 text-xl font-semibold">PrintMe</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                Balance: ${balance.availableCredits.toFixed(2)}
              </span>
              <button 
                onClick={handleAddBalance}
                className="ml-3 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Add Credits
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          
          {/* Credit Balance Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium text-gray-900">Print Balance</h3>
                  <div className="mt-1 text-3xl font-bold">${balance.availableCredits.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">of ${balance.totalAllocation.toFixed(2)} allocation</div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-black h-2.5 rounded-full" 
                      style={{ width: `${balance.percentRemaining}%` }}>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{Math.round(balance.percentRemaining)}% remaining</div>
                </div>
                
                <div className="flex items-center justify-end">
                  <button 
                    onClick={handleUploadClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    <File className="mr-2 h-5 w-5" />
                    Print Document
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Print Jobs and Nearby Printers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Print Jobs Section */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Print Jobs</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {isLoadingDocuments ? (
                    <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                      Loading print jobs...
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                      No print jobs found. Upload a document to get started.
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div 
                        key={doc.id}
                        className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleDocumentClick(doc)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <File className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                              <p className="text-sm text-gray-500">
                                {doc.pages ? `${doc.pages} pages • ` : ''}{doc.size || ''}
                              </p>
                            </div>
                          </div>
                          <div className="ml-2 flex flex-col items-end">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(doc.status)}`}>
                              {doc.status}
                            </span>
                            {doc.timeLeft && <p className="mt-1 text-xs text-gray-500">{doc.timeLeft}</p>}
                            <p className="text-xs text-gray-500">{doc.location}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Nearby Printers Section */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Nearby Printers</h3>
                  <button 
                    onClick={handleFindPrinter}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    <MapPin className="mr-1 h-4 w-4" />
                    Update Location
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {locationPermissionGranted === false && (
                    <div className="px-4 py-4 sm:px-6 text-center">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Location access required</p>
                      <button 
                        onClick={requestUserLocation}
                        className="mt-2 text-sm text-black hover:underline">
                        Enable location services
                      </button>
                    </div>
                  )}
                  
                  {locationPermissionGranted && isLoadingPrinters && (
                    <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                      Finding nearby printers...
                    </div>
                  )}
                  
                  {locationPermissionGranted && !isLoadingPrinters && printers.length === 0 && (
                    <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                      No printers found nearby. Try updating your location.
                    </div>
                  )}
                  
                  {printers
                    .filter(p => p.status !== "maintenance")
                    .map((printer) => (
                      <div key={printer.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">{printer.name}</h4>
                            <p className="text-sm text-gray-500">{printer.location}</p>
                            <div className="mt-1 flex items-center">
                              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-xs text-gray-500">{printer.distance} away</span>
                            </div>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${printer.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {printer.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {notifications.length === 0 ? (
                  <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-4 sm:px-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {renderNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          <p className="text-sm text-gray-500">{formatTimeAgo(notification.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Upload Document
                    </h3>
                    
                    <form id="printForm" className="mt-4" onSubmit={handlePrintSubmit}>
                      {/* File Upload Area */}
                      <div 
                        ref={dragAreaRef}
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragging ? 'border-black bg-gray-50' : 'border-gray-300'}`}>
                        <div className="space-y-1 text-center">
                          <File className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500">
                              <span>Upload a file</span>
                              <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX or TXT up to 10MB
                          </p>
                        </div>
                      </div>
                      
                      {/* Selected File Preview */}
                      {selectedFile && (
                        <div className="mt-2">
                          <div className="flex items-center p-2 bg-gray-50 rounded-md">
                            <File className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-900">{selectedFile.name}</span>
                            <button 
                              type="button" 
                              className="ml-auto text-gray-500 hover:text-gray-700"
                              onClick={() => setSelectedFile(null)}>
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {error && (
                        <div className="mt-2 text-sm text-red-600">{error}</div>
                      )}
                    
                      <div className="mt-4 grid grid-cols-1 gap-y-4">
                        {/* Printer Selection */}
                        <div>
                          <label htmlFor="printer" className="block text-sm font-medium text-gray-700">Select Printer</label>
                          <select 
                            id="printer" 
                            name="printer" 
                            value={selectedPrinter}
                            onChange={handlePrinterSelect}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md">
                            <option value="">Select a printer</option>
                            {printers
                              .filter(p => p.status !== "maintenance")
                              .map(printer => (
                                <option key={printer.id} value={printer.id}>
                                  {printer.name} - {printer.location}
                                </option>
                              ))}
                          </select>
                        </div>
                        
                        {/* Print Options */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Print Options</h4>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            {/* Copies */}
                            <div>
                              <label htmlFor="copies" className="block text-xs font-medium text-gray-500">Copies</label>
                              <input 
                                type="number" 
                                name="copies" 
                                id="copies" 
                                min="1" 
                                max="100" 
                                value={printOptions.copies}
                                onChange={handlePrintOptionsChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm" />
                            </div>
                            
                            {/* Page Size */}
                            <div>
                              <label htmlFor="pageSize" className="block text-xs font-medium text-gray-500">Page Size</label>
                              <select 
                                id="pageSize" 
                                name="pageSize"
                                value={printOptions.pageSize}
                                onChange={handlePrintOptionsChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm">
                                <option value="letter">Letter</option>
                                <option value="legal">Legal</option>
                                <option value="a4">A4</option>
                                <option value="a3">A3</option>
                              </select>
                            </div>
                            
                            {/* Page Range */}
                            <div>
                              <label htmlFor="pageRange" className="block text-xs font-medium text-gray-500">Page Range (e.g., 1-5, 8, 11-13)</label>
                              <input 
                                type="text" 
                                name="pageRange" 
                                id="pageRange"
                                value={printOptions.pageRange}
                                onChange={handlePrintOptionsChange}
                                placeholder="All pages" 
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm" />
                            </div>
                            
                            {/* Options */}
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <input 
                                  id="color" 
                                  name="color" 
                                  type="checkbox" 
                                  checked={printOptions.color}
                                  onChange={handlePrintOptionsChange}
                                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
                                <label htmlFor="color" className="ml-2 block text-xs text-gray-500">
                                  Color printing
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input 
                                  id="duplex" 
                                  name="duplex" 
                                  type="checkbox" 
                                  checked={printOptions.duplex}
                                  onChange={handlePrintOptionsChange}
                                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
                                <label htmlFor="duplex" className="ml-2 block text-xs text-gray-500">
                                  Double-sided
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Token Selection Section */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Select Token Type</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Normal Token Card */}
                            <div 
                              className={`border ${tokenType === "normal" ? "border-blue-500" : "border-gray-200"} rounded-lg p-4 bg-white cursor-pointer`}
                              onClick={() => setTokenType("normal")}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className={`h-6 w-6 rounded-full ${tokenType === "normal" ? "bg-blue-500" : "bg-blue-100"} mr-2`}></div>
                                  <span className="text-lg font-medium text-gray-800">Normal Token</span>
                                </div>
                                <span className="text-lg font-medium">Free</span>
                              </div>
                              
                              <p className="text-gray-500 mb-3">Up to 20 pages per print job</p>
                              
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div 
                                  className="bg-green-500 h-2.5 rounded-full" 
                                  style={{ width: `${(normalTokens.filter(t => t).length / normalTokens.length) * 100}%` }}>
                                </div>
                              </div>
                              
                              <div className="flex justify-between text-sm mb-3">
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                                  <span className="text-gray-600">{Math.round((normalTokens.filter(t => t).length / normalTokens.length) * 100)}% Available</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-red-300 mr-1"></div>
                                  <span className="text-gray-600">{Math.round((normalTokens.filter(t => !t).length / normalTokens.length) * 100)}% Busy</span>
                                </div>
                              </div>
                              
                              {/* Token Grid */}
                              <div className="grid grid-cols-5 gap-2">
                                {normalTokens.slice(0, 15).map((isAvailable, index) => (
                                  <div 
                                    key={`normal-${index}`}
                                    className={`aspect-square w-full rounded border ${isAvailable ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Priority Token Card */}
                            <div 
                              className={`border ${tokenType === "priority" ? "border-blue-500" : "border-gray-200"} rounded-lg p-4 bg-white cursor-pointer`}
                              onClick={() => setTokenType("priority")}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className={`h-6 w-6 rounded-full ${tokenType === "priority" ? "bg-blue-500" : "bg-blue-100"} mr-2`}></div>
                                  <span className="text-lg font-medium text-gray-800">Priority Token</span>
                                </div>
                                <span className="text-lg font-medium">$1.50</span>
                              </div>
                              
                              <p className="text-gray-500 mb-3">Up to 80 pages per print job</p>
                              
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div 
                                  className="bg-green-500 h-2.5 rounded-full" 
                                  style={{ width: `${(priorityTokens.filter(t => t).length / priorityTokens.length) * 100}%` }}>
                                </div>
                              </div>
                              
                              <div className="flex justify-between text-sm mb-3">
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                                  <span className="text-gray-600">{Math.round((priorityTokens.filter(t => t).length / priorityTokens.length) * 100)}% Available</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-red-300 mr-1"></div>
                                  <span className="text-gray-600">{Math.round((priorityTokens.filter(t => !t).length / priorityTokens.length) * 100)}% Busy</span>
                                </div>
                              </div>
                              
                              {/* Token Grid */}
                              <div className="grid grid-cols-5 gap-2">
                                {priorityTokens.slice(0, 15).map((isAvailable, index) => (
                                  <div 
                                    key={`priority-${index}`}
                                    className={`aspect-square w-full rounded border ${isAvailable ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={handlePrintSubmit}
                  disabled={isUploading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm">
                  {isUploading ? "Processing..." : tokenType === 'priority' ? "Continue to Payment" : "Print Document"}
                </button>
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {isDetailModalOpen && selectedDocument && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="detail-modal-title">
                      Document Details
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center mb-3">
                          <File className="h-8 w-8 text-gray-500 mr-3" />
                          <div>
                            <h4 className="text-base font-medium text-gray-900">{selectedDocument.name}</h4>
                            <p className="text-sm text-gray-500">
                              {selectedDocument.pages ? `${selectedDocument.pages} pages` : ''} 
                              {selectedDocument.size ? ` • ${selectedDocument.size}` : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                              <dt className="text-xs font-medium text-gray-500">Status</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedDocument.status}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-xs font-medium text-gray-500">Printer</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedDocument.location}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-xs font-medium text-gray-500">Time Left</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedDocument.timeLeft || 'Complete'}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-xs font-medium text-gray-500">Submitted</dt>
                              <dd className="mt-1 text-sm text-gray-900">{formatTimeAgo(selectedDocument.timestamp)}</dd>
                            </div>
                          </dl>
                        </div>
                        
                        {selectedDocument.options && (
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <h5 className="text-xs font-medium text-gray-500 mb-2">Print Options</h5>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                              <div className="sm:col-span-1">
                                <dt className="text-xs text-gray-500">Copies</dt>
                                <dd className="text-sm text-gray-900">{selectedDocument.options.copies || 1}</dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-xs text-gray-500">Color</dt>
                                <dd className="text-sm text-gray-900">{selectedDocument.options.color ? 'Yes' : 'No'}</dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-xs text-gray-500">Double-sided</dt>
                                <dd className="text-sm text-gray-900">{selectedDocument.options.duplex ? 'Yes' : 'No'}</dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-xs text-gray-500">Page Size</dt>
                                <dd className="text-sm text-gray-900">{selectedDocument.options.pageSize}</dd>
                              </div>
                            </dl>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedDocument.status === 'printing' && (
                  <button 
                    type="button" 
                    onClick={() => handleCancelDocument(selectedDocument.id)} 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel Print
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Balance Modal */}
      {isAddBalanceModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add Balance
                    </h3>
                    <div className="mt-4">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          min="5"
                          max="100"
                          step="5"
                          value={addBalanceAmount}
                          onChange={(e) => setAddBalanceAmount(parseFloat(e.target.value))}
                          className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {[5, 10, 20, 50].map(amount => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setAddBalanceAmount(amount)}
                            className={`py-2 px-4 border ${addBalanceAmount === amount ? 'bg-gray-100 border-black' : 'border-gray-300'} rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={() => addBalanceMutation.mutate(addBalanceAmount)}
                  disabled={addBalanceMutation.isPending}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm">
                  {addBalanceMutation.isPending ? "Processing..." : <><CreditCard className="mr-2 h-4 w-4" /> Add Funds</>}
                </button>
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Razorpay interface to Window
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default UserDashboard;
