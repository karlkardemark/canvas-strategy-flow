import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sparkles, Brain, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LlmOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  speed: "fast" | "medium" | "slow";
}

const llmOptions: LlmOption[] = [
  {
    id: "gpt-4.1-2025-04-14",
    name: "GPT-4.1",
    description: "Most capable and balanced",
    icon: <Star className="h-4 w-4" />,
    speed: "medium"
  },
  {
    id: "o4-mini-2025-04-16", 
    name: "O4 Mini",
    description: "Fast reasoning model",
    icon: <Zap className="h-4 w-4" />,
    speed: "fast"
  },
  {
    id: "o3-2025-04-16",
    name: "O3",
    description: "Powerful reasoning model", 
    icon: <Brain className="h-4 w-4" />,
    speed: "slow"
  }
];

interface LlmSelectionMenuProps {
  onSelect: (llmId: string) => void;
  isGenerating?: boolean;
}

export function LlmSelectionMenu({ onSelect, isGenerating = false }: LlmSelectionMenuProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (llmId: string) => {
    onSelect(llmId);
    setOpen(false);
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "fast": return "text-green-600";
      case "medium": return "text-yellow-600"; 
      case "slow": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-purple-500 hover:text-purple-600 opacity-60 hover:opacity-100"
          title="AI assistance"
          disabled={isGenerating}
        >
          <Sparkles className={cn("h-4 w-4", isGenerating && "animate-spin")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="end">
        <div className="space-y-0.5">
          {llmOptions.map((llm) => (
            <Button
              key={llm.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 px-2"
              onClick={() => handleSelect(llm.id)}
              disabled={isGenerating}
            >
              <span className="text-sm">{llm.name}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}