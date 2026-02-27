
CREATE OR REPLACE FUNCTION update_team_finances_for_purchase(p_team_id INT, p_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE team_finances
  SET 
    cash_balance = cash_balance - p_amount,
    new_signings_expenses = new_signings_expenses + p_amount
  WHERE team_id = p_team_id;
END;
$$;
