
import { Badge } from "@/components/ui/badge";

interface DeadlineDisplayProps {
  deadline: string | null;
}

export const DeadlineDisplay = ({ deadline }: DeadlineDisplayProps) => {
  if (!deadline) {
    return <Badge variant="outline" className="bg-gray-100">Unknown</Badge>;
  }
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  
  if (deadlineDate < now) {
    return <Badge variant="outline" className="bg-red-100">Expired</Badge>;
  }
  
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return <span>{diffDays}d {diffHours}h</span>;
};
