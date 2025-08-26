import { HourglassIcon } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";

interface PendingPageProps {
  onNavigate: (page: string) => void;
}

export default function PendingPage({ onNavigate }: PendingPageProps) {
  const { login } = useAuth();

  const checkStatusMutation = useMutation({
    mutationFn: async () => {
      const handle = localStorage.getItem('lastVerificationHandle') || '';
      const response = await fetch(`/api/verify/${encodeURIComponent(handle)}`);
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.status === 'verified') {
        try {
          await login(data.user.instagramHandle);
          onNavigate('offerwall');
        } catch (error) {
          console.error('Login failed after verification:', error);
        }
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <GlassCard className="p-8 text-center max-w-md w-full">
        <div className="animate-pulse-slow mb-6">
          <HourglassIcon className="text-6xl text-yellow-400 mx-auto" size={64} />
        </div>
        <h3 className="text-2xl font-bold mb-4">Verification in Progress</h3>
        <p className="text-gray-300 mb-6">
          Our team is verifying your Instagram account. Please wait 1-2 hours and check back.
        </p>
        <GlowButton 
          onClick={() => checkStatusMutation.mutate()}
          disabled={checkStatusMutation.isPending}
          data-testid="button-check-status"
        >
          {checkStatusMutation.isPending ? 'Checking...' : 'Check Status'}
        </GlowButton>
      </GlassCard>
    </div>
  );
}
