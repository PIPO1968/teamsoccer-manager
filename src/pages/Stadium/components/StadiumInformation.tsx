
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { StadiumData } from "@/hooks/useStadiumData";
import { useLanguage } from "@/contexts/LanguageContext";

interface StadiumInformationProps {
  stadium: StadiumData;
}

export const StadiumInformation = ({ stadium }: StadiumInformationProps) => {
  const { t } = useLanguage();
  const cap = stadium.stadium_capacity || 2500;

  const sStanding = stadium.seats_standing ?? 0;
  const sBasic = stadium.seats_basic ?? 0;
  const sCovered = stadium.seats_covered ?? 0;
  const sVip = stadium.seats_vip ?? 0;

  const hasAssigned = sStanding + sBasic + sCovered + sVip > 0;
  const terraces = hasAssigned ? sStanding : Math.floor(cap * 0.80);
  const basicSeats = hasAssigned ? sBasic : Math.floor(cap * 0.192);
  const roofSeats = hasAssigned ? sCovered : Math.floor(cap * 0.008);
  const vipSeats = sVip;

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
            {cap.toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.terraces')}</span>
          </div>
          <div className="font-medium">
            {terraces.toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.basicSeating')}</span>
          </div>
          <div className="font-medium">
            {basicSeats.toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.seatsUnderRoof')}</span>
          </div>
          <div className="font-medium">
            {roofSeats.toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.vipBoxes')}</span>
          </div>
          <div className="font-medium">
            {vipSeats.toLocaleString()}
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.potentialTakings')}</span>
          </div>
          <div className="font-medium">
            {Math.floor(cap * 30).toLocaleString()} $
          </div>

          <div>
            <span className="text-gray-600">{t('stadium.maintenance')}</span>
          </div>
          <div className="font-medium">
            {Math.floor(cap * 1.8).toLocaleString()} $
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
