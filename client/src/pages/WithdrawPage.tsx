import { useState } from "react";
import { CreditCard, Smartphone, Gift, ShoppingCart, Play } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function WithdrawPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<'amazon' | 'flipkart' | 'googleplay' | ''>('');

  const { data: settings } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  const upiMessage = settings?.find((s: any) => s.key === 'upiMessage')?.value || 'UPI payments are accessible after 2 days';

  const withdrawMutation = useMutation({
    mutationFn: async (data: { type: string; amount: number; details: any }) => {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...data,
          details: JSON.stringify(data.details),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit withdrawal request');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.type === 'upi') {
        toast({
          title: "UPI Withdrawal Requested",
          description: upiMessage,
          variant: "default",
        });
      } else {
        toast({
          title: "Gift Card Requested",
          description: "You will receive your code in 1-2 hours via email.",
        });
      }
      setShowGiftCardModal(false);
      setSelectedGiftCard('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request.",
        variant: "destructive",
      });
    },
  });

  const handleUpiSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const upiId = formData.get('upiId') as string;
    const amount = parseInt(formData.get('amount') as string) * 100; // Convert to paisa

    withdrawMutation.mutate({
      type: 'upi',
      amount,
      details: { upiId },
    });
  };

  const handleGiftCardSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const mobile = formData.get('mobile') as string;
    const amount = parseInt(formData.get('amount') as string) * 100; // Convert to paisa

    withdrawMutation.mutate({
      type: selectedGiftCard,
      amount,
      details: { email, mobile },
    });
  };

  const selectGiftCard = (type: 'amazon' | 'flipkart' | 'googleplay') => {
    setSelectedGiftCard(type);
    setShowGiftCardModal(true);
  };

  const giftCardTitles = {
    amazon: 'Amazon Gift Card',
    flipkart: 'Flipkart Gift Card',
    googleplay: 'Google Play Gift Card',
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <h2 className="text-2xl font-bold gradient-text mb-6">Withdraw Funds</h2>
      
      {/* Current Balance */}
      <GlassCard className="p-6 mb-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-500/30">
        <div className="text-center">
          <div className="text-sm text-gray-300 mb-2">Available Balance</div>
          <div className="text-3xl font-bold text-green-400" data-testid="available-balance">
            ₹{(user.balance / 100).toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-2">Minimum withdrawal: ₹50</div>
        </div>
      </GlassCard>

      {/* UPI Withdrawal */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Smartphone className="text-green-400 mr-3" size={24} />
          UPI Withdrawal
        </h3>
        
        <form onSubmit={handleUpiSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-2">UPI ID</Label>
            <Input
              name="upiId"
              type="text"
              placeholder="yourname@paytm"
              className="instagram-input"
              required
              data-testid="input-upi-id"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-2">Amount</Label>
            <Input
              name="amount"
              type="number"
              placeholder="Enter amount (min ₹50)"
              className="instagram-input"
              min="50"
              max={user.balance / 100}
              required
              data-testid="input-upi-amount"
            />
          </div>
          <Button
            type="submit"
            disabled={withdrawMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            data-testid="button-submit-upi"
          >
            {withdrawMutation.isPending ? 'Processing...' : 'Request UPI Withdrawal'}
          </Button>
        </form>
        
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center text-yellow-400 text-sm">
            <CreditCard className="mr-2" size={16} />
            <span data-testid="text-upi-message">{upiMessage}</span>
          </div>
        </div>
      </GlassCard>

      {/* Gift Cards */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Gift className="text-purple-400 mr-3" size={24} />
          Gift Cards
        </h3>
        
        <div className="space-y-4">
          {/* Amazon Gift Card */}
          <button
            onClick={() => selectGiftCard('amazon')}
            className="w-full border border-orange-500/30 rounded-xl p-4 hover:border-orange-500/60 transition-colors cursor-pointer text-left"
            data-testid="button-select-amazon"
          >
            <div className="flex items-center">
              <ShoppingCart className="text-orange-400 text-2xl mr-4" size={32} />
              <div className="flex-1">
                <div className="font-semibold">Amazon Gift Card</div>
                <div className="text-sm text-gray-400">Redeem on Amazon.in</div>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          </button>

          {/* Flipkart Gift Card */}
          <button
            onClick={() => selectGiftCard('flipkart')}
            className="w-full border border-blue-500/30 rounded-xl p-4 hover:border-blue-500/60 transition-colors cursor-pointer text-left"
            data-testid="button-select-flipkart"
          >
            <div className="flex items-center">
              <ShoppingCart className="text-blue-400 text-2xl mr-4" size={32} />
              <div className="flex-1">
                <div className="font-semibold">Flipkart Gift Card</div>
                <div className="text-sm text-gray-400">Redeem on Flipkart.com</div>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          </button>

          {/* Google Play Gift Card */}
          <button
            onClick={() => selectGiftCard('googleplay')}
            className="w-full border border-green-500/30 rounded-xl p-4 hover:border-green-500/60 transition-colors cursor-pointer text-left"
            data-testid="button-select-googleplay"
          >
            <div className="flex items-center">
              <Play className="text-green-400 text-2xl mr-4" size={32} />
              <div className="flex-1">
                <div className="font-semibold">Google Play Gift Card</div>
                <div className="text-sm text-gray-400">Redeem on Play Store</div>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          </button>
        </div>
      </GlassCard>

      {/* Gift Card Form Modal */}
      <Dialog open={showGiftCardModal} onOpenChange={setShowGiftCardModal}>
        <DialogContent className="glass-effect border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {selectedGiftCard ? giftCardTitles[selectedGiftCard] : 'Gift Card'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleGiftCardSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Email Address</Label>
              <Input
                name="email"
                type="email"
                placeholder="your@email.com"
                className="instagram-input"
                required
                data-testid="input-giftcard-email"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Mobile Number</Label>
              <Input
                name="mobile"
                type="tel"
                placeholder="+91 9876543210"
                className="instagram-input"
                required
                data-testid="input-giftcard-mobile"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Amount</Label>
              <Input
                name="amount"
                type="number"
                placeholder="Enter amount (min ₹50)"
                className="instagram-input"
                min="50"
                max={user.balance / 100}
                required
                data-testid="input-giftcard-amount"
              />
            </div>
            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={withdrawMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                data-testid="button-submit-giftcard"
              >
                {withdrawMutation.isPending ? 'Processing...' : 'Request Gift Card'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowGiftCardModal(false)}
                className="flex-1"
                data-testid="button-cancel-giftcard"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
