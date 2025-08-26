import { Loader2, Vault } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-bg flex items-center justify-center z-50">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Vault className="text-6xl text-gold mr-4" size={64} />
          <div>
            <h1 className="text-4xl font-bold gradient-text">Task Vault</h1>
            <p className="text-gray-400 text-lg mt-2">Loading...</p>
          </div>
        </div>
        <Loader2 className="animate-spin mx-auto text-gold" size={32} />
      </div>
    </div>
  );
}
