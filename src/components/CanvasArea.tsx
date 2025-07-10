import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LlmSelectionMenu } from "./LlmSelectionMenu";

interface CanvasAreaProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onDrop: (areaId: string, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDoubleClick?: (areaId: string, x: number, y: number) => void;
  onCreatePostIt?: (areaId: string) => void;
  onIconClick?: (areaId: string) => void;
  onAiClick?: (areaId: string, llmId: string) => void;
  onGridArrange?: (areaId: string) => void;
  isDragOver?: boolean;
  className?: string;
  isGeneratingAi?: boolean;
}

export function CanvasArea({
  id,
  title,
  icon,
  children,
  onDrop,
  onDragOver,
  onDoubleClick,
  onCreatePostIt,
  onIconClick,
  onAiClick,
  onGridArrange,
  isDragOver = false,
  className,
  isGeneratingAi = false,
}: CanvasAreaProps) {

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(id, e);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!onDoubleClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onDoubleClick(id, x, y);
  };

  return (
    <Card
      className={cn(
        "relative min-h-48 p-4 bg-canvas-area border-2 border-canvas-border transition-all duration-200",
        isDragOver && "border-primary bg-primary/5 shadow-medium",
        className
      )}
      data-canvas-area="true"
      onDrop={handleDrop}
      onDragOver={onDragOver}
      onDoubleClick={handleDoubleClick}
    >
      {/* Area header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-2">
          {icon && (
            <Button
              onClick={() => onIconClick?.(id)}
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              title={`Learn more about ${title}`}
            >
              {icon}
            </Button>
          )}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        
        {/* Grid, AI and Add Post-it buttons */}
        <div className="flex items-center gap-1">
          {/* Grid arrange button */}
          {onGridArrange && (
            <Button
              onClick={() => onGridArrange(id)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
              title="Arrange Post-its in grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          )}
          
          {/* AI button */}
          {onAiClick && (
            <LlmSelectionMenu 
              onSelect={(llmId) => onAiClick(id, llmId)} 
              isGenerating={isGeneratingAi}
            />
          )}
          
          {/* Add Post-it button */}
          {onCreatePostIt && (
            <Button
              onClick={() => onCreatePostIt(id)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Drop zone indicator */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-primary/5 z-20">
          <div className="text-primary font-medium">Drop here</div>
        </div>
      )}

      {/* Content */}
      <div className="relative min-h-32">
        {children}
      </div>
    </Card>
  );
}