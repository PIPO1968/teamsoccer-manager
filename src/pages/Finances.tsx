import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamFinances } from "@/hooks/useTeamFinances";
import { useTeamData } from "@/hooks/useTeamData";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, DollarSign, Award } from "lucide-react";
import { useCompleteCarnetTest, useManagerLicense, CARNET_TESTS } from '@/hooks/useManagerLicense';
import { useLanguage } from "@/contexts/LanguageContext";

export default function Finances() {
  useCompleteCarnetTest('visit_finances');
  const { teamId } = useParams<{ teamId: string }>();
  const { finances, isLoading: financesLoading } = useTeamFinances(teamId);
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { completedKeys: carnetCompletedKeys } = useManagerLicense();
  const { t } = useLanguage();

  if (financesLoading || teamLoading) {
    return <FinancesSkeleton />;
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const cashEarned = CARNET_TESTS
    .filter(test => test.test_key !== 'visit_dashboard' && carnetCompletedKeys.includes(test.test_key))
    .reduce((sum, test) => sum + test.reward_amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('finances.title')}</h1>
        <p className="text-muted-foreground">{team?.name} {t('finances.overview')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finances.cashBalance')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(finances?.cash_balance || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finances.weeklyIncome')}</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(finances?.weekly_income || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finances.weeklyExpenses')}</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(finances?.weekly_expenses || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('finances.weeklyBalance')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMoney((finances?.weekly_income || 0) - (finances?.weekly_expenses || 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('finances.income')}</CardTitle>
            <CardDescription>{t('finances.incomeBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.matchIncome')}</span>
                <span className="font-medium">{formatMoney(finances?.match_income || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.sponsorship')}</span>
                <span className="font-medium">{formatMoney(finances?.sponsor_income || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.playerSales')}</span>
                <span className="font-medium">{formatMoney(finances?.player_sales_income || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.commission')}</span>
                <span className="font-medium">{formatMoney(finances?.commission_income || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.otherIncome')}</span>
                <span className="font-medium">{formatMoney(finances?.other_income || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('finances.expenses')}</CardTitle>
            <CardDescription>{t('finances.expensesBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.wages')}</span>
                <span className="font-medium">{formatMoney(finances?.wages_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.stadiumMaintenance')}</span>
                <span className="font-medium">{formatMoney(finances?.stadium_maintenance_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.stadiumBuilding')}</span>
                <span className="font-medium">{formatMoney(finances?.stadium_building_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.staff')}</span>
                <span className="font-medium">{formatMoney(finances?.staff_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.youthAcademy')}</span>
                <span className="font-medium">{formatMoney(finances?.youth_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.newSignings')}</span>
                <span className="font-medium">{formatMoney(finances?.new_signings_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('finances.otherExpenses')}</span>
                <span className="font-medium">{formatMoney(finances?.other_expenses || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manager License Awards */}
      {carnetCompletedKeys.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Award className="h-5 w-5 text-yellow-500" />
              {t('finances.carnetAwards')}
            </CardTitle>
            <CardDescription>{t('finances.carnetDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {carnetCompletedKeys.includes('visit_dashboard') && (
                <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-yellow-800">{t('finances.premiumDays')}</span>
                    <span className="text-xs text-gray-500">— {t('finances.exploreDashboard')}</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-700">{t('finances.activated')}</span>
                </div>
              )}
              {CARNET_TESTS.filter(test => test.test_key !== 'visit_dashboard' && carnetCompletedKeys.includes(test.test_key)).map(test => (
                <div key={test.test_key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{test.title}</span>
                  <span className="text-sm font-bold text-green-600">+{formatMoney(test.reward_amount)}</span>
                </div>
              ))}
              {cashEarned > 0 && (
                <div className="flex justify-between items-center pt-3 border-t border-yellow-200 font-bold">
                  <span className="text-sm text-gray-900">{t('finances.totalEarned')}</span>
                  <span className="text-sm text-green-700">+{formatMoney(cashEarned)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const FinancesSkeleton = () => (
  <div className="space-y-8">
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64 mt-2" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-56 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div className="flex justify-between" key={j}>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
