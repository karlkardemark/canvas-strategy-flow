import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusinessModelCanvas } from "@/components/BusinessModelCanvas";
import { ValuePropositionCanvas } from "@/components/ValuePropositionCanvas";
import { VpcCreationDialog } from "@/components/VpcCreationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Share, Download, Layout, Target, Plus, Edit3, Trash2, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generatePostIts, generateRandomBusinessIdea } from "@/services/aiService";
import { PostItColor, PostItMetric } from "@/components/PostIt";
import { BmcEditDialog } from "@/components/BmcEditDialog";

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
  bmcId?: string; // For BMC post-its
  vpcId?: string; // For VPC post-its
  // Channel connections
  linkedValuePropositionIds?: string[];
  linkedCustomerSegmentIds?: string[];
}

type CanvasType = "BMC" | "VPC" | null;

interface BMCData {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

interface VPCData {
  id: string;
  name: string;
  createdAt: Date;
  linkedBmcId?: string;
  linkedValuePropositionIds: string[]; // Multiple Value Proposition Post-its
  linkedCustomerSegmentIds: string[];   // Multiple Customer Segment Post-its
  isDraft: boolean; // True until at least one value proposition and one customer segment are linked
}

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeCanvas, setActiveCanvas] = useState<CanvasType>(null);
  const [activeCanvasId, setActiveCanvasId] = useState<string>("");
  const [bmcs, setBmcs] = useState<BMCData[]>([]);
  const [vpcs, setVpcs] = useState<VPCData[]>([]);
  const [newBmcName, setNewBmcName] = useState("");
  const [newBmcDescription, setNewBmcDescription] = useState("");
  const [isGeneratingPostIts, setIsGeneratingPostIts] = useState(false);
  const [isGeneratingRandomBmc, setIsGeneratingRandomBmc] = useState(false);
  const [newVpcName, setNewVpcName] = useState("");
  const [isCreateBmcOpen, setIsCreateBmcOpen] = useState(false);
  const [isCreateVpcOpen, setIsCreateVpcOpen] = useState(false);
  const [postIts, setPostIts] = useState<PostItData[]>([]);
  const [vpcCreationDialog, setVpcCreationDialog] = useState<{
    isOpen: boolean;
    initiatingPostIt: PostItData | null;
    availablePostIts: PostItData[];
    existingConnections: string[];
  }>({
    isOpen: false,
    initiatingPostIt: null,
    availablePostIts: [],
    existingConnections: []
  });

  const handleSave = () => {
    toast.success("Project saved successfully!");
  };

  const handleShare = () => {
    toast.info("Share functionality coming soon!");
  };

  const handleDownload = () => {
    toast.info("Export functionality coming soon!");
  };

  const createBmc = () => {
    if (!newBmcName.trim()) return;
    const newBmc: BMCData = {
      id: `bmc_${Date.now()}`,
      name: newBmcName,
      description: newBmcDescription,
      createdAt: new Date(),
    };
    setBmcs([...bmcs, newBmc]);
    setNewBmcName("");
    setNewBmcDescription("");
    setIsCreateBmcOpen(false);
    toast.success("BMC created successfully!");
  };

  const createVpc = (name?: string) => {
    const vpcName = name || newVpcName;
    if (!vpcName.trim()) return null;
    
    const newVpc: VPCData = {
      id: `vpc_${Date.now()}`,
      name: vpcName,
      createdAt: new Date(),
      linkedValuePropositionIds: [],
      linkedCustomerSegmentIds: [],
      isDraft: true, // Start as draft
    };
    setVpcs([...vpcs, newVpc]);
    
    if (!name) {
      setNewVpcName("");
      setIsCreateVpcOpen(false);
    }
    
    toast.success("VPC created successfully!");
    return newVpc.id;
  };

  const deleteBmc = (bmcId: string) => {
    setBmcs(bmcs.filter(bmc => bmc.id !== bmcId));
    // Remove any VPC links to this BMC
    setVpcs(vpcs.map(vpc => 
      vpc.linkedBmcId === bmcId 
        ? { ...vpc, linkedBmcId: undefined, linkedValuePropositionIds: [], linkedCustomerSegmentIds: [], isDraft: true }
        : vpc
    ));
    toast.success("BMC deleted successfully!");
  };

  const deleteVpc = (vpcId: string) => {
    setVpcs(vpcs.filter(vpc => vpc.id !== vpcId));
    toast.success("VPC deleted successfully!");
  };

  const openCanvas = (type: CanvasType, canvasId: string) => {
    setActiveCanvas(type);
    setActiveCanvasId(canvasId);
  };

  const handleVpcLink = (postItId: string, vpcId: string, vpcName?: string, areaId?: string) => {
    let targetVpcId = vpcId;
    
    // If vpcName is provided, create a new VPC
    if (vpcName) {
      const newVpcId = createVpc(vpcName);
      if (newVpcId) {
        targetVpcId = newVpcId;
      }
    }
    
    // Find the post-it to determine its area
    const postIt = postIts.find(p => p.id === postItId);
    const postItArea = areaId || postIt?.areaId;
    
    // If unlinking (empty vpcId), remove postItId from all VPCs
    if (!vpcId || vpcId === "") {
      setVpcs(prev => prev.map(vpc => {
        const updatedVpc = { ...vpc };
        if (postItArea === "value-propositions") {
          updatedVpc.linkedValuePropositionIds = vpc.linkedValuePropositionIds.filter(id => id !== postItId);
        } else if (postItArea === "customer-segments") {
          updatedVpc.linkedCustomerSegmentIds = vpc.linkedCustomerSegmentIds.filter(id => id !== postItId);
        }
        
        // Check if VPC becomes draft (no connections in either array)
        updatedVpc.isDraft = updatedVpc.linkedValuePropositionIds.length === 0 || updatedVpc.linkedCustomerSegmentIds.length === 0;
        
        // Update VPC name if still complete
        if (!updatedVpc.isDraft && updatedVpc.linkedValuePropositionIds.length > 0 && updatedVpc.linkedCustomerSegmentIds.length > 0) {
          const firstValueProposition = postIts.find(p => p.id === updatedVpc.linkedValuePropositionIds[0])?.text || "";
          const firstCustomerSegment = postIts.find(p => p.id === updatedVpc.linkedCustomerSegmentIds[0])?.text || "";
          updatedVpc.name = `${firstValueProposition} for ${firstCustomerSegment}`;
        }
        
        return updatedVpc;
      }));
      return;
    }
    
    // Link to existing or new VPC
    setVpcs(prev => prev.map(vpc => {
      if (vpc.id === targetVpcId) {
        const updatedVpc = { 
          ...vpc, 
          linkedBmcId: activeCanvasId,
        };
        
        // Add the post-it based on its area (if not already linked)
        if (postItArea === "value-propositions" && !updatedVpc.linkedValuePropositionIds.includes(postItId)) {
          updatedVpc.linkedValuePropositionIds = [...updatedVpc.linkedValuePropositionIds, postItId];
        } else if (postItArea === "customer-segments" && !updatedVpc.linkedCustomerSegmentIds.includes(postItId)) {
          updatedVpc.linkedCustomerSegmentIds = [...updatedVpc.linkedCustomerSegmentIds, postItId];
        }
        
        // Check if VPC is complete and update name
        if (updatedVpc.linkedValuePropositionIds.length > 0 && updatedVpc.linkedCustomerSegmentIds.length > 0) {
          const firstValueProposition = postIts.find(p => p.id === updatedVpc.linkedValuePropositionIds[0])?.text || "";
          const firstCustomerSegment = postIts.find(p => p.id === updatedVpc.linkedCustomerSegmentIds[0])?.text || "";
          updatedVpc.name = `${firstValueProposition} for ${firstCustomerSegment}`;
          updatedVpc.isDraft = false;
        } else {
          updatedVpc.isDraft = true;
        }
        
        return updatedVpc;
      }
      return vpc;
    }));
    
    // Don't automatically navigate - let user stay in properties dialog
  };

  const handleNavigateToVpc = (vpcId: string) => {
    openCanvas("VPC", vpcId);
  };

  const handleCreateAndLinkVpc = (postItId: string, postItText: string, areaId?: string) => {
    const initiatingPostIt = postIts.find(p => p.id === postItId);
    if (!initiatingPostIt) return;

    // Determine the opposite area type
    const requiredAreaType = areaId === "value-propositions" ? "customer-segments" : "value-propositions";
    
    // Find available post-its of the opposite type
    const availablePostIts = postIts.filter(p => 
      p.areaId === requiredAreaType && 
      p.bmcId === activeCanvasId // Only from the same BMC
    );

    // Find existing connections for this initiating PostIt
    const existingConnections: string[] = [];
    vpcs.forEach(vpc => {
      if (areaId === "value-propositions") {
        // If initiating from VP, check which CS are already connected
        if (vpc.linkedValuePropositionIds.includes(postItId)) {
          existingConnections.push(...vpc.linkedCustomerSegmentIds);
        }
      } else {
        // If initiating from CS, check which VP are already connected  
        if (vpc.linkedCustomerSegmentIds.includes(postItId)) {
          existingConnections.push(...vpc.linkedValuePropositionIds);
        }
      }
    });

    setVpcCreationDialog({
      isOpen: true,
      initiatingPostIt,
      availablePostIts,
      existingConnections: [...new Set(existingConnections)] // Remove duplicates
    });
  };

  const handleVpcCreation = (initiatingPostItId: string, selectedPostItId: string) => {
    // Create a new VPC
    const initiatingPostIt = postIts.find(p => p.id === initiatingPostItId);
    const selectedPostIt = postIts.find(p => p.id === selectedPostItId);
    
    if (!initiatingPostIt || !selectedPostIt) return;

    // Generate VPC name based on the two post-its
    const vpcName = `${initiatingPostIt.areaId === "value-propositions" ? initiatingPostIt.text : selectedPostIt.text} for ${initiatingPostIt.areaId === "customer-segments" ? initiatingPostIt.text : selectedPostIt.text}`;
    
    const newVpcId = createVpc(vpcName);
    if (!newVpcId) return;

    // Link both post-its to the new VPC
    handleVpcLink(initiatingPostItId, newVpcId, undefined, initiatingPostIt.areaId);
    handleVpcLink(selectedPostItId, newVpcId, undefined, selectedPostIt.areaId);

    toast.success("VPC created and linked successfully!");
  };

  const editBmc = (bmcId: string, name: string, description: string) => {
    setBmcs(prev => prev.map(bmc => 
      bmc.id === bmcId ? { ...bmc, name, description } : bmc
    ));
    toast.success("BMC updated successfully!");
  };

  const createRandomBmc = async () => {
    setIsGeneratingRandomBmc(true);
    try {
      const businessIdea = await generateRandomBusinessIdea("gpt-4.1-2025-04-14");
      const newBmc: BMCData = {
        id: `bmc_${Date.now()}`,
        name: businessIdea.name,
        description: businessIdea.description,
        createdAt: new Date(),
      };
      setBmcs([...bmcs, newBmc]);
      toast.success(`Created "${businessIdea.name}" BMC!`);
      openCanvas("BMC", newBmc.id);
    } catch (error) {
      toast.error("Failed to generate random BMC");
    } finally {
      setIsGeneratingRandomBmc(false);
    }
  };

  const handleAiClick = async (areaId: string, llmId: string) => {
    const currentBmc = bmcs.find(bmc => bmc.id === activeCanvasId);
    
    if (!currentBmc?.description) {
      toast.error("No business description found. Please add a description when creating the BMC.");
      return;
    }

    setIsGeneratingPostIts(true);
    
    try {
      const suggestions = await generatePostIts({
        businessDescription: currentBmc.description,
        areaId,
        llmModel: llmId
      });

      // Create post-its from suggestions with proper positioning within the area
      const newPostIts = suggestions.map((suggestion, index) => {
        // Calculate grid position to ensure Post-its stay within area bounds
        const cols = Math.ceil(Math.sqrt(suggestions.length));
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // Post-it dimensions and spacing for proper placement
        const postItWidth = 100;
        const postItHeight = 70;
        const spacing = 10;
        const startX = 10; // Closer to left edge
        const startY = 10; // Much closer to top
        
        const x = startX + col * (postItWidth + spacing);
        const y = startY + row * (postItHeight + spacing);
        
        console.log(`AI Post-it ${index} positioned at:`, { x, y, areaId, col, row });
        
        return {
          id: `ai-postit-${Date.now()}-${index}`,
          text: suggestion.text,
          color: suggestion.color,
          x,
          y,
          width: postItWidth,
          height: postItHeight,
          areaId,
          bmcId: activeCanvasId,
        };
      });

      setPostIts(prev => [...prev, ...newPostIts]);
      toast.success(`Generated ${suggestions.length} Post-its for ${areaId.replace('-', ' ')}`);
      
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error("Failed to generate Post-its. Please try again.");
    } finally {
      setIsGeneratingPostIts(false);
    }
  };


  if (activeCanvas) {
    return (
      <div className="h-screen flex flex-col bg-workspace">
        {/* Header */}
        <header className="h-16 bg-card border-b border-canvas-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveCanvas(null);
                setActiveCanvasId("");
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
            <div className="h-6 w-px bg-canvas-border" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {activeCanvas === "BMC" 
                  ? bmcs.find(b => b.id === activeCanvasId)?.name || "Business Model Canvas"
                  : vpcs.find(v => v.id === activeCanvasId)?.name || "Value Proposition Canvas"}
              </h1>
              {activeCanvas === "BMC" && (
                <BmcEditDialog 
                  bmc={bmcs.find(b => b.id === activeCanvasId)!}
                  onEdit={editBmc}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </header>

        {/* Canvas Content */}
        <main className="flex-1 overflow-hidden">
          {activeCanvas === "BMC" ? (
            <BusinessModelCanvas 
              projectId={id || ""} 
              bmcId={activeCanvasId}
              bmcName={bmcs.find(bmc => bmc.id === activeCanvasId)?.name}
              dateCreated={bmcs.find(bmc => bmc.id === activeCanvasId)?.createdAt.toLocaleDateString()}
              availableVpcs={vpcs}
              onLinkVpc={handleVpcLink}
              onCreateAndLinkVpc={handleCreateAndLinkVpc}
              onNavigateToVpc={handleNavigateToVpc}
              postIts={postIts.filter(p => p.bmcId === activeCanvasId)}
              onPostItsChange={(updatedPostIts) => {
                // Merge the updated postIts for this BMC with postIts from other BMCs
                setPostIts(prev => [
                  ...prev.filter(p => p.bmcId !== activeCanvasId),
                  ...updatedPostIts
                ]);
              }}
              onAiClick={handleAiClick}
              isGeneratingAi={isGeneratingPostIts}
            />
          ) : (
            <ValuePropositionCanvas 
              projectId={id || ""} 
              vpcId={activeCanvasId}
              vpcName={vpcs.find(vpc => vpc.id === activeCanvasId)?.name}
              dateCreated={vpcs.find(vpc => vpc.id === activeCanvasId)?.createdAt.toLocaleDateString()}
              postIts={postIts.filter(p => p.vpcId === activeCanvasId)}
              allPostIts={postIts}
              linkedCustomerSegmentIds={vpcs.find(vpc => vpc.id === activeCanvasId)?.linkedCustomerSegmentIds || []}
              linkedValuePropositionIds={vpcs.find(vpc => vpc.id === activeCanvasId)?.linkedValuePropositionIds || []}
              onPostItsChange={(updatedPostIts) => {
                // Merge the updated postIts for this VPC with postIts from other canvases
                setPostIts(prev => [
                  ...prev.filter(p => p.vpcId !== activeCanvasId),
                  ...updatedPostIts
                ]);
              }}
              onAiClick={handleAiClick}
            />
          )}
        </main>

        {/* VPC Creation Dialog */}
        <VpcCreationDialog
          isOpen={vpcCreationDialog.isOpen}
          onClose={() => setVpcCreationDialog({ isOpen: false, initiatingPostIt: null, availablePostIts: [], existingConnections: [] })}
          initiatingPostIt={vpcCreationDialog.initiatingPostIt!}
          availablePostIts={vpcCreationDialog.availablePostIts}
          existingConnections={vpcCreationDialog.existingConnections}
          onCreateVpc={handleVpcCreation}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-workspace">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-canvas-border" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Workspace</h1>
            <p className="text-muted-foreground">Choose a canvas to work with</p>
          </div>
        </div>

        {/* Canvas Management */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl">
          {/* BMC Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Business Model Canvas</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={createRandomBmc}
                  disabled={isGeneratingRandomBmc}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGeneratingRandomBmc ? "Generating..." : "Random BMC"}
                </Button>
                <Dialog open={isCreateBmcOpen} onOpenChange={setIsCreateBmcOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New BMC
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New BMC</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="BMC Name"
                        value={newBmcName}
                        onChange={(e) => setNewBmcName(e.target.value)}
                      />
                      <Textarea
                        placeholder="Business description (optional - for AI generation)"
                        value={newBmcDescription}
                        onChange={(e) => setNewBmcDescription(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button onClick={createBmc} className="flex-1">Create</Button>
                        <Button variant="outline" onClick={() => setIsCreateBmcOpen(false)}>Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="space-y-3">
              {bmcs.length === 0 ? (
                <Card className="p-6 text-center">
                  <Layout className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No BMCs created yet</p>
                </Card>
              ) : (
                bmcs.map((bmc) => (
                  <Card key={bmc.id} className="p-4 hover:shadow-medium transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Layout className="h-5 w-5 text-primary" />
                        <div 
                          className="cursor-pointer flex-1"
                          onClick={() => openCanvas("BMC", bmc.id)}
                        >
                          <h3 className="font-medium hover:text-primary transition-colors">{bmc.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {bmc.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <BmcEditDialog 
                          bmc={bmc}
                          onEdit={editBmc}
                        />
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteBmc(bmc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* VPC Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Value Proposition Canvas</h2>
              <Dialog open={isCreateVpcOpen} onOpenChange={setIsCreateVpcOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New VPC
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New VPC</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="VPC Name"
                      value={newVpcName}
                      onChange={(e) => setNewVpcName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => createVpc()} className="flex-1">Create</Button>
                      <Button variant="outline" onClick={() => setIsCreateVpcOpen(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-3">
              {vpcs.length === 0 ? (
                <Card className="p-6 text-center">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No VPCs created yet</p>
                </Card>
              ) : (
                vpcs.map((vpc) => (
                  <Card key={vpc.id} className="p-4 hover:shadow-medium transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-purple-500" />
                        <div>
                          <h3 className="font-medium">
                            {vpc.name}
                            {vpc.isDraft && <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">Draft</span>}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Created {vpc.createdAt.toLocaleDateString()}
                          </p>
                          {vpc.linkedBmcId && (
                            <p className="text-xs text-primary">
                              Linked to {bmcs.find(b => b.id === vpc.linkedBmcId)?.name}
                            </p>
                          )}
                          {!vpc.isDraft && (
                            <p className="text-xs text-green-600">
                              Complete VPC (Value Proposition + Customer Segment)
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openCanvas("VPC", vpc.id)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteVpc(vpc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="bg-card rounded-lg p-6 border border-canvas-border">
            <p className="text-muted-foreground text-center py-8">
              No recent activity. Start by selecting a canvas to begin working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}