import { Users, HelpCircle, ExternalLink, AlertTriangle, Mail } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

export default function HomeTabPage() {
  const openEmail = () => {
    window.open('mailto:taskvaultsupport@gmail.com');
  };

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <h2 className="text-2xl font-bold gradient-text mb-6">Welcome to Task Vault</h2>
      
      {/* About Us */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="text-blue-400 mr-3" size={24} />
          About Us
        </h3>
        <p className="text-gray-300 leading-relaxed">
          Task Vault is a premier platform that connects Instagram influencers with brands, 
          enabling you to monetize your social media presence through simple tasks and engagements.
        </p>
      </GlassCard>

      {/* FAQs */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <HelpCircle className="text-green-400 mr-3" size={24} />
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <details className="cursor-pointer">
            <summary className="font-medium py-2">How long does verification take?</summary>
            <p className="text-gray-300 text-sm mt-2 pl-4">Typically 1-2 hours during business hours.</p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-medium py-2">When do I receive payments?</summary>
            <p className="text-gray-300 text-sm mt-2 pl-4">Payments are processed within 24-48 hours of task completion.</p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-medium py-2">What tasks are available?</summary>
            <p className="text-gray-300 text-sm mt-2 pl-4">Follow accounts, like posts, share stories, and more Instagram engagement tasks.</p>
          </details>
        </div>
      </GlassCard>

      {/* Support */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Mail className="text-purple-400 mr-3" size={24} />
          Support
        </h3>
        <button
          onClick={openEmail}
          className="w-full flex items-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors"
          data-testid="button-email-support"
        >
          <Mail className="text-purple-400 text-xl mr-4" size={24} />
          <div className="flex-1 text-left">
            <div className="font-medium">Email Support</div>
            <div className="text-sm text-gray-400">taskvaultsupport@gmail.com</div>
          </div>
          <ExternalLink className="text-purple-400" size={20} />
        </button>
      </GlassCard>

      {/* Disclaimers */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <AlertTriangle className="text-yellow-400 mr-3" size={24} />
          Important Disclaimers
        </h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p>• You must be 18+ years old to participate</p>
          <p>• Instagram account must have 1000+ followers</p>
          <p>• Earnings depend on task completion and approval</p>
          <p>• We are not affiliated with Instagram/Meta</p>
          <p>• Tasks must be completed genuinely</p>
        </div>
      </GlassCard>
    </div>
  );
}
