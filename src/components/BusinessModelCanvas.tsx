import { useState } from "react";
import { CanvasArea } from "./CanvasArea";
import { PostIt, PostItColor, PostItMetric } from "./PostIt";
import { ConnectionConfirmDialog } from "./ConnectionConfirmDialog";
import { AreaInfoDialog } from "./AreaInfoDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { 
  Users, 
  CheckCircle, 
  Gift, 
  Heart, 
  UserCheck, 
  TrendingUp, 
  Truck, 
  CreditCard, 
  DollarSign 
} from "lucide-react";
import bmcHeaderImage from "@/assets/bmc-header.jpg";
import { bmcAreaInfo } from "@/data/areaInformation";

interface PostItData {
  id: string;
  text: string;
  comment?: string;
  price?: string;
  metric?: PostItMetric;
  color: PostItColor;
  x: number;
  y: number;
  width: number;
  height: number;
  areaId: string;
  bmcId?: string; // Optional to match parent interface
  // Channel connections
  linkedValuePropositionIds?: string[];
  linkedCustomerSegmentIds?: string[];
}

interface VPCOption {
  id: string;
  name: string;
  linkedBmcId?: string;
  linkedValuePropositionIds: string[];
  linkedCustomerSegmentIds: string[];
  isDraft: boolean;
}

interface BusinessModelCanvasProps {
  projectId: string;
  bmcId: string;
  bmcName?: string;
  dateCreated?: string;
  lastUpdated?: string;
  availableVpcs: VPCOption[];
  onLinkVpc: (postItId: string, vpcId: string, vpcName?: string, areaId?: string) => void;
  onCreateAndLinkVpc?: (postItId: string, postItText: string, areaId?: string) => void;
  onNavigateToVpc?: (vpcId: string) => void;
  postIts: PostItData[];
  onPostItsChange: (postIts: PostItData[]) => void;
  onAiClick?: (areaId: string) => void;
}

const canvasAreas = [
  { id: "key-partners", title: "Key Partners", icon: <Users className="h-4 w-4" /> },
  { id: "key-activities", title: "Key Activities", icon: <CheckCircle className="h-4 w-4" /> },
  { id: "key-resources", title: "Key Resources", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "value-propositions", title: "Value Propositions", icon: <Gift className="h-4 w-4" /> },
  { id: "customer-relationships", title: "Customer Relationships", icon: <Heart className="h-4 w-4" /> },
  { id: "channels", title: "Channels", icon: <Truck className="h-4 w-4" /> },
  { id: "customer-segments", title: "Customer Segments", icon: <UserCheck className="h-4 w-4" /> },
  { id: "cost-structure", title: "Cost Structure", icon: <CreditCard className="h-4 w-4" /> },
  { id: "revenue-streams", title: "Revenue Streams", icon: <DollarSign className="h-4 w-4" /> },
];

const defaultColors: PostItColor[] = ["yellow", "blue", "green", "pink", "orange", "purple"];

