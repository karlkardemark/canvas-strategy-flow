import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PostItColor = "yellow" | "blue" | "green" | "pink" | "orange" | "purple";

interface PostItProps {
  id: string;
  text: string;
  color: PostItColor;
  x: number;
  y: number;
  width?: number;
  height?: number;
  onUpdate: (id: string, text: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
  className?: string;
}

const colorClasses: Record<PostItColor, string> = {
  yellow: "bg-postit-yellow border-yellow-400",
  blue: "bg-postit-blue border-blue-400",
  green: "bg-postit-green border-green-400",
  pink: "bg-postit-pink border-pink-400",
  orange: "bg-postit-orange border-orange-400",
  purple: "bg-postit-purple border-purple-400",
};

export function PostIt({
  id,
  text,
  color,
  x,
  y,
  width = 192,
  height = 128,
  onUpdate,
  onResize,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging = false,
  className,
}: PostItProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate(id, editText.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      return; // Allow line breaks with Shift+Enter
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditText(text);
      setIsEditing(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart(id);
  };

  return (
    <Card
      className={cn(
        "absolute p-3 cursor-move select-none transition-all duration-200 border-2 resize overflow-auto",
        colorClasses[color],
        isDragging && "opacity-50 scale-105 rotate-2",
        isHovered && !isDragging && "shadow-medium scale-105",
        className
      )}
      style={{ 
        left: x, 
        top: y, 
        width: width, 
        height: height,
        minWidth: 150,
        minHeight: 100
      }}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full">
        {/* Action buttons */}
        <div
          className={cn(
            "absolute -top-1 -right-1 flex space-x-1 transition-opacity duration-200",
            isHovered || isEditing ? "opacity-100" : "opacity-0"
          )}
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 bg-white/80 hover:bg-white border shadow-soft"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 bg-white/80 hover:bg-white border shadow-soft text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Content */}
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full h-24 resize-none border-none outline-none bg-transparent text-sm font-medium placeholder:text-gray-500"
            placeholder="Add your note..."
          />
        ) : (
          <div
            className="w-full h-24 text-sm font-medium text-gray-800 whitespace-pre-wrap overflow-hidden cursor-text"
            onClick={() => setIsEditing(true)}
          >
            {text || "Click to edit..."}
          </div>
        )}
      </div>
    </Card>
  );
}