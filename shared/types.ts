// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AuthResponse = {
  user: {
    id: number;
    username: string;
    email: string;
    name?: string;
  };
  token: string;
};

// Print Settings
export type PrintSettings = {
  colorMode: 'Color' | 'Black & White';
  paperSize: 'Letter' | 'Legal' | 'A4';
  copies: number;
  orientation: 'Portrait' | 'Landscape';
  sides: 'One-sided' | 'Two-sided (long edge)' | 'Two-sided (short edge)';
  quality: 'Standard' | 'High' | 'Draft';
};

// AI Recommendation
export type AiRecommendation = {
  colorMode?: 'Color' | 'Black & White';
  paperSize?: 'Letter' | 'Legal' | 'A4';
  copies?: number;
  orientation?: 'Portrait' | 'Landscape';
  sides?: 'One-sided' | 'Two-sided (long edge)' | 'Two-sided (short edge)';
  quality?: 'Standard' | 'High' | 'Draft';
  message: string;
  tips: string[];
};

// Geolocation
export type PrinterLocation = {
  id: number;
  name: string;
  address: string;
  distance: number;
  isOpen: boolean;
  latitude: number;
  longitude: number;
  features?: Record<string, any>;
};

// Dashboard Stats
export type DashboardStats = {
  printJobs: number;
  pagesPrinted: number;
  balance: number;
};

// Pricing Plans
export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
};

// Document Type
export type Document = {
  id: number;
  name: string;
  fileType: string;
  pages: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
};
