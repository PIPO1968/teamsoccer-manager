
import { useState } from "react";
import { apiPost } from "@/services/apiClient";


type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string | number;
  teamName: string;
  agreedToTerms: boolean;
};

type RegisterFormErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  teamName?: string;
  agreedToTerms?: string;
  general?: string;
};

export const useRegisterForm = (onSuccess: () => void) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: 2, // Default to England (region_id = 2)
    teamName: "",
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: RegisterFormErrors = {};
    let isValid = true;

    if (!formData.username?.trim()) {
      newErrors.username = "Manager name is required";
      isValid = false;
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    if (!formData.teamName?.trim()) {
      newErrors.teamName = "Team name is required";
      isValid = false;
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the terms";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      await apiPost<
        { success: boolean; userId: number; managerId: number; teamId: number; status: string },
        {
          email: string;
          password: string;
          username: string;
          country: string | number;
          teamName: string;
        }
      >("/register", {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        country: formData.country,
        teamName: formData.teamName,
      });

      setLoading(false);
      onSuccess();
    } catch (error: any) {
      setErrors({ general: error.message || "Registration failed" });
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    loading,
    handleSubmit
  };
};
