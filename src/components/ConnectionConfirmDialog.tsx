import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, X } from 'lucide-react';

interface PostItData {
  id: string;
  text: string;
  areaId: string;
}

interface ConnectionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePostIt: PostItData | null;
  targetPostIt: PostItData | null;
  onConfirm: () => void;
}

export const ConnectionConfirmDialog: React.FC<ConnectionConfirmDialogProps> = ({
  isOpen,
  onClose,
  sourcePostIt,
  targetPostIt,
  onConfirm
}) => {
  const getAreaTitle = (areaId: string) => {
    if (areaId === "value-propositions") return "Value Proposition";
    if (areaId === "customer-segments") return "Customer Segment";
    if (areaId === "channels") return "Channel";
    return areaId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!sourcePostIt || !targetPostIt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Channel</DialogTitle>
          <DialogDescription>
            Do you sell <strong>{sourcePostIt.text}</strong> via <strong>{targetPostIt.text}</strong>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">



          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              <Check className="h-4 w-4 mr-1" />
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};