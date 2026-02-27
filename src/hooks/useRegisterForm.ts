
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";


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
      // Registro con Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            country: formData.country,
            teamName: formData.teamName
          }
        }
      });
      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      // Obtener el user_id del usuario recién creado
      const user_id = data?.user?.id;
      if (!user_id) {
        setErrors({ general: "No se pudo obtener el user_id de Supabase Auth." });
        setLoading(false);
        return;
      }

      // Crear usuario en tabla users (opcional)
      const { error: userError } = await supabase.from('users').insert({
        email: formData.email,
        password: formData.password,
        username: formData.username
      });
      if (userError) {
        setErrors({ general: userError.message });
        setLoading(false);
        return;
      }

      // Lógica para admin y status
      const adminEmails = ["PIPO68", "pipo68@example.com", "pipocanarias@hotmail.com"];
      const isAdmin = adminEmails.includes(formData.username) || adminEmails.includes(formData.email);
      const managerStatus = isAdmin ? "active" : "waiting_list";
      const is_admin = isAdmin ? 10 : 0;

      // Crear manager con user_id
      const { error: managerError } = await supabase.from('managers').insert({
        user_id,
        username: formData.username,
        email: formData.email,
        country_id: typeof formData.country === 'number' ? formData.country : null,
        is_admin: is_admin,
        status: managerStatus
      });
      if (managerError) {
        setErrors({ general: managerError.message });
        setLoading(false);
        return;
      }

      // Crear equipo asociado
      const { error: teamError } = await supabase.from('teams').insert({
        name: formData.teamName,
        manager_id: user_id,
        country_id: typeof formData.country === 'number' ? formData.country : null
      });
      if (teamError) {
        setErrors({ general: teamError.message });
        setLoading(false);
        return;
      }

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
