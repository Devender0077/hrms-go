import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider, ToastProvider } from "@heroui/react"
import { AuthProvider } from "./contexts/auth-context";
import { TaskProvider } from "./contexts/task-context";
import { ThemeProvider } from "./contexts/theme-context";
import { SettingsProvider } from "./contexts/settings-context";
import { TranslationProvider } from "./contexts/translation-context";
import { PusherProvider } from "./contexts/pusher-context";
import './i18n/config'; // Initialize i18next
import App from './App.tsx'
import './index.css'
    
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <HeroUIProvider>
        <TranslationProvider>
          <AuthProvider>
            <SettingsProvider>
              <PusherProvider>
                <TaskProvider>
                  <ToastProvider />
                  <App />
                </TaskProvider>
              </PusherProvider>
            </SettingsProvider>
          </AuthProvider>
        </TranslationProvider>
      </HeroUIProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
