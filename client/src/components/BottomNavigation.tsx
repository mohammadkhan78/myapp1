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
    <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gray-700 z-40">
      <div className="flex items-center justify-around py-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-4 transition-colors ${
              currentTab === id ? 'text-gold' : 'text-gray-400'
            }`}
            data-testid={`nav-${id}`}
          >
            <Icon size={20} className="mb-1" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