export function BusinessModelCanvas({ projectId, bmcId, bmcName = "Business Model Canvas", dateCreated, lastUpdated, availableVpcs, onLinkVpc, onCreateAndLinkVpc, onNavigateToVpc, postIts, onPostItsChange, onAiClick }: BusinessModelCanvasProps) {
  const [draggedPostIt, setDraggedPostIt] = useState<string | null>(null);
  const [dragOverArea, setDragOverArea] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{source: PostItData, target: PostItData} | null>(null);

  const createPostIt = (areaId: string) => {
    const newPostIt: PostItData = {
      id: `postit-${Date.now()}-${Math.random()}`,
      text: "",
      color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
      x: Math.random() * 100 + 20,
      y: Math.random() * 50 + 60,
      width: 120, // Smaller default width
      height: 80, // Smaller default height
      areaId,
      bmcId, // Add the bmcId to associate with this canvas
    };
    onPostItsChange([...postIts, newPostIt]);
  };

  const updatePostIt = (id: string, text: string, comment?: string, price?: string, metric?: PostItMetric) => {
    onPostItsChange(
      postIts.map(postIt => 
        postIt.id === id ? { ...postIt, text, comment, price, metric } : postIt
      )
    );
  };

  const handleVpcLink = (postItId: string, vpcId: string, areaId?: string) => {
    onLinkVpc(postItId, vpcId, undefined, areaId);
    toast.success("VPC linked successfully!");
  };

  const handleCreateAndLinkVpc = (postItId: string, postItText: string, areaId?: string) => {
    // Pass the request to the parent component to show the selection dialog
    onCreateAndLinkVpc?.(postItId, postItText, areaId);
  };

  const resizePostIt = (id: string, width: number, height: number) => {
    onPostItsChange(
      postIts.map(postIt => 
        postIt.id === id ? { ...postIt, width, height } : postIt
      )
    );
  };

  const deletePostIt = (id: string) => {
    const postItToDelete = postIts.find(postIt => postIt.id === id);
    
    // If deleting a Value Proposition or Customer Segment post-it, clear its VPC link
    if (postItToDelete?.areaId === "value-propositions" || postItToDelete?.areaId === "customer-segments") {
      const linkedVpc = availableVpcs.find(vpc => 
        vpc.linkedValuePropositionIds.includes(id) || vpc.linkedCustomerSegmentIds.includes(id)
      );
      if (linkedVpc) {
        // Clear the VPC connection to make it available again
        onLinkVpc(id, "", undefined, postItToDelete.areaId);
      }
    }
    
    onPostItsChange(postIts.filter(postIt => postIt.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedPostIt(id);
  };

  const handleDragEnd = () => {
    setDraggedPostIt(null);
    setDragOverArea(null);
  };

  const handleAreaDragOver = (e: React.DragEvent, areaId: string) => {
    // Only allow drag over for connection functionality on channels
    if (areaId === "channels") {
      e.preventDefault();
      setDragOverArea(areaId);
    }
  };

  const handleDoubleClick = (areaId: string, x: number, y: number) => {
    const colors: PostItColor[] = ["yellow", "blue", "green", "pink", "orange", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newPostIt: PostItData = {
      id: `postit_${Date.now()}`,
      text: "",
      areaId,
      x: Math.max(0, x - 60), // Center the post-it on click position
      y: Math.max(0, y - 40),
      color: randomColor,
      width: 120,
      height: 80,
      bmcId, // Add bmcId to associate with this canvas
    };
    
    onPostItsChange([...postIts, newPostIt]);
  };


  const handleIconClick = (areaId: string) => {
    setSelectedAreaId(areaId);
  };

  const handleDropConnection = (targetPostItId: string, sourcePostItId: string) => {
    const sourcePostIt = postIts.find(p => p.id === sourcePostItId);
    const targetPostIt = postIts.find(p => p.id === targetPostItId);
    
    if (!sourcePostIt || !targetPostIt || targetPostIt.areaId !== "channels") return;
    
    // Only allow VP and CS Post-its to be connected to Channel Post-its
    if (sourcePostIt.areaId !== "value-propositions" && sourcePostIt.areaId !== "customer-segments") {
      return;
    }
    
    // Check if connection already exists
    if (sourcePostIt.areaId === "value-propositions") {
      const existingConnections = targetPostIt.linkedValuePropositionIds || [];
      if (existingConnections.includes(sourcePostItId)) {
        toast.error("This Value Proposition is already connected to this Channel!");
        return;
      }
    } else if (sourcePostIt.areaId === "customer-segments") {
      const existingConnections = targetPostIt.linkedCustomerSegmentIds || [];
      if (existingConnections.includes(sourcePostItId)) {
        toast.error("This Customer Segment is already connected to this Channel!");
        return;
      }
    }
    
    // Show confirmation dialog
    setPendingConnection({ source: sourcePostIt, target: targetPostIt });
    setShowConnectionDialog(true);
  };

  const handleConnectionConfirm = () => {
    if (!pendingConnection) return;
    
    const { source, target } = pendingConnection;
    
    // Make the connection
    const updatedPostIts = postIts.map(postIt => {
      if (postIt.id === target.id) {
        if (source.areaId === "value-propositions") {
          const currentLinks = postIt.linkedValuePropositionIds || [];
          return {
            ...postIt,
            linkedValuePropositionIds: [...currentLinks, source.id]
          };
        } else if (source.areaId === "customer-segments") {
          const currentLinks = postIt.linkedCustomerSegmentIds || [];
          return {
            ...postIt,
            linkedCustomerSegmentIds: [...currentLinks, source.id]
          };
        }
      }
      return postIt;
    });
    
    onPostItsChange(updatedPostIts);
    toast.success(`${source.areaId === "value-propositions" ? "Value Proposition" : "Customer Segment"} connected to Channel!`);
    
    setShowConnectionDialog(false);
    setPendingConnection(null);
  };

  return (
    <div className="h-full bg-workspace overflow-auto">
      <div className="min-w-[1400px] p-8">
        {/* Canvas header with hero image */}
        <div className="relative mb-8 rounded-xl overflow-hidden shadow-medium">
          <img 
            src={bmcHeaderImage} 
            alt="Business Model Canvas" 
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 flex items-center justify-between px-8">
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-1">Business Model Canvas: {bmcName}</h1>
              <div className="text-sm opacity-90 space-y-0.5">
                {dateCreated && <p>Created: {dateCreated}</p>}
                {lastUpdated && <p>Last updated: {lastUpdated}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas grid */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          {/* Row 1 */}
          <CanvasArea
            id="key-partners"
            title="Key Partners"
            icon={<Users className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "key-partners")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "key-partners"}
            className="row-span-2"
          >
            {postIts
              .filter(postIt => postIt.areaId === "key-partners")
              .map(postIt => (
                <PostIt
                  key={postIt.id}
                  {...postIt}
                  onUpdate={updatePostIt}
                  onResize={resizePostIt}
                  onDelete={deletePostIt}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedPostIt === postIt.id}
                />
              ))}
          </CanvasArea>

          <CanvasArea
            id="key-activities"
            title="Key Activities"
            icon={<CheckCircle className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "key-activities")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "key-activities"}
          >
            {postIts
              .filter(postIt => postIt.areaId === "key-activities")
              .map(postIt => (
                <PostIt
                  key={postIt.id}
                  {...postIt}
                  onUpdate={updatePostIt}
                  onResize={resizePostIt}
                  onDelete={deletePostIt}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedPostIt === postIt.id}
                />
              ))}
          </CanvasArea>

          <CanvasArea
            id="value-propositions"
            title="Value Propositions"
            icon={<Gift className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "value-propositions")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "value-propositions"}
            className="row-span-2"
          >
            {postIts
              .filter(postIt => postIt.areaId === "value-propositions")
              .map(postIt => (
                 <PostIt
                   key={postIt.id}
                   {...postIt}
                   showVpcConnection={true}
                   availableVpcs={availableVpcs}
                   linkedVpcIds={availableVpcs.filter(vpc => vpc.linkedValuePropositionIds.includes(postIt.id)).map(vpc => vpc.id)}
                   onDropConnection={handleDropConnection}
                   onUpdate={updatePostIt}
                   onResize={resizePostIt}
                   onDelete={deletePostIt}
                   onDragStart={handleDragStart}
                   onDragEnd={handleDragEnd}
                    onLinkVpc={(postItId, vpcId) => handleVpcLink(postItId, vpcId, "value-propositions")}
                    onCreateAndLinkVpc={(postItId, postItText) => handleCreateAndLinkVpc(postItId, postItText, "value-propositions")}
                    onNavigateToVpc={onNavigateToVpc}
                    isDragging={draggedPostIt === postIt.id}
                 />
              ))}
          </CanvasArea>

          <CanvasArea
            id="customer-relationships"
            title="Customer Relationships"
            icon={<Heart className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "customer-relationships")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "customer-relationships"}
          >
            {postIts
              .filter(postIt => postIt.areaId === "customer-relationships")
              .map(postIt => (
                <PostIt
                  key={postIt.id}
                  {...postIt}
                  onUpdate={updatePostIt}
                  onResize={resizePostIt}
                  onDelete={deletePostIt}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedPostIt === postIt.id}
                />
              ))}
          </CanvasArea>

          <CanvasArea
            id="customer-segments"
            title="Customer Segments"
            icon={<UserCheck className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "customer-segments")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "customer-segments"}
            className="row-span-2"
          >
            {postIts
              .filter(postIt => postIt.areaId === "customer-segments")
              .map(postIt => (
                 <PostIt
                   key={postIt.id}
                   {...postIt}
                   showVpcConnection={true}
                   availableVpcs={availableVpcs}
                   linkedVpcIds={availableVpcs.filter(vpc => vpc.linkedCustomerSegmentIds.includes(postIt.id)).map(vpc => vpc.id)}
                   onDropConnection={handleDropConnection}
                   onUpdate={updatePostIt}
                   onResize={resizePostIt}
                   onDelete={deletePostIt}
                   onDragStart={handleDragStart}
                   onDragEnd={handleDragEnd}
                   onLinkVpc={(postItId, vpcId) => handleVpcLink(postItId, vpcId, "customer-segments")}
                   onCreateAndLinkVpc={(postItId, postItText) => handleCreateAndLinkVpc(postItId, postItText, "customer-segments")}
                   onNavigateToVpc={onNavigateToVpc}
                   isDragging={draggedPostIt === postIt.id}
                 />
              ))}
          </CanvasArea>

          {/* Row 2 */}
          <CanvasArea
            id="key-resources"
            title="Key Resources"
            icon={<TrendingUp className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "key-resources")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "key-resources"}
          >
            {postIts
              .filter(postIt => postIt.areaId === "key-resources")
              .map(postIt => (
                <PostIt
                  key={postIt.id}
                  {...postIt}
                  onUpdate={updatePostIt}
                  onResize={resizePostIt}
                  onDelete={deletePostIt}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedPostIt === postIt.id}
                />
              ))}
          </CanvasArea>

          <CanvasArea
            id="channels"
            title="Channels"
            icon={<Truck className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "channels")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "channels"}
          >
            {postIts
              .filter(postIt => postIt.areaId === "channels")
              .map(postIt => (
                <PostIt
                  key={postIt.id}
                  {...postIt}
                  // Add Channel-specific props
                  availableValuePropositionPostIts={postIts
                    .filter(p => p.areaId === "value-propositions")
                    .map(p => ({ id: p.id, text: p.text }))
                  }
                  availableCustomerSegmentPostIts={postIts
                    .filter(p => p.areaId === "customer-segments")
                    .map(p => ({ id: p.id, text: p.text }))
                  }
                  linkedValuePropositionIds={postIt.linkedValuePropositionIds || []}
                  linkedCustomerSegmentIds={postIt.linkedCustomerSegmentIds || []}
                  onLinkValueProposition={(channelId, vpId) => {
                    // Update the post-it to add the VP connection
                    const updatedPostIts = postIts.map(postIt => {
                      if (postIt.id === channelId) {
                        const currentLinks = postIt.linkedValuePropositionIds || [];
                        if (!currentLinks.includes(vpId)) {
                          return {
                            ...postIt,
                            linkedValuePropositionIds: [...currentLinks, vpId]
                          };
                        }
                      }
                      return postIt;
                    });
                    onPostItsChange(updatedPostIts);
                  }}
                  onLinkCustomerSegment={(channelId, csId) => {
                    // Update the post-it to add the CS connection
                    const updatedPostIts = postIts.map(postIt => {
                      if (postIt.id === channelId) {
                        const currentLinks = postIt.linkedCustomerSegmentIds || [];
                        if (!currentLinks.includes(csId)) {
                          return {
                            ...postIt,
                            linkedCustomerSegmentIds: [...currentLinks, csId]
                          };
                        }
                      }
                      return postIt;
                    });
                    onPostItsChange(updatedPostIts);
                  }}
                  onUnlinkValueProposition={(channelId, vpId) => {
                    // Update the post-it to remove the VP connection
                    const updatedPostIts = postIts.map(postIt => {
                      if (postIt.id === channelId) {
                        return {
                          ...postIt,
                          linkedValuePropositionIds: (postIt.linkedValuePropositionIds || []).filter(id => id !== vpId)
                        };
                      }
                      return postIt;
                    });
                    onPostItsChange(updatedPostIts);
                  }}
                  onUnlinkCustomerSegment={(channelId, csId) => {
                    // Update the post-it to remove the CS connection
                    const updatedPostIts = postIts.map(postIt => {
                      if (postIt.id === channelId) {
                        return {
                          ...postIt,
                          linkedCustomerSegmentIds: (postIt.linkedCustomerSegmentIds || []).filter(id => id !== csId)
                        };
                      }
                      return postIt;
                    });
                    onPostItsChange(updatedPostIts);
                   }}
                   onDropConnection={handleDropConnection}
                   onUpdate={updatePostIt}
                   onResize={resizePostIt}
                   onDelete={deletePostIt}
                   onDragStart={handleDragStart}
                   onDragEnd={handleDragEnd}
                   isDragging={draggedPostIt === postIt.id}
                />
              ))}
          </CanvasArea>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">
          <CanvasArea
            id="cost-structure"
            title="Cost Structure"
            icon={<CreditCard className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "cost-structure")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "cost-structure"}
          >
            {postIts
              .filter(postIt => postIt.areaId === "cost-structure")
              .map(postIt => (
                <PostIt
                  key={postIt.id}
                  {...postIt}
                  onUpdate={updatePostIt}
                  onResize={resizePostIt}
                  onDelete={deletePostIt}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedPostIt === postIt.id}
                />
              ))}
          </CanvasArea>

          <CanvasArea
            id="revenue-streams"
            title="Revenue Streams"
            icon={<DollarSign className="h-4 w-4" />}
            onDragOver={(e) => handleAreaDragOver(e, "revenue-streams")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            onAiClick={onAiClick}
            isDragOver={dragOverArea === "revenue-streams"}
          >
            {postIts
              .filter(postIt => postIt.areaId === "revenue-streams")
              .map(postIt => (
                <PostIt
                  key={postIt.id}
                  {...postIt}
                  onUpdate={updatePostIt}
                  onResize={resizePostIt}
                  onDelete={deletePostIt}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedPostIt === postIt.id}
                />
              ))}
          </CanvasArea>
        </div>
      </div>
      
      {/* Area Information Dialog */}
      {selectedAreaId && bmcAreaInfo[selectedAreaId as keyof typeof bmcAreaInfo] && (
        <AreaInfoDialog
          isOpen={!!selectedAreaId}
          onClose={() => setSelectedAreaId(null)}
          areaInfo={bmcAreaInfo[selectedAreaId as keyof typeof bmcAreaInfo]}
        />
      )}

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
    </div>
  );
}