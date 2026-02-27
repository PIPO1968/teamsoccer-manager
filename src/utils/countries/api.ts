
// import { supabase } from "@/integrations/supabase/client";
import { CountryData } from "./types";

/**
 * Fetch all countries from the database
 * @returns Promise with array of country data
 */
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

/**
 * Get country name by ID
 * @param id The region ID to look up
 * @returns Promise with country name 
 */
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
