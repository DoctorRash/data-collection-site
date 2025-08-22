import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SubmittedData {
  id: string;
  first_name: string;
  middle_name: string | null;
  surname: string;
  gender: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  employment_status: string;
  state_of_origin: string;
  created_at: string;
}

interface SpreadsheetExportProps {
  submissions: SubmittedData[];
}

const SpreadsheetExport = ({ submissions }: SpreadsheetExportProps) => {
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCsv = () => {
    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions available to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "ID", "First Name", "Middle Name", "Surname", "Gender", "Date of Birth",
      "Email", "Phone Number", "Employment Status", "State of Origin", "Submitted At"
    ];

    const csvContent = [
      headers.join(","),
      ...submissions.map(submission => [
        submission.id,
        `"${submission.first_name}"`,
        `"${submission.middle_name || ''}"`,
        `"${submission.surname}"`,
        `"${submission.gender}"`,
        submission.date_of_birth,
        `"${submission.email}"`,
        `"${submission.phone_number}"`,
        `"${submission.employment_status}"`,
        `"${submission.state_of_origin}"`,
        new Date(submission.created_at).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `form_submissions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "CSV Downloaded",
      description: "Form submissions have been downloaded as CSV file.",
    });
  };

  const exportToGoogleSheets = async () => {
    if (!googleSheetsUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter your Google Sheets Apps Script URL.",
        variant: "destructive",
      });
      return;
    }

    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions available to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(googleSheetsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          submissions: submissions.map(submission => ({
            id: submission.id,
            firstName: submission.first_name,
            middleName: submission.middle_name || '',
            surname: submission.surname,
            gender: submission.gender,
            dateOfBirth: submission.date_of_birth,
            email: submission.email,
            phoneNumber: submission.phone_number,
            employmentStatus: submission.employment_status,
            stateOfOrigin: submission.state_of_origin,
            submittedAt: submission.created_at
          }))
        }),
      });

      toast({
        title: "Export Initiated",
        description: "Data has been sent to Google Sheets. Please check your spreadsheet.",
      });
    } catch (error) {
      console.error("Google Sheets export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export to Google Sheets. Please check your URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Export Data</CardTitle>
        <CardDescription>
          Export form submissions to CSV or Google Sheets
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={exportToCsv}
            variant="outline"
            className="flex-1"
          >
            Download CSV
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="googleSheetsUrl">Google Sheets Apps Script URL</Label>
          <div className="flex gap-2">
            <Input
              id="googleSheetsUrl"
              type="url"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/your-script-id/exec"
            />
            <Button 
              onClick={exportToGoogleSheets}
              disabled={isExporting}
              className="whitespace-nowrap"
            >
              {isExporting ? "Exporting..." : "Export to Sheets"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create a Google Apps Script that receives POST requests and writes data to your spreadsheet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpreadsheetExport;