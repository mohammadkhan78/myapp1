import { useState, useEffect } from "react";
import { Wallet, Instagram, Heart, Share, Unlock, Upload, X } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import GlowButton from "@/components/GlowButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

interface OfferwallPageProps {
  onNavigate: (page: string) => void;
}

export default function OfferwallPage({ onNavigate }: OfferwallPageProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, screenshotUrl }: { taskId: string; screenshotUrl: string }) => {
      const response = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          screenshotUrl,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit task');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Submitted",
        description: "Task submitted for review. You'll be notified once approved!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      refreshUser();
      setShowUploadModal(false);
      setSelectedTask(null);
      setScreenshotFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'follow':
        return <Instagram className="text-pink-500" size={24} />;
      case 'like':
        return <Heart className="text-red-500" size={24} />;
      case 'share':
        return <Share className="text-blue-500" size={24} />;
      default:
        return <Instagram className="text-pink-500" size={24} />;
    }
  };

  const handleStartTask = (task: Task) => {
    setSelectedTask(task);
    setShowUploadModal(true);
  };

  const handleSubmitTask = () => {
    if (!selectedTask || !screenshotFile) {
      toast({
        title: "Screenshot Required",
        description: "Please upload a screenshot to submit the task.",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll use a placeholder filename since we're not implementing file upload
    const screenshotUrl = `screenshot-${Date.now()}-${screenshotFile.name}`;
    submitTaskMutation.mutate({ taskId: selectedTask.id, screenshotUrl });
  };

  const handleUnlockAdvanced = () => {
    if (!user?.hasAdvancedAccess) {
      toast({
        title: "Complete Tasks First",
        description: "Complete at least one task to unlock high offers",
        variant: "destructive",
      });
      return;
    }
    onNavigate('advanced');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      {/* Wallet Balance */}
      <GlassCard className="p-6 mb-6 bg-gradient-to-r from-gold/20 to-yellow-600/20 border-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="text-gold text-2xl mr-3" size={32} />
            <div>
              <div className="text-sm text-gray-300">Wallet Balance</div>
              <div className="text-2xl font-bold text-gold" data-testid="wallet-balance">
                ₹{(user.balance / 100).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Welcome Bonus</div>
            <div className="text-sm text-green-400">+₹5.00</div>
          </div>
        </div>
      </GlassCard>

      <h2 className="text-2xl font-bold gradient-text mb-6">Available Tasks</h2>
      
      {/* Tasks List */}
      <div className="space-y-4 mb-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400">No tasks available</div>
          </div>
        ) : (
          tasks
            .filter(task => !task.isAdvanced && task.isActive)
            .map((task) => (
              <GlassCard key={task.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getTaskIcon(task.taskType)}
                    <div className="ml-3">
                      <h4 className="font-semibold" data-testid={`task-title-${task.id}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-400" data-testid={`task-description-${task.id}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gold" data-testid={`task-reward-${task.id}`}>
                      ₹{(task.reward / 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400">Reward</div>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartTask(task)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  data-testid={`button-start-task-${task.id}`}
                >
                  Start Task
                </Button>
              </GlassCard>
            ))
        )}
      </div>

      {/* Unlock High Offers Button */}
      <Button
        onClick={handleUnlockAdvanced}
        disabled={!user.hasAdvancedAccess}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl glow-button disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        data-testid="button-unlock-advanced"
      >
        <Unlock className="mr-3" size={20} />
        <div>
          <div>Unlock High Offers</div>
          <div className="text-sm opacity-75">
            {user.hasAdvancedAccess ? 'Available Now!' : 'Complete 1 task to unlock'}
          </div>
        </div>
      </Button>

      {/* Screenshot Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="glass-effect border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text flex items-center">
              <Upload className="mr-2" size={24} />
              Submit Task Screenshot
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <h4 className="font-semibold mb-2">{selectedTask.title}</h4>
                <p className="text-sm text-gray-400 mb-3">{selectedTask.description}</p>
                <div className="text-gold font-bold">Reward: ₹{(selectedTask.reward / 100).toFixed(0)}</div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Upload Screenshot</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                  className="instagram-input"
                  required
                />
                {screenshotFile && (
                  <div className="text-sm text-green-400">✓ {screenshotFile.name} selected</div>
                )}
                <div className="text-xs text-gray-500">
                  Please upload a clear screenshot showing task completion
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleSubmitTask}
                  disabled={!screenshotFile || submitTaskMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                  {submitTaskMutation.isPending ? 'Submitting...' : 'Submit Task'}
                </Button>
                <Button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedTask(null);
                    setScreenshotFile(null);
                  }}
                  variant="ghost"
                  className="flex-1 text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
