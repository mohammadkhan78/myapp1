import { Home, Target, Gem, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ currentTab, onTabChange }: BottomNavigationProps) {
  const { user } = useAuth();

  if (!user?.isVerified) {
    return null;
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'offerwall', label: 'Offerwall', icon: Target },
    { id: 'advanced', label: 'Premium', icon: Gem },
    { id: 'withdraw', label: 'Withdraw', icon: CreditCard },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-gold/20 z-40">
      <div className="flex items-center justify-around py-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
              currentTab === id 
                ? 'text-gold bg-gold/10 shadow-lg shadow-gold/20' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            data-testid={`nav-${id}`}
          >
            <Icon size={20} className={`mb-1 ${currentTab === id ? 'filter drop-shadow-glow' : ''}`} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
