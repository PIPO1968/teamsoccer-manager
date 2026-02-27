
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        '16': 'repeat(16, minmax(0, 1fr))',
        '20': 'repeat(20, minmax(0, 1fr))',
        '24': 'repeat(24, minmax(0, 1fr))',
        '30': 'repeat(30, minmax(0, 1fr))',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        pitch: {
          DEFAULT: '#1E3A8A',
          light: '#2563EB',
          dark: '#1E40AF',
          lines: '#FFFFFF',
        },
        team: {
          primary: '#1A2B4C',
          secondary: '#3498DB',
          accent: '#0EA5E9',
        },
        stadium: {
          stands: '#E2E8F0',
          seats: '#CBD5E1',
        },
        teamsoccer: {
          green: {
            DEFAULT: '#2E7D32', // Main green color used in teamsoccer
            dark: '#1B5E20',    // Darker green for headers
            light: '#43A047',   // Lighter green for accents
          },
          beige: '#F5F5DC',     // Background color similar to teamsoccer
          yellow: '#FFC107',    // For notifications and highlights
          gray: '#E0E0E0',      // For secondary backgrounds
          border: '#BDBDBD',    // For borders
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      backgroundImage: {
        'teamsoccer-pattern': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMkU3RDMyIiBvcGFjaXR5PSIwLjEiLz48cGF0aCBkPSJNMzAgMEM0Ni41NyAwIDYwIDEzLjQzIDYwIDMwQzYwIDQ2LjU3IDQ2LjU3IDYwIDMwIDYwQzEzLjQzIDYwIDAgNDYuNTcgMCAzMEMwIDEzLjQzIDEzLjQzIDAgMzAgMFoiIGZpbGw9IiMyRTdEMzIiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjxwYXRoIGQ9Ik0xNSA1QzIzLjI4NDMgNSAzMCAxMS43MTU3IDMwIDIwQzMwIDI4LjI4NDMgMjMuMjg0MyAzNSAxNSAzNUM2LjcxNTczIDM1IDAgMjguMjg0MyAwIDIwQzAgMTEuNzE1NyA2LjcxNTczIDUgMTUgNVoiIGZpbGw9IiMxQjVFMjAiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjxjaXJjbGUgY3g9IjQ1IiBjeT0iNDUiIHI9IjEwIiBmaWxsPSIjNDNBMDQ3IiBmaWxsLW9wYWNpdHk9IjAuMDQiLz48L3N2Zz4=')"
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
