import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';

interface PostItData {
  id: string;
  text: string;
  comment?: string;
  price?: string;
  metric?: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  areaId: string;
  bmcId?: string;
  vpcId?: string;
}

interface VpcCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initiatingPostIt: PostItData | null;
  availablePostIts: PostItData[];
  onCreateVpc: (initiatingPostItId: string, selectedPostItId: string) => void;
}

export const VpcCreationDialog: React.FC<VpcCreationDialogProps> = ({
  isOpen,
  onClose,
  initiatingPostIt,
  availablePostIts,
  onCreateVpc
}) => {
  const [selectedPostItId, setSelectedPostItId] = useState<string>("");

  const handleCreate = () => {
    if (selectedPostItId && initiatingPostIt) {
      onCreateVpc(initiatingPostIt.id, selectedPostItId);
      setSelectedPostItId("");
      onClose();
    }
  };

  const getAreaTitle = (areaId: string) => {
    if (areaId === "value-propositions") return "Value Proposition";
    if (areaId === "customer-segments") return "Customer Segment";
    return areaId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRequiredAreaTitle = () => {
    if (!initiatingPostIt) return "";
    return initiatingPostIt.areaId === "value-propositions" ? "Customer Segment" : "Value Proposition";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle>Create Value Proposition Canvas</DialogTitle>
           <DialogDescription>
             Select a Post-it from the opposite area to create a new VPC combining both elements.
           </DialogDescription>
         </DialogHeader>
        
        {!initiatingPostIt ? (
          <div className="p-4">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Selected {getAreaTitle(initiatingPostIt.areaId)}:</h4>
              <div className="p-2 bg-muted rounded border">
                <p className="text-sm">{initiatingPostIt.text}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Select {getRequiredAreaTitle()}:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availablePostIts.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2 text-center">
                    No {getRequiredAreaTitle()} post-its available. Create one first in the BMC.
                  </p>
                ) : (
                  availablePostIts.map((postIt) => (
                    <div
                      key={postIt.id}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedPostItId === postIt.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPostItId(postIt.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm">{postIt.text}</p>
                        </div>
                        {selectedPostItId === postIt.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!selectedPostItId || availablePostIts.length === 0 || !initiatingPostIt}
              >
                Create VPC
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};