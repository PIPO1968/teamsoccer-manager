
-- Function for emergency deactivation of listings via direct SQL
CREATE OR REPLACE FUNCTION emergency_deactivate_listing(listing_id_param INT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE transfer_listings 
  SET is_active = false
  WHERE id = listing_id_param;
END;
$$;
