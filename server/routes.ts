import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertUserSchema, 
  insertDocumentSchema, 
  insertPrintJobSchema, 
  insertPaymentSchema,
  insertContactFormSchema
} from "@shared/schema";

const upload = multer({ 
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../uploads');
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function for API responses
  const apiResponse = <T>(res: Response, data: T, status = 200) => {
    return res.status(status).json({
      success: true,
      data
    });
  };

  const errorResponse = (res: Response, error: string, status = 400) => {
    return res.status(status).json({
      success: false,
      error
    });
  };

  // API Routes
  // User routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return errorResponse(res, 'User with this email already exists', 409);
      }
      
      const user = await storage.createUser(validatedData);
      return apiResponse(res, { 
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      });
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to register user');
    }
  });

  app.post('/api/auth/firebase-auth', async (req, res) => {
    try {
      const { uid, email, displayName } = req.body;
      
      if (!uid || !email) {
        return errorResponse(res, 'Missing required fields', 400);
      }
      
      // Check if user already exists by firebase UID
      let user = await storage.getUserByFirebaseUid(uid);
      
      if (!user) {
        // Also check by email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update existing user with Firebase UID
          user = await storage.updateUser(user.id, { firebaseUid: uid });
        } else {
          // Create new user
          const username = email.split('@')[0] + Date.now().toString().slice(-4);
          user = await storage.createUser({
            username,
            email,
            password: '', // Not used with Firebase auth
            name: displayName,
            firebaseUid: uid
          });
        }
      }
      
      return apiResponse(res, {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      });
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to authenticate with Firebase');
    }
  });

  // Document routes
  app.get('/api/documents', async (req, res) => {
    try {
      const userIdParam = req.query.userId;
      
      if (!userIdParam || typeof userIdParam !== 'string') {
        return errorResponse(res, 'Invalid or missing user ID', 400);
      }
      
      const userId = parseInt(userIdParam, 10);
      const documents = await storage.getDocumentsByUserId(userId);
      return apiResponse(res, documents);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to fetch documents');
    }
  });

  app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }
      
      const { userId, name, pages } = req.body;
      
      if (!userId || !name || !pages) {
        return errorResponse(res, 'Missing required fields', 400);
      }
      
      const fileType = path.extname(req.file.originalname).slice(1);
      
      const document = await storage.createDocument({
        userId: parseInt(userId, 10),
        name,
        filePath: req.file.path,
        fileType,
        pages: parseInt(pages, 10)
      });
      
      return apiResponse(res, document);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to upload document');
    }
  });

  app.delete('/api/documents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const document = await storage.getDocument(id);
      if (!document) {
        return errorResponse(res, 'Document not found', 404);
      }
      
      // Delete file if it exists
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
      
      await storage.deleteDocument(id);
      return apiResponse(res, { success: true });
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to delete document');
    }
  });

  // Print job routes
  app.get('/api/print-jobs', async (req, res) => {
    try {
      const userIdParam = req.query.userId;
      
      if (!userIdParam || typeof userIdParam !== 'string') {
        return errorResponse(res, 'Invalid or missing user ID', 400);
      }
      
      const userId = parseInt(userIdParam, 10);
      const printJobs = await storage.getPrintJobsByUserId(userId);
      return apiResponse(res, printJobs);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to fetch print jobs');
    }
  });

  app.post('/api/print-jobs', async (req, res) => {
    try {
      const validatedData = insertPrintJobSchema.parse(req.body);
      const printJob = await storage.createPrintJob(validatedData);
      return apiResponse(res, printJob);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to create print job');
    }
  });

  app.put('/api/print-jobs/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!status) {
        return errorResponse(res, 'Missing status field', 400);
      }
      
      const updatedPrintJob = await storage.updatePrintJob(id, {
        status,
        ...(status === 'completed' ? { completedAt: new Date() } : {})
      });
      
      if (!updatedPrintJob) {
        return errorResponse(res, 'Print job not found', 404);
      }
      
      return apiResponse(res, updatedPrintJob);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to update print job status');
    }
  });

  // Printer routes
  app.get('/api/printers', async (req, res) => {
    try {
      const printers = await storage.getAllPrinters();
      return apiResponse(res, printers);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to fetch printers');
    }
  });

  app.get('/api/printers/nearby', async (req, res) => {
    try {
      const { lat, lng, radius = 10 } = req.query;
      
      if (!lat || !lng || typeof lat !== 'string' || typeof lng !== 'string') {
        return errorResponse(res, 'Invalid location parameters', 400);
      }
      
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusValue = typeof radius === 'string' ? parseFloat(radius) : 10;
      
      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusValue)) {
        return errorResponse(res, 'Invalid location parameters', 400);
      }
      
      const nearbyPrinters = await storage.getNearbyPrinters(latitude, longitude, radiusValue);
      return apiResponse(res, nearbyPrinters);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to find nearby printers');
    }
  });

  // Payment routes
  app.post('/api/payments', async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      return apiResponse(res, payment);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to create payment');
    }
  });

  app.put('/api/payments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, razorpayId } = req.body;
      
      const updatedPayment = await storage.updatePayment(id, {
        status,
        razorpayId
      });
      
      if (!updatedPayment) {
        return errorResponse(res, 'Payment not found', 404);
      }
      
      return apiResponse(res, updatedPayment);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to update payment');
    }
  });

  // Contact form route
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactFormSchema.parse(req.body);
      const contactForm = await storage.submitContactForm(validatedData);
      return apiResponse(res, contactForm);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to submit contact form');
    }
  });

  // AI recommendation route
  app.get('/api/ai-recommendation/:documentId', async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId, 10);
      const recommendation = await storage.getAiRecommendation(documentId);
      return apiResponse(res, recommendation);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to get AI recommendation');
    }
  });

  // Dashboard statistics
  app.get('/api/dashboard/stats/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const stats = await storage.getUserDashboardStats(userId);
      return apiResponse(res, stats);
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : 'Failed to fetch dashboard statistics');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
