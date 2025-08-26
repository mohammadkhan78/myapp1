import { Vault } from "lucide-react";
import GlassCard from "./GlassCard";

interface EarningsChartProps {
  activeUsers: number;
  totalPaid: number;
  isLoading: boolean;
}

export default function EarningsChart({ activeUsers, totalPaid, isLoading }: EarningsChartProps) {
  return (
    <GlassCard className="p-6 card-glow">
      <div className="flex items-center justify-center mb-6">
        <Vault className="text-2xl text-gold mr-2" size={24} />
        <h2 className="text-xl font-bold gradient-text">Task Vault</h2>
      </div>
      
      {/* Statistics Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold text-glow mb-1" data-testid="active-users">
            {isLoading ? '...' : activeUsers.toLocaleString()}
          </div>
          <div className="text-gray-300 text-sm">Active Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400 text-glow mb-1" data-testid="total-paid">
            {isLoading ? '...' : `₹${totalPaid.toLocaleString()}`}
          </div>
          <div className="text-gray-300 text-sm">Total Paid</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2 text-glow text-center">Earnings Growth</h3>
      <p className="text-gray-300 mb-4 text-sm text-center">Weekly Performance</p>
      
      {/* Enhanced Chart */}
      <div className="chart-container">
        <svg className="absolute inset-4 w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFC107" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#FFD54F" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#FFEB3B" stopOpacity="0.8"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Grid */}
          <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,193,7,0.1)" strokeWidth="1"/>
          <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,193,7,0.1)" strokeWidth="1"/>
          <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,193,7,0.1)" strokeWidth="1"/>
          <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,193,7,0.1)" strokeWidth="1"/>
          
          {/* Chart line with glow */}
          <path 
            d="M20,95 Q60,85 80,75 T120,65 T160,55 T200,45 T240,35 T280,25" 
            stroke="url(#chartGradient)" 
            strokeWidth="3" 
            fill="none" 
            filter="url(#glow)"
          />
          
          {/* Data points */}
          <circle cx="20" cy="95" r="3" fill="#FFC107" filter="url(#glow)"/>
          <circle cx="80" cy="75" r="3" fill="#FFD54F" filter="url(#glow)"/>
          <circle cx="120" cy="65" r="3" fill="#FFC107" filter="url(#glow)"/>
          <circle cx="160" cy="55" r="3" fill="#FFD54F" filter="url(#glow)"/>
          <circle cx="200" cy="45" r="3" fill="#FFC107" filter="url(#glow)"/>
          <circle cx="240" cy="35" r="3" fill="#FFD54F" filter="url(#glow)"/>
          <circle cx="280" cy="25" r="3" fill="#FFEB3B" filter="url(#glow)"/>
        </svg>
        
        <div className="absolute bottom-4 left-4 text-xs text-gray-300">This Week</div>
        <div className="absolute top-4 right-4 text-xs text-green-400 font-bold text-glow">+24.5%</div>
      </div>
    </GlassCard>
  );
}
