import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// USER SCHEMA
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  firebaseUid: text("firebase_uid").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  plan: text("plan").default("free")
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// DOCUMENT SCHEMA
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  pages: integer("pages").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastPrinted: timestamp("last_printed")
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  lastPrinted: true
});

// PRINT JOB SCHEMA
export const printJobs = pgTable("print_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  documentId: integer("document_id").notNull().references(() => documents.id),
  printerId: integer("printer_id").references(() => printers.id),
  status: text("status").notNull().default("pending"),
  copies: integer("copies").notNull().default(1),
  colorMode: text("color_mode").notNull(),
  paperSize: text("paper_size").notNull(),
  orientation: text("orientation").notNull(),
  sides: text("sides").notNull(),
  quality: text("quality").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  cost: real("cost"),
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status")
});

export const insertPrintJobSchema = createInsertSchema(printJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

// PRINTER SCHEMA
export const printers = pgTable("printers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isOpen: boolean("is_open").notNull().default(true),
  features: jsonb("features"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertPrinterSchema = createInsertSchema(printers).omit({
  id: true,
  createdAt: true
});

// PAYMENT SCHEMA
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  printJobId: integer("print_job_id").references(() => printJobs.id),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  razorpayId: text("razorpay_id"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CONTACT FORM SCHEMA
export const contactForms = pgTable("contact_forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isResolved: boolean("is_resolved").default(false)
});

export const insertContactFormSchema = createInsertSchema(contactForms).omit({
  id: true,
  createdAt: true,
  isResolved: true
});

// EXPORT TYPES
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type PrintJob = typeof printJobs.$inferSelect;
export type InsertPrintJob = z.infer<typeof insertPrintJobSchema>;

export type Printer = typeof printers.$inferSelect;
export type InsertPrinter = z.infer<typeof insertPrinterSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type ContactForm = typeof contactForms.$inferSelect;
export type InsertContactForm = z.infer<typeof insertContactFormSchema>;
