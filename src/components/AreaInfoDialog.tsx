import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AreaInfo {
  title: string;
  description: string;
  purpose: string;
  examples: string[];
  tips?: string[];
}

interface AreaInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  areaInfo: AreaInfo;
}

export function AreaInfoDialog({ isOpen, onClose, areaInfo }: AreaInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{areaInfo.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground">{areaInfo.description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Purpose</h3>
            <p className="text-muted-foreground">{areaInfo.purpose}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Examples</h3>
            <ul className="list-disc list-inside space-y-1">
              {areaInfo.examples.map((example, index) => (
                <li key={index} className="text-muted-foreground">{example}</li>
              ))}
            </ul>
          </div>
          
          {areaInfo.tips && areaInfo.tips.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-1">
                {areaInfo.tips.map((tip, index) => (
                  <li key={index} className="text-muted-foreground">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}