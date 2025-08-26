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
} from "@shared/schema";
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
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private taskSubmissions: Map<string, TaskSubmission>;
  private verificationRequests: Map<string, VerificationRequest>;
  private instagramBindingRequests: Map<string, InstagramBindingRequest>;
  private withdrawalRequests: Map<string, WithdrawalRequest>;
  private supportRequests: Map<string, SupportRequest>;
  private settings: Map<string, Setting>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.taskSubmissions = new Map();
    this.verificationRequests = new Map();
    this.instagramBindingRequests = new Map();
    this.withdrawalRequests = new Map();
    this.supportRequests = new Map();
    this.settings = new Map();

    // Initialize default settings
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
      {
        title: 'Follow @brandaccount',
        description: 'Follow the account and screenshot',
        reward: 1500, // ₹15
        taskType: 'follow' as const,
        isAdvanced: false,
        isActive: true
      },
      {
        title: 'Like 5 Recent Posts',
        description: 'Like the last 5 posts from @targetaccount',
        reward: 1000, // ₹10
        taskType: 'like' as const,
        isAdvanced: false,
        isActive: true
      },
      {
        title: 'Share Story',
        description: 'Share the brand post to your story',
        reward: 2500, // ₹25
        taskType: 'share' as const,
        isAdvanced: false,
        isActive: true
      },
      {
        title: 'Premium Follow Campaign',
        description: 'Follow 10 premium brand accounts',
        reward: 15000, // ₹150
        taskType: 'follow' as const,
        isAdvanced: true,
        isActive: true
      },
      {
        title: 'Reel Engagement',
        description: 'Like, comment and share brand reels',
        reward: 20000, // ₹200
        taskType: 'custom' as const,
        isAdvanced: true,
        isActive: true
      }
    ];

    defaultTasks.forEach(task => {
      const newTask: Task = {
        id: randomUUID(),
        ...task,
        createdAt: new Date()
      };
      this.tasks.set(newTask.id, newTask);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByInstagramHandle(handle: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.instagramHandle === handle);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Tasks
  async getTasks(isAdvanced?: boolean): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values()).filter(task => task.isActive);
    if (isAdvanced !== undefined) {
      return tasks.filter(task => task.isAdvanced === isAdvanced);
    }
    return tasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Task submissions
  async getTaskSubmissions(): Promise<TaskSubmission[]> {
    return Array.from(this.taskSubmissions.values());
  }

  async getTaskSubmissionsByUser(userId: string): Promise<TaskSubmission[]> {
    return Array.from(this.taskSubmissions.values()).filter(sub => sub.userId === userId);
  }

  async createTaskSubmission(insertSubmission: InsertTaskSubmission): Promise<TaskSubmission> {
    const id = randomUUID();
    const submission: TaskSubmission = {
      ...insertSubmission,
      id,
      submittedAt: new Date()
    };
    this.taskSubmissions.set(id, submission);
    return submission;
  }

  async updateTaskSubmission(id: string, submissionUpdate: Partial<TaskSubmission>): Promise<TaskSubmission | undefined> {
    const submission = this.taskSubmissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission = { ...submission, ...submissionUpdate };
    this.taskSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Verification requests
  async getVerificationRequests(): Promise<VerificationRequest[]> {
    return Array.from(this.verificationRequests.values());
  }

  async createVerificationRequest(insertRequest: InsertVerificationRequest): Promise<VerificationRequest> {
    const id = randomUUID();
    const request: VerificationRequest = {
      ...insertRequest,
      id,
      status: 'pending',
      createdAt: new Date()
    };
    this.verificationRequests.set(id, request);
    return request;
  }

  async updateVerificationRequest(id: string, requestUpdate: Partial<VerificationRequest>): Promise<VerificationRequest | undefined> {
    const request = this.verificationRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...requestUpdate };
    this.verificationRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Instagram binding requests
  async getInstagramBindingRequests(): Promise<InstagramBindingRequest[]> {
    return Array.from(this.instagramBindingRequests.values());
  }

  async createInstagramBindingRequest(insertRequest: InsertInstagramBindingRequest): Promise<InstagramBindingRequest> {
    const id = randomUUID();
    const request: InstagramBindingRequest = {
      ...insertRequest,
      id,
      createdAt: new Date()
    };
    this.instagramBindingRequests.set(id, request);
    return request;
  }

  async updateInstagramBindingRequest(id: string, requestUpdate: Partial<InstagramBindingRequest>): Promise<InstagramBindingRequest | undefined> {
    const request = this.instagramBindingRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...requestUpdate };
    this.instagramBindingRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Withdrawal requests
  async getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    return Array.from(this.withdrawalRequests.values());
  }

  async createWithdrawalRequest(insertRequest: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const id = randomUUID();
    const request: WithdrawalRequest = {
      ...insertRequest,
      id,
      createdAt: new Date()
    };
    this.withdrawalRequests.set(id, request);
    return request;
  }

  async updateWithdrawalRequest(id: string, requestUpdate: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined> {
    const request = this.withdrawalRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...requestUpdate };
    this.withdrawalRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Support requests
  async getSupportRequests(): Promise<SupportRequest[]> {
    return Array.from(this.supportRequests.values());
  }

  async createSupportRequest(insertRequest: InsertSupportRequest): Promise<SupportRequest> {
    const id = randomUUID();
    const request: SupportRequest = {
      ...insertRequest,
      id,
      createdAt: new Date()
    };
    this.supportRequests.set(id, request);
    return request;
  }

  async updateSupportRequest(id: string, requestUpdate: Partial<SupportRequest>): Promise<SupportRequest | undefined> {
    const request = this.supportRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...requestUpdate };
    this.supportRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = this.settings.get(insertSetting.key);
    if (existing) {
      const updated = { ...existing, value: insertSetting.value };
      this.settings.set(insertSetting.key, updated);
      return updated;
    }
    
    const id = randomUUID();
    const setting: Setting = {
      ...insertSetting,
      id
    };
    this.settings.set(insertSetting.key, setting);
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
}

export const storage = new MemStorage();
