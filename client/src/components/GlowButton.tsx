import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

interface GlowButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export default function GlowButton({ children, className, ...props }: GlowButtonProps) {
  return (
    <Button
      className={cn(
        "glow-button bg-gold text-dark-bg hover:bg-gold-light font-bold",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
