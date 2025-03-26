import { 
  users, User, InsertUser, 
  documents, Document, InsertDocument,
  printJobs, PrintJob, InsertPrintJob,
  printers, Printer, InsertPrinter,
  payments, Payment, InsertPayment,
  contactForms, ContactForm, InsertContactForm
} from "@shared/schema";
import { PrinterLocation, DashboardStats, AiRecommendation } from "@shared/types";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Print job operations
  getPrintJob(id: number): Promise<PrintJob | undefined>;
  getPrintJobsByUserId(userId: number): Promise<PrintJob[]>;
  createPrintJob(printJob: InsertPrintJob): Promise<PrintJob>;
  updatePrintJob(id: number, data: Partial<PrintJob>): Promise<PrintJob | undefined>;
  
  // Printer operations
  getPrinter(id: number): Promise<Printer | undefined>;
  getAllPrinters(): Promise<Printer[]>;
  getNearbyPrinters(lat: number, lng: number, radius: number): Promise<PrinterLocation[]>;
  createPrinter(printer: InsertPrinter): Promise<Printer>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined>;
  
  // Contact form operations
  submitContactForm(form: InsertContactForm): Promise<ContactForm>;
  
  // Dashboard statistics
  getUserDashboardStats(userId: number): Promise<DashboardStats>;
  
  // AI recommendation
  getAiRecommendation(documentId: number): Promise<AiRecommendation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private printJobs: Map<number, PrintJob>;
  private printers: Map<number, Printer>;
  private payments: Map<number, Payment>;
  private contactForms: Map<number, ContactForm>;
  
  private userIdCounter: number;
  private documentIdCounter: number;
  private printJobIdCounter: number;
  private printerIdCounter: number;
  private paymentIdCounter: number;
  private contactFormIdCounter: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.printJobs = new Map();
    this.printers = new Map();
    this.payments = new Map();
    this.contactForms = new Map();
    
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
    this.printJobIdCounter = 1;
    this.printerIdCounter = 1;
    this.paymentIdCounter = 1;
    this.contactFormIdCounter = 1;
    
    // Initialize some demo printers
    this.initSamplePrinters();
  }

  private initSamplePrinters() {
    const samplePrinters: InsertPrinter[] = [
      {
        name: "PrintShop Downtown",
        address: "123 Main St, Suite 101",
        latitude: 12.9716,
        longitude: 77.5946,
        isOpen: true,
        features: { color: true, largeFormat: true }
      },
      {
        name: "Office Supplies Plus",
        address: "456 Market Ave",
        latitude: 12.9766,
        longitude: 77.5993,
        isOpen: true,
        features: { color: true, binding: true }
      },
      {
        name: "University Print Center",
        address: "789 College Blvd",
        latitude: 12.9656,
        longitude: 77.5876,
        isOpen: false,
        features: { color: true, scanning: true, lamination: true }
      }
    ];
    
    samplePrinters.forEach(printer => this.createPrinter(printer));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const createdAt = new Date();
    const document: Document = { ...documentData, id, createdAt, lastPrinted: null };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, data: Partial<Document>): Promise<Document | undefined> {
    const document = await this.getDocument(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...data };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Print job operations
  async getPrintJob(id: number): Promise<PrintJob | undefined> {
    return this.printJobs.get(id);
  }
  
  async getPrintJobsByUserId(userId: number): Promise<PrintJob[]> {
    return Array.from(this.printJobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async createPrintJob(printJobData: InsertPrintJob): Promise<PrintJob> {
    const id = this.printJobIdCounter++;
    const createdAt = new Date();
    const printJob: PrintJob = { 
      ...printJobData, 
      id, 
      createdAt, 
      completedAt: null 
    };
    this.printJobs.set(id, printJob);
    return printJob;
  }
  
  async updatePrintJob(id: number, data: Partial<PrintJob>): Promise<PrintJob | undefined> {
    const printJob = await this.getPrintJob(id);
    if (!printJob) return undefined;
    
    const updatedPrintJob = { ...printJob, ...data };
    this.printJobs.set(id, updatedPrintJob);
    return updatedPrintJob;
  }

  // Printer operations
  async getPrinter(id: number): Promise<Printer | undefined> {
    return this.printers.get(id);
  }
  
  async getAllPrinters(): Promise<Printer[]> {
    return Array.from(this.printers.values());
  }
  
  async getNearbyPrinters(lat: number, lng: number, radius: number): Promise<PrinterLocation[]> {
    const allPrinters = await this.getAllPrinters();
    
    return allPrinters.map(printer => {
      // Calculate distance using Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = this.deg2rad(printer.latitude - lat);
      const dLon = this.deg2rad(printer.longitude - lng);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat)) * Math.cos(this.deg2rad(printer.latitude)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in km
      
      return {
        id: printer.id,
        name: printer.name,
        address: printer.address,
        distance: parseFloat(distance.toFixed(1)),
        isOpen: printer.isOpen,
        latitude: printer.latitude,
        longitude: printer.longitude,
        features: printer.features
      };
    })
    .filter(p => p.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  async createPrinter(printerData: InsertPrinter): Promise<Printer> {
    const id = this.printerIdCounter++;
    const createdAt = new Date();
    const printer: Printer = { ...printerData, id, createdAt };
    this.printers.set(id, printer);
    return printer;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const createdAt = new Date();
    const payment: Payment = { 
      ...paymentData, 
      id, 
      createdAt, 
      updatedAt: createdAt 
    };
    this.payments.set(id, payment);
    return payment;
  }
  
  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined> {
    const payment = await this.getPayment(id);
    if (!payment) return undefined;
    
    const updatedPayment = { 
      ...payment, 
      ...data, 
      updatedAt: new Date() 
    };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Contact form operations
  async submitContactForm(formData: InsertContactForm): Promise<ContactForm> {
    const id = this.contactFormIdCounter++;
    const createdAt = new Date();
    const form: ContactForm = { 
      ...formData, 
      id, 
      createdAt, 
      isResolved: false 
    };
    this.contactForms.set(id, form);
    return form;
  }
  
  // Dashboard statistics
  async getUserDashboardStats(userId: number): Promise<DashboardStats> {
    const userPrintJobs = await this.getPrintJobsByUserId(userId);
    
    // Calculate total pages printed
    const userDocuments = await this.getDocumentsByUserId(userId);
    const documentPageMap = new Map<number, number>();
    userDocuments.forEach(doc => documentPageMap.set(doc.id, doc.pages));
    
    let totalPagesPrinted = 0;
    userPrintJobs.forEach(job => {
      const documentPages = documentPageMap.get(job.documentId) || 0;
      const copies = job.copies || 1;
      totalPagesPrinted += documentPages * copies;
    });
    
    // Calculate balance
    const userPayments = await this.getPaymentsByUserId(userId);
    const balance = userPayments
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
    
    return {
      printJobs: userPrintJobs.length,
      pagesPrinted: totalPagesPrinted,
      balance: parseFloat(balance.toFixed(2))
    };
  }
  
  // AI recommendation
  async getAiRecommendation(documentId: number): Promise<AiRecommendation> {
    const document = await this.getDocument(documentId);
    
    if (!document) {
      return {
        colorMode: 'Black & White',
        sides: 'Two-sided (long edge)',
        quality: 'Standard',
        message: 'We couldn\'t analyze your document. These are our default eco-friendly recommendations.',
        tips: [
          'Using black & white saves on color ink',
          'Two-sided printing reduces paper usage',
          'Standard quality is sufficient for most documents'
        ]
      };
    }
    
    // Logic would typically analyze document content
    // Here we're providing recommendations based on file type
    const isPresentation = document.fileType.includes('ppt');
    const isImage = ['jpg', 'png', 'jpeg', 'gif'].some(ext => 
      document.fileType.includes(ext)
    );
    
    if (isPresentation) {
      return {
        colorMode: 'Color',
        quality: 'High',
        sides: 'One-sided',
        message: 'This appears to be a presentation document.',
        tips: [
          'Color printing recommended for presentations',
          'High quality ensures graphics are clear',
          'One-sided printing helps with readability'
        ]
      };
    } else if (isImage) {
      return {
        colorMode: 'Color',
        quality: 'High',
        message: 'This appears to be an image file.',
        tips: [
          'Color printing recommended for images',
          'High quality ensures details are preserved',
          'Consider the right paper size for your image proportions'
        ]
      };
    } else {
      return {
        colorMode: 'Black & White',
        sides: 'Two-sided (long edge)',
        quality: 'Standard',
        message: 'This appears to be a standard document.',
        tips: [
          'Two-sided printing to save paper',
          'Black & White mode (this document likely has minimal color)',
          'Standard quality is sufficient for text documents'
        ]
      };
    }
  }
}

export const storage = new MemStorage();
