import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";

interface BMCData {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

interface BmcEditDialogProps {
  bmc: BMCData;
  onEdit: (id: string, name: string, description: string) => void;
}

export function BmcEditDialog({ bmc, onEdit }: BmcEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(bmc.name);
  const [description, setDescription] = useState(bmc.description || "");

  const handleSave = () => {
    if (!name.trim()) return;
    onEdit(bmc.id, name, description);
    setIsOpen(false);
  };

  const handleOpen = () => {
    setName(bmc.name);
    setDescription(bmc.description || "");
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="h-8 w-8 p-0"
      >
        <Edit3 className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit BMC</DialogTitle>
            <DialogDescription>
              Update the name and description of your Business Model Canvas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bmc-name">BMC Name</Label>
              <Input
                id="bmc-name"
                placeholder="Enter BMC name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bmc-description">Business Description</Label>
              <Textarea
                id="bmc-description"
                placeholder="Describe your business idea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!name.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}