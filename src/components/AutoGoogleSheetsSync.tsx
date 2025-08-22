import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AutoGoogleSheetsSyncProps {
  onUrlUpdate?: (url: string) => void;
}

const AutoGoogleSheetsSync = ({ onUrlUpdate }: AutoGoogleSheetsSyncProps) => {
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved Google Sheets URL from localStorage or database
    const savedUrl = localStorage.getItem('google_sheets_url');
    if (savedUrl) {
      setGoogleSheetsUrl(savedUrl);
      setIsEnabled(true);
      onUrlUpdate?.(savedUrl);
    }
  }, [onUrlUpdate]);

  const saveGoogleSheetsUrl = () => {
    if (!googleSheetsUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter your Google Sheets Apps Script URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Save to localStorage (in a real app, you might save to database)
      localStorage.setItem('google_sheets_url', googleSheetsUrl);
      setIsEnabled(true);
      onUrlUpdate?.(googleSheetsUrl);
      
      toast({
        title: "URL Saved",
        description: "Google Sheets URL has been saved. New submissions will be automatically synced.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save Google Sheets URL.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const disableSync = () => {
    localStorage.removeItem('google_sheets_url');
    setGoogleSheetsUrl("");
    setIsEnabled(false);
    onUrlUpdate?.("");
    
    toast({
      title: "Sync Disabled",
      description: "Automatic Google Sheets sync has been disabled.",
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Auto Google Sheets Sync</CardTitle>
            <CardDescription>
              Automatically sync new form submissions to Google Sheets
            </CardDescription>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="autoGoogleSheetsUrl">Google Sheets Apps Script URL</Label>
          <div className="flex gap-2">
            <Input
              id="autoGoogleSheetsUrl"
              type="url"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/your-script-id/exec"
              disabled={isEnabled}
            />
            {isEnabled ? (
              <Button 
                onClick={disableSync}
                variant="outline"
                className="whitespace-nowrap"
              >
                Disable
              </Button>
            ) : (
              <Button 
                onClick={saveGoogleSheetsUrl}
                disabled={isSaving}
                className="whitespace-nowrap"
              >
                {isSaving ? "Saving..." : "Enable Sync"}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Create a Google Apps Script that receives POST requests and writes data to your spreadsheet.
            Once enabled, all new form submissions will be automatically sent to your sheet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoGoogleSheetsSync;