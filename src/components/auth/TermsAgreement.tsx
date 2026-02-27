
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAgreementProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export function TermsAgreement({ checked, onCheckedChange, error }: TermsAgreementProps) {
  return (
    <>
      <div className="flex items-center space-x-2 mt-2">
        <Checkbox 
          id="terms" 
          checked={checked}
          onCheckedChange={(checked) => onCheckedChange(checked === true)}
        />
        <label
          htmlFor="terms"
          className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            error ? "text-red-500" : ""
          }`}
        >
          I agree to the terms of service and privacy policy
        </label>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </>
  );
}
