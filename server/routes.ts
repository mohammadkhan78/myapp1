import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertVerificationRequestSchema,
  insertTaskSubmissionSchema,
  insertInstagramBindingRequestSchema,
  insertWithdrawalRequestSchema,
  insertSupportRequestSchema,
  insertTaskSchema,
  insertSettingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const verifiedUsers = users.filter(u => u.isVerified);
      const totalPaid = verifiedUsers.reduce((sum, user) => sum + (user.balance > 500 ? 0 : 500 - user.balance), 0);
      
      res.json({
        activeUsers: verifiedUsers.length,
        totalPaid: Math.floor(totalPaid / 100) // Convert paisa to rupees
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Verification endpoints
  app.post("/api/verify", async (req, res) => {
    try {
      const data = insertVerificationRequestSchema.parse(req.body);
      
      // Check if already exists
      const existing = await storage.getUserByInstagramHandle(data.instagramHandle);
      if (existing) {
        if (existing.isVerified) {
          return res.json({ status: "already_verified", user: existing });
        }
      }

      const request = await storage.createVerificationRequest(data);
      res.json({ status: "pending", request });
    } catch (error) {
      res.status(400).json({ message: "Invalid verification request" });
    }
  });

  app.get("/api/verify/:handle", async (req, res) => {
    try {
      const handle = req.params.handle;
      const user = await storage.getUserByInstagramHandle(handle);
      
      if (user && user.isVerified) {
        res.json({ status: "verified", user });
      } else {
        res.json({ status: "pending" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to check verification status" });
    }
  });

  // User endpoints
  app.get("/api/user/:handle", async (req, res) => {
    try {
      const handle = req.params.handle;
      const user = await storage.getUserByInstagramHandle(handle);
      
      if (!user || !user.isVerified) {
        return res.status(404).json({ message: "User not found or not verified" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tasks endpoints
  app.get("/api/tasks", async (req, res) => {
    try {
      const isAdvanced = req.query.advanced === 'true';
      const tasks = await storage.getTasks(isAdvanced);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks/:taskId/submit", async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const data = insertTaskSubmissionSchema.parse(req.body);
      
      const submission = await storage.createTaskSubmission({
        ...data,
        taskId
      });
      
      res.json(submission);
    } catch (error) {
      res.status(400).json({ message: "Failed to submit task" });
    }
  });

  // Instagram binding
  app.post("/api/bind-instagram", async (req, res) => {
    try {
      const data = insertInstagramBindingRequestSchema.parse(req.body);
      const request = await storage.createInstagramBindingRequest(data);
      res.json({ status: "pending", request });
    } catch (error) {
      res.status(400).json({ message: "Failed to submit binding request" });
    }
  });

  // Withdrawal endpoints
  app.post("/api/withdraw", async (req, res) => {
    try {
      const data = insertWithdrawalRequestSchema.parse(req.body);
      const request = await storage.createWithdrawalRequest(data);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to submit withdrawal request" });
    }
  });

  // Support endpoints
  app.post("/api/support", async (req, res) => {
    try {
      const data = insertSupportRequestSchema.parse(req.body);
      const request = await storage.createSupportRequest(data);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to submit support request" });
    }
  });

  // Admin endpoints
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      if (password === '12345678910admin') {
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  // Admin - Get all pending requests
  app.get("/api/admin/verification-requests", async (req, res) => {
    try {
      const requests = await storage.getVerificationRequests();
      res.json(requests.filter(r => r.status === 'pending'));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch verification requests" });
    }
  });

  app.get("/api/admin/binding-requests", async (req, res) => {
    try {
      const requests = await storage.getInstagramBindingRequests();
      res.json(requests.filter(r => r.status === 'pending'));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch binding requests" });
    }
  });

  app.get("/api/admin/task-submissions", async (req, res) => {
    try {
      const submissions = await storage.getTaskSubmissions();
      res.json(submissions.filter(s => s.status === 'pending'));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task submissions" });
    }
  });

  app.get("/api/admin/withdrawal-requests", async (req, res) => {
    try {
      const requests = await storage.getWithdrawalRequests();
      res.json(requests.filter(r => r.status === 'pending'));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });

  app.get("/api/admin/support-requests", async (req, res) => {
    try {
      const requests = await storage.getSupportRequests();
      res.json(requests.filter(r => r.status === 'pending'));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support requests" });
    }
  });

  // Admin - Approve/Reject verification
  app.post("/api/admin/verify/:requestId", async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const { action } = req.body; // 'approve' or 'reject'
      
      const request = await storage.updateVerificationRequest(requestId, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (action === 'approve') {
        // Create user account with ₹5 bonus
        await storage.createUser({
          instagramHandle: request.instagramHandle,
          isVerified: true,
          balance: 500, // ₹5 in paisa
          completedTasks: 0,
          hasAdvancedAccess: false,
          isInstagramBound: false
        });
      }
      
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to process verification" });
    }
  });

  // Admin - Approve task submission
  app.post("/api/admin/tasks/submissions/:submissionId", async (req, res) => {
    try {
      const submissionId = req.params.submissionId;
      const { action } = req.body;
      
      const submission = await storage.updateTaskSubmission(submissionId, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      if (action === 'approve') {
        // Add reward to user balance and increment completed tasks
        const user = await storage.getUser(submission.userId);
        const task = await storage.getTask(submission.taskId);
        
        if (user && task) {
          const newBalance = user.balance + task.reward;
          const newCompletedTasks = user.completedTasks + 1;
          const hasAdvancedAccess = newCompletedTasks >= 1; // Unlock after 1 task
          
          await storage.updateUser(user.id, {
            balance: newBalance,
            completedTasks: newCompletedTasks,
            hasAdvancedAccess
          });
        }
      }
      
      res.json(submission);
    } catch (error) {
      res.status(400).json({ message: "Failed to process task submission" });
    }
  });

  // Admin - Approve Instagram binding
  app.post("/api/admin/bind/:requestId", async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const { action } = req.body;
      
      const request = await storage.updateInstagramBindingRequest(requestId, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (action === 'approve') {
        // Update user's Instagram bound status
        await storage.updateUser(request.userId, {
          isInstagramBound: true
        });
      }
      
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to process binding request" });
    }
  });

  // Admin - Task management
  app.post("/api/admin/tasks", async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(data);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/admin/tasks/:taskId", async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const data = req.body;
      const task = await storage.updateTask(taskId, data);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/admin/tasks/:taskId", async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const success = await storage.deleteTask(taskId);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete task" });
    }
  });

  // Admin - Settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const data = insertSettingSchema.parse(req.body);
      const setting = await storage.setSetting(data);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ message: "Failed to update setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
