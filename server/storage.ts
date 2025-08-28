import { 
  type User, 
  type InsertUser, 
  type Task, 
  type InsertTask,
  type TaskSubmission,
  type InsertTaskSubmission,
  type VerificationRequest,
  type InsertVerificationRequest,
  type InstagramBindingRequest,
  type InsertInstagramBindingRequest,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type SupportRequest,
  type InsertSupportRequest,
  type Setting,
  type InsertSetting
} from "../shared/schema"; // <-- changed from "@shared/schema"
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByInstagramHandle(handle: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Tasks
  getTasks(isAdvanced?: boolean): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Task submissions
  getTaskSubmissions(): Promise<TaskSubmission[]>;
  getTaskSubmissionsByUser(userId: string): Promise<TaskSubmission[]>;
  createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission>;
  updateTaskSubmission(id: string, submission: Partial<TaskSubmission>): Promise<TaskSubmission | undefined>;

  // Verification requests
  getVerificationRequests(): Promise<VerificationRequest[]>;
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest>;
  updateVerificationRequest(id: string, request: Partial<VerificationRequest>): Promise<VerificationRequest | undefined>;

  // Instagram binding requests
  getInstagramBindingRequests(): Promise<InstagramBindingRequest[]>;
  createInstagramBindingRequest(request: InsertInstagramBindingRequest): Promise<InstagramBindingRequest>;
  updateInstagramBindingRequest(id: string, request: Partial<InstagramBindingRequest>): Promise<InstagramBindingRequest | undefined>;

  // Withdrawal requests
  getWithdrawalRequests(): Promise<WithdrawalRequest[]>;
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  updateWithdrawalRequest(id: string, request: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined>;

  // Support requests
  getSupportRequests(): Promise<SupportRequest[]>;
  createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest>;
  updateSupportRequest(id: string, request: Partial<SupportRequest>): Promise<SupportRequest | undefined>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private tasks: Map<string, Task> = new Map();
  private taskSubmissions: Map<string, TaskSubmission> = new Map();
  private verificationRequests: Map<string, VerificationRequest> = new Map();
  private instagramBindingRequests: Map<string, InstagramBindingRequest> = new Map();
  private withdrawalRequests: Map<string, WithdrawalRequest> = new Map();
  private supportRequests: Map<string, SupportRequest> = new Map();
  private settings: Map<string, Setting> = new Map();

  constructor() {
    this.initializeDefaultSettings();
    this.initializeDefaultTasks();
  }

  private initializeDefaultSettings() {
    const upiMessageSetting: Setting = {
      id: randomUUID(),
      key: 'upiMessage',
      value: 'UPI payments are accessible after 2 days'
    };
    this.settings.set('upiMessage', upiMessageSetting);
  }

  private initializeDefaultTasks() {
    const defaultTasks = [
      { title: 'Follow @brandaccount', description: 'Follow the account and screenshot', reward: 1500, taskType: 'follow' as const, isAdvanced: false, isActive: true },
      { title: 'Like 5 Recent Posts', description: 'Like the last 5 posts from @targetaccount', reward: 1000, taskType: 'like' as const, isAdvanced: false, isActive: true },
      { title: 'Share Story', description: 'Share the brand post to your story', reward: 2500, taskType: 'share' as const, isAdvanced: false, isActive: true },
      { title: 'Premium Follow Campaign', description: 'Follow 10 premium brand accounts', reward: 15000, taskType: 'follow' as const, isAdvanced: true, isActive: true },
      { title: 'Reel Engagement', description: 'Like, comment and share brand reels', reward: 20000, taskType: 'custom' as const, isAdvanced: true, isActive: true }
    ];

    defaultTasks.forEach(task => {
      const newTask: Task = { id: randomUUID(), ...task, createdAt: new Date() };
      this.tasks.set(newTask.id, newTask);
    });
  }

  // Users
  async getUser(id: string) { return this.users.get(id); }
  async getUserByInstagramHandle(handle: string) { return Array.from(this.users.values()).find(u => u.instagramHandle === handle); }
  async createUser(insertUser: InsertUser) { const id = randomUUID(); const user: User = { ...insertUser, id, createdAt: new Date() }; this.users.set(id, user); return user; }
  async updateUser(id: string, userUpdate: Partial<User>) { const user = this.users.get(id); if (!user) return undefined; const updated = { ...user, ...userUpdate }; this.users.set(id, updated); return updated; }
  async getAllUsers() { return Array.from(this.users.values()); }

  // Tasks
  async getTasks(isAdvanced?: boolean) { const tasks = Array.from(this.tasks.values()).filter(t => t.isActive); return isAdvanced !== undefined ? tasks.filter(t => t.isAdvanced === isAdvanced) : tasks; }
  async getTask(id: string) { return this.tasks.get(id); }
  async createTask(insertTask: InsertTask) { const id = randomUUID(); const task: Task = { ...insertTask, id, createdAt: new Date() }; this.tasks.set(id, task); return task; }
  async updateTask(id: string, taskUpdate: Partial<Task>) { const task = this.tasks.get(id); if (!task) return undefined; const updated = { ...task, ...taskUpdate }; this.tasks.set(id, updated); return updated; }
  async deleteTask(id: string) { return this.tasks.delete(id); }

  // Task submissions
  async getTaskSubmissions() { return Array.from(this.taskSubmissions.values()); }
  async getTaskSubmissionsByUser(userId: string) { return Array.from(this.taskSubmissions.values()).filter(sub => sub.userId === userId); }
  async createTaskSubmission(insertSubmission: InsertTaskSubmission) { const id = randomUUID(); const submission: TaskSubmission = { ...insertSubmission, id, submittedAt: new Date() }; this.taskSubmissions.set(id, submission); return submission; }
  async updateTaskSubmission(id: string, submissionUpdate: Partial<TaskSubmission>) { const sub = this.taskSubmissions.get(id); if (!sub) return undefined; const updated = { ...sub, ...submissionUpdate }; this.taskSubmissions.set(id, updated); return updated; }

  // Verification requests
  async getVerificationRequests() { return Array.from(this.verificationRequests.values()); }
  async createVerificationRequest(insertRequest: InsertVerificationRequest) { const id = randomUUID(); const req: VerificationRequest = { ...insertRequest, id, status: 'pending', createdAt: new Date() }; this.verificationRequests.set(id, req); return req; }
  async updateVerificationRequest(id: string, requestUpdate: Partial<VerificationRequest>) { const req = this.verificationRequests.get(id); if (!req) return undefined; const updated = { ...req, ...requestUpdate }; this.verificationRequests.set(id, updated); return updated; }

  // Instagram binding requests
  async getInstagramBindingRequests() { return Array.from(this.instagramBindingRequests.values()); }
  async createInstagramBindingRequest(insertRequest: InsertInstagramBindingRequest) { const id = randomUUID(); const req: InstagramBindingRequest = { ...insertRequest, id, createdAt: new Date() }; this.instagramBindingRequests.set(id, req); return req; }
  async updateInstagramBindingRequest(id: string, requestUpdate: Partial<InstagramBindingRequest>) { const req = this.instagramBindingRequests.get(id); if (!req) return undefined; const updated = { ...req, ...requestUpdate }; this.instagramBindingRequests.set(id, updated); return updated; }

  // Withdrawal requests
  async getWithdrawalRequests() { return Array.from(this.withdrawalRequests.values()); }
  async createWithdrawalRequest(insertRequest: InsertWithdrawalRequest) { const id = randomUUID(); const req: WithdrawalRequest = { ...insertRequest, id, createdAt: new Date() }; this.withdrawalRequests.set(id, req); return req; }
  async updateWithdrawalRequest(id: string, requestUpdate: Partial<WithdrawalRequest>) { const req = this.withdrawalRequests.get(id); if (!req) return undefined; const updated = { ...req, ...requestUpdate }; this.withdrawalRequests.set(id, updated); return updated; }

  // Support requests
  async getSupportRequests() { return Array.from(this.supportRequests.values()); }
  async createSupportRequest(insertRequest: InsertSupportRequest) { const id = randomUUID(); const req: SupportRequest = { ...insertRequest, id, createdAt: new Date() }; this.supportRequests.set(id, req); return req; }
  async updateSupportRequest(id: string, requestUpdate: Partial<SupportRequest>) { const req = this.supportRequests.get(id); if (!req) return undefined; const updated = { ...req, ...requestUpdate }; this.supportRequests.set(id, updated); return updated; }

  // Settings
  async getSetting(key: string) { return this.settings.get(key); }
  async setSetting(insertSetting: InsertSetting) {
    const existing = this.settings.get(insertSetting.key);
    if (existing) { const updated = { ...existing, value: insertSetting.value }; this.settings.set(insertSetting.key, updated); return updated; }
    const id = randomUUID(); const setting: Setting = { ...insertSetting, id }; this.settings.set(insertSetting.key, setting); return setting;
  }
  async getAllSettings() { return Array.from(this.settings.values()); }
}

export const storage = new MemStorage();
