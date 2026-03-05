import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamFinances } from "@/hooks/useTeamFinances";
import { useTeamData } from "@/hooks/useTeamData";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';

export default function Finances() {
  useCompleteCarnetTest('visit_finances');
  const { teamId } = useParams<{ teamId: string }>();
  const { finances, isLoading: financesLoading } = useTeamFinances(teamId);
  const { team, isLoading: teamLoading } = useTeamData(teamId);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Club Finances</h1>
        <p className="text-muted-foreground">{team?.name} financial overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(finances?.cash_balance || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(finances?.weekly_income || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(finances?.weekly_expenses || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Balance</CardTitle>
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
            <CardTitle>Income</CardTitle>
            <CardDescription>Breakdown of income sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Match Income</span>
                <span className="font-medium">{formatMoney(finances?.match_income || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Sponsorship</span>
                <span className="font-medium">{formatMoney(finances?.sponsor_income || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Player Sales</span>
                <span className="font-medium">{formatMoney(finances?.player_sales_income || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Commission</span>
                <span className="font-medium">{formatMoney(finances?.commission_income || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Other Income</span>
                <span className="font-medium">{formatMoney(finances?.other_income || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Breakdown of expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Wages</span>
                <span className="font-medium">{formatMoney(finances?.wages_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Stadium Maintenance</span>
                <span className="font-medium">{formatMoney(finances?.stadium_maintenance_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Stadium Building</span>
                <span className="font-medium">{formatMoney(finances?.stadium_building_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Staff</span>
                <span className="font-medium">{formatMoney(finances?.staff_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Youth Academy</span>
                <span className="font-medium">{formatMoney(finances?.youth_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">New Signings</span>
                <span className="font-medium">{formatMoney(finances?.new_signings_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Other Expenses</span>
                <span className="font-medium">{formatMoney(finances?.other_expenses || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
