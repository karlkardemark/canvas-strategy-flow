import { useState } from "react";
import { CanvasArea } from "./CanvasArea";
import { PostIt, PostItColor, PostItMetric } from "./PostIt";
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
}

interface VPCOption {
  id: string;
  name: string;
  linkedBmcId?: string;
  linkedPostItId?: string;
}

interface BusinessModelCanvasProps {
  projectId: string;
  bmcId: string;
  bmcName?: string;
  dateCreated?: string;
  lastUpdated?: string;
  availableVpcs: VPCOption[];
  onLinkVpc: (postItId: string, vpcId: string, vpcName?: string) => void;
  onNavigateToVpc?: (vpcId: string) => void;
  postIts: PostItData[];
  onPostItsChange: (postIts: PostItData[]) => void;
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

export function BusinessModelCanvas({ projectId, bmcId, bmcName = "Business Model Canvas", dateCreated, lastUpdated, availableVpcs, onLinkVpc, onNavigateToVpc, postIts, onPostItsChange }: BusinessModelCanvasProps) {
  const [draggedPostIt, setDraggedPostIt] = useState<string | null>(null);
  const [dragOverArea, setDragOverArea] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

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

  const handleVpcLink = (postItId: string, vpcId: string) => {
    onLinkVpc(postItId, vpcId);
    toast.success("VPC linked successfully!");
  };

  const handleCreateAndLinkVpc = (postItId: string, postItText: string) => {
    const newVpcId = `vpc_${Date.now()}`;
    const vpcName = postItText.trim() || "Untitled Value Proposition";
    
    // Create new VPC and link it
    onLinkVpc(postItId, newVpcId, vpcName);
    toast.success("VPC created and linked successfully!");
  };

  const resizePostIt = (id: string, width: number, height: number) => {
    onPostItsChange(
      postIts.map(postIt => 
        postIt.id === id ? { ...postIt, width, height } : postIt
      )
    );
  };

  const deletePostIt = (id: string) => {
    onPostItsChange(postIts.filter(postIt => postIt.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedPostIt(id);
  };

  const handleDragEnd = () => {
    setDraggedPostIt(null);
    setDragOverArea(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (areaId: string, e: React.DragEvent) => {
    if (draggedPostIt) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      onPostItsChange(
        postIts.map(postIt =>
          postIt.id === draggedPostIt
            ? { 
                ...postIt, 
                areaId,
                x: Math.max(0, Math.min(x - 60, rect.width - 120)), // Center the smaller post-it and keep within bounds
                y: Math.max(0, Math.min(y - 40, rect.height - 80))
              }
            : postIt
        )
      );
    }
    setDragOverArea(null);
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

  const handleAreaDragOver = (e: React.DragEvent, areaId: string) => {
    e.preventDefault();
    setDragOverArea(areaId);
  };

  const handleIconClick = (areaId: string) => {
    setSelectedAreaId(areaId);
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
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={handleDragOver}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
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
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={(e) => handleAreaDragOver(e, "key-activities")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
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
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={(e) => handleAreaDragOver(e, "value-propositions")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
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
                  linkedVpcId={availableVpcs.find(vpc => vpc.linkedPostItId === postIt.id)?.id}
                  onUpdate={updatePostIt}
                  onResize={resizePostIt}
                  onDelete={deletePostIt}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                   onLinkVpc={handleVpcLink}
                   onCreateAndLinkVpc={handleCreateAndLinkVpc}
                   onNavigateToVpc={onNavigateToVpc}
                   isDragging={draggedPostIt === postIt.id}
                />
              ))}
          </CanvasArea>

          <CanvasArea
            id="customer-relationships"
            title="Customer Relationships"
            icon={<Heart className="h-4 w-4" />}
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={(e) => handleAreaDragOver(e, "customer-relationships")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
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
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={(e) => handleAreaDragOver(e, "customer-segments")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            isDragOver={dragOverArea === "customer-segments"}
            className="row-span-2"
          >
            {postIts
              .filter(postIt => postIt.areaId === "customer-segments")
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

          {/* Row 2 */}
          <CanvasArea
            id="key-resources"
            title="Key Resources"
            icon={<TrendingUp className="h-4 w-4" />}
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={(e) => handleAreaDragOver(e, "key-resources")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
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
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={(e) => handleAreaDragOver(e, "channels")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
            isDragOver={dragOverArea === "channels"}
          >
            {postIts
              .filter(postIt => postIt.areaId === "channels")
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

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">
          <CanvasArea
            id="cost-structure"
            title="Cost Structure"
            icon={<CreditCard className="h-4 w-4" />}
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={(e) => handleAreaDragOver(e, "cost-structure")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
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
            onDrop={(areaId, e) => handleDrop(areaId, e)}
            onDragOver={(e) => handleAreaDragOver(e, "revenue-streams")}
            onDoubleClick={handleDoubleClick}
            onCreatePostIt={createPostIt}
            onIconClick={handleIconClick}
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
    </div>
  );
}