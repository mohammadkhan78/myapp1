import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instagramHandle: text("instagram_handle").notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  balance: integer("balance").notNull().default(500), // in paisa (₹5.00)
  completedTasks: integer("completed_tasks").notNull().default(0),
  hasAdvancedAccess: boolean("has_advanced_access").notNull().default(false),
  isInstagramBound: boolean("is_instagram_bound").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(), // in paisa
  taskType: text("task_type").notNull(), // 'follow', 'like', 'share', 'custom'
  isAdvanced: boolean("is_advanced").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const taskSubmissions = pgTable("task_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  screenshotUrl: text("screenshot_url"),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected'
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const verificationRequests = pgTable("verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instagramHandle: text("instagram_handle").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const instagramBindingRequests = pgTable("instagram_binding_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  username: text("username").notNull(),
  password: text("password").notNull(),
  accessCode: text("access_code"),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'upi', 'amazon', 'flipkart', 'googleplay'
  amount: integer("amount").notNull(), // in paisa
  details: text("details").notNull(), // JSON string with UPI ID or email/phone
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const supportRequests = pgTable("support_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'responded'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertTaskSubmissionSchema = createInsertSchema(taskSubmissions).omit({ id: true, submittedAt: true });
export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({ id: true, createdAt: true });
export const insertInstagramBindingRequestSchema = createInsertSchema(instagramBindingRequests).omit({ id: true, createdAt: true });
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({ id: true, createdAt: true });
export const insertSupportRequestSchema = createInsertSchema(supportRequests).omit({ id: true, createdAt: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskSubmission = typeof taskSubmissions.$inferSelect;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InstagramBindingRequest = typeof instagramBindingRequests.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type SupportRequest = typeof supportRequests.$inferSelect;
export type Setting = typeof settings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTaskSubmission = z.infer<typeof insertTaskSubmissionSchema>;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type InsertInstagramBindingRequest = z.infer<typeof insertInstagramBindingRequestSchema>;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type InsertSupportRequest = z.infer<typeof insertSupportRequestSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
