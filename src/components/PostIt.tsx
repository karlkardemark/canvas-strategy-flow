import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { X, Edit3, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type PostItColor = "yellow" | "blue" | "green" | "pink" | "orange" | "purple";

interface PostItProps {
  id: string;
  text: string;
  comment?: string;
  color: PostItColor;
  x: number;
  y: number;
  width?: number;
  height?: number;
  onUpdate: (id: string, text: string, comment?: string) => void;
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
  comment = "",
  color,
  x,
  y,
  width = 120,
  height = 80,
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
  const [editComment, setEditComment] = useState(comment);
  const [isHovered, setIsHovered] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate(id, editText.trim(), editComment.trim());
    setIsEditing(false);
  };

  const handleCommentSave = () => {
    onUpdate(id, text, editComment.trim());
    setIsCommentOpen(false);
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
      setEditComment(comment);
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
        "absolute p-2 cursor-move select-none transition-all duration-200 border-2 resize overflow-hidden",
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
        minWidth: 80,
        minHeight: 60
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
          <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 bg-white/80 hover:bg-white border shadow-soft"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MessageSquare className="h-2.5 w-2.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Post-it Comment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Main Text:</label>
                  <p className="text-sm text-muted-foreground mt-1">{text || "No text"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Comment:</label>
                  <Textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Add detailed comments here..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCommentOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCommentSave}>
                    Save Comment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0 bg-white/80 hover:bg-white border shadow-soft"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit3 className="h-2.5 w-2.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0 bg-white/80 hover:bg-white border shadow-soft text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <X className="h-2.5 w-2.5" />
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
            className="w-full h-full resize-none border-none outline-none bg-transparent text-xs font-medium placeholder:text-gray-500"
            placeholder="Short text..."
            maxLength={50}
          />
        ) : (
          <div
            className="w-full h-full text-xs font-medium text-gray-800 overflow-hidden cursor-text flex items-center justify-center text-center leading-tight"
            onClick={() => setIsEditing(true)}
          >
            <span className="break-words">
              {text || "Click to edit..."}
              {comment && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full opacity-60" />
              )}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}