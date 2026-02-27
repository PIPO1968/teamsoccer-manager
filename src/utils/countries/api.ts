
import { supabase } from "@/integrations/supabase/client";
import { CountryData } from "./types";

/**
 * Fetch all countries from the database
 * @returns Promise with array of country data
 */
export async function fetchAllCountries(): Promise<CountryData[]> {
  try {
    const { data, error } = await supabase
      .from('leagues_regions')
      .select('region_id, name')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

/**
 * Get country name by ID
 * @param id The region ID to look up
 * @returns Promise with country name 
 */
export async function getCountryNameById(id: number): Promise<string> {
  if (!id) return '';
  
  try {
    const { data, error } = await supabase
      .from('leagues_regions')
      .select('name')
      .eq('region_id', id)
      .single();
      
    if (error) throw error;
    return data?.name || '';
  } catch (error) {
    console.error('Error fetching country name:', error);
    return '';
  }
}
