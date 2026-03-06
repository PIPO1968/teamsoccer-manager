
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { StadiumData } from "@/hooks/useStadiumData";
import { useLanguage } from "@/contexts/LanguageContext";

interface StadiumInformationProps {
  stadium: StadiumData;
}

export const StadiumInformation = ({ stadium }: StadiumInformationProps) => {
  const { t } = useLanguage();
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('stadium.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-3 gap-x-8">
          <div>
            <span className="text-gray-600">{t('stadium.belongsTo')}</span>
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
            <span className="text-gray-600">{t('stadium.totalCapacity')}</span>
          </div>
          <div className="font-medium">
            {stadium.stadium_capacity?.toLocaleString() || '15,000'}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.terraces')}</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.6).toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.basicSeating')}</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.2).toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.seatsUnderRoof')}</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.15).toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.vipBoxes')}</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.05).toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.potentialTakings')}</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 5).toLocaleString()} £
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.maintenance')}</span>
          </div>
          <div className="font-medium">
            {Math.floor((stadium.stadium_capacity || 15000) * 0.3).toLocaleString()} £
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
