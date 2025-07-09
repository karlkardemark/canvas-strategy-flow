import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusinessModelCanvas } from "@/components/BusinessModelCanvas";
import { ValuePropositionCanvas } from "@/components/ValuePropositionCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Share, Download, Layout, Target } from "lucide-react";
import { toast } from "sonner";

type CanvasType = "BMC" | "VPC" | null;

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeCanvas, setActiveCanvas] = useState<CanvasType>(null);

  const handleSave = () => {
    toast.success("Project saved successfully!");
  };

  const handleShare = () => {
    toast.info("Share functionality coming soon!");
  };

  const handleDownload = () => {
    toast.info("Export functionality coming soon!");
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
              onClick={() => setActiveCanvas(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
            <div className="h-6 w-px bg-canvas-border" />
            <h1 className="text-lg font-semibold text-foreground">
              {activeCanvas === "BMC" ? "Business Model Canvas" : "Value Proposition Canvas"}
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
            <BusinessModelCanvas projectId={id || ""} />
          ) : (
            <ValuePropositionCanvas projectId={id || ""} />
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

        {/* Canvas Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-medium hover:scale-105 group"
            onClick={() => setActiveCanvas("BMC")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Layout className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Business Model Canvas</CardTitle>
              <CardDescription>
                Design your complete business model with the 9-building-block framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Key Partners & Activities
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Value Propositions
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Customer Segments & Relationships
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Revenue & Cost Structure
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-medium hover:scale-105 group"
            onClick={() => setActiveCanvas("VPC")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Target className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle className="text-xl">Value Proposition Canvas</CardTitle>
              <CardDescription>
                Map your value proposition to customer needs and validate product-market fit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Gain Creators & Pain Relievers
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Products & Services
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Customer Jobs & Gains
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Customer Pains
                </div>
              </div>
            </CardContent>
          </Card>
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