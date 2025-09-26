import { heroui } from "@heroui/react";
    
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
          },
        },
      },
      plugins: [
        heroui({
          layout: {
            dividerWeight: "1px", 
            disabledOpacity: 0.45, 
            fontSize: {
              tiny: "0.75rem",   // 12px
              small: "0.875rem", // 14px
              medium: "0.9375rem", // 15px
              large: "1.125rem", // 18px
            },
            lineHeight: {
              tiny: "1rem", 
              small: "1.25rem", 
              medium: "1.5rem", 
              large: "1.75rem", 
            },
            radius: {
              small: "6px", 
              medium: "8px", 
              large: "12px", 
            },
            borderWidth: {
              small: "1px", 
              medium: "1px", 
              large: "2px", 
            },
          },
          themes: {
            light: {
              colors: {
                primary: {
                  "50": "#e6f1fe",
                  "100": "#cce3fd",
                  "200": "#99c7fb",
                  "300": "#66aaf9",
                  "400": "#338ef7",
                  "500": "#006FEE",
                  "600": "#005bc4",
                  "700": "#004493",
                  "800": "#002e62",
                  "900": "#001731",
                  "DEFAULT": "#006FEE",
                  "foreground": "#fff"
                },
              },
            },
            dark: {
              colors: {
                primary: {
                  "50": "#001731",
                  "100": "#002e62",
                  "200": "#004493",
                  "300": "#005bc4",
                  "400": "#006FEE",
                  "500": "#338ef7",
                  "600": "#66aaf9",
                  "700": "#99c7fb",
                  "800": "#cce3fd",
                  "900": "#e6f1fe",
                  "DEFAULT": "#006FEE",
                  "foreground": "#fff"
                },
                background: {
                  "50": "#f9fafb",
                  "100": "#f3f4f6",
                  "200": "#e5e7eb",
                  "300": "#d1d5db",
                  "400": "#9ca3af",
                  "500": "#6b7280",
                  "600": "#4b5563",
                  "700": "#374151",
                  "800": "#1f2937",
                  "900": "#111827",
                  "DEFAULT": "#111827",
                  "foreground": "#f9fafb"
                },
                foreground: {
                  "50": "#f9fafb",
                  "100": "#f3f4f6",
                  "200": "#e5e7eb",
                  "300": "#d1d5db",
                  "400": "#9ca3af",
                  "500": "#6b7280",
                  "600": "#4b5563",
                  "700": "#374151",
                  "800": "#1f2937",
                  "900": "#111827",
                  "DEFAULT": "#f9fafb",
                  "foreground": "#111827"
                },
                content: {
                  "1": "#111827",
                  "2": "#1f2937",
                  "3": "#374151",
                  "4": "#4b5563"
                },
                default: {
                  "50": "#f9fafb",
                  "100": "#f3f4f6",
                  "200": "#e5e7eb",
                  "300": "#d1d5db",
                  "400": "#9ca3af",
                  "500": "#6b7280",
                  "600": "#4b5563",
                  "700": "#374151",
                  "800": "#1f2937",
                  "900": "#111827",
                  "DEFAULT": "#1f2937",
                  "foreground": "#f9fafb"
                }
              },
            },
          },
        }),
      ],
    };
