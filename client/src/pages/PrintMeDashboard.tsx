import React, { useState, useRef, useEffect, useCallback } from "react";

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
  timestamp?: Date;
}

interface Document {
  id: string;
  name: string;
  status: "ready" | "printing" | "error" | "completed" | "processing";
  location: string;
  timeLeft?: string;
  pages?: number;
  size?: string;
  timestamp?: Date;
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

const PrintMeDashboard: React.FC = () => {
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

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Assignment.pdf",
      status: "printing",
      location: "Library Printer 1",
      timeLeft: "2 min left",
      pages: 4,
      size: "1.2 MB",
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    },
    {
      id: "2",
      name: "Research Paper.pdf",
      status: "printing",
      location: "Study Room Printer",
      pages: 12,
      size: "3.4 MB",
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    },
    {
      id: "3",
      name: "Notes.pdf",
      status: "ready",
      location: "Computer Lab Printer",
      pages: 8,
      size: "2.1 MB",
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
  
  // Print options
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    copies: 1,
    color: false,
    duplex: true,
    pageSize: "letter",
    pageRange: "",
  });

  // Available printers
  const [printers] = useState<PrinterLocation[]>([
    { 
      id: "1", 
      name: "Library Printer 1", 
      location: "Main Library - 2nd Floor", 
      status: "available", 
      distance: "50m",
      capabilities: {
        color: true,
        duplex: true,
        maxPageSize: "letter",
        ppm: 30,
      }
    },
    { 
      id: "2", 
      name: "Study Room Printer", 
      location: "West Campus Building", 
      status: "available", 
      distance: "120m",
      capabilities: {
        color: false,
        duplex: true,
        maxPageSize: "legal",
        ppm: 25,
      }
    },
    { 
      id: "3", 
      name: "Computer Lab Printer", 
      location: "Engineering Building", 
      status: "busy", 
      distance: "200m",
      capabilities: {
        color: true,
        duplex: true,
        maxPageSize: "ledger",
        ppm: 40,
      }
    },
    { 
      id: "4", 
      name: "Student Center Printer", 
      location: "Student Center - 1st Floor", 
      status: "available", 
      distance: "350m",
      capabilities: {
        color: true,
        duplex: false,
        maxPageSize: "letter",
        ppm: 20,
      }
    },
    { 
      id: "5", 
      name: "Science Lab Printer", 
      location: "Science Building - Room 302", 
      status: "maintenance", 
      distance: "180m",
      capabilities: {
        color: true,
        duplex: true,
        maxPageSize: "a3",
        ppm: 35,
      }
    },
  ]);

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

  // Auto refresh document statuses simulation
  useEffect(() => {
    // Update statuses and progress every 10 seconds
    const interval = setInterval(() => {
      setDocuments(prev => 
        prev.map(doc => {
          if (doc.status === "printing") {
            // Randomly update progress
            if (doc.timeLeft && doc.timeLeft.includes("min")) {
              const currentMinutes = parseInt(doc.timeLeft.split(" ")[0]);
              if (currentMinutes > 1) {
                return {
                  ...doc,
                  timeLeft: `${currentMinutes - 1} min left`
                };
              } else {
                // Job is now ready
                const notification: Notification = {
                  id: Date.now().toString(),
                  type: "success",
                  title: "Print job ready",
                  message: `${doc.name} is ready for pickup at ${doc.location}`,
                  timestamp: new Date()
                };
                setNotifications(prevNotifs => [notification, ...prevNotifs]);
                
                return {
                  ...doc,
                  status: "ready",
                  timeLeft: undefined
                };
              }
            }
          }
          return doc;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

  // Handler for printer location finder
  const handleFindPrinter = () => {
    setIsPrinterModalOpen(true);
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
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    
    // Add notification
    const doc = documents.find(d => d.id === docId);
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
    
    setIsDetailModalOpen(false);
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
  const calculatePrintCost = useCallback((pages: number, options: PrintOptions): number => {
    const baseCostPerPage = options.color ? 0.25 : 0.10;
    const duplexDiscount = options.duplex ? 0.9 : 1; // 10% discount for duplex
    const copies = options.copies || 1;
    
    return pages * baseCostPerPage * duplexDiscount * copies;
  }, []);

  // Handler for form submission
  const handlePrintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedPrinter) return;

    // Validate balance
    const estimatedPages = Math.floor(selectedFile.size / 30000); // Rough estimate
    const estimatedCost = calculatePrintCost(estimatedPages, printOptions);
    
    if (estimatedCost > balance.availableCredits) {
      setError(`Insufficient balance. Estimated cost: $${estimatedCost.toFixed(2)}`);
      return;
    }

    // Simulate upload with progress
    setIsUploading(true);
    setError(null);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      // Simulate occasional upload issues
      if (progress === 75 && Math.random() > 0.8) {
        clearInterval(interval);
        setError("Network connection interrupted. Please try again.");
        setIsUploading(false);
        return;
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Create new document
        const newDocument: Document = {
          id: Date.now().toString(),
          name: selectedFile.name,
          status: "processing",
          location: printers.find(p => p.id === selectedPrinter)?.name || "",
          pages: estimatedPages,
          size: (selectedFile.size / (1024 * 1024)).toFixed(1) + " MB",
          timestamp: new Date(),
          options: printOptions
        };
        
        // Simulate processing time before printing starts
        setTimeout(() => {
          setDocuments(prev => {
            const updatedDocs = prev.map(doc => {
              if (doc.id === newDocument.id) {
                return {
                  ...doc,
                  status: "printing" as const,
                  timeLeft: `${Math.max(1, Math.floor(estimatedPages / 5))} min left`
                };
              }
              return doc;
            });
            
            // If document wasn't found (shouldn't happen), add it
            if (!updatedDocs.some(doc => doc.id === newDocument.id)) {
              return [
                {
                  ...newDocument,
                  status: "printing" as const,
                  timeLeft: `${Math.max(1, Math.floor(estimatedPages / 5))} min left`
                },
                ...updatedDocs
              ];
            }
            
            return updatedDocs;
          });
        }, 2000);
        
        setDocuments(prev => [newDocument, ...prev]);
        
        // Add notification
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "info",
          title: "Print job submitted",
          message: `${selectedFile.name} sent to ${printers.find(p => p.id === selectedPrinter)?.name}`,
          timestamp: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        // Update balance
        setBalance(prev => {
          const newBalance = Math.max(0, prev.availableCredits - estimatedCost);
          const newPercent = Math.floor(newBalance / prev.totalAllocation * 100);
          
          // Add low balance warning if under $5
          if (newBalance < 5 && prev.availableCredits >= 5) {
            const warningNotification: Notification = {
              id: Date.now().toString() + "-warn",
              type: "warning",
              title: "Low balance warning",
              message: "Less than $5 remaining in your account",
              timestamp: new Date()
            };
            setNotifications(prevNotifs => [warningNotification, ...prevNotifs]);
          }
          
          return {
            ...prev,
            availableCredits: newBalance,
            percentRemaining: newPercent
          };
        });
        
        // Close modal after short delay
        setTimeout(() => {
          closeModal();
        }, 500);
      }
    }, 150);
  };

  // Handler for add balance submission
  const handleAddBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update balance
    setBalance(prev => {
      const newBalance = prev.availableCredits + addBalanceAmount;
      return {
        ...prev,
        availableCredits: newBalance,
        percentRemaining: Math.floor(newBalance / prev.totalAllocation * 100)
      };
    });
    
    // Add notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "success",
      title: "Balance added",
      message: `$${addBalanceAmount.toFixed(2)} added to your account`,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Close modal
    closeModal();
  };

  // Clear notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Format timestamp
  const formatTimestamp = (date?: Date): string => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    return date.toLocaleDateString();
  };

  // Helper function to get notification icon
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return (
          <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "success":
        return (
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "info":
        return (
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "error":
        return (
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Helper function to get status badge styling
  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "ready":
        return { bg: "bg-green-100", text: "text-green-800", label: "Ready to Collect" };
      case "printing":
        return { bg: "bg-yellow-100", text: "text-yellow-800", label: "In Queue" };
      case "processing":
        return { bg: "bg-blue-100", text: "text-blue-800", label: "Processing" };
      case "error":
        return { bg: "bg-red-100", text: "text-red-800", label: "Error" };
      case "completed":
        return { bg: "bg-gray-100", text: "text-gray-800", label: "Completed" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: status };
    }
  };

  // Helper function to get printer status badge styling
  const getPrinterStatusBadge = (status: PrinterLocation["status"]) => {
    switch (status) {
      case "available":
        return { bg: "bg-green-100", text: "text-green-800", label: "Available" };
      case "busy":
        return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Busy" };
      case "maintenance":
        return { bg: "bg-red-100", text: "text-red-800", label: "Maintenance" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: status };
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My PrintMe Dashboard</h1>
      </div>

      {/* Balance Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Print Balance</h2>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ${balance.availableCredits.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-3 md:mt-0">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              Enough for about {balance.percentRemaining} black & white pages
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${balance.percentRemaining}%` }}>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleUploadClick}
              className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-150"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Print New Document
            </button>
            <button 
              onClick={handleFindPrinter}
              className="flex items-center justify-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition duration-150"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find Nearest Printer
            </button>
            <button 
              onClick={handleAddBalance}
              className="flex items-center justify-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition duration-150"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add Print Balance
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h2>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start group">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                      {notification.timestamp && (
                        <span className="text-xs text-gray-500 ml-2">{formatTimestamp(notification.timestamp)}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                  </div>
                  <button 
                    onClick={() => clearNotification(notification.id)}
                    className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No new notifications</p>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">My Documents</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => {
                const status = getStatusBadge(doc.status);
                return (
                  <tr 
                    key={doc.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <td className="py-4 pl-4 pr-3 text-sm sm:pl-0">
                      <div className="font-medium text-gray-900">{doc.name}</div>
                      <div className="text-gray-500 text-xs flex flex-wrap items-center mt-1">
                        {doc.timestamp && (
                          <span className="mr-2">{formatTimestamp(doc.timestamp)}</span>
                        )}
                        {doc.pages && <span className="mr-2">{doc.pages} pages</span>}
                        {doc.size && <span>{doc.size}</span>}
                        {doc.timeLeft && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">{doc.timeLeft}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                      {doc.location}
                    </td>
                    <td className="px-3 py-4 text-right text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-4 ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Document to Print</h3>
                    <div className="mt-4">
                      <form onSubmit={handlePrintSubmit}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Document</label>
                          <div 
                            ref={dragAreaRef}
                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 border-dashed'
                            } rounded-md`}
                          >
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                  <span>Upload a file</span>
                                  <input 
                                    id="file-upload" 
                                    name="file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PDF, DOC, PPT, XLS up to 10MB</p>
                            </div>
                          </div>
                          {selectedFile && (
                            <p className="mt-2 text-sm text-gray-600">
                              Selected: <span className="font-medium">{selectedFile?.name}</span> ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        <div className="mb-4">
                          <label htmlFor="printer-select" className="block text-sm font-medium text-gray-700 mb-1">Select Printer</label>
                          <select
                            id="printer-select"
                            name="printer-select"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={selectedPrinter}
                            onChange={handlePrinterSelect}
                          >
                            <option value="" disabled>Select a printer</option>
                            {printers.filter(p => p.status !== "maintenance").map(printer => (
                              <option key={printer.id} value={printer.id}>
                                {printer.name} - {printer.location}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedPrinter && (
                          <div className="mb-4 bg-gray-50 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Print Options</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label htmlFor="copies" className="block text-sm text-gray-600">
                                  Copies
                                </label>
                                <input
                                  type="number"
                                  id="copies"
                                  name="copies"
                                  min="1"
                                  max="99"
                                  value={printOptions.copies}
                                  onChange={handlePrintOptionsChange}
                                  className="w-16 text-right border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                />
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="color"
                                  name="color"
                                  checked={printOptions.color}
                                  onChange={handlePrintOptionsChange}
                                  disabled={!printers.find(p => p.id === selectedPrinter)?.capabilities?.color}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="color" className="ml-2 block text-sm text-gray-600">
                                  Color printing
                                </label>
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="duplex"
                                  name="duplex"
                                  checked={printOptions.duplex}
                                  onChange={handlePrintOptionsChange}
                                  disabled={!printers.find(p => p.id === selectedPrinter)?.capabilities?.duplex}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="duplex" className="ml-2 block text-sm text-gray-600">
                                  Double-sided (10% discount)
                                </label>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <label htmlFor="pageSize" className="block text-sm text-gray-600">
                                  Page Size
                                </label>
                                <select
                                  id="pageSize"
                                  name="pageSize"
                                  value={printOptions.pageSize}
                                  onChange={handlePrintOptionsChange}
                                  className="w-32 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                >
                                  <option value="letter">Letter</option>
                                  <option value="legal">Legal</option>
                                  <option value="a4">A4</option>
                                  <option value="a3">A3</option>
                                </select>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <label htmlFor="pageRange" className="block text-sm text-gray-600">
                                  Page Range (optional)
                                </label>
                                <input
                                  type="text"
                                  id="pageRange"
                                  name="pageRange"
                                  placeholder="e.g. 1-5, 8"
                                  value={printOptions.pageRange}
                                  onChange={handlePrintOptionsChange}
                                  className="w-32 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {error && (
                          <div className="mb-4 bg-red-50 p-3 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                          </div>
                        )}

                        {isUploading && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Uploading...</label>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 text-right">{uploadProgress}%</p>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handlePrintSubmit}
                  disabled={!selectedFile || !selectedPrinter || isUploading}
                >
                  Print Document
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Find Printer Modal */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Nearby Printers</h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">Printers sorted by distance from your current location</p>
                      
                      <div className="overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                          {printers
                            .sort((a, b) => {
                              // Sort by distance (remove 'm' and convert to number)
                              const distA = a.distance ? parseInt(a.distance.replace('m', '')) : 9999;
                              const distB = b.distance ? parseInt(b.distance.replace('m', '')) : 9999;
                              return distA - distB;
                            })
                            .map(printer => {
                              const status = getPrinterStatusBadge(printer.status);
                              return (
                                <li key={printer.id} className="py-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">{printer.name}</h4>
                                      <p className="text-sm text-gray-500">{printer.location}</p>
                                      <div className="flex items-center mt-1">
                                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-xs text-gray-500">{printer.distance || "Unknown"} away</span>
                                      </div>
                                      <div className="flex flex-wrap mt-1 gap-1">
                                        {printer.capabilities?.color && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            Color
                                          </span>
                                        )}
                                        {printer.capabilities?.duplex && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Double-sided
                                          </span>
                                        )}
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                          {printer.capabilities?.ppm} PPM
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-4 ${status.bg} ${status.text}`}>
                                        {status.label}
                                      </span>
                                      {printer.status === "available" && (
                                        <button 
                                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                          onClick={() => {
                                            setSelectedPrinter(printer.id);
                                            setIsPrinterModalOpen(false);
                                            setIsUploadModalOpen(true);
                                          }}
                                        >
                                          Print here
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Balance Modal */}
      {isAddBalanceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Add Print Balance</h3>
                    <div className="mt-4">
                      <form onSubmit={handleAddBalanceSubmit}>
                        <div className="mb-4">
                          <label htmlFor="balance-amount" className="block text-sm font-medium text-gray-700 mb-1">Amount to add ($)</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              name="balance-amount"
                              id="balance-amount"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              step="0.01"
                              min="1"
                              value={addBalanceAmount}
                              onChange={(e) => setAddBalanceAmount(parseFloat(e.target.value))}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">USD</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quick Amounts</label>
                          <div className="grid grid-cols-4 gap-2 mt-1">
                            {[5, 10, 20, 50].map(amount => (
                              <button
                                key={amount}
                                type="button"
                                className={`py-2 px-4 rounded-md text-sm font-medium ${
                                  addBalanceAmount === amount
                                    ? 'bg-blue-100 text-blue-800 border border-blue-500'
                                    : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                }`}
                                onClick={() => setAddBalanceAmount(amount)}
                              >
                                ${amount}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                          <div className="mt-1 space-y-3">
                            <div className="flex items-center p-3 border border-gray-300 rounded-md bg-blue-50">
                              <input
                                id="payment-campus-account"
                                name="payment-method"
                                type="radio"
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                defaultChecked
                              />
                              <label htmlFor="payment-campus-account" className="ml-3 block text-sm font-medium text-gray-700">
                                Campus Account
                                <span className="block text-xs text-gray-500">Balance: $120.75</span>
                              </label>
                            </div>
                            <div className="flex items-center p-3 border border-gray-300 rounded-md">
                              <input
                                id="payment-credit-card"
                                name="payment-method"
                                type="radio"
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <label htmlFor="payment-credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                                Credit/Debit Card
                              </label>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddBalanceSubmit}
                  disabled={!addBalanceAmount || addBalanceAmount <= 0}
                >
                  Add Balance
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {isDetailModalOpen && selectedDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Document Details</h3>
                      {selectedDocument.status === "ready" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ready for Pickup
                        </span>
                      )}
                      {selectedDocument.status === "printing" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          In Queue - {selectedDocument.timeLeft}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <h4 className="text-base font-medium text-gray-900">{selectedDocument.name}</h4>
                      
                      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1 text-sm text-gray-900">{getStatusBadge(selectedDocument.status).label}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Location</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedDocument.location}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Pages</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedDocument.pages || 'Unknown'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Size</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedDocument.size || 'Unknown'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedDocument.timestamp ? 
                              selectedDocument.timestamp.toLocaleString() : 
                              'Unknown'}
                          </dd>
                        </div>
                        {selectedDocument.options && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Print Options</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <ul className="list-disc pl-5 space-y-1">
                                <li>{selectedDocument.options.copies} {selectedDocument.options.copies === 1 ? 'copy' : 'copies'}</li>
                                <li>{selectedDocument.options.color ? 'Color' : 'Black & White'}</li>
                                <li>{selectedDocument.options.duplex ? 'Double-sided' : 'Single-sided'}</li>
                                <li>Size: {selectedDocument.options.pageSize.toUpperCase()}</li>
                                {selectedDocument.options.pageRange && (
                                  <li>Pages: {selectedDocument.options.pageRange}</li>
                                )}
                              </ul>
                            </dd>
                          </div>
                        )}
                      </dl>
                      
                      {selectedDocument.status === "ready" && (
                        <div className="mt-4">
                          <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                  Your document is ready for pickup at {selectedDocument.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {(selectedDocument.status === "printing" || selectedDocument.status === "processing") && (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleCancelDocument(selectedDocument.id)}
                  >
                    Cancel Print Job
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My PrintMe Dashboard</h1>
      </div>

      {/* Balance Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Print Balance</h2>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ${balance.availableCredits.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-3 md:mt-0">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              Enough for about {balance.percentRemaining} black & white pages
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${balance.percentRemaining}%` }}>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleUploadClick}
              className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-150"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Print New Document
            </button>
            <button 
              onClick={handleFindPrinter}
              className="flex items-center justify-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition duration-150"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find Nearest Printer
            </button>
            <button 
              onClick={handleAddBalance}
              className="flex items-center justify-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition duration-150"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add Print Balance
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h2>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No new notifications</p>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">My Documents</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => {
                const status = getStatusBadge(doc.status);
                return (
                  <tr key={doc.id}>
                    <td className="py-4 pl-4 pr-3 text-sm sm:pl-0">
                      <div className="font-medium text-gray-900">{doc.name}</div>
                      <div className="text-gray-500 text-xs flex items-center mt-1">
                        {doc.pages && <span className="mr-2">{doc.pages} pages</span>}
                        {doc.size && <span>{doc.size}</span>}
                        {doc.timeLeft && (
                          <span className="ml-2">{doc.timeLeft}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                      {doc.location}
                    </td>
                    <td className="px-3 py-4 text-right text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-4 ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Document to Print</h3>
                    <div className="mt-4">
                      <form onSubmit={handlePrintSubmit}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Document</label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                  <span>Upload a file</span>
                                  <input 
                                    id="file-upload" 
                                    name="file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PDF, DOC, PPT, XLS up to 10MB</p>
                            </div>
                          </div>
                          {selectedFile && (
                            <p className="mt-2 text-sm text-gray-600">
                              Selected: <span className="font-medium">{selectedFile?.name}</span> ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        <div className="mb-4">
                          <label htmlFor="printer-select" className="block text-sm font-medium text-gray-700 mb-1">Select Printer</label>
                          <select
                            id="printer-select"
                            name="printer-select"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={selectedPrinter}
                            onChange={handlePrinterSelect}
                          >
                            <option value="" disabled>Select a printer</option>
                            {printers.filter(p => p.status !== "maintenance").map(printer => (
                              <option key={printer.id} value={printer.id}>
                                {printer.name} - {printer.location}
                              </option>
                            ))}
                          </select>
                        </div>

                        {isUploading && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Uploading...</label>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 text-right">{uploadProgress}%</p>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handlePrintSubmit}
                  disabled={!selectedFile || !selectedPrinter || isUploading}
                >
                  Print Document
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Find Printer Modal */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Nearby Printers</h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">Printers sorted by distance from your current location</p>
                      
                      <div className="overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                          {printers
                            .sort((a, b) => {
                              // Sort by distance (remove 'm' and convert to number)
                              const distA = a.distance ? parseInt(a.distance.replace('m', '')) : 9999;
                              const distB = b.distance ? parseInt(b.distance.replace('m', '')) : 9999;
                              return distA - distB;
                            })
                            .map(printer => {
                              const status = getPrinterStatusBadge(printer.status);
                              return (
                                <li key={printer.id} className="py-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">{printer.name}</h4>
                                      <p className="text-sm text-gray-500">{printer.location}</p>
                                      <div className="flex items-center mt-1">
                                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-xs text-gray-500">{printer.distance || "Unknown"} away</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-4 ${status.bg} ${status.text}`}>
                                        {status.label}
                                      </span>
                                      {printer.status === "available" && (
                                        <button 
                                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                          onClick={() => {
                                            setSelectedPrinter(printer.id);
                                            setIsPrinterModalOpen(false);
                                            setIsUploadModalOpen(true);
                                          }}
                                        >
                                          Print here
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Balance Modal */}
      {isAddBalanceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Add Print Balance</h3>
                    <div className="mt-4">
                      <form onSubmit={handleAddBalanceSubmit}>
                        <div className="mb-4">
                          <label htmlFor="balance-amount" className="block text-sm font-medium text-gray-700 mb-1">Amount to add ($)</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              name="balance-amount"
                              id="balance-amount"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              step="0.01"
                              min="1"
                              value={addBalanceAmount}
                              onChange={(e) => setAddBalanceAmount(parseFloat(e.target.value))}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">USD</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quick Amounts</label>
                          <div className="grid grid-cols-4 gap-2 mt-1">
                            {[5, 10, 20, 50].map(amount => (
                              <button
                                key={amount}
                                type="button"
                                className={`py-2 px-4 rounded-md text-sm font-medium ${
                                  addBalanceAmount === amount
                                    ? 'bg-blue-100 text-blue-800 border border-blue-500'
                                    : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                }`}
                                onClick={() => setAddBalanceAmount(amount)}
                              >
                                ${amount}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                          <div className="mt-1 space-y-3">
                            <div className="flex items-center p-3 border border-gray-300 rounded-md bg-blue-50">
                              <input
                                id="payment-campus-account"
                                name="payment-method"
                                type="radio"
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                defaultChecked
                              />
                              <label htmlFor="payment-campus-account" className="ml-3 block text-sm font-medium text-gray-700">
                                Campus Account
                                <span className="block text-xs text-gray-500">Balance: $120.75</span>
                              </label>
                            </div>
                            <div className="flex items-center p-3 border border-gray-300 rounded-md">
                              <input
                                id="payment-credit-card"
                                name="payment-method"
                                type="radio"
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <label htmlFor="payment-credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                                Credit/Debit Card
                              </label>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddBalanceSubmit}
                  disabled={!addBalanceAmount || addBalanceAmount <= 0}
                >
                  Add Balance
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
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

export default PrintMeDashboard;