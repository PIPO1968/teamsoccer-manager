
// Environment configuration
export const IS_DEVELOPMENT = import.meta.env.VITE_IS_DEVELOPMENT === 'true';

export const environment = {
  isDevelopment: IS_DEVELOPMENT, // Now reads from environment variable
} as const;
