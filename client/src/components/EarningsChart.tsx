import { Vault } from "lucide-react";
import GlassCard from "./GlassCard";

interface EarningsChartProps {
  activeUsers: number;
  totalPaid: number;
  isLoading: boolean;
}

export default function EarningsChart({ activeUsers, totalPaid, isLoading }: EarningsChartProps) {
  const weekData = [
    { day: 'Mon', earning: 45, growth: '2.3%' },
    { day: 'Tue', earning: 52, growth: null },
    { day: 'Wed', earning: 38, growth: null },
    { day: 'Thu', earning: 68, growth: '₹1,240' },
    { day: 'Fri', earning: 72, growth: null },
    { day: 'Sat', earning: 58, growth: null },
    { day: 'Sun', earning: 85, growth: '₹177' }
  ];

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

      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <Vault className="text-gold mr-2" size={20} />
          <h3 className="text-lg font-semibold text-glow">Task Vault</h3>
        </div>
        <h4 className="font-semibold text-gray-200 mb-1">Earnings Growth</h4>
        <p className="text-gray-400 text-sm">Weekly Performance</p>
      </div>
      
      {/* Enhanced Chart */}
      <div className="chart-container mb-4">
        <svg className="absolute inset-4 w-full h-full" viewBox="0 0 350 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFC107" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#FFC107" stopOpacity="0.1"/>
            </linearGradient>
            <filter id="chartGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Area under the curve */}
          <path 
            d="M50,80 Q90,70 120,65 T180,50 T220,45 T260,35 T300,25 L300,95 L50,95 Z" 
            fill="url(#areaGradient)"
          />
          
          {/* Chart line with glow */}
          <path 
            d="M50,80 Q90,70 120,65 T180,50 T220,45 T260,35 T300,25" 
            stroke="#FFC107" 
            strokeWidth="3" 
            fill="none" 
            filter="url(#chartGlow)"
          />
          
          {/* Data points */}
          <circle cx="50" cy="80" r="3" fill="#FFC107" filter="url(#chartGlow)"/>
          <circle cx="120" cy="65" r="3" fill="#FFC107" filter="url(#chartGlow)"/>
          <circle cx="180" cy="50" r="3" fill="#FFC107" filter="url(#chartGlow)"/>
          <circle cx="220" cy="45" r="3" fill="#FFC107" filter="url(#chartGlow)"/>
          <circle cx="260" cy="35" r="3" fill="#FFC107" filter="url(#chartGlow)"/>
          <circle cx="300" cy="25" r="3" fill="#FFC107" filter="url(#chartGlow)"/>
        </svg>
      </div>

      {/* Days of the week with data */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekData.map((data, index) => (
          <div key={data.day} className="text-center">
            <div className="text-xs text-gray-400 mb-1">{data.day}</div>
            {data.growth && (
              <div className={`text-xs font-bold mb-1 ${
                data.growth.includes('₹') 
                  ? data.day === 'Thu' ? 'text-gold' : 'text-blue-400'
                  : 'text-green-400'
              }`}>
                {data.growth}
              </div>
            )}
            {data.growth && data.growth.includes('₹') && (
              <div className="text-xs text-gray-500">
                {data.day === 'Thu' ? 'This Week' : 'Daily Avg'}
              </div>
            )}
            {data.growth && !data.growth.includes('₹') && !data.growth.includes('%') && (
              <div className="text-xs text-gray-500">Growth</div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center">
        <div className="text-xs text-gray-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-gold rounded-full mr-2"></div>
          Real-time earning statistics updated every hour
        </div>
      </div>
    </GlassCard>
  );
}
