import { heroui } from "@heroui/react";
    
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
      ],
      darkMode: "class",
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
                background: "#ffffff",
                foreground: "#11181C",
                content1: "#ffffff",
                content2: "#f4f4f5",
                content3: "#e4e4e7",
                content4: "#d4d4d8",
                default: {
                  "50": "#fafafa",
                  "100": "#f4f4f5",
                  "200": "#e4e4e7",
                  "300": "#d4d4d8",
                  "400": "#a1a1aa",
                  "500": "#71717a",
                  "600": "#52525b",
                  "700": "#3f3f46",
                  "800": "#27272a",
                  "900": "#18181b",
                  "DEFAULT": "#71717a",
                  "foreground": "#ffffff"
                },
                divider: "#e4e4e7",
                focus: "#006FEE",
                overlay: "rgba(0, 0, 0, 0.5)",
                success: {
                  "50": "#f0fdf4",
                  "100": "#dcfce7",
                  "200": "#bbf7d0",
                  "300": "#86efac",
                  "400": "#4ade80",
                  "500": "#22c55e",
                  "600": "#16a34a",
                  "700": "#15803d",
                  "800": "#166534",
                  "900": "#14532d",
                  "DEFAULT": "#22c55e",
                  "foreground": "#ffffff"
                },
                warning: {
                  "50": "#fffbeb",
                  "100": "#fef3c7",
                  "200": "#fde68a",
                  "300": "#fcd34d",
                  "400": "#fbbf24",
                  "500": "#f59e0b",
                  "600": "#d97706",
                  "700": "#b45309",
                  "800": "#92400e",
                  "900": "#78350f",
                  "DEFAULT": "#f59e0b",
                  "foreground": "#ffffff"
                },
                danger: {
                  "50": "#fef2f2",
                  "100": "#fee2e2",
                  "200": "#fecaca",
                  "300": "#fca5a5",
                  "400": "#f87171",
                  "500": "#ef4444",
                  "600": "#dc2626",
                  "700": "#b91c1c",
                  "800": "#991b1b",
                  "900": "#7f1d1d",
                  "DEFAULT": "#ef4444",
                  "foreground": "#ffffff"
                }
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
                  "foreground": "#ffffff"
                },
                background: "#000000",
                foreground: "#ECEDEE",
                content1: "#18181b",
                content2: "#27272a",
                content3: "#3f3f46",
                content4: "#52525b",
                default: {
                  "50": "#18181b",
                  "100": "#27272a",
                  "200": "#3f3f46",
                  "300": "#52525b",
                  "400": "#71717a",
                  "500": "#a1a1aa",
                  "600": "#d4d4d8",
                  "700": "#e4e4e7",
                  "800": "#f4f4f5",
                  "900": "#fafafa",
                  "DEFAULT": "#3f3f46",
                  "foreground": "#ECEDEE"
                },
                divider: "#3f3f46",
                focus: "#006FEE",
                overlay: "rgba(0, 0, 0, 0.8)",
                success: {
                  "50": "#14532d",
                  "100": "#166534",
                  "200": "#15803d",
                  "300": "#16a34a",
                  "400": "#22c55e",
                  "500": "#4ade80",
                  "600": "#86efac",
                  "700": "#bbf7d0",
                  "800": "#dcfce7",
                  "900": "#f0fdf4",
                  "DEFAULT": "#22c55e",
                  "foreground": "#ffffff"
                },
                warning: {
                  "50": "#78350f",
                  "100": "#92400e",
                  "200": "#b45309",
                  "300": "#d97706",
                  "400": "#f59e0b",
                  "500": "#fbbf24",
                  "600": "#fcd34d",
                  "700": "#fde68a",
                  "800": "#fef3c7",
                  "900": "#fffbeb",
                  "DEFAULT": "#f59e0b",
                  "foreground": "#ffffff"
                },
                danger: {
                  "50": "#7f1d1d",
                  "100": "#991b1b",
                  "200": "#b91c1c",
                  "300": "#dc2626",
                  "400": "#ef4444",
                  "500": "#f87171",
                  "600": "#fca5a5",
                  "700": "#fecaca",
                  "800": "#fee2e2",
                  "900": "#fef2f2",
                  "DEFAULT": "#ef4444",
                  "foreground": "#ffffff"
                }
              },
            },
          },
        }),
      ],
    };
