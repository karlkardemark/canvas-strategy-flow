import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusinessModelCanvas } from "@/components/BusinessModelCanvas";
import { ValuePropositionCanvas } from "@/components/ValuePropositionCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Share, Download, Layout, Target, Plus, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PostItColor, PostItMetric } from "@/components/PostIt";

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
}

type CanvasType = "BMC" | "VPC" | null;

interface BMCData {
  id: string;
  name: string;
  createdAt: Date;
}

interface VPCData {
  id: string;
  name: string;
  createdAt: Date;
  linkedBmcId?: string;
  linkedPostItIds?: string[]; // Changed to array to support multiple Post-its
}

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeCanvas, setActiveCanvas] = useState<CanvasType>(null);
  const [activeCanvasId, setActiveCanvasId] = useState<string>("");
  const [bmcs, setBmcs] = useState<BMCData[]>([]);
  const [vpcs, setVpcs] = useState<VPCData[]>([]);
  const [newBmcName, setNewBmcName] = useState("");
  const [newVpcName, setNewVpcName] = useState("");
  const [isCreateBmcOpen, setIsCreateBmcOpen] = useState(false);
  const [isCreateVpcOpen, setIsCreateVpcOpen] = useState(false);
  const [postIts, setPostIts] = useState<PostItData[]>([]);

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
      createdAt: new Date(),
    };
    setBmcs([...bmcs, newBmc]);
    setNewBmcName("");
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
        ? { ...vpc, linkedBmcId: undefined, linkedPostItIds: undefined }
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

  const handleVpcLink = (postItId: string, vpcId: string, vpcName?: string) => {
    let targetVpcId = vpcId;
    
    // If vpcName is provided, create a new VPC
    if (vpcName) {
      const newVpcId = createVpc(vpcName);
      if (newVpcId) {
        targetVpcId = newVpcId;
      }
    }
    
    // If unlinking (empty vpcId), remove postItId from all VPCs
    if (!vpcId || vpcId === "") {
      setVpcs(prev => prev.map(vpc => ({
        ...vpc,
        linkedPostItIds: vpc.linkedPostItIds?.filter(id => id !== postItId) || []
      })));
      return;
    }
    
    // Link to existing or new VPC
    setVpcs(prev => prev.map(vpc => 
      vpc.id === targetVpcId 
        ? { 
            ...vpc, 
            linkedBmcId: activeCanvasId, 
            linkedPostItIds: [...(vpc.linkedPostItIds || []), postItId].filter((id, index, arr) => arr.indexOf(id) === index) // Avoid duplicates
          }
        : vpc
    ));
    
    // Don't automatically navigate - let user stay in properties dialog
  };

  const handleNavigateToVpc = (vpcId: string) => {
    openCanvas("VPC", vpcId);
  };

  const handleAiClick = (areaId: string) => {
    // Placeholder for AI functionality
    console.log('AI clicked for area:', areaId);
    // In a real implementation, this would show AI assistance features
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
            <h1 className="text-lg font-semibold text-foreground">
              {activeCanvas === "BMC" 
                ? bmcs.find(b => b.id === activeCanvasId)?.name || "Business Model Canvas"
                : vpcs.find(v => v.id === activeCanvasId)?.name || "Value Proposition Canvas"}
            </h1>
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
            />
          ) : (
            <ValuePropositionCanvas 
              projectId={id || ""} 
              vpcId={activeCanvasId}
              vpcName={vpcs.find(vpc => vpc.id === activeCanvasId)?.name}
              dateCreated={vpcs.find(vpc => vpc.id === activeCanvasId)?.createdAt.toLocaleDateString()}
              postIts={postIts.filter(p => p.vpcId === activeCanvasId)}
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
                    <div className="flex gap-2">
                      <Button onClick={createBmc} className="flex-1">Create</Button>
                      <Button variant="outline" onClick={() => setIsCreateBmcOpen(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                      <div className="flex items-center gap-3">
                        <Layout className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{bmc.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {bmc.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openCanvas("BMC", bmc.id)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
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
                          <h3 className="font-medium">{vpc.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {vpc.createdAt.toLocaleDateString()}
                          </p>
                          {vpc.linkedBmcId && (
                            <p className="text-xs text-primary">
                              Linked to {bmcs.find(b => b.id === vpc.linkedBmcId)?.name}
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