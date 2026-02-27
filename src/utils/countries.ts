
import { supabase } from "@/integrations/supabase/client";
import { getCountryCode, specialCases } from "@/utils/countries/codes";
import { getCountriesByContinent } from "@/utils/countries/continents";

export type CountryData = {
  region_id: number;
  name: string;
};

// Re-export getCountryCode for backward compatibility
export { getCountryCode };

// Fetch all countries from the database
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

// Get country name by ID
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

// Re-export for backward compatibility
export { getCountriesByContinent, specialCases };
