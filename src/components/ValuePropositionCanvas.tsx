import { useState } from "react";
import { CanvasArea } from "./CanvasArea";
import { PostIt, PostItColor, PostItMetric } from "./PostIt";
import { AreaInfoDialog } from "./AreaInfoDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Package, Smile, Frown, Briefcase, TrendingUp, Shield } from "lucide-react";
import bmcHeaderImage from "@/assets/bmc-header.jpg";
import { vpcAreaInfo } from "@/data/areaInformation";
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
  vpcId?: string; // For VPC post-its
  bmcId?: string; // For BMC post-its
}
interface ValuePropositionCanvasProps {
  projectId: string;
  vpcId: string;
  vpcName?: string;
  dateCreated?: string;
  postIts: PostItData[];
  allPostIts: PostItData[]; // All post-its to find linked customer segment
  linkedCustomerSegmentIds: string[];
  linkedValuePropositionIds: string[];
  onPostItsChange: (postIts: PostItData[]) => void;
  onAiClick?: (areaId: string) => void;
}
const defaultColors: PostItColor[] = ["yellow", "blue", "green", "pink", "orange", "purple"];
export function ValuePropositionCanvas({
  projectId,
  vpcId,
  vpcName = "Value Proposition Canvas",
  dateCreated,
  postIts,
  allPostIts,
  linkedCustomerSegmentIds,
  linkedValuePropositionIds,
  onPostItsChange,
  onAiClick
}: ValuePropositionCanvasProps) {
  const [draggedPostIt, setDraggedPostIt] = useState<string | null>(null);
  const [dragOverArea, setDragOverArea] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const handleIconClick = (areaId: string) => {
    setSelectedAreaId(areaId);
  };
  const createPostIt = (areaId: string) => {
    const newPostIt: PostItData = {
      id: `postit-${Date.now()}-${Math.random()}`,
      text: "",
      color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
      x: Math.random() * 100 + 20,
      y: Math.random() * 50 + 60,
      width: 120,
      // Smaller default width
      height: 80,
      // Smaller default height
      areaId,
      vpcId // Add the vpcId to associate with this canvas
    };
    onPostItsChange([...postIts, newPostIt]);
  };
  const updatePostIt = (id: string, text: string, comment?: string, price?: string, metric?: PostItMetric) => {
    onPostItsChange(postIts.map(postIt => postIt.id === id ? {
      ...postIt,
      text,
      comment,
      price,
      metric
    } : postIt));
  };
  const resizePostIt = (id: string, width: number, height: number) => {
    onPostItsChange(postIts.map(postIt => postIt.id === id ? {
      ...postIt,
      width,
      height
    } : postIt));
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
  const handleDoubleClick = (areaId: string, x: number, y: number) => {
    const colors: PostItColor[] = ["yellow", "blue", "green", "pink", "orange", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newPostIt: PostItData = {
      id: `postit_${Date.now()}`,
      text: "",
      areaId,
      x: Math.max(0, x - 60),
      // Center the post-it on click position
      y: Math.max(0, y - 40),
      color: randomColor,
      width: 120,
      height: 80,
      vpcId // Add vpcId to associate with this canvas
    };
    onPostItsChange([...postIts, newPostIt]);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (areaId: string, e: React.DragEvent) => {
    if (draggedPostIt) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onPostItsChange(postIts.map(postIt => postIt.id === draggedPostIt ? {
        ...postIt,
        areaId,
        x: Math.max(0, Math.min(x - 60, rect.width - 120)),
        // Center the smaller post-it and keep within bounds
        y: Math.max(0, Math.min(y - 40, rect.height - 80))
      } : postIt));
    }
    setDragOverArea(null);
  };
  const handleAreaDragOver = (e: React.DragEvent, areaId: string) => {
    e.preventDefault();
    setDragOverArea(areaId);
  };
  return <div className="h-full bg-workspace overflow-auto">
      <div className="min-w-[1200px] p-8">
        {/* Canvas header */}
        <div className="relative mb-8 rounded-xl overflow-hidden shadow-medium">
          <img src={bmcHeaderImage} alt="Value Proposition Canvas" className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-500/60 flex items-center justify-between px-8">
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-1">Value Proposition Canvas: {vpcName}</h1>
              <div className="text-sm opacity-90 space-y-0.5">
                {dateCreated && <p>Created: {dateCreated}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas layout */}
        <div className="grid grid-cols-2 gap-8">
          {/* Value Proposition side */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Value Proposition: {linkedValuePropositionIds.length > 0 ? linkedValuePropositionIds.map(id => allPostIts.find(postIt => postIt.id === id)?.text || "Untitled").join(", ") : "Not connected"}
              </h2>
              
            </div>

            {/* Square layout for Value Proposition areas */}
            <div className="aspect-square grid grid-cols-2 grid-rows-2 gap-2">
              {/* Gain Creators - Top Right */}
              <div className="col-start-2 row-start-1">
                <CanvasArea id="gain-creators" title="Gain Creators" icon={<TrendingUp className="h-4 w-4" />} onDragOver={e => handleAreaDragOver(e, "gain-creators")} onDoubleClick={handleDoubleClick} onCreatePostIt={createPostIt} onIconClick={handleIconClick} onAiClick={onAiClick} isDragOver={dragOverArea === "gain-creators"} className="h-full">
                  {postIts.filter(postIt => postIt.areaId === "gain-creators").map(postIt => <PostIt key={postIt.id} {...postIt} showMetadata={false} onUpdate={updatePostIt} onResize={resizePostIt} onDelete={deletePostIt} onDragStart={handleDragStart} onDragEnd={handleDragEnd} isDragging={draggedPostIt === postIt.id} />)}
                </CanvasArea>
              </div>

              {/* Products & Services - Left side spanning both rows */}
              <div className="col-start-1 row-span-2">
                <CanvasArea id="products-services" title="Products & Services" icon={<Package className="h-4 w-4" />} onDragOver={e => handleAreaDragOver(e, "products-services")} onDoubleClick={handleDoubleClick} onCreatePostIt={createPostIt} onIconClick={handleIconClick} onAiClick={onAiClick} isDragOver={dragOverArea === "products-services"} className="h-full">
                  {postIts.filter(postIt => postIt.areaId === "products-services").map(postIt => <PostIt key={postIt.id} {...postIt} showMetadata={true} onUpdate={updatePostIt} onResize={resizePostIt} onDelete={deletePostIt} onDragStart={handleDragStart} onDragEnd={handleDragEnd} isDragging={draggedPostIt === postIt.id} />)}
                </CanvasArea>
              </div>

              {/* Pain Relievers - Bottom Right */}
              <div className="col-start-2 row-start-2">
                <CanvasArea id="pain-relievers" title="Pain Relievers" icon={<Shield className="h-4 w-4" />} onDragOver={e => handleAreaDragOver(e, "pain-relievers")} onDoubleClick={handleDoubleClick} onCreatePostIt={createPostIt} onIconClick={handleIconClick} onAiClick={onAiClick} isDragOver={dragOverArea === "pain-relievers"} className="h-full">
                  {postIts.filter(postIt => postIt.areaId === "pain-relievers").map(postIt => <PostIt key={postIt.id} {...postIt} showMetadata={false} onUpdate={updatePostIt} onResize={resizePostIt} onDelete={deletePostIt} onDragStart={handleDragStart} onDragEnd={handleDragEnd} isDragging={draggedPostIt === postIt.id} />)}
                </CanvasArea>
              </div>
            </div>
          </div>

          {/* Customer Segment side */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Customer Segment: {linkedCustomerSegmentIds.length > 0 ? linkedCustomerSegmentIds.map(id => allPostIts.find(postIt => postIt.id === id)?.text || "Untitled").join(", ") : "Not connected"}
              </h2>
              
            </div>

            {/* Square layout for Customer Segment areas */}
            <div className="aspect-square grid grid-cols-2 grid-rows-2 gap-2">
              {/* Gains - Top Left */}
              <div className="col-start-1 row-start-1">
                <CanvasArea id="gains" title="Gains" icon={<Smile className="h-4 w-4" />} onDragOver={e => handleAreaDragOver(e, "gains")} onDoubleClick={handleDoubleClick} onCreatePostIt={createPostIt} onIconClick={handleIconClick} onAiClick={onAiClick} isDragOver={dragOverArea === "gains"} className="h-full">
                  {postIts.filter(postIt => postIt.areaId === "gains").map(postIt => <PostIt key={postIt.id} {...postIt} showMetadata={false} onUpdate={updatePostIt} onResize={resizePostIt} onDelete={deletePostIt} onDragStart={handleDragStart} onDragEnd={handleDragEnd} isDragging={draggedPostIt === postIt.id} />)}
                </CanvasArea>
              </div>

              {/* Customer Jobs - Right side spanning both rows */}
              <div className="col-start-2 row-span-2">
                <CanvasArea id="customer-jobs" title="Customer Jobs" icon={<Briefcase className="h-4 w-4" />} onDragOver={e => handleAreaDragOver(e, "customer-jobs")} onDoubleClick={handleDoubleClick} onCreatePostIt={createPostIt} onIconClick={handleIconClick} onAiClick={onAiClick} isDragOver={dragOverArea === "customer-jobs"} className="h-full">
                  {postIts.filter(postIt => postIt.areaId === "customer-jobs").map(postIt => <PostIt key={postIt.id} {...postIt} showMetadata={false} onUpdate={updatePostIt} onResize={resizePostIt} onDelete={deletePostIt} onDragStart={handleDragStart} onDragEnd={handleDragEnd} isDragging={draggedPostIt === postIt.id} />)}
                </CanvasArea>
              </div>

              {/* Pains - Bottom Left */}
              <div className="col-start-1 row-start-2">
                <CanvasArea id="pains" title="Pains" icon={<Frown className="h-4 w-4" />} onDragOver={e => handleAreaDragOver(e, "pains")} onDoubleClick={handleDoubleClick} onCreatePostIt={createPostIt} onIconClick={handleIconClick} onAiClick={onAiClick} isDragOver={dragOverArea === "pains"} className="h-full">
                  {postIts.filter(postIt => postIt.areaId === "pains").map(postIt => <PostIt key={postIt.id} {...postIt} showMetadata={false} onUpdate={updatePostIt} onResize={resizePostIt} onDelete={deletePostIt} onDragStart={handleDragStart} onDragEnd={handleDragEnd} isDragging={draggedPostIt === postIt.id} />)}
                </CanvasArea>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Area Information Dialog */}
      {selectedAreaId && vpcAreaInfo[selectedAreaId as keyof typeof vpcAreaInfo] && <AreaInfoDialog isOpen={!!selectedAreaId} onClose={() => setSelectedAreaId(null)} areaInfo={vpcAreaInfo[selectedAreaId as keyof typeof vpcAreaInfo]} />}
    </div>;
}