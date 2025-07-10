import { useState } from "react";
import { CanvasArea } from "./CanvasArea";
import { PostIt, PostItColor } from "./PostIt";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

interface PostItData {
  id: string;
  text: string;
  comment?: string;
  color: PostItColor;
  x: number;
  y: number;
  width: number;
  height: number;
  areaId: string;
}

interface BusinessModelCanvasProps {
  projectId: string;
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

export function BusinessModelCanvas({ projectId }: BusinessModelCanvasProps) {
  const [postIts, setPostIts] = useState<PostItData[]>([]);
  const [draggedPostIt, setDraggedPostIt] = useState<string | null>(null);
  const [dragOverArea, setDragOverArea] = useState<string | null>(null);

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
    };
    setPostIts(prev => [...prev, newPostIt]);
  };

  const updatePostIt = (id: string, text: string, comment?: string) => {
    setPostIts(prev => 
      prev.map(postIt => 
        postIt.id === id ? { ...postIt, text, comment } : postIt
      )
    );
  };

  const createVpc = (postItId: string) => {
    // For now, just show an alert - will be connected to actual VPC creation later
    alert(`Creating VPC for Value Proposition: ${postIts.find(p => p.id === postItId)?.text || 'Untitled'}`);
  };

  const resizePostIt = (id: string, width: number, height: number) => {
    setPostIts(prev => 
      prev.map(postIt => 
        postIt.id === id ? { ...postIt, width, height } : postIt
      )
    );
  };

  const deletePostIt = (id: string) => {
    setPostIts(prev => prev.filter(postIt => postIt.id !== id));
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
      
      setPostIts(prev =>
        prev.map(postIt =>
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

  const handleAreaDragOver = (e: React.DragEvent, areaId: string) => {
    e.preventDefault();
    setDragOverArea(areaId);
  };

  return (
    <div className="h-full bg-workspace overflow-auto">
      <div className="min-w-[1400px] p-8">
        {/* Canvas header with hero image */}
        <div className="relative mb-8 rounded-xl overflow-hidden shadow-medium">
          <img 
            src={bmcHeaderImage} 
            alt="Business Model Canvas" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">The Business Model Canvas</h1>
              <p className="text-xl opacity-90">Design your business model with interactive Post-its</p>
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
            isDragOver={dragOverArea === "key-partners"}
            className="row-span-2"
          >
            <Button
              onClick={() => createPostIt("key-partners")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
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
            isDragOver={dragOverArea === "key-activities"}
          >
            <Button
              onClick={() => createPostIt("key-activities")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
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
            isDragOver={dragOverArea === "value-propositions"}
            className="row-span-2"
          >
            <Button
              onClick={() => createPostIt("value-propositions")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
            {postIts
              .filter(postIt => postIt.areaId === "value-propositions")
              .map(postIt => (
                <PostIt
                  key={postIt.id}
                  {...postIt}
                  showVpcConnection={true}
                  onUpdate={updatePostIt}
                  onResize={resizePostIt}
                  onDelete={deletePostIt}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onCreateVpc={createVpc}
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
            isDragOver={dragOverArea === "customer-relationships"}
          >
            <Button
              onClick={() => createPostIt("customer-relationships")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
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
            isDragOver={dragOverArea === "customer-segments"}
            className="row-span-2"
          >
            <Button
              onClick={() => createPostIt("customer-segments")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
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
            isDragOver={dragOverArea === "key-resources"}
          >
            <Button
              onClick={() => createPostIt("key-resources")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
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
            isDragOver={dragOverArea === "channels"}
          >
            <Button
              onClick={() => createPostIt("channels")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
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
            isDragOver={dragOverArea === "cost-structure"}
          >
            <Button
              onClick={() => createPostIt("cost-structure")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
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
            isDragOver={dragOverArea === "revenue-streams"}
          >
            <Button
              onClick={() => createPostIt("revenue-streams")}
              variant="ghost"
              size="sm"
              className="mb-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post-it
            </Button>
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
    </div>
  );
}