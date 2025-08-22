import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import SpreadsheetExport from "@/components/SpreadsheetExport";
import AutoGoogleSheetsSync from "@/components/AutoGoogleSheetsSync";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<SubmittedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user is system admin using secure function
      const { data: adminCheck, error } = await supabase
        .rpc('is_admin_email', { check_email: session.user.email });

      if (error || !adminCheck) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadSubmissions();
    };

    checkAuth();
  }, [toast, navigate]);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-form-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmploymentStatusBadge = (status: string) => {
    const statusColors = {
      'Employed': 'bg-success text-success-foreground',
      'Self-Employed': 'bg-primary text-primary-foreground',
      'Unemployed': 'bg-warning text-warning-foreground',
      'Student': 'bg-accent text-accent-foreground'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-muted text-muted-foreground'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-form-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              View and manage submitted information forms
            </p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </Button>
        </div>

        <Card className="shadow-custom-lg border-0 bg-surface">
          <CardHeader>
            <CardTitle className="text-xl">Submitted Forms</CardTitle>
            <CardDescription>
              {loading ? "Loading submissions..." : `${submissions.length} total submissions`}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No submissions yet</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Submitted forms will appear here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Employment</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {`${submission.first_name} ${submission.middle_name || ''} ${submission.surname}`.trim()}
                        </TableCell>
                        <TableCell>{submission.gender}</TableCell>
                        <TableCell>{new Date(submission.date_of_birth).toLocaleDateString()}</TableCell>
                        <TableCell className="text-primary">
                          <a href={`mailto:${submission.email}`} className="hover:underline">
                            {submission.email}
                          </a>
                        </TableCell>
                        <TableCell>{submission.phone_number}</TableCell>
                        <TableCell>
                          {getEmploymentStatusBadge(submission.employment_status)}
                        </TableCell>
                        <TableCell>{submission.state_of_origin}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(submission.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <AutoGoogleSheetsSync />
        <SpreadsheetExport submissions={submissions} />
      </div>
    </div>
  );
};

export default AdminDashboard;