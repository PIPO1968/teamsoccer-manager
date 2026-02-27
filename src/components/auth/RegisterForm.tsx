
import { Button } from "@/components/ui/button";
import { RegisterFormFields } from "./RegisterFormFields";
import { FormErrorDisplay } from "./FormErrorDisplay";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { useCountryAutoDetection } from "@/hooks/useCountryAutoDetection";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSuccess: () => void;
  countries?: Record<string, string[]>;
  useCountryIds?: boolean;
}

export function RegisterForm({ onSuccess, countries, useCountryIds = true }: RegisterFormProps) {
  const { formData, setFormData, errors, loading, handleSubmit } = useRegisterForm(onSuccess);
  const { toast } = useToast();

  const { isDetectingCountry, countryAutoDetected } = useCountryAutoDetection({
    useCountryIds,
    currentCountry: formData.country,
    setFormData
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
    } catch (error) {
      // Error handling is already done in useRegisterForm
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="grid gap-4">
        <FormErrorDisplay error={errors.general} />

        <RegisterFormFields
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          countries={countries}
          useCountryIds={useCountryIds}
          isDetectingCountry={isDetectingCountry}
          countryAutoDetected={countryAutoDetected}
        />

        <Button
          type="submit"
          disabled={loading || !formData.agreedToTerms}
          className="mt-2"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
