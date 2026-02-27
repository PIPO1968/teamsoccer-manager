
import { FormField } from "./FormField";
import { CountryFieldWrapper } from "./CountryFieldWrapper";
import { TermsAgreement } from "./TermsAgreement";

interface RegisterFormFieldsProps {
  formData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    country: string | number;
    teamName: string;
    agreedToTerms: boolean;
  };
  setFormData: (update: (prev: any) => any) => void;
  errors: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    country?: string;
    teamName?: string;
    agreedToTerms?: string;
    general?: string;
  };
  countries?: Record<string, string[]>;
  useCountryIds: boolean;
  isDetectingCountry: boolean;
  countryAutoDetected: boolean;
}

export function RegisterFormFields({
  formData,
  setFormData,
  errors,
  countries,
  useCountryIds,
  isDetectingCountry,
  countryAutoDetected
}: RegisterFormFieldsProps) {
  return (
    <>
      <FormField
        id="username"
        label="Manager Name"
        type="text"
        value={formData.username}
        onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
        error={errors.username}
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
        error={errors.email}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
        error={errors.password}
      />

      <FormField
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
        error={errors.confirmPassword}
      />

      <CountryFieldWrapper
        value={formData.country}
        onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
        countries={countries}
        useCountryIds={useCountryIds}
        isDetectingCountry={isDetectingCountry}
        countryAutoDetected={countryAutoDetected}
      />

      <FormField
        id="teamName"
        label="Team Name"
        type="text"
        value={formData.teamName}
        onChange={(value) => setFormData(prev => ({ ...prev, teamName: value }))}
        error={errors.teamName}
      />

      <TermsAgreement
        checked={formData.agreedToTerms}
        onCheckedChange={(value) => setFormData(prev => ({ ...prev, agreedToTerms: value }))}
        error={errors.agreedToTerms}
      />
    </>
  );
}
