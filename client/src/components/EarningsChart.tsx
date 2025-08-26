import { Vault } from "lucide-react";
import GlassCard from "./GlassCard";

export default function EarningsChart() {
  return (
    <GlassCard className="p-6 card-glow">
      <div className="flex items-center justify-center mb-4">
        <Vault className="text-2xl text-gold mr-2" size={24} />
        <h2 className="text-xl font-bold gradient-text">Task Vault</h2>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-glow">Earnings Growth</h3>
      <p className="text-gray-300 mb-4 text-sm">Weekly Performance</p>
      <div className="chart-container">
        <div className="chart-line"></div>
        <div className="absolute bottom-4 left-4 text-xs text-gray-300">This Week</div>
        <div className="absolute top-4 right-4 text-xs text-green-400 font-bold">+24.5%</div>
      </div>
    </GlassCard>
  );
}
