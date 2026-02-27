
// import { supabase } from "@/integrations/supabase/client";
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
    const response = await fetch('/api/countries');
    if (!response.ok) throw new Error('No se pudo obtener países');
    const data = await response.json();
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
    const response = await fetch(`/api/countries/${id}`);
    if (!response.ok) throw new Error('No se pudo obtener el nombre del país');
    const data = await response.json();
    return data.name || '';
  } catch (error) {
    console.error('Error fetching country name:', error);
    return '';
  }
}

// Re-export for backward compatibility
export { getCountriesByContinent, specialCases };
