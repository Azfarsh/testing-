import { apiRequest } from "./queryClient";
import { PrintSettings, AiRecommendation } from "@shared/types";

export async function uploadDocument(file: File, userId: number): Promise<any> {
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId.toString());
  formData.append('name', file.name);
  
  // Estimate pages based on file type and size
  // In a real implementation, we would analyze the document
  const estimatedPages = estimateDocumentPages(file);
  formData.append('pages', estimatedPages.toString());
  
  try {
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    
    return data.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

function estimateDocumentPages(file: File): number {
  // This is a simplified estimation, in a real system we would analyze the document
  const sizeInMB = file.size / (1024 * 1024);
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  // Rough estimates based on file size and type
  if (fileType === 'pdf') {
    return Math.max(1, Math.ceil(sizeInMB * 10)); // ~100KB per page
  } else if (['doc', 'docx'].includes(fileType || '')) {
    return Math.max(1, Math.ceil(sizeInMB * 8)); // ~125KB per page
  } else if (['ppt', 'pptx'].includes(fileType || '')) {
    return Math.max(1, Math.ceil(sizeInMB * 2)); // ~500KB per slide
  } else if (['xls', 'xlsx'].includes(fileType || '')) {
    return Math.max(1, Math.ceil(sizeInMB * 5)); // ~200KB per sheet
  } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType || '')) {
    return 1; // Single page for images
  } else {
    return Math.max(1, Math.ceil(sizeInMB * 5)); // Default estimation
  }
}

export async function submitPrintJob(
  userId: number,
  documentId: number,
  settings: PrintSettings,
  printerId?: number
): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/print-jobs', {
      userId,
      documentId,
      printerId,
      copies: settings.copies,
      colorMode: settings.colorMode,
      paperSize: settings.paperSize,
      orientation: settings.orientation,
      sides: settings.sides,
      quality: settings.quality,
      status: 'pending'
    });
    
    const data = await response.json();
    
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    
    return data.data;
  } catch (error) {
    console.error("Error submitting print job:", error);
    throw error;
  }
}

export async function getAiRecommendation(documentId: number): Promise<AiRecommendation> {
  try {
    const response = await apiRequest('GET', `/api/ai-recommendation/${documentId}`);
    
    const data = await response.json();
    
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    
    return data.data;
  } catch (error) {
    console.error("Error getting AI recommendation:", error);
    throw error;
  }
}

export async function getPrintJobPriceEstimate(
  documentId: number,
  settings: PrintSettings
): Promise<number> {
  // In a real implementation, this would call an API
  // Here we're calculating a basic estimate
  
  try {
    // Get document info to know number of pages
    const response = await apiRequest('GET', `/api/documents/${documentId}`);
    const data = await response.json();
    
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    
    const document = data.data;
    const basePagePrice = settings.colorMode === 'Color' ? 5 : 2; // Rs. 5 for color, Rs. 2 for B&W
    const qualityMultiplier = settings.quality === 'High' ? 1.5 : 
                             settings.quality === 'Draft' ? 0.8 : 1.0;
    const sidesMultiplier = settings.sides.startsWith('Two-sided') ? 0.8 : 1.0; // 20% discount for double-sided
    
    let totalPrice = document.pages * basePagePrice * qualityMultiplier * sidesMultiplier * settings.copies;
    
    // Round to 2 decimal places
    return Math.round(totalPrice * 100) / 100;
  } catch (error) {
    console.error("Error calculating price estimate:", error);
    // Fallback to a default estimate
    return 50.00; // Default estimate of Rs. 50
  }
}
