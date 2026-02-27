
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { StadiumData } from "@/hooks/useStadiumData";

interface StadiumInformationProps {
  stadium: StadiumData;
}

export const StadiumInformation = ({ stadium }: StadiumInformationProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Stadium</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-3 gap-x-8">
          <div>
            <span className="text-gray-600">Belongs to</span>
          </div>
          <div>
            <Link 
              to={`/team/${stadium.team_id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {stadium.team_name}
            </Link>
          </div>

          <div>
            <span className="text-gray-600">Total capacity</span>
          </div>
          <div className="font-medium">
            {stadium.stadium_capacity?.toLocaleString() || '15,000'}
          </div>

          <div>
            <span className="text-gray-600">Terraces</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.6).toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">Basic seating</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.2).toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">Seats under roof</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.15).toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">Seats in VIP boxes</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.05).toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">Potential match takings</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 5).toLocaleString()} £
          </div>

          <div>
            <span className="text-gray-600">Stadium maintenance</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.3).toLocaleString()} £
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
