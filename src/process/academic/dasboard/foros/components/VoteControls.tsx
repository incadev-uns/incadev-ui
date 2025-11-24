import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoteControlsProps {
  voteCount: number;
  userVoted: boolean;
  isVoting: boolean;
  onToggleVote: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function VoteControls({
  voteCount,
  userVoted,
  isVoting,
  onToggleVote,
  size = "md",
  className,
}: VoteControlsProps) {
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant={userVoted ? "default" : "ghost"}
        size="sm"
        onClick={onToggleVote}
        disabled={isVoting}
        className={cn(
          "flex items-center gap-1 px-2",
          userVoted && "bg-primary text-primary-foreground"
        )}
      >
        <ThumbsUp
          className={cn(
            iconSizes[size],
            userVoted && "fill-current"
          )}
        />
        <span className={textSizes[size]}>{voteCount}</span>
      </Button>
    </div>
  );
}
