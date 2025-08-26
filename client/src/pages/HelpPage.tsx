import { X, LifeBuoy, Send } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface HelpPageProps {
  onClose: () => void;
}

export default function HelpPage({ onClose }: HelpPageProps) {
  const { toast } = useToast();

  const supportMutation = useMutation({
    mutationFn: async (data: { email: string; message: string }) => {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to submit support request');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Request Sent",
        description: "We will contact you via email shortly.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit support request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    supportMutation.mutate({
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    });
  };

  return (
    <div className="fixed inset-0 bg-dark-bg z-50 overflow-y-auto">
      <div className="p-4 pt-8">
        <div className="flex items-center mb-6">
          <Button 
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="mr-4 hover:bg-gray-700"
            data-testid="button-close-help"
          >
            <X size={24} />
          </Button>
          <h2 className="text-2xl font-bold gradient-text">Help & Support</h2>
        </div>

        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <LifeBuoy className="text-blue-400 mr-3" size={24} />
            Contact Support
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Your Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="your@email.com"
                className="instagram-input"
                required
                data-testid="input-support-email"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Problem Description</Label>
              <Textarea
                name="message"
                placeholder="Describe your issue in detail..."
                className="instagram-input h-32 resize-none"
                required
                data-testid="textarea-support-message"
              />
            </div>
            <Button
              type="submit"
              disabled={supportMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              data-testid="button-submit-support"
            >
              <Send className="mr-2" size={20} />
              {supportMutation.isPending ? 'Sending...' : 'Send Support Request'}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
