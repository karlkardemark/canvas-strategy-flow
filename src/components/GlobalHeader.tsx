import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";
import { PromptSettingsDialog } from "@/components/PromptSettingsDialog";

interface Transaction {
  id: string;
  type: 'purchase' | 'usage';
  amount: number;
  description: string;
  date: string;
}

export function GlobalHeader() {
  const [credits, setCredits] = useState(250);
  const [showCreditHistory, setShowCreditHistory] = useState(false);
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "purchase",
      amount: 100,
      description: "Credit purchase",
      date: "2024-01-15 14:30"
    },
    {
      id: "2",
      type: "usage",
      amount: -5,
      description: "Canvas creation",
      date: "2024-01-15 15:45"
    },
    {
      id: "3",
      type: "purchase",
      amount: 200,
      description: "Credit top-up",
      date: "2024-01-14 09:20"
    }
  ]);

  const handleAddCredits = () => {
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid credit amount");
      return;
    }
    
    setCredits(prev => prev + amount);
    setCreditAmount("");
    setShowAddCredit(false);
    toast.success(`Added ${amount} credits to your account`);
  };

  return (
    <>
      <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-full flex items-center justify-end">
          <div className="flex items-center space-x-4">
            {/* AI Settings */}
            <PromptSettingsDialog />
            
            {/* Credits Section */}
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreditHistory(true)}
                className="flex items-center space-x-2 text-sm font-medium"
              >
                <Coins className="h-4 w-4 text-yellow-600" />
                <span>{credits} Credits</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddCredit(true)}
                className="flex items-center space-x-1"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">Add Credit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Credit History Dialog */}
      <Dialog open={showCreditHistory} onOpenChange={setShowCreditHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span>Credit History</span>
            </DialogTitle>
            <DialogDescription>
              View your credit balance and transaction history
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <span className="text-2xl font-bold text-yellow-600">{credits} Credits</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Recent Transactions</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'purchase' ? '+' : ''}{transaction.amount} credits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Credit Dialog */}
      <Dialog open={showAddCredit} onOpenChange={setShowAddCredit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Add Credits</span>
            </DialogTitle>
            <DialogDescription>
              Purchase additional credits for your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credit-amount">Credit Amount</Label>
              <Input
                id="credit-amount"
                type="number"
                placeholder="Enter amount..."
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                min="1"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddCredit(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddCredits}
              >
                Add Credits
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}