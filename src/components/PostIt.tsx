import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Edit3, MessageSquare, ExternalLink, Link } from "lucide-react";
import { cn } from "@/lib/utils";

export type PostItColor = "yellow" | "blue" | "green" | "pink" | "orange" | "purple";
export type PostItMetric = "Piece" | "Monthly" | "Weekly" | "Credits";

interface VPCOption {
  id: string;
  name: string;
  linkedBmcId?: string;
  linkedPostItId?: string;
}

interface PostItProps {
  id: string;
  text: string;
  comment?: string;
  price?: string;
  metric?: PostItMetric;
  color: PostItColor;
  x: number;
  y: number;
  width?: number;
  height?: number;
  showMetadata?: boolean;
  showVpcConnection?: boolean;
  availableVpcs?: VPCOption[];
  linkedVpcId?: string;
  onUpdate: (id: string, text: string, comment?: string, price?: string, metric?: PostItMetric) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onLinkVpc?: (postItId: string, vpcId: string) => void;
  onCreateAndLinkVpc?: (postItId: string, postItText: string) => void;
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
  price = "",
  metric,
  color,
  x,
  y,
  width = 120,
  height = 80,
  showMetadata = false,
  showVpcConnection = false,
  availableVpcs = [],
  linkedVpcId,
  onUpdate,
  onResize,
  onDelete,
  onDragStart,
  onDragEnd,
  onLinkVpc,
  onCreateAndLinkVpc,
  isDragging = false,
  className,
}: PostItProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editComment, setEditComment] = useState(comment);
  const [editPrice, setEditPrice] = useState(price);
  const [editMetric, setEditMetric] = useState<PostItMetric | undefined>(metric);
  const [isHovered, setIsHovered] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isVpcLinkOpen, setIsVpcLinkOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditText(text);
    setEditComment(comment);
    setEditPrice(price);
    setEditMetric(metric);
  }, [text, comment, price, metric]);

  const handleSave = () => {
    onUpdate(id, editText.trim(), editComment.trim(), editPrice.trim(), editMetric);
    setIsEditing(false);
  };

  const handleCommentSave = () => {
    onUpdate(id, text, editComment.trim(), editPrice.trim(), editMetric);
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
      setEditPrice(price);
      setEditMetric(metric);
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
          {showVpcConnection && (
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-5 w-5 p-0 bg-white/80 hover:bg-white border shadow-soft hover:text-primary",
                linkedVpcId ? "text-green-600" : "text-primary"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (!linkedVpcId) {
                  // No VPC linked, create new one
                  onCreateAndLinkVpc?.(id, text);
                } else {
                  // VPC already linked, show linking options
                  setIsVpcLinkOpen(true);
                }
              }}
              title={linkedVpcId ? "Linked to VPC" : "Create VPC"}
            >
              {linkedVpcId ? <Link className="h-2.5 w-2.5" /> : <ExternalLink className="h-2.5 w-2.5" />}
            </Button>
          )}
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
                {showMetadata && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Price:</label>
                      <Input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="Enter price..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Metric:</label>
                      <Select value={editMetric} onValueChange={(value) => setEditMetric(value as PostItMetric)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select metric..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Piece">Piece</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Credits">Credits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
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

      {/* VPC Link Dialog */}
      <Dialog open={isVpcLinkOpen} onOpenChange={setIsVpcLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to VPC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {linkedVpcId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  Currently linked to: {availableVpcs.find(v => v.id === linkedVpcId)?.name}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Select a VPC to link to this value proposition:</p>
              {availableVpcs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No VPCs available. Create a VPC first.</p>
              ) : (
                <div className="space-y-2">
                  {availableVpcs.map((vpc) => (
                    <Button
                      key={vpc.id}
                      variant={vpc.linkedPostItId === id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => {
                        onLinkVpc?.(id, vpc.id);
                        setIsVpcLinkOpen(false);
                      }}
                      disabled={vpc.linkedPostItId && vpc.linkedPostItId !== id}
                    >
                      {vpc.name}
                      {vpc.linkedPostItId && vpc.linkedPostItId !== id && " (Already linked)"}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}