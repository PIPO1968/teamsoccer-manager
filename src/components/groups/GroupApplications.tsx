
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupApplicationsProps {
  applications: any[];
  onHandle: (applicationId: number, status: 'approved' | 'rejected') => void;
}

export function GroupApplications({ applications, onHandle }: GroupApplicationsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pending Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="flex items-center justify-between">
              <div>
                <Link 
                  to={`/manager/${application.applicant_id}`}
                  className="font-medium hover:underline text-primary"
                >
                  {application.applicant.username}
                </Link>
                {application.message && (
                  <p className="text-sm text-muted-foreground">{application.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onHandle(application.id, 'approved')}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onHandle(application.id, 'rejected')}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
