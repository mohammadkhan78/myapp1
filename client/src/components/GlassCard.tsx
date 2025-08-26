import { cn } from "@/lib/utils";
import { Card, type CardProps } from "@/components/ui/card";

interface GlassCardProps extends CardProps {
  children: React.ReactNode;
}

export default function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn("glass-effect bg-opacity-10 border-opacity-20", className)}
      {...props}
    >
      {children}
    </Card>
  );
}
