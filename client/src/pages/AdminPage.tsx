import { useState } from "react";
import { X, Users, Target, CreditCard, Settings, Eye, Check, XIcon, Shield } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { VerificationRequest, InstagramBindingRequest, TaskSubmission, WithdrawalRequest, SupportRequest, Task, Setting } from "@shared/schema";

interface AdminPageProps {
  onClose: () => void;
}

export default function AdminPage({ onClose }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [currentSection, setCurrentSection] = useState("users");
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) throw new Error('Invalid password');
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel",
      });
    },
    onError: () => {
      toast({
        title: "Access Denied",
        description: "Invalid admin password",
        variant: "destructive",
      });
    },
  });

  // Queries for admin data
  const { data: verificationRequests = [] } = useQuery<VerificationRequest[]>({
    queryKey: ['/api/admin/verification-requests'],
    enabled: isAuthenticated,
  });

  const { data: bindingRequests = [] } = useQuery<InstagramBindingRequest[]>({
    queryKey: ['/api/admin/binding-requests'],
    enabled: isAuthenticated,
  });

  const { data: taskSubmissions = [] } = useQuery<TaskSubmission[]>({
    queryKey: ['/api/admin/task-submissions'],
    enabled: isAuthenticated,
  });

  const { data: withdrawalRequests = [] } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/admin/withdrawal-requests'],
    enabled: isAuthenticated,
  });

  const { data: supportRequests = [] } = useQuery<SupportRequest[]>({
    queryKey: ['/api/admin/support-requests'],
    enabled: isAuthenticated,
  });

  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ['/api/admin/settings'],
    enabled: isAuthenticated,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks', 'all'],
    queryFn: async () => {
      const [regular, advanced] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/tasks?advanced=true').then(r => r.json())
      ]);
      return [...regular, ...advanced];
    },
    enabled: isAuthenticated,
  });

  // Mutations for admin actions
  const verifyUserMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'approve' | 'reject' }) => {
      const response = await fetch(`/api/admin/verify/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Failed to process verification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-requests'] });
      toast({ title: "Verification processed successfully" });
    },
  });

  const approveBindingMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'approve' | 'reject' }) => {
      const response = await fetch(`/api/admin/bind/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Failed to process binding');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/binding-requests'] });
      toast({ title: "Instagram binding processed successfully" });
    },
  });

  const approveTaskMutation = useMutation({
    mutationFn: async ({ submissionId, action }: { submissionId: string; action: 'approve' | 'reject' }) => {
      const response = await fetch(`/api/admin/tasks/submissions/${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Failed to process task submission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/task-submissions'] });
      toast({ title: "Task submission processed successfully" });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task created successfully" });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (setting: { key: string; value: string }) => {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setting),
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({ title: "Setting updated successfully" });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(password);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    createTaskMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description'),
      reward: parseInt(formData.get('reward') as string) * 100, // Convert to paisa
      taskType: formData.get('taskType'),
      isAdvanced: formData.get('taskLevel') === 'Premium Task',
      isActive: true,
    });
    
    (e.currentTarget as HTMLFormElement).reset();
  };

  const handleUpdateUpiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    updateSettingMutation.mutate({
      key: 'upiMessage',
      value: formData.get('upiMessage') as string,
    });
  };

  const viewScreenshot = (submission: TaskSubmission) => {
    setSelectedSubmission(submission);
    setShowScreenshot(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <GlassCard className="p-8 w-full max-w-md mx-4">
          <h3 className="text-2xl font-bold gradient-text mb-6 text-center flex items-center justify-center">
            <Shield className="mr-3" size={32} />
            Admin Access
          </h3>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="instagram-input"
              required
              data-testid="input-admin-password"
            />
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gold text-dark-bg font-semibold py-3 glow-button"
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? 'Verifying...' : 'Login to Admin Panel'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white py-2"
              data-testid="button-cancel-admin"
            >
              Cancel
            </Button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-dark-bg z-50 overflow-y-auto">
      <div className="p-4">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-bold gradient-text">Admin Panel</h1>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300"
            data-testid="button-logout-admin"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Admin Navigation */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => setCurrentSection('users')}
            variant={currentSection === 'users' ? 'default' : 'ghost'}
            className="glass-effect p-4 text-center hover:bg-gold/10"
            data-testid="nav-users"
          >
            <div className="flex flex-col items-center">
              <Users className="text-2xl mb-2 text-blue-400" size={32} />
              <div className="font-semibold">Users</div>
            </div>
          </Button>
          <Button
            onClick={() => setCurrentSection('tasks')}
            variant={currentSection === 'tasks' ? 'default' : 'ghost'}
            className="glass-effect p-4 text-center hover:bg-gold/10"
            data-testid="nav-tasks"
          >
            <div className="flex flex-col items-center">
              <Target className="text-2xl mb-2 text-green-400" size={32} />
              <div className="font-semibold">Tasks</div>
            </div>
          </Button>
          <Button
            onClick={() => setCurrentSection('withdrawals')}
            variant={currentSection === 'withdrawals' ? 'default' : 'ghost'}
            className="glass-effect p-4 text-center hover:bg-gold/10"
            data-testid="nav-withdrawals"
          >
            <div className="flex flex-col items-center">
              <CreditCard className="text-2xl mb-2 text-purple-400" size={32} />
              <div className="font-semibold">Withdrawals</div>
            </div>
          </Button>
          <Button
            onClick={() => setCurrentSection('settings')}
            variant={currentSection === 'settings' ? 'default' : 'ghost'}
            className="glass-effect p-4 text-center hover:bg-gold/10"
            data-testid="nav-settings"
          >
            <div className="flex flex-col items-center">
              <Settings className="text-2xl mb-2 text-yellow-400" size={32} />
              <div className="font-semibold">Settings</div>
            </div>
          </Button>
        </div>

        {/* Admin Content Sections */}
        {currentSection === 'users' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">User Management</h3>
            
            {/* Verification Requests */}
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-4 text-blue-400">Verification Requests ({verificationRequests.length})</h4>
              <div className="space-y-4">
                {verificationRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex items-center">
                      <Users className="text-pink-500 mr-3" size={24} />
                      <div>
                        <div className="font-medium" data-testid={`verification-handle-${request.id}`}>
                          @{request.instagramHandle}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => verifyUserMutation.mutate({ requestId: request.id, action: 'approve' })}
                        disabled={verifyUserMutation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`button-approve-verification-${request.id}`}
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        onClick={() => verifyUserMutation.mutate({ requestId: request.id, action: 'reject' })}
                        disabled={verifyUserMutation.isPending}
                        size="sm"
                        variant="destructive"
                        data-testid={`button-reject-verification-${request.id}`}
                      >
                        <XIcon size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {verificationRequests.length === 0 && (
                  <div className="text-center py-4 text-gray-400">No pending verification requests</div>
                )}
              </div>
            </GlassCard>

            {/* Instagram Binding Requests */}
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-4 text-purple-400">Instagram Binding Requests ({bindingRequests.length})</h4>
              <div className="space-y-4">
                {bindingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div>
                      <div className="font-medium" data-testid={`binding-username-${request.id}`}>
                        @{request.username}
                      </div>
                      <div className="text-sm text-gray-400">Login credentials provided</div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => approveBindingMutation.mutate({ requestId: request.id, action: 'approve' })}
                        disabled={approveBindingMutation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`button-approve-binding-${request.id}`}
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        onClick={() => approveBindingMutation.mutate({ requestId: request.id, action: 'reject' })}
                        disabled={approveBindingMutation.isPending}
                        size="sm"
                        variant="destructive"
                        data-testid={`button-reject-binding-${request.id}`}
                      >
                        <XIcon size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {bindingRequests.length === 0 && (
                  <div className="text-center py-4 text-gray-400">No pending binding requests</div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {currentSection === 'tasks' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Task Management</h3>
            
            {/* Add New Task */}
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-4 text-green-400">Add New Task</h4>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select name="taskLevel" required>
                    <SelectTrigger className="instagram-input">
                      <SelectValue placeholder="Task Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular Task">Regular Task</SelectItem>
                      <SelectItem value="Premium Task">Premium Task</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    name="title"
                    placeholder="Task Title"
                    className="instagram-input"
                    required
                    data-testid="input-task-title"
                  />
                </div>
                <Textarea
                  name="description"
                  placeholder="Task Description"
                  className="instagram-input h-20"
                  required
                  data-testid="textarea-task-description"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="reward"
                    type="number"
                    placeholder="Reward Amount (₹)"
                    className="instagram-input"
                    min="1"
                    required
                    data-testid="input-task-reward"
                  />
                  <Select name="taskType" required>
                    <SelectTrigger className="instagram-input">
                      <SelectValue placeholder="Task Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow">Follow Account</SelectItem>
                      <SelectItem value="like">Like Posts</SelectItem>
                      <SelectItem value="share">Share Story</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  data-testid="button-create-task"
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Add Task'}
                </Button>
              </form>
            </GlassCard>

            {/* Task Submissions */}
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-4 text-yellow-400">Task Submissions ({taskSubmissions.length})</h4>
              <div className="space-y-4">
                {taskSubmissions.map((submission) => {
                  const task = tasks.find(t => t.id === submission.taskId);
                  return (
                    <div key={submission.id} className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium" data-testid={`submission-task-${submission.id}`}>
                          {task?.title || 'Unknown Task'}
                        </div>
                        <div className="text-sm text-gold">₹{task ? (task.reward / 100).toFixed(0) : '0'}</div>
                      </div>
                      <div className="text-sm text-gray-400 mb-3">
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={() => viewScreenshot(submission)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                          data-testid={`button-view-screenshot-${submission.id}`}
                        >
                          <Eye className="mr-2" size={16} />
                          View Screenshot
                        </Button>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => approveTaskMutation.mutate({ submissionId: submission.id, action: 'approve' })}
                            disabled={approveTaskMutation.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-approve-task-${submission.id}`}
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            onClick={() => approveTaskMutation.mutate({ submissionId: submission.id, action: 'reject' })}
                            disabled={approveTaskMutation.isPending}
                            size="sm"
                            variant="destructive"
                            data-testid={`button-reject-task-${submission.id}`}
                          >
                            <XIcon size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {taskSubmissions.length === 0 && (
                  <div className="text-center py-4 text-gray-400">No pending task submissions</div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {currentSection === 'withdrawals' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Withdrawal Requests</h3>
            
            {/* UPI & Gift Card Withdrawals */}
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-4 text-green-400">All Withdrawal Requests ({withdrawalRequests.length})</h4>
              <div className="space-y-4">
                {withdrawalRequests.map((request) => {
                  const details = JSON.parse(request.details);
                  return (
                    <div key={request.id} className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium capitalize" data-testid={`withdrawal-type-${request.id}`}>
                          {request.type} {request.type !== 'upi' ? 'Gift Card' : 'Withdrawal'}
                        </div>
                        <div className="text-lg font-bold text-green-400">
                          ₹{(request.amount / 100).toFixed(0)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-3">
                        {request.type === 'upi' ? (
                          <span data-testid={`withdrawal-upi-${request.id}`}>UPI: {details.upiId}</span>
                        ) : (
                          <div>
                            <div data-testid={`withdrawal-email-${request.id}`}>Email: {details.email}</div>
                            <div data-testid={`withdrawal-mobile-${request.id}`}>Mobile: {details.mobile}</div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-process-withdrawal-${request.id}`}
                        >
                          Process Payment
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          data-testid={`button-reject-withdrawal-${request.id}`}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {withdrawalRequests.length === 0 && (
                  <div className="text-center py-4 text-gray-400">No pending withdrawal requests</div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {currentSection === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Admin Settings</h3>
            
            {/* UPI Message Setting */}
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-4 text-blue-400">UPI Availability Message</h4>
              <form onSubmit={handleUpdateUpiMessage} className="space-y-4">
                <Textarea
                  name="upiMessage"
                  defaultValue={settings.find(s => s.key === 'upiMessage')?.value || 'UPI payments are accessible after 2 days'}
                  className="instagram-input h-20"
                  data-testid="textarea-upi-message"
                />
                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6"
                  data-testid="button-update-upi-message"
                >
                  {updateSettingMutation.isPending ? 'Updating...' : 'Update Message'}
                </Button>
              </form>
            </GlassCard>

            {/* Support Requests */}
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-4 text-yellow-400">Support Requests ({supportRequests.length})</h4>
              <div className="space-y-4">
                {supportRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <div className="font-medium mb-2" data-testid={`support-email-${request.id}`}>
                      {request.email}
                    </div>
                    <div className="text-sm text-gray-300 mb-3" data-testid={`support-message-${request.id}`}>
                      {request.message}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <Button
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => window.open(`mailto:${request.email}`)}
                      data-testid={`button-respond-support-${request.id}`}
                    >
                      Respond via Email
                    </Button>
                  </div>
                ))}
                {supportRequests.length === 0 && (
                  <div className="text-center py-4 text-gray-400">No pending support requests</div>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      <Dialog open={showScreenshot} onOpenChange={setShowScreenshot}>
        <DialogContent className="glass-effect border border-gray-700">
          <DialogHeader>
            <DialogTitle>Task Screenshot</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">Screenshot Preview</div>
            <div className="bg-gray-700 rounded-lg p-8 text-gray-500">
              Screenshot would be displayed here
              <br />
              <small>File: {selectedSubmission?.screenshotUrl}</small>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
