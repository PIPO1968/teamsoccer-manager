
import { Badge } from "@/components/ui/badge";

type BidStatus = 'pending' | 'accepted' | 'rejected' | 'outbid';

interface BidStatusBadgeProps {
  status: string;
}

export const BidStatusBadge = ({ status }: BidStatusBadgeProps) => {
  switch (status as BidStatus) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="bg-green-100">Won</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-100">Lost</Badge>;
    case 'outbid':
      return <Badge variant="outline" className="bg-gray-100">Outbid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
