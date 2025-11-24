// hooks/use-toast.ts
import { useState } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [, setToast] = useState<Toast | null>(null);

  const toast = ({ title, description, variant = "default" }: Toast) => {
    if (variant === "destructive") {
      alert(`❌ ${title}\n${description || ""}`);
    } else {
      alert(`✅ ${title}\n${description || ""}`);
    }
    
    setToast({ title, description, variant });
  };

  return { toast };
}