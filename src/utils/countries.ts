
// import { supabase } from "@/integrations/supabase/client";
import { getCountryCode, specialCases } from "@/utils/countries/codes";
import { getCountriesByContinent } from "@/utils/countries/continents";
import { apiFetch } from "@/services/apiClient";

export type CountryData = {
  region_id: number;
  name: string;
};

// Re-export getCountryCode for backward compatibility
export { getCountryCode };

// Fetch all countries from the database
export async function fetchAllCountries(): Promise<CountryData[]> {
  try {
    const data = await apiFetch<{ success: boolean; countries: CountryData[] }>('/admin/countries');
    return data.countries || [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

// Get country name by ID
export async function getCountryNameById(id: number): Promise<string> {
  if (!id) return '';
  try {
    const data = await apiFetch<{ success: boolean; countries: CountryData[] }>('/admin/countries');
    const country = (data.countries || []).find(c => c.region_id === id);
    return country?.name || '';
  } catch (error) {
    console.error('Error fetching country name:', error);
    return '';
  }
}

// Re-export for backward compatibility
export { getCountriesByContinent, specialCases };
