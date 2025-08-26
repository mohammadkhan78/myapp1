import { useState, useEffect } from "react";
import { Vault, CheckCircle, Calendar, Coins, Instagram, Users, ArrowRight } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import GlassCard from "@/components/GlassCard";
import EarningsChart from "@/components/EarningsChart";
import { useQuery } from "@tanstack/react-query";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

interface Stats {
  activeUsers: number;
  totalPaid: number;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <div className="flex items-center justify-center mb-4">
          <Vault className="text-4xl text-gold mr-3" size={40} />
          <h1 className="text-4xl font-bold gradient-text">Task Vault</h1>
        </div>
        <p className="text-gray-300 text-lg">Earn Money • Complete Tasks • Get Rewarded</p>
      </div>

      {/* Statistics & Earnings Chart Combined */}
      <div className="px-4 mb-8">
        <EarningsChart 
          activeUsers={stats?.activeUsers || 0}
          totalPaid={stats?.totalPaid || 0}
          isLoading={isLoading}
        />
      </div>

      {/* Eligibility Requirements */}
      <div className="px-4 mb-8">
        <GlassCard className="p-6 card-glow">
          <div className="flex items-center mb-6">
            <CheckCircle className="text-green-400 text-xl mr-3" size={24} />
            <h3 className="text-xl font-semibold text-glow">Eligibility Requirements</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-pink-500/20 rounded-xl border border-pink-500/30 card-glow">
              <Instagram className="text-pink-500 text-xl mr-4" size={24} />
              <div className="flex-1">
                <div className="font-medium text-pink-300">Instagram account with 1000+ followers</div>
              </div>
              <ArrowRight className="text-pink-400" size={20} />
            </div>
            
            <div className="flex items-center p-4 bg-blue-500/20 rounded-xl border border-blue-500/30 card-glow">
              <Calendar className="text-blue-500 text-xl mr-4" size={24} />
              <div className="flex-1">
                <div className="font-medium text-blue-300">Must be over 18 years old</div>
              </div>
              <ArrowRight className="text-blue-400" size={20} />
            </div>
            
            <div className="flex items-center p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/30 premium-glow">
              <Coins className="text-yellow-400 text-xl mr-4" size={24} />
              <div className="flex-1">
                <div className="font-medium text-gold text-glow">Earn up to ₹200 daily & ₹6000 monthly</div>
              </div>
              <ArrowRight className="text-gold" size={20} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Verify Button */}
      <div className="px-4 mb-8">
        <GlowButton 
          onClick={() => onNavigate('verification')}
          className="w-full py-4 text-lg flex items-center justify-center"
          data-testid="button-verify"
        >
          <Users className="mr-3" size={24} />
          Verify Your Instagram Handle
        </GlowButton>
      </div>

      {/* Professional Images Section */}
      <div className="px-4 mb-8">
        <img 
          src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
          alt="Professional team working on financial tasks" 
          className="rounded-2xl w-full h-48 object-cover glass-effect p-2"
        />
      </div>
    </div>
  );
}
