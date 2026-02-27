
import { useState, useEffect } from "react";
import { fetchAllCountries } from "@/utils/countries";
import { detectUserCountry } from "@/services/ipGeolocation";

// Mapping for detected country names to database country names
const countryMappings: Record<string, string> = {
  'United Kingdom': 'England',
  'UK': 'England',
  'Great Britain': 'England',
  'United States': 'USA',
  'United States of America': 'USA',
  'US': 'USA',
  'People\'s Republic of China': 'People\'s Republic of China',
  'China': 'People\'s Republic of China',
  // Add more mappings as needed
};

interface UseCountryAutoDetectionProps {
  useCountryIds: boolean;
  currentCountry: string | number;
  setFormData: (update: (prev: any) => any) => void;
}

export const useCountryAutoDetection = ({ 
  useCountryIds, 
  currentCountry, 
  setFormData 
}: UseCountryAutoDetectionProps) => {
  const [allCountries, setAllCountries] = useState<Array<{region_id: number, name: string}>>([]);
  const [isDetectingCountry, setIsDetectingCountry] = useState(false);
  const [countryAutoDetected, setCountryAutoDetected] = useState(false);

  useEffect(() => {
    if (useCountryIds) {
      fetchAllCountries().then(countries => {
        console.log('📋 Fetched countries from database:', countries.length, 'countries');
        setAllCountries(countries);
      });
    }
  }, [useCountryIds]);

  // Auto-detect user's country on component mount
  useEffect(() => {
    const autoDetectCountry = async () => {
      console.log('🔍 Auto-detect check - useCountryIds:', useCountryIds, 'allCountries.length:', allCountries.length);
      if (!useCountryIds || allCountries.length === 0) return;
      
      console.log('🚀 Starting country auto-detection...');
      setIsDetectingCountry(true);
      try {
        const detectedCountryName = await detectUserCountry();
        console.log('🎯 Detected country name:', detectedCountryName);
        
        if (detectedCountryName) {
          console.log('🔍 Searching for country in database...');
          console.log('📋 Available countries:', allCountries.map(c => c.name));
          
          // First check if we have a direct mapping for the detected country
          const mappedCountryName = countryMappings[detectedCountryName] || detectedCountryName;
          console.log('🗺️ Mapped country name:', mappedCountryName);
          
          // Find the country in our database by name
          const matchedCountry = allCountries.find(country => {
            const countryNameLower = country.name.toLowerCase();
            const mappedNameLower = mappedCountryName.toLowerCase();
            
            const exactMatch = countryNameLower === mappedNameLower;
            const countryContainsDetected = countryNameLower.includes(mappedNameLower);
            const detectedContainsCountry = mappedNameLower.includes(countryNameLower);
            
            console.log(`🔍 Checking "${country.name}" vs "${mappedCountryName}":`, {
              exactMatch,
              countryContainsDetected,
              detectedContainsCountry
            });
            
            return exactMatch || countryContainsDetected || detectedContainsCountry;
          });
          
          if (matchedCountry) {
            console.log('✅ Found matching country:', matchedCountry);
            console.log('🔄 Current form country before update:', currentCountry);
            setFormData(prev => ({ ...prev, country: matchedCountry.region_id }));
            setCountryAutoDetected(true);
            console.log('✅ Updated form country to:', matchedCountry.region_id, `(${matchedCountry.name})`);
          } else {
            console.log(`❌ Detected country "${detectedCountryName}" (mapped to "${mappedCountryName}") not found in database`);
            console.log('📋 Available countries list:', allCountries.map(c => `${c.region_id}: ${c.name}`));
          }
        }
      } catch (error) {
        console.error('❌ Failed to auto-detect country:', error);
      } finally {
        setIsDetectingCountry(false);
        console.log('🏁 Country detection process completed');
      }
    };

    // Only run auto-detection if we have countries data and haven't manually selected a country yet
    console.log('🔍 Auto-detect trigger check - allCountries.length:', allCountries.length, 'currentCountry:', currentCountry);
    if (allCountries.length > 0 && currentCountry === 2) { // 2 is the default (Spain)
      console.log('✅ Conditions met, starting auto-detection...');
      autoDetectCountry();
    } else {
      console.log('❌ Auto-detection conditions not met');
    }
  }, [allCountries, useCountryIds, currentCountry, setFormData]);

  return {
    allCountries,
    isDetectingCountry,
    countryAutoDetected
  };
};
