import { useState } from "react";
import { ArrowLeft, Instagram, Shield, Clock, Users, Gift, Info } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface VerificationPageProps {
  onNavigate: (page: string) => void;
}

export default function VerificationPage({ onNavigate }: VerificationPageProps) {
  const [instagramHandle, setInstagramHandle] = useState("");
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async (handle: string) => {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instagramHandle: handle }),
      });
      
      if (!response.ok) {
        throw new Error('Verification request failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.status === 'already_verified') {
        toast({
          title: "Already Verified",
          description: "Your account is already verified!",
        });
        onNavigate('offerwall');
      } else {
        toast({
          title: "Verification Submitted",
          description: "Our team will verify your account within 1-2 hours.",
        });
        onNavigate('pending');
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instagramHandle.trim()) {
      const cleanHandle = instagramHandle.trim().replace('@', '');
      verifyMutation.mutate(cleanHandle);
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center mb-8 pt-4">
        <Button 
          onClick={() => onNavigate('home')}
          variant="ghost"
          size="icon"
          className="mr-4 hover:bg-gray-700"
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-bold gradient-text">Instagram Verification</h2>
      </div>

      {/* Verification Form */}
      <GlassCard className="p-6 mb-6">
        <div className="text-center mb-6">
          <Instagram className="text-6xl text-pink-500 mb-4 mx-auto" size={64} />
          <h3 className="text-xl font-semibold mb-2">Verify Your Instagram Handle</h3>
          <div className="flex items-center justify-center text-green-400 text-sm">
            <Shield className="mr-2" size={16} />
            Your data is 100% secure and encrypted
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-3">Instagram Username</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
              <Input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="your_username"
                className="instagram-input pl-10"
                required
                data-testid="input-instagram-handle"
              />
            </div>
          </div>

          <GlowButton 
            type="submit" 
            className="w-full py-4 text-lg"
            disabled={verifyMutation.isPending}
            data-testid="button-submit-verification"
          >
            <Gift className="mr-2" size={20} />
            {verifyMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
          </GlowButton>
        </form>
      </GlassCard>

      {/* Info Section */}
      <GlassCard className="p-6">
        <h4 className="font-semibold mb-4 flex items-center">
          <Info className="text-blue-400 mr-2" size={20} />
          Verification Process
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center">
            <Clock className="text-yellow-400 mr-2 w-4" size={16} />
            Our team will verify your account within 1-2 hours
          </li>
          <li className="flex items-center">
            <Users className="text-green-400 mr-2 w-4" size={16} />
            Minimum 1000 followers required
          </li>
          <li className="flex items-center">
            <Gift className="text-purple-400 mr-2 w-4" size={16} />
            ₹5 bonus added to wallet upon approval
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}
