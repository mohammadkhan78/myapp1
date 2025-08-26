import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingScreen from "@/components/LoadingScreen";
import BottomNavigation from "@/components/BottomNavigation";
import HomePage from "@/pages/HomePage";
import VerificationPage from "@/pages/VerificationPage";
import PendingPage from "@/pages/PendingPage";
import OfferwallPage from "@/pages/OfferwallPage";
import AdvancedOfferwallPage from "@/pages/AdvancedOfferwallPage";
import WithdrawPage from "@/pages/WithdrawPage";
import HomeTabPage from "@/pages/HomeTabPage";
import HelpPage from "@/pages/HelpPage";
import AdminPage from "@/pages/AdminPage";
import { HelpCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [showHelp, setShowHelp] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Handle initial loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Check for admin route and handle initial page
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setShowAdmin(true);
      return;
    }
    
    if (!isLoading) {
      if (!user) {
        setCurrentPage('home');
      } else if (user.isVerified) {
        setCurrentPage('offerwall');
      }
    }
  }, [user, isLoading]);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    
    // Store verification handle for status checking
    if (page === 'verification') {
      // This will be set when user submits verification
    }
  };

  const handleTabChange = (tab: string) => {
    const tabPages = {
      'home': 'home-tab',
      'offerwall': 'offerwall',
      'advanced': 'advanced',
      'withdraw': 'withdraw',
    };
    setCurrentPage(tabPages[tab as keyof typeof tabPages] || tab);
  };

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigation} />;
      case 'verification':
        return <VerificationPage onNavigate={handleNavigation} />;
      case 'pending':
        return <PendingPage onNavigate={handleNavigation} />;
      case 'offerwall':
        return <OfferwallPage onNavigate={handleNavigation} />;
      case 'advanced':
        return <AdvancedOfferwallPage />;
      case 'withdraw':
        return <WithdrawPage />;
      case 'home-tab':
        return <HomeTabPage />;
      default:
        return <HomePage onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white relative">
      {/* Main Content */}
      <div className={`${user?.isVerified ? 'pb-20' : ''}`}>
        {renderCurrentPage()}
      </div>

      {/* Bottom Navigation - Only show when user is verified */}
      {user?.isVerified && (
        <BottomNavigation 
          currentTab={currentPage === 'home-tab' ? 'home' : currentPage}
          onTabChange={handleTabChange}
        />
      )}

      {/* Floating Help Button - Only show when user is verified */}
      {user?.isVerified && (
        <Button
          onClick={() => setShowHelp(true)}
          className="fixed bottom-24 right-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-30"
          size="icon"
          data-testid="button-help"
        >
          <HelpCircle size={24} />
        </Button>
      )}


      {/* Help Page Overlay */}
      {showHelp && (
        <HelpPage onClose={() => setShowHelp(false)} />
      )}

      {/* Admin Page Overlay */}
      {showAdmin && (
        <AdminPage onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
