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
                  "50": "#0a0a0a",
                  "100": "#1a1a1a",
                  "200": "#2a2a2a",
                  "300": "#3a3a3a",
                  "400": "#4a4a4a",
                  "500": "#5a5a5a",
                  "600": "#6a6a6a",
                  "700": "#7a7a7a",
                  "800": "#8a8a8a",
                  "900": "#9a9a9a",
                  "DEFAULT": "#1a1a1a",
                  "foreground": "#ffffff"
                },
                foreground: {
                  "50": "#9a9a9a",
                  "100": "#8a8a8a",
                  "200": "#7a7a7a",
                  "300": "#6a6a6a",
                  "400": "#5a5a5a",
                  "500": "#4a4a4a",
                  "600": "#3a3a3a",
                  "700": "#2a2a2a",
                  "800": "#1a1a1a",
                  "900": "#0a0a0a",
                  "DEFAULT": "#ffffff",
                  "foreground": "#1a1a1a"
                }
              },
            },
          },
        }),
      ],
    };
