import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, RotateCcw, Download, Upload, Save } from "lucide-react";
import { PromptSettingsService } from "@/services/promptSettings";
import { bmcAreaInfo } from "@/data/areaInformation";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface AreaPromptSettings {
  systemPrompt: string;
  maxSuggestions: number;
  useDefaultFallback: boolean;
}

export function PromptSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, AreaPromptSettings>>({});
  const [activeTab, setActiveTab] = useState("areas");
  const [selectedArea, setSelectedArea] = useState("key-partners");
  const [importData, setImportData] = useState("");
  const { toast } = useToast();
  const promptService = PromptSettingsService.getInstance();

  useEffect(() => {
    if (open) {
      setSettings(promptService.getAllSettings());
    }
  }, [open]);

  const updateAreaSetting = (areaId: string, field: keyof AreaPromptSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [areaId]: {
        ...prev[areaId],
        [field]: value
      }
    }));
  };

  const saveSettings = () => {
    Object.entries(settings).forEach(([areaId, areaSettings]) => {
      promptService.updateAreaSettings(areaId, areaSettings);
    });
    toast({
      title: "Settings saved",
      description: "AI prompt settings have been updated successfully.",
    });
  };

  const resetArea = (areaId: string) => {
    promptService.resetAreaToDefault(areaId);
    setSettings(promptService.getAllSettings());
    toast({
      title: "Area reset",
      description: `Settings for ${bmcAreaInfo[areaId as keyof typeof bmcAreaInfo]?.title} have been reset to defaults.`,
    });
  };

  const resetAll = () => {
    promptService.resetAllToDefaults();
    setSettings(promptService.getAllSettings());
    toast({
      title: "All settings reset",
      description: "All AI prompt settings have been reset to defaults.",
    });
  };

  const exportSettings = () => {
    const exported = promptService.exportSettings();
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bmc-prompt-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Settings exported",
      description: "AI prompt settings have been exported to a JSON file.",
    });
  };

  const importSettings = () => {
    if (!importData.trim()) {
      toast({
        title: "Import failed",
        description: "Please paste valid JSON settings data.",
        variant: "destructive",
      });
      return;
    }

    const success = promptService.importSettings(importData);
    if (success) {
      setSettings(promptService.getAllSettings());
      setImportData("");
      toast({
        title: "Settings imported",
        description: "AI prompt settings have been imported successfully.",
      });
    } else {
      toast({
        title: "Import failed",
        description: "Invalid JSON format or structure. Please check your data.",
        variant: "destructive",
      });
    }
  };

  const areaIds = Object.keys(bmcAreaInfo);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          AI Prompt Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Prompt Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="areas">Areas</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
            <TabsTrigger value="global">Global Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="areas" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Area selection sidebar */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Area</Label>
                {areaIds.map((areaId) => (
                  <Button
                    key={areaId}
                    variant={areaId === selectedArea ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedArea(areaId)}
                  >
                    {bmcAreaInfo[areaId as keyof typeof bmcAreaInfo]?.title}
                  </Button>
                ))}
              </div>
              
              {/* Area settings */}
              <div className="col-span-2 space-y-4">
                {areaIds.map((areaId) => (
                  <div
                    key={areaId}
                    className={`space-y-4 ${areaId === selectedArea ? 'block' : 'hidden'}`}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {bmcAreaInfo[areaId as keyof typeof bmcAreaInfo]?.title}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetArea(areaId)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          {bmcAreaInfo[areaId as keyof typeof bmcAreaInfo]?.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`prompt-${areaId}`}>System Prompt</Label>
                          <Textarea
                            id={`prompt-${areaId}`}
                            value={settings[areaId]?.systemPrompt || ""}
                            onChange={(e) => updateAreaSetting(areaId, 'systemPrompt', e.target.value)}
                            placeholder="Enter the system prompt for AI generation..."
                            className="min-h-[120px] mt-2"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`max-${areaId}`}>Max Suggestions</Label>
                            <Input
                              id={`max-${areaId}`}
                              type="number"
                              min="1"
                              max="10"
                              value={settings[areaId]?.maxSuggestions || 4}
                              onChange={(e) => updateAreaSetting(areaId, 'maxSuggestions', parseInt(e.target.value))}
                              className="mt-2"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-6">
                            <Switch
                              id={`fallback-${areaId}`}
                              checked={settings[areaId]?.useDefaultFallback || false}
                              onCheckedChange={(checked) => updateAreaSetting(areaId, 'useDefaultFallback', checked)}
                            />
                            <Label htmlFor={`fallback-${areaId}`}>Use default fallback</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="import-export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import/Export Settings</CardTitle>
                <CardDescription>
                  Backup your settings or share them across devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={exportSettings} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="import-data">Import Settings (JSON)</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your exported settings JSON here..."
                    className="min-h-[120px] mt-2"
                  />
                  <Button 
                    onClick={importSettings} 
                    className="mt-2"
                    disabled={!importData.trim()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="global" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Actions</CardTitle>
                <CardDescription>
                  Actions that affect all prompt settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={saveSettings}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </Button>
                
                <Button 
                  onClick={resetAll}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All to Defaults
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Always visible save button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={saveSettings} className="px-6">
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}