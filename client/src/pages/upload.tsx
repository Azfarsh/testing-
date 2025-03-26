import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  uploadDocument, 
  getAiRecommendation, 
  submitPrintJob,
  getPrintJobPriceEstimate
} from "@/lib/printApi";
import { getNearbyPrinters, getCurrentPosition } from "@/lib/geolocation";
import { initiateRazorpayPayment, loadRazorpayScript } from "@/lib/razorpay";
import { PrintSettings, AiRecommendation, Document, PrinterLocation } from "@shared/types";
import { 
  Upload, 
  File, 
  FileText,
  FileImage,
  UploadCloud,
  Check,
  X,
  Printer,
  Bot,
  AlertCircle,
  MapPin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to get file icon based on type
const getFileIcon = (fileType: string) => {
  if (['pdf'].includes(fileType)) {
    return <FileText className="h-5 w-5 text-gray-400" />;
  } else if (['doc', 'docx', 'txt'].includes(fileType)) {
    return <FileText className="h-5 w-5 text-gray-400" />;
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
    return <FileImage className="h-5 w-5 text-gray-400" />;
  } else {
    return <File className="h-5 w-5 text-gray-400" />;
  }
};

const UploadDocument = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firebaseUser, setFirebaseUser] = useState(getCurrentUser());
  const [userId, setUserId] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    colorMode: 'Black & White',
    paperSize: 'A4',
    copies: 1,
    orientation: 'Portrait',
    sides: 'One-sided',
    quality: 'Standard'
  });
  const [aiRecommendation, setAiRecommendation] = useState<AiRecommendation | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterLocation | null>(null);
  const [showPrinterSelect, setShowPrinterSelect] = useState(false);
  const [nearbyPrinters, setNearbyPrinters] = useState<PrinterLocation[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Create a staggered animation effect
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
              description: "Please log in to upload documents",
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

  // Fetch recent user documents
  const { 
    data: documentsData, 
    isLoading: isLoadingDocuments 
  } = useQuery({
    queryKey: [userId ? `/api/documents?userId=${userId}` : null],
    enabled: !!userId,
  });

  // Mutation for document upload
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("User not authenticated");
      return await uploadDocument(file, userId);
    },
    onSuccess: (data) => {
      setUploadedDocument(data);
      queryClient.invalidateQueries({ queryKey: [`/api/documents?userId=${userId}`] });
      toast({
        title: "Document uploaded successfully",
        variant: "default",
      });
      
      // Get AI recommendation for the document
      getAiRecommendations(data.id);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    }
  });

  // Get AI recommendations for document
  const getAiRecommendations = async (documentId: number) => {
    try {
      const recommendation = await getAiRecommendation(documentId);
      setAiRecommendation(recommendation);
      
      // If there are recommendations, update the price estimate
      if (recommendation) {
        const updatedSettings = { ...printSettings };
        
        if (recommendation.colorMode) {
          updatedSettings.colorMode = recommendation.colorMode;
        }
        if (recommendation.paperSize) {
          updatedSettings.paperSize = recommendation.paperSize;
        }
        if (recommendation.orientation) {
          updatedSettings.orientation = recommendation.orientation;
        }
        if (recommendation.sides) {
          updatedSettings.sides = recommendation.sides;
        }
        if (recommendation.quality) {
          updatedSettings.quality = recommendation.quality;
        }
        if (recommendation.copies) {
          updatedSettings.copies = recommendation.copies;
        }
        
        // Don't apply recommendations automatically, but keep them for user to apply
      }
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
    }
  };

  // Update price estimate when settings change
  useEffect(() => {
    const updatePriceEstimate = async () => {
      if (uploadedDocument) {
        try {
          const price = await getPrintJobPriceEstimate(uploadedDocument.id, printSettings);
          setEstimatedPrice(price);
        } catch (error) {
          console.error("Error getting price estimate:", error);
        }
      }
    };
    
    updatePriceEstimate();
  }, [uploadedDocument, printSettings]);

  // Handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Common upload handler
  const handleFileUpload = (file: File) => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    const supportedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'txt'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!supportedTypes.includes(fileExtension)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, Office document, or image file",
        variant: "destructive",
      });
      return;
    }
    
    setUploadedFile(file);
    uploadMutation.mutate(file);
  };

  // Handle form input changes
  const handleSettingChange = (name: keyof PrintSettings, value: any) => {
    setPrintSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply AI recommendations
  const applyRecommendations = () => {
    if (aiRecommendation) {
      const updatedSettings = { ...printSettings };
      
      if (aiRecommendation.colorMode) {
        updatedSettings.colorMode = aiRecommendation.colorMode;
      }
      if (aiRecommendation.paperSize) {
        updatedSettings.paperSize = aiRecommendation.paperSize;
      }
      if (aiRecommendation.orientation) {
        updatedSettings.orientation = aiRecommendation.orientation;
      }
      if (aiRecommendation.sides) {
        updatedSettings.sides = aiRecommendation.sides;
      }
      if (aiRecommendation.quality) {
        updatedSettings.quality = aiRecommendation.quality;
      }
      if (aiRecommendation.copies) {
        updatedSettings.copies = aiRecommendation.copies;
      }
      
      setPrintSettings(updatedSettings);
      
      toast({
        title: "Recommendations applied",
        description: "AI-recommended settings have been applied to your print job",
      });
    }
  };

  // Proceed to printer selection
  const proceedToSelectPrinter = async () => {
    if (!uploadedDocument) {
      toast({
        title: "No document selected",
        description: "Please upload or select a document first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get user's location
      const position = await getCurrentPosition();
      
      // Fetch nearby printers
      const printers = await getNearbyPrinters(
        position.coords.latitude,
        position.coords.longitude,
        10 // 10km radius
      );
      
      setNearbyPrinters(printers);
      setShowPrinterSelect(true);
    } catch (error) {
      toast({
        title: "Error finding printers",
        description: "Failed to get your location or find nearby printers",
        variant: "destructive",
      });
    }
  };

  // Select printer and proceed
  const handlePrinterSelect = (printer: PrinterLocation) => {
    setSelectedPrinter(printer);
    setShowPrinterSelect(false);
    setShowPaymentDialog(true);
  };

  // Proceed with payment
  const handleProceedToPayment = async () => {
    if (!uploadedDocument || !userId) {
      toast({
        title: "Missing information",
        description: "Document or user information is missing",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First, create the print job
      const printJob = await submitPrintJob(
        userId,
        uploadedDocument.id,
        printSettings,
        selectedPrinter?.id
      );
      
      // Ensure Razorpay script is loaded
      await loadRazorpayScript();
      
      // Initiate payment
      if (estimatedPrice) {
        const paymentResponse = await initiateRazorpayPayment(
          {
            amount: Math.round(estimatedPrice * 100), // convert to paise
            currency: "INR",
            name: "PrintX",
            description: `Print job for ${uploadedDocument.name}`,
            prefill: {
              name: firebaseUser?.displayName || undefined,
              email: firebaseUser?.email || undefined
            },
            theme: {
              color: "#000000"
            }
          },
          userId,
          printJob.id
        );
        
        if (paymentResponse.status === 'success') {
          // Update print job status to paid
          await apiRequest('PUT', `/api/print-jobs/${printJob.id}/status`, {
            status: 'processing',
            paymentId: paymentResponse.paymentId
          });
          
          // Show success message
          toast({
            title: "Payment successful",
            description: "Your print job has been submitted successfully",
          });
          
          // Navigate to dashboard
          setLocation("/dashboard");
        } else if (paymentResponse.status === 'cancelled') {
          toast({
            title: "Payment cancelled",
            description: "You can try again when you're ready"
          });
          
          setShowPaymentDialog(false);
        }
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An error occurred during payment",
        variant: "destructive",
      });
      
      setShowPaymentDialog(false);
    }
  };

  // Documents from user history
  const recentDocuments = documentsData?.data || [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 font-heading">Upload Document</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <Card>
                <CardContent className="p-6">
                  <motion.div 
                    className="max-w-lg mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                  >
                    {/* Upload Area */}
                    <motion.div variants={fadeInUp}>
                      <div 
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                          isDragging 
                            ? 'border-black bg-gray-50' 
                            : 'border-gray-300'
                        } transition-colors`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-1 text-center">
                          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-900">
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                ref={fileInputRef}
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG up to 10MB
                          </p>
                        </div>
                      </div>
                      
                      {/* Selected File Info */}
                      {uploadedFile && uploadedDocument && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {getFileIcon(uploadedFile.name.split('.').pop() || '')}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {uploadedDocument.pages} pages • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setUploadedFile(null);
                                  setUploadedDocument(null);
                                  setAiRecommendation(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Recently Uploaded Files */}
                    <motion.div variants={fadeInUp} className="mt-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Documents</h3>
                      {isLoadingDocuments ? (
                        <ul className="mt-2 divide-y divide-gray-200">
                          {Array(3).fill(0).map((_, i) => (
                            <li key={i} className="py-3 flex justify-between items-center">
                              <div className="flex items-center">
                                <Skeleton className="h-5 w-5 mr-3 rounded" />
                                <Skeleton className="h-5 w-40" />
                              </div>
                              <Skeleton className="h-8 w-16" />
                            </li>
                          ))}
                        </ul>
                      ) : recentDocuments.length > 0 ? (
                        <ul className="mt-2 divide-y divide-gray-200">
                          {recentDocuments.slice(0, 5).map((doc) => (
                            <li key={doc.id} className="py-3 flex justify-between items-center">
                              <div className="flex items-center">
                                {getFileIcon(doc.fileType)}
                                <span className="ml-3 text-sm font-medium text-gray-900">{doc.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUploadedDocument(doc);
                                  getAiRecommendations(doc.id);
                                  toast({
                                    title: "Document selected",
                                    description: `${doc.name} selected for printing`,
                                  });
                                }}
                              >
                                Select
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No recent documents found</p>
                      )}
                    </motion.div>

                    {/* Print Settings - Only show if document is uploaded */}
                    {uploadedDocument && (
                      <motion.div variants={fadeInUp} className="mt-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Print Settings</h3>
                        <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <Label htmlFor="color-mode">Color Mode</Label>
                            <Select
                              value={printSettings.colorMode}
                              onValueChange={(value) => handleSettingChange('colorMode', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select color mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Color">Color</SelectItem>
                                <SelectItem value="Black & White">Black & White</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="sm:col-span-3">
                            <Label htmlFor="paper-size">Paper Size</Label>
                            <Select
                              value={printSettings.paperSize}
                              onValueChange={(value) => handleSettingChange('paperSize', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select paper size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Letter">Letter (8.5" x 11")</SelectItem>
                                <SelectItem value="Legal">Legal (8.5" x 14")</SelectItem>
                                <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="sm:col-span-3">
                            <Label htmlFor="copies">Number of Copies</Label>
                            <Input
                              type="number"
                              id="copies"
                              min="1"
                              value={printSettings.copies}
                              onChange={(e) => handleSettingChange('copies', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <Label htmlFor="orientation">Orientation</Label>
                            <Select
                              value={printSettings.orientation}
                              onValueChange={(value) => handleSettingChange('orientation', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select orientation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Portrait">Portrait</SelectItem>
                                <SelectItem value="Landscape">Landscape</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="sm:col-span-3">
                            <Label htmlFor="sides">Sides</Label>
                            <Select
                              value={printSettings.sides}
                              onValueChange={(value) => handleSettingChange('sides', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select sides" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="One-sided">One-sided</SelectItem>
                                <SelectItem value="Two-sided (long edge)">Two-sided (long edge)</SelectItem>
                                <SelectItem value="Two-sided (short edge)">Two-sided (short edge)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="sm:col-span-3">
                            <Label htmlFor="quality">Print Quality</Label>
                            <Select
                              value={printSettings.quality}
                              onValueChange={(value) => handleSettingChange('quality', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Standard">Standard</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Price Estimate */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Estimated Price:</span>
                            <span className="text-lg font-bold text-black">
                              {estimatedPrice !== null ? `₹${estimatedPrice.toFixed(2)}` : 'Calculating...'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* AI Recommendations - Only show if document is uploaded and recommendation is available */}
                    {uploadedDocument && aiRecommendation && (
                      <motion.div variants={fadeInUp} className="mt-6 bg-gray-50 p-4 rounded-md">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <Bot className="h-5 w-5 text-black" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">AI Print Recommendations</h3>
                            <div className="mt-2 text-sm text-gray-500">
                              <p>{aiRecommendation.message}</p>
                              <ul className="list-disc pl-5 mt-1 space-y-1">
                                {aiRecommendation.tips.map((tip, index) => (
                                  <li key={index}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-2">
                              <Button onClick={applyRecommendations} size="sm">
                                Apply Recommendations
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <motion.div variants={fadeInUp} className="mt-8 flex justify-end">
                      <Button
                        variant="outline"
                        className="mr-3"
                        onClick={() => setLocation("/dashboard")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={proceedToSelectPrinter}
                        disabled={!uploadedDocument || uploadMutation.isPending}
                      >
                        {uploadMutation.isPending ? "Uploading..." : "Continue"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Printer Selection Dialog */}
      <Dialog open={showPrinterSelect} onOpenChange={setShowPrinterSelect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Printer</DialogTitle>
            <DialogDescription>
              Choose a printer location from the list below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto">
            {nearbyPrinters.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {nearbyPrinters.map((printer) => (
                  <li key={printer.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{printer.name}</p>
                        <p className="text-xs text-gray-500">{printer.address}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">{printer.distance.toFixed(1)} km</p>
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            printer.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {printer.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePrinterSelect(printer)}
                        disabled={!printer.isOpen}
                        variant={printer.isOpen ? "default" : "outline"}
                        size="sm"
                      >
                        Select
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center text-gray-500">
                <MapPin className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p>No nearby printers found</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrinterSelect(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Print Job</DialogTitle>
            <DialogDescription>
              Review your order details before proceeding to payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Document</h4>
              <p className="text-sm text-gray-500">{uploadedDocument?.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900">Print Settings</h4>
              <ul className="mt-1 space-y-1 text-sm text-gray-500">
                <li>Pages: {uploadedDocument?.pages}</li>
                <li>Copies: {printSettings.copies}</li>
                <li>Color: {printSettings.colorMode}</li>
                <li>Size: {printSettings.paperSize}</li>
                <li>Orientation: {printSettings.orientation}</li>
                <li>Sides: {printSettings.sides}</li>
                <li>Quality: {printSettings.quality}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900">Printer Location</h4>
              <p className="text-sm text-gray-500">{selectedPrinter?.name}</p>
              <p className="text-sm text-gray-500">{selectedPrinter?.address}</p>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-base font-medium text-gray-900">Total Amount:</span>
                <span className="text-base font-medium text-black">
                  {estimatedPrice !== null ? `₹${estimatedPrice.toFixed(2)}` : 'Calculating...'}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleProceedToPayment}>
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadDocument;
