import { useParams, useNavigate } from "react-router-dom";
import { BusinessModelCanvas } from "@/components/BusinessModelCanvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Share, Download } from "lucide-react";
import { toast } from "sonner";

export default function CanvasWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSave = () => {
    toast.success("Canvas saved successfully!");
  };

  const handleShare = () => {
    toast.info("Share functionality coming soon!");
  };

  const handleDownload = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <div className="h-screen flex flex-col bg-workspace">
      {/* Header */}
      <header className="h-16 bg-card border-b border-canvas-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-canvas-border" />
          <h1 className="text-lg font-semibold text-foreground">
            Business Model Canvas
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
        <BusinessModelCanvas projectId={id || ""} />
      </main>
    </div>
  );
}