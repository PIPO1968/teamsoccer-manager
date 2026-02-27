
import { supabase } from "@/integrations/supabase/client";

export const useFinanceOperations = () => {
  const updateTeamFinancesForPurchase = async (
    teamId: number,
    askingPrice: number
  ) => {
    const { data: buyerFinances, error: buyerFinancesError } = await supabase
      .from('team_finances')
      .select('cash_balance, new_signings_expenses')
      .eq('team_id', teamId)
      .maybeSingle();

    if (buyerFinancesError) throw buyerFinancesError;
    if (!buyerFinances) throw new Error("Buyer team finances not found");
    
    const newBuyerCashBalance = buyerFinances.cash_balance - askingPrice;
    const newBuyerExpenses = buyerFinances.new_signings_expenses + askingPrice;

    const { error: buyerFinanceError } = await supabase
      .from('team_finances')
      .update({
        cash_balance: newBuyerCashBalance,
        new_signings_expenses: newBuyerExpenses
      })
      .eq('team_id', teamId);

    if (buyerFinanceError) throw buyerFinanceError;
  };

  const updateTeamFinancesForSale = async (
    teamId: number,
    askingPrice: number
  ) => {
    const { data: sellerFinances, error: sellerFinancesError } = await supabase
      .from('team_finances')
      .select('cash_balance, player_sales_income')
      .eq('team_id', teamId)
      .maybeSingle();

    if (sellerFinancesError) throw sellerFinancesError;
    if (!sellerFinances) throw new Error("Seller team finances not found");
    
    const newSellerCashBalance = sellerFinances.cash_balance + askingPrice;
    const newSellerIncome = sellerFinances.player_sales_income + askingPrice;

    const { error: sellerFinanceError } = await supabase
      .from('team_finances')
      .update({
        cash_balance: newSellerCashBalance,
        player_sales_income: newSellerIncome
      })
      .eq('team_id', teamId);

    if (sellerFinanceError) throw sellerFinanceError;
  };

  return {
    updateTeamFinancesForPurchase,
    updateTeamFinancesForSale
  };
};
