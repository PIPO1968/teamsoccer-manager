
// import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from "@/services/apiClient";
import { CountryData } from "./types";

/**
 * Fetch all countries from the database
 * @returns Promise with array of country data
 */
export async function fetchAllCountries(): Promise<CountryData[]> {
  try {
    const data = await apiFetch<{ success: boolean; countries: CountryData[] }>('/admin/countries');
    return data.countries || [];
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
    const data = await apiFetch<{ success: boolean; countries: CountryData[] }>('/admin/countries');
    const country = (data.countries || []).find(c => c.region_id === id);
    return country?.name || '';
  } catch (error) {
    console.error('Error fetching country name:', error);
    return '';
  }
}
