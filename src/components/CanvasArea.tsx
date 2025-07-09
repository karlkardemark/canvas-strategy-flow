import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CanvasAreaProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onDrop: (areaId: string, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  isDragOver?: boolean;
  className?: string;
}

export function CanvasArea({
  id,
  title,
  icon,
  children,
  onDrop,
  onDragOver,
  isDragOver = false,
  className,
}: CanvasAreaProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(id, e);
  };

  return (
    <Card
      className={cn(
        "relative min-h-48 p-4 bg-canvas-area border-2 border-canvas-border transition-all duration-200",
        isDragOver && "border-primary bg-primary/5 shadow-medium",
        className
      )}
      onDrop={handleDrop}
      onDragOver={onDragOver}
    >
      {/* Area header */}
      <div className="flex items-center space-x-2 mb-4 relative z-10">
        {icon && (
          <div className="p-2 rounded-lg bg-secondary">
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-foreground">{title}</h3>
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