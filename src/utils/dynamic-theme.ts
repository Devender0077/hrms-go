/**
 * Dynamic Theme Utility
 * Handles real-time theme updates from settings
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export class DynamicThemeManager {
  private static instance: DynamicThemeManager;
  private styleElement: HTMLStyleElement | null = null;

  private constructor() {
    this.createStyleElement();
  }

  public static getInstance(): DynamicThemeManager {
    if (!DynamicThemeManager.instance) {
      DynamicThemeManager.instance = new DynamicThemeManager();
    }
    return DynamicThemeManager.instance;
  }

  private createStyleElement(): void {
    if (typeof document === 'undefined') return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'dynamic-theme-styles';
    this.styleElement.type = 'text/css';
    document.head.appendChild(this.styleElement);
  }

  public updateColors(colors: ThemeColors): void {
    if (!this.styleElement) return;

    const css = this.generateColorCSS(colors);
    this.styleElement.textContent = css;
    
    // Update CSS custom properties
    this.updateCSSVariables(colors);
  }

  private generateColorCSS(colors: ThemeColors): string {
    return `
      /* Dynamic Primary Color */
      .btn-primary,
      .btn-primary:hover,
      .btn-primary:focus,
      .btn-primary:active {
        background-color: ${colors.primary} !important;
        border-color: ${colors.primary} !important;
        color: white !important;
      }

      /* Dynamic Secondary Color */
      .btn-secondary,
      .btn-secondary:hover,
      .btn-secondary:focus,
      .btn-secondary:active {
        background-color: ${colors.secondary} !important;
        border-color: ${colors.secondary} !important;
        color: white !important;
      }

      /* Dynamic Accent Color */
      .btn-accent,
      .btn-accent:hover,
      .btn-accent:focus,
      .btn-accent:active {
        background-color: ${colors.accent} !important;
        border-color: ${colors.accent} !important;
        color: white !important;
      }

      /* HeroUI Button Overrides */
      [data-slot="base"].bg-primary {
        background-color: ${colors.primary} !important;
      }

      [data-slot="base"].bg-secondary {
        background-color: ${colors.secondary} !important;
      }

      /* SVG Color Overrides */
      .svg-primary {
        fill: ${colors.primary} !important;
      }

      .svg-secondary {
        fill: ${colors.secondary} !important;
      }

      .svg-accent {
        fill: ${colors.accent} !important;
      }

      /* Dynamic SVG Color Updates */
      .dynamic-svg [fill="#3b82f6"],
      .dynamic-svg [fill="#1e40af"],
      .dynamic-svg [fill="#60a5fa"],
      .dynamic-svg [fill="currentColor"] {
        fill: ${colors.primary} !important;
      }

      .dynamic-svg [stroke="#3b82f6"],
      .dynamic-svg [stroke="#1e40af"],
      .dynamic-svg [stroke="#60a5fa"],
      .dynamic-svg [stroke="currentColor"] {
        stroke: ${colors.primary} !important;
      }

      /* Gradient Overrides */
      .bg-gradient-primary {
        background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}) !important;
      }

      /* Border Overrides */
      .border-primary {
        border-color: ${colors.primary} !important;
      }

      .border-secondary {
        border-color: ${colors.secondary} !important;
      }

      /* Text Color Overrides */
      .text-primary {
        color: ${colors.primary} !important;
      }

      .text-secondary {
        color: ${colors.secondary} !important;
      }

      /* Focus Ring Overrides */
      .focus\\:ring-primary:focus {
        --tw-ring-color: ${colors.primary} !important;
      }
    `;
  }

  private updateCSSVariables(colors: ThemeColors): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--dynamic-primary', colors.primary);
    root.style.setProperty('--dynamic-secondary', colors.secondary);
    root.style.setProperty('--dynamic-accent', colors.accent);
  }

  public applyMaintenanceMode(isEnabled: boolean): void {
    if (typeof document === 'undefined') return;

    const existingOverlay = document.getElementById('maintenance-overlay');
    
    if (isEnabled) {
      if (!existingOverlay) {
        const overlay = document.createElement('div');
        overlay.id = 'maintenance-overlay';
        overlay.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'Inter', sans-serif;
          ">
            <div style="
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 1rem;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              max-width: 500px;
              margin: 2rem;
            ">
              <div style="
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.8;
              ">🔧</div>
              <h1 style="
                font-size: 2rem;
                font-weight: 600;
                margin-bottom: 1rem;
                color: white;
              ">Site Under Maintenance</h1>
              <p style="
                font-size: 1.1rem;
                opacity: 0.8;
                line-height: 1.6;
                margin-bottom: 2rem;
              ">
                We're currently performing scheduled maintenance to improve your experience. 
                Please check back shortly.
              </p>
              <div style="
                display: inline-block;
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              "></div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
      }
    } else {
      if (existingOverlay) {
        existingOverlay.remove();
      }
    }
  }

  public applyDebugMode(isEnabled: boolean): void {
    if (typeof document === 'undefined') return;

    const body = document.body;
    
    if (isEnabled) {
      body.classList.add('debug-mode');
      
      // Add debug styles
      if (!document.getElementById('debug-styles')) {
        const debugStyles = document.createElement('style');
        debugStyles.id = 'debug-styles';
        debugStyles.textContent = `
          .debug-mode * {
            outline: 1px solid rgba(255, 0, 0, 0.2) !important;
          }
          
          .debug-mode::before {
            content: "DEBUG MODE";
            position: fixed;
            top: 10px;
            right: 10px;
            background: red;
            color: white;
            padding: 5px 10px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            border-radius: 4px;
          }
          
          .debug-info {
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            font-size: 12px;
            border-radius: 4px;
            z-index: 10000;
            max-width: 300px;
          }
        `;
        document.head.appendChild(debugStyles);
      }

      // Add debug info panel
      if (!document.getElementById('debug-info')) {
        const debugInfo = document.createElement('div');
        debugInfo.id = 'debug-info';
        debugInfo.className = 'debug-info';
        debugInfo.innerHTML = `
          <div><strong>Debug Mode Active</strong></div>
          <div>Timestamp: ${new Date().toLocaleTimeString()}</div>
          <div>User Agent: ${navigator.userAgent.substring(0, 50)}...</div>
          <div>Viewport: ${window.innerWidth}x${window.innerHeight}</div>
        `;
        document.body.appendChild(debugInfo);
      }
    } else {
      body.classList.remove('debug-mode');
      
      const debugStyles = document.getElementById('debug-styles');
      if (debugStyles) {
        debugStyles.remove();
      }
      
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) {
        debugInfo.remove();
      }
    }
  }

  public destroy(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    
    // Clean up maintenance mode
    this.applyMaintenanceMode(false);
    
    // Clean up debug mode
    this.applyDebugMode(false);
  }
}

// Export singleton instance
export const dynamicTheme = DynamicThemeManager.getInstance();
