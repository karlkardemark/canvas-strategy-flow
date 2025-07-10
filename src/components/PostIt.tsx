import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Edit3, MessageSquare, ExternalLink, Link, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionConfirmDialog } from "./ConnectionConfirmDialog";

export type PostItColor = "yellow" | "blue" | "green" | "pink" | "orange" | "purple";
export type PostItMetric = "Piece" | "Monthly" | "Weekly" | "Credits";

interface VPCOption {
  id: string;
  name: string;
  linkedBmcId?: string;
  linkedValuePropositionIds: string[];
  linkedCustomerSegmentIds: string[];
  isDraft: boolean;
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
  areaId: string;
  showMetadata?: boolean;
  showVpcConnection?: boolean;
  availableVpcs?: VPCOption[];
  linkedVpcIds?: string[]; // Changed to array to support multiple VPCs
  // New properties for Channel Post-its (connections to other Post-its)
  linkedValuePropositionIds?: string[]; // IDs of Value Proposition Post-its
  linkedCustomerSegmentIds?: string[]; // IDs of Customer Segment Post-its
  availableValuePropositionPostIts?: { id: string; text: string }[]; // Available VP Post-its to connect to
  availableCustomerSegmentPostIts?: { id: string; text: string }[]; // Available CS Post-its to connect to
  onUpdate: (id: string, text: string, comment?: string, price?: string, metric?: PostItMetric) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, dragEvent?: React.DragEvent) => void;
  onDragEnd: () => void;
  onLinkVpc?: (postItId: string, vpcId: string) => void;
  onCreateAndLinkVpc?: (postItId: string, postItText: string, areaId?: string) => void;
  onNavigateToVpc?: (vpcId: string) => void;
  // New handlers for Channel connections
  onLinkValueProposition?: (channelId: string, valuePropositionId: string) => void;
  onLinkCustomerSegment?: (channelId: string, customerSegmentId: string) => void;
  onUnlinkValueProposition?: (channelId: string, valuePropositionId: string) => void;
  onUnlinkCustomerSegment?: (channelId: string, customerSegmentId: string) => void;
  // New drag and drop connection handler
  onDropConnection?: (targetPostItId: string, sourcePostItId: string) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onPostItDragOver?: (e: React.DragEvent, postItId: string) => void;
  onPostItDragLeave?: () => void;
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
  areaId,
  showMetadata = false,
  showVpcConnection = false,
  availableVpcs = [],
  linkedVpcIds = [], // Default to empty array
  // New Channel connection props
  linkedValuePropositionIds = [],
  linkedCustomerSegmentIds = [],
  availableValuePropositionPostIts = [],
  availableCustomerSegmentPostIts = [],
  onUpdate,
  onResize,
  onDelete,
  onDragStart,
  onDragEnd,
  onLinkVpc,
  onCreateAndLinkVpc,
  onNavigateToVpc,
  // New Channel connection handlers
  onLinkValueProposition,
  onLinkCustomerSegment,
  onUnlinkValueProposition,
  onUnlinkCustomerSegment,
  onDropConnection,
  isDragging = false,
  isDragOver = false,
  onPostItDragOver,
  onPostItDragLeave,
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
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(text);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{source: any, target: any} | null>(null);
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
    setEditTitle(text);
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
    onDragStart(id, e);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (areaId !== "channels") return; // Only Channel Post-its can receive connections
    
    e.preventDefault();
    e.stopPropagation(); // Prevent the CanvasArea drop handler from firing
    const draggedPostItId = e.dataTransfer.getData("text/plain");
    
    if (draggedPostItId === id) return; // Can't connect to itself
    
    if (onDropConnection) {
      onDropConnection(id, draggedPostItId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (areaId === "channels") {
      e.preventDefault(); // Allow drop on Channel Post-its
      onPostItDragOver?.(e, id);
    }
  };

  const handleDragLeave = () => {
    if (areaId === "channels") {
      onPostItDragLeave?.();
    }
  };

  const handleConnectionConfirm = () => {
    if (pendingConnection && onDropConnection) {
      onDropConnection(pendingConnection.target.id, pendingConnection.source.id);
    }
    setPendingConnection(null);
    setShowConnectionDialog(false);
  };

  return (
    <Card
      className={cn(
        "absolute p-2 cursor-move select-none transition-all duration-200 border-2 resize overflow-hidden",
        colorClasses[color],
        isDragging && "opacity-50 scale-105 rotate-2",
        isDragOver && "ring-2 ring-primary ring-offset-2 scale-110 shadow-lg",
        isHovered && !isDragging && !isDragOver && "shadow-medium scale-105",
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
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full">
        {/* Properties icon */}
        <Dialog open={isPropertiesOpen} onOpenChange={setIsPropertiesOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 p-0 bg-white/80 hover:bg-white border shadow-soft transition-opacity duration-200",
                isHovered || isEditing ? "opacity-100" : "opacity-0"
              )}
            >
              <Settings className="h-2.5 w-2.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              {isTitleEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => {
                    onUpdate(id, editTitle.trim(), editComment.trim(), editPrice.trim(), editMetric);
                    setIsTitleEditing(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onUpdate(id, editTitle.trim(), editComment.trim(), editPrice.trim(), editMetric);
                      setIsTitleEditing(false);
                    }
                    if (e.key === "Escape") {
                      setEditTitle(text);
                      setIsTitleEditing(false);
                    }
                  }}
                  className="text-lg font-semibold"
                  autoFocus
                />
              ) : (
                <DialogTitle 
                  className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors text-left"
                  onClick={() => setIsTitleEditing(true)}
                >
                  {text || "Untitled Post-it"}
                </DialogTitle>
               )}
               
             </DialogHeader>
             <div className="space-y-4">
              
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
              
               {showVpcConnection && (
                 <div>
                   <label className="text-sm font-medium">
                     {linkedVpcIds.length > 0 ? "VPC Connections:" : "Link to VPC:"}
                   </label>
                   {linkedVpcIds.length > 0 ? (
                     <div className="mt-1 space-y-2">
                       {linkedVpcIds.map(vpcId => {
                         const vpc = availableVpcs.find(v => v.id === vpcId);
                         return vpc ? (
                           <div key={vpcId} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                             <span className="text-sm text-green-800">
                               {vpc.name}
                             </span>
                             <div className="flex gap-1">
                               <Button
                                 size="sm"
                                 variant="outline"
                                 className="flex items-center gap-1 text-xs"
                                 onClick={() => {
                                   if (onNavigateToVpc) {
                                     onNavigateToVpc(vpcId);
                                     setIsPropertiesOpen(false);
                                   }
                                 }}
                               >
                                 <ExternalLink className="h-3 w-3" />
                                 Go
                               </Button>
                               <Button
                                 size="sm"
                                 variant="outline"
                                 className="flex items-center gap-1 text-xs text-destructive"
                                 onClick={() => {
                                   onLinkVpc?.(id, "");
                                 }}
                               >
                                 <X className="h-3 w-3" />
                               </Button>
                             </div>
                           </div>
                         ) : null;
                       })}
                       <Select 
                         value="none" 
                         onValueChange={(value) => {
                           if (value !== "none" && onLinkVpc) {
                             onLinkVpc(id, value);
                           }
                         }}
                       >
                         <SelectTrigger className="mt-1">
                           <SelectValue placeholder="Link to another VPC..." />
                         </SelectTrigger>
                         <SelectContent className="z-50 bg-background">
                           <SelectItem value="none">Select VPC to link...</SelectItem>
                           {availableVpcs
                             .filter(vpc => !linkedVpcIds.includes(vpc.id))
                             .map((vpc) => (
                               <SelectItem 
                                 key={vpc.id} 
                                 value={vpc.id}
                                  disabled={vpc.linkedValuePropositionIds.length > 0 && !vpc.linkedValuePropositionIds.includes(id)}
                               >
                                 {vpc.name}
                                  {vpc.linkedValuePropositionIds.length > 0 && !vpc.linkedValuePropositionIds.includes(id) && " (Already linked)"}
                               </SelectItem>
                             ))}
                         </SelectContent>
                       </Select>
                     </div>
                   ) : (
                     <>
                       <Select 
                         value="none" 
                         onValueChange={(value) => {
                           if (value !== "none" && onLinkVpc) {
                             onLinkVpc(id, value);
                           }
                         }}
                       >
                         <SelectTrigger className="mt-1">
                           <SelectValue placeholder="Select VPC to link..." />
                         </SelectTrigger>
                         <SelectContent className="z-50 bg-background">
                           <SelectItem value="none">No VPC linked</SelectItem>
                           {availableVpcs.map((vpc) => (
                             <SelectItem 
                               key={vpc.id} 
                               value={vpc.id}
                               disabled={(vpc.linkedValuePropositionIds.length > 0 && !vpc.linkedValuePropositionIds.includes(id)) || (vpc.linkedCustomerSegmentIds.length > 0 && !vpc.linkedCustomerSegmentIds.includes(id))}
                             >
                               {vpc.name}
                               {((vpc.linkedValuePropositionIds.length > 0 && !vpc.linkedValuePropositionIds.includes(id)) || (vpc.linkedCustomerSegmentIds.length > 0 && !vpc.linkedCustomerSegmentIds.includes(id))) && " (Already linked)"}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       {availableVpcs.length === 0 && (
                         <p className="text-xs text-muted-foreground mt-1">
                           No VPCs available. Create a VPC first.
                         </p>
                       )}
                     </>
                   )}
                 </div>
               )}

               {/* Channel connections - only show for Channel Post-its */}
               {areaId === "channels" && (
                 <div className="space-y-4">
                     <div>
                       <label className="text-sm font-medium">Connected Value Propositions:</label>
                       <div className="mt-1 space-y-2">
                         {linkedValuePropositionIds.length > 0 && (
                           <div className="space-y-2">
                             {linkedValuePropositionIds.map(vpId => {
                               const vp = availableValuePropositionPostIts.find(v => v.id === vpId);
                               return vp ? (
                                 <div key={vpId} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                                   <span className="text-sm text-blue-800">{vp.text}</span>
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     className="flex items-center gap-1 text-xs text-destructive"
                                     onClick={() => onUnlinkValueProposition?.(id, vpId)}
                                   >
                                     <X className="h-3 w-3" />
                                   </Button>
                                 </div>
                               ) : null;
                             })}
                           </div>
                         )}
                         <Select 
                           value="none" 
                           onValueChange={(value) => {
                             console.log('Select onValueChange triggered:', value);
                             if (value !== "none" && onLinkValueProposition) {
                               console.log('Calling onLinkValueProposition:', id, value);
                               onLinkValueProposition(id, value);
                             }
                           }}
                         >
                           <SelectTrigger 
                             className="pointer-events-auto"
                             onClick={(e) => {
                               console.log('SelectTrigger clicked');
                               e.stopPropagation();
                             }}
                           >
                             <SelectValue placeholder="Add Value Proposition..." />
                           </SelectTrigger>
                           <SelectContent 
                             className="z-[100] bg-background border shadow-lg pointer-events-auto" 
                             side="bottom" 
                             align="start"
                             sideOffset={4}
                             onClick={(e) => {
                               console.log('SelectContent clicked');
                               e.stopPropagation();
                             }}
                           >
                             <SelectItem 
                               value="none"
                               onClick={(e) => {
                                 console.log('SelectItem none clicked');
                                 e.stopPropagation();
                               }}
                             >
                               Select Value Proposition...
                             </SelectItem>
                             {availableValuePropositionPostIts
                               .filter(vp => !linkedValuePropositionIds.includes(vp.id))
                               .map((vp) => (
                                 <SelectItem 
                                   key={vp.id} 
                                   value={vp.id}
                                   onClick={(e) => {
                                     console.log('SelectItem clicked:', vp.id, vp.text);
                                     e.stopPropagation();
                                   }}
                                 >
                                   {vp.text}
                                 </SelectItem>
                               ))}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                   {/* Customer Segment connections */}
                   <div>
                     <label className="text-sm font-medium">Connected Customer Segments:</label>
                     <div className="mt-1 space-y-2">
                       {linkedCustomerSegmentIds.length > 0 && (
                         <div className="space-y-2">
                           {linkedCustomerSegmentIds.map(csId => {
                             const cs = availableCustomerSegmentPostIts.find(c => c.id === csId);
                             return cs ? (
                               <div key={csId} className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded">
                                 <span className="text-sm text-purple-800">{cs.text}</span>
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   className="flex items-center gap-1 text-xs text-destructive"
                                   onClick={() => onUnlinkCustomerSegment?.(id, csId)}
                                 >
                                   <X className="h-3 w-3" />
                                 </Button>
                               </div>
                             ) : null;
                           })}
                         </div>
                       )}
                        <Select 
                          value="none" 
                          onValueChange={(value) => {
                            console.log('CS Select onValueChange triggered:', value);
                            if (value !== "none" && onLinkCustomerSegment) {
                              console.log('Calling onLinkCustomerSegment:', id, value);
                              onLinkCustomerSegment(id, value);
                            }
                          }}
                        >
                          <SelectTrigger 
                            className="pointer-events-auto"
                            onClick={(e) => {
                              console.log('CS SelectTrigger clicked');
                              e.stopPropagation();
                            }}
                          >
                            <SelectValue placeholder="Add Customer Segment..." />
                          </SelectTrigger>
                          <SelectContent 
                            className="z-[100] bg-background border shadow-lg pointer-events-auto" 
                            side="bottom" 
                            align="start"
                            sideOffset={4}
                            onClick={(e) => {
                              console.log('CS SelectContent clicked');
                              e.stopPropagation();
                            }}
                          >
                            <SelectItem 
                              value="none"
                              onClick={(e) => {
                                console.log('CS SelectItem none clicked');
                                e.stopPropagation();
                              }}
                            >
                              Select Customer Segment...
                            </SelectItem>
                            {availableCustomerSegmentPostIts
                              .filter(cs => !linkedCustomerSegmentIds.includes(cs.id))
                              .map((cs) => (
                                <SelectItem 
                                  key={cs.id} 
                                  value={cs.id}
                                  onClick={(e) => {
                                    console.log('CS SelectItem clicked:', cs.id, cs.text);
                                    e.stopPropagation();
                                  }}
                                >
                                  {cs.text}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                     </div>
                   </div>
                 </div>
               )}
              
              <div className="border-t pt-4">
                <label className="text-sm font-medium">Actions:</label>
                <div className="flex space-x-2 mt-2">
                  
                   {showVpcConnection && (
                     <>
                       <Button
                         size="sm"
                         variant="outline"
                          onClick={() => {
                            onCreateAndLinkVpc?.(id, text, areaId);
                            setIsPropertiesOpen(false);
                          }}
                       >
                         <ExternalLink className="h-3 w-3 mr-1" />
                         Create VPC
                       </Button>
                       {linkedVpcIds.length > 0 && (
                         <Button
                           size="sm"
                           variant="outline"
                           className="text-green-600"
                           onClick={() => {
                             setIsVpcLinkOpen(true);
                             setIsPropertiesOpen(false);
                           }}
                         >
                           <Link className="h-3 w-3 mr-1" />
                           VPCs ({linkedVpcIds.length})
                         </Button>
                       )}
                     </>
                   )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      onDelete(id);
                      setIsPropertiesOpen(false);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPropertiesOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  onUpdate(id, text, editComment.trim(), editPrice.trim(), editMetric);
                  setIsPropertiesOpen(false);
                }}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Content */}
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full h-full resize-none border-none outline-none bg-transparent text-xs font-medium placeholder:text-gray-500 text-center"
            style={{ paddingTop: "calc(50% - 0.6em)" }}
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
            {linkedVpcIds.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  Currently linked to {linkedVpcIds.length} VPC{linkedVpcIds.length > 1 ? 's' : ''}:
                  {linkedVpcIds.map(vpcId => {
                    const vpc = availableVpcs.find(v => v.id === vpcId);
                    return vpc ? ` ${vpc.name}` : '';
                  }).join(', ')}
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
                      variant={linkedVpcIds.includes(vpc.id) ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => {
                        if (linkedVpcIds.includes(vpc.id)) {
                          // Unlink if already linked
                          onLinkVpc?.(id, "");
                        } else {
                          // Link if not already linked
                          onLinkVpc?.(id, vpc.id);
                        }
                        setIsVpcLinkOpen(false);
                      }}
                      disabled={((vpc.linkedValuePropositionIds.length > 0 && !vpc.linkedValuePropositionIds.includes(id)) || (vpc.linkedCustomerSegmentIds.length > 0 && !vpc.linkedCustomerSegmentIds.includes(id))) && !linkedVpcIds.includes(vpc.id)}
                    >
                      {vpc.name}
                      {linkedVpcIds.includes(vpc.id) && " (Linked)"}
                      {((vpc.linkedValuePropositionIds.length > 0 && !vpc.linkedValuePropositionIds.includes(id)) || (vpc.linkedCustomerSegmentIds.length > 0 && !vpc.linkedCustomerSegmentIds.includes(id))) && !linkedVpcIds.includes(vpc.id) && " (Already linked)"}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connection Confirmation Dialog */}
      <ConnectionConfirmDialog
        isOpen={showConnectionDialog}
        onClose={() => {
          setShowConnectionDialog(false);
          setPendingConnection(null);
        }}
        sourcePostIt={pendingConnection?.source}
        targetPostIt={pendingConnection?.target}
        onConfirm={handleConnectionConfirm}
      />
    </Card>
  );
}