
import { useEffect, useState } from "react";
import { Flag } from "@/components/ui/flag";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator
} from "@/components/ui/select";
import { getCountriesByContinent, fetchAllCountries, localizeCountryName } from "@/utils/countries";
import { useLanguage } from "@/contexts/LanguageContext";

interface CountrySelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  useIds?: boolean;
  countries?: Record<string, string[]>; // Optional to allow override
  disabled?: boolean;
}

export function CountrySelect({ value, onChange, useIds = false, countries, disabled = false }: CountrySelectProps) {
  const { language } = useLanguage();
  // States for the countries data
  const [countryGroups, setCountryGroups] = useState<Record<string, string[]>>(countries || {});
  const [allCountries, setAllCountries] = useState<{ region_id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [usingFallback, setUsingFallback] = useState(false);

  // Fallback: lista local de países (solo nombres, sin IDs)
  const localCountryGroups = getCountriesByContinent();
  const localCountriesList = Object.values(localCountryGroups).flat().map((name, idx) => ({ region_id: idx + 1000, name }));

  // Fetch countries from database si es necesario
  useEffect(() => {
    if (useIds) {
      setLoading(true);
      fetchAllCountries().then(data => {
        if (data && data.length > 0) {
          setAllCountries(data);
          setUsingFallback(false);
          // Agrupar por inicial
          const grouped: Record<string, string[]> = data.reduce((acc, country) => {
            const firstLetter = country.name[0].toUpperCase();
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(country.name);
            return acc;
          }, {} as Record<string, string[]>);
          setCountryGroups(grouped);
        } else {
          // Fallback local si no hay datos
          setAllCountries(localCountriesList);
          setCountryGroups(localCountryGroups);
          setUsingFallback(true);
        }
        setLoading(false);
      }).catch(() => {
        setAllCountries(localCountriesList);
        setCountryGroups(localCountryGroups);
        setUsingFallback(true);
        setLoading(false);
      });
    } else if (Object.keys(countryGroups).length === 0) {
      setCountryGroups(countries || localCountryGroups);
    }
  }, [useIds, countries]);

  // Update selected country name when value or allCountries change
  useEffect(() => {
    if (useIds && typeof value === 'number' && allCountries.length > 0) {
      const country = allCountries.find(c => c.region_id === value);
      if (country) {
        console.log('🔄 CountrySelect: Setting selected country name to:', country.name);
        setSelectedCountryName(country.name);
      }
    } else if (!useIds && typeof value === 'string') {
      setSelectedCountryName(value);
    }
  }, [value, allCountries, useIds]);

  const handleSelectChange = (newValue: string) => {
    if (useIds && !usingFallback) {
      const country = allCountries.find(c => c.name === newValue);
      if (country) {
        onChange(country.region_id);
        setSelectedCountryName(newValue);
      }
    } else {
      // Si estamos usando fallback, pasar el nombre del país como string
      onChange(newValue);
      setSelectedCountryName(newValue);
    }
  };

  // Determine what to display in the trigger
  const displayValue = selectedCountryName || (useIds && typeof value === 'number' ? '...' : value as string);

  return (
    <Select
      value={selectedCountryName || ''}
      onValueChange={handleSelectChange}
      disabled={loading || disabled}
    >
      <SelectTrigger className={`w-full ${disabled ? 'opacity-75 cursor-not-allowed' : ''}`}>
        <SelectValue placeholder="Select your country">
          {displayValue && (
            <div className="flex items-center gap-2">
              <Flag country={displayValue} />
              <span>{localizeCountryName(displayValue, language)}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {loading ? (
          <div className="p-2 text-center">Loading countries...</div>
        ) : (
          Object.entries(countryGroups).map(([groupName, groupCountries]) => (
            <div key={groupName}>
              <SelectGroup>
                <SelectLabel>{groupName}</SelectLabel>
                {groupCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    <div className="flex items-center gap-2">
                      <Flag country={country} />
                      <span>{localizeCountryName(country, language)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
            </div>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
