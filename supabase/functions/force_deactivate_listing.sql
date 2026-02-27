
-- Function to force deactivate a listing
CREATE OR REPLACE FUNCTION force_deactivate_listing(listing_id INT)
RETURNS void
LANGUAGE SQL
AS $$
  UPDATE transfer_listings 
  SET is_active = false
  WHERE id = listing_id;
$$;
