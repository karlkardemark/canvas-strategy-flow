import { useState } from "react";
import { CanvasArea } from "./CanvasArea";
import { PostIt, PostItColor, PostItMetric } from "./PostIt";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Package, 
  Smile, 
  Frown, 
  Briefcase,
  TrendingUp,
  Shield
} from "lucide-react";
import bmcHeaderImage from "@/assets/bmc-header.jpg";

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
}

interface ValuePropositionCanvasProps {
  projectId: string;
}

const defaultColors: PostItColor[] = ["yellow", "blue", "green", "pink", "orange", "purple"];

export function ValuePropositionCanvas({ projectId }: ValuePropositionCanvasProps) {
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

  const updatePostIt = (id: string, text: string, comment?: string, price?: string, metric?: PostItMetric) => {
    setPostIts(prev => 
      prev.map(postIt => 
        postIt.id === id ? { ...postIt, text, comment, price, metric } : postIt
      )
    );
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
      <div className="min-w-[1200px] p-8">
        {/* Canvas header */}
        <div className="relative mb-8 rounded-xl overflow-hidden shadow-medium">
          <img 
            src={bmcHeaderImage} 
            alt="Value Proposition Canvas" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-500/60 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">The Value Proposition Canvas</h1>
              <p className="text-xl opacity-90">Map your value proposition to customer needs</p>
            </div>
          </div>
        </div>

        {/* Canvas layout */}
        <div className="grid grid-cols-2 gap-8">
          {/* Value Proposition side */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Value Proposition</h2>
              <p className="text-muted-foreground">What you offer to customers</p>
            </div>

            <div className="grid gap-4">
              <CanvasArea
                id="gain-creators"
                title="Gain Creators"
                icon={<TrendingUp className="h-4 w-4" />}
                onDrop={handleDrop}
                onDragOver={(e) => handleAreaDragOver(e, "gain-creators")}
                isDragOver={dragOverArea === "gain-creators"}
                className="min-h-64"
              >
                <Button
                  onClick={() => createPostIt("gain-creators")}
                  variant="ghost"
                  size="sm"
                  className="mb-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post-it
                </Button>
                {postIts
                  .filter(postIt => postIt.areaId === "gain-creators")
                  .map(postIt => (
                     <PostIt
                       key={postIt.id}
                       {...postIt}
                       showMetadata={false}
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
                id="products-services"
                title="Products & Services"
                icon={<Package className="h-4 w-4" />}
                onDrop={handleDrop}
                onDragOver={(e) => handleAreaDragOver(e, "products-services")}
                isDragOver={dragOverArea === "products-services"}
                className="min-h-64"
              >
                <Button
                  onClick={() => createPostIt("products-services")}
                  variant="ghost"
                  size="sm"
                  className="mb-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post-it
                </Button>
                {postIts
                  .filter(postIt => postIt.areaId === "products-services")
                  .map(postIt => (
                     <PostIt
                       key={postIt.id}
                       {...postIt}
                       showMetadata={true}
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
                id="pain-relievers"
                title="Pain Relievers"
                icon={<Shield className="h-4 w-4" />}
                onDrop={handleDrop}
                onDragOver={(e) => handleAreaDragOver(e, "pain-relievers")}
                isDragOver={dragOverArea === "pain-relievers"}
                className="min-h-64"
              >
                <Button
                  onClick={() => createPostIt("pain-relievers")}
                  variant="ghost"
                  size="sm"
                  className="mb-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post-it
                </Button>
                {postIts
                  .filter(postIt => postIt.areaId === "pain-relievers")
                  .map(postIt => (
                     <PostIt
                       key={postIt.id}
                        {...postIt}
                        showMetadata={false}
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

          {/* Customer Segment side */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Customer Segment</h2>
              <p className="text-muted-foreground">Who you're creating value for</p>
            </div>

            <div className="grid gap-4">
              <CanvasArea
                id="gains"
                title="Gains"
                icon={<Smile className="h-4 w-4" />}
                onDrop={handleDrop}
                onDragOver={(e) => handleAreaDragOver(e, "gains")}
                isDragOver={dragOverArea === "gains"}
                className="min-h-64"
              >
                <Button
                  onClick={() => createPostIt("gains")}
                  variant="ghost"
                  size="sm"
                  className="mb-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post-it
                </Button>
                {postIts
                  .filter(postIt => postIt.areaId === "gains")
                  .map(postIt => (
                     <PostIt
                       key={postIt.id}
                        {...postIt}
                        showMetadata={false}
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
                id="customer-jobs"
                title="Customer Jobs"
                icon={<Briefcase className="h-4 w-4" />}
                onDrop={handleDrop}
                onDragOver={(e) => handleAreaDragOver(e, "customer-jobs")}
                isDragOver={dragOverArea === "customer-jobs"}
                className="min-h-64"
              >
                <Button
                  onClick={() => createPostIt("customer-jobs")}
                  variant="ghost"
                  size="sm"
                  className="mb-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post-it
                </Button>
                {postIts
                  .filter(postIt => postIt.areaId === "customer-jobs")
                  .map(postIt => (
                     <PostIt
                       key={postIt.id}
                        {...postIt}
                        showMetadata={false}
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
                id="pains"
                title="Pains"
                icon={<Frown className="h-4 w-4" />}
                onDrop={handleDrop}
                onDragOver={(e) => handleAreaDragOver(e, "pains")}
                isDragOver={dragOverArea === "pains"}
                className="min-h-64"
              >
                <Button
                  onClick={() => createPostIt("pains")}
                  variant="ghost"
                  size="sm"
                  className="mb-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post-it
                </Button>
                {postIts
                  .filter(postIt => postIt.areaId === "pains")
                  .map(postIt => (
                     <PostIt
                       key={postIt.id}
                        {...postIt}
                        showMetadata={false}
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
      </div>
    </div>
  );
}