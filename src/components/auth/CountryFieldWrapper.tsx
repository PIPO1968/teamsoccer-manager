
import { CountrySelect } from "./CountrySelect";

interface CountryFieldWrapperProps {
  value: string | number;
  onChange: (value: string | number) => void;
  countries?: Record<string, string[]>;
  useCountryIds: boolean;
  isDetectingCountry: boolean;
  countryAutoDetected: boolean;
}

export function CountryFieldWrapper({
  value,
  onChange,
  countries,
  useCountryIds,
  isDetectingCountry,
  countryAutoDetected
}: CountryFieldWrapperProps) {
  return (
    <div className="grid gap-2">
      <div className="grid gap-2">
        <label htmlFor="country" className="flex items-center gap-2">
          League (Country)
          {isDetectingCountry && (
            <span className="text-xs text-gray-500">(detecting your location...)</span>
          )}
          {countryAutoDetected && (
            <span className="text-xs text-green-600">(auto-detected)</span>
          )}
        </label>
        <CountrySelect
          value={value}
          onChange={onChange}
          countries={countries}
          useIds={useCountryIds}
          disabled={false}
        />
      </div>
    </div>
  );
}
