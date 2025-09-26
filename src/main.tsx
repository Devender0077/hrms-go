import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider, ToastProvider } from "@heroui/react"
import { AuthProvider } from "./contexts/auth-context";
import { TaskProvider } from "./contexts/task-context";
import { ThemeProvider } from "./contexts/theme-context";
import App from './App.tsx'
import './index.css'
    
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <HeroUIProvider>
        <AuthProvider>
          <TaskProvider>
            <ToastProvider />
            <App />
          </TaskProvider>
        </AuthProvider>
      </HeroUIProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
