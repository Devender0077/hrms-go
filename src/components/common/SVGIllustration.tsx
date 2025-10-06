import React, { useState, useEffect } from 'react';

interface SVGIllustrationProps {
  src: string;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export const SVGIllustration: React.FC<SVGIllustrationProps> = ({
  src,
  className = '',
  primaryColor = '#3b82f6',
  secondaryColor = '#1e40af',
  accentColor = '#60a5fa'
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use a direct fetch approach with the public path
        const response = await fetch(`/assets/illustrations/${src}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.statusText}`);
        }
        
        let svgText = await response.text();
        
        // Apply color theming to the SVG
        svgText = applyColorTheming(svgText, primaryColor, secondaryColor, accentColor);
        
        // Add CSS classes for dynamic color updates
        svgText = svgText.replace('<svg', '<svg class="dynamic-svg"');
        
        setSvgContent(svgText);
      } catch (err) {
        console.error('Error loading SVG:', err);
        setError(err instanceof Error ? err.message : 'Failed to load illustration');
        
        // Fallback to a simple placeholder
        setSvgContent(`
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" rx="20" fill="${primaryColor}" fill-opacity="0.1"/>
            <circle cx="100" cy="80" r="30" fill="${primaryColor}" fill-opacity="0.3"/>
            <rect x="70" y="120" width="60" height="40" rx="10" fill="${primaryColor}" fill-opacity="0.3"/>
            <text x="100" y="180" text-anchor="middle" fill="${primaryColor}" font-family="Arial" font-size="12">Illustration</text>
          </svg>
        `);
      } finally {
        setLoading(false);
      }
    };

    loadSVG();
  }, [src, primaryColor, secondaryColor, accentColor]);

  const applyColorTheming = (svgText: string, primary: string, secondary: string, accent: string): string => {
    // Comprehensive color replacement for SVG theming
    // Replace common blue color variations with theme colors
    
    // Primary color variations
    const primaryVariations = [
      '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#1e293b',
      '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff', '#f0f9ff'
    ];
    
    // Secondary color variations  
    const secondaryVariations = [
      '#64748b', '#475569', '#334155', '#1e293b', '#0f172a',
      '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc'
    ];
    
    // Accent color variations
    const accentVariations = [
      '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
      '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f3f0ff'
    ];
    
    // Replace primary colors
    primaryVariations.forEach(color => {
      svgText = svgText.replace(new RegExp(color, 'g'), primary);
      svgText = svgText.replace(new RegExp(`fill="${color}"`, 'g'), `fill="${primary}"`);
      svgText = svgText.replace(new RegExp(`stroke="${color}"`, 'g'), `stroke="${primary}"`);
      svgText = svgText.replace(new RegExp(`fill:${color}`, 'g'), `fill:${primary}`);
      svgText = svgText.replace(new RegExp(`stroke:${color}`, 'g'), `stroke:${primary}`);
    });
    
    // Replace secondary colors
    secondaryVariations.forEach(color => {
      svgText = svgText.replace(new RegExp(color, 'g'), secondary);
      svgText = svgText.replace(new RegExp(`fill="${color}"`, 'g'), `fill="${secondary}"`);
      svgText = svgText.replace(new RegExp(`stroke="${color}"`, 'g'), `stroke="${secondary}"`);
      svgText = svgText.replace(new RegExp(`fill:${color}`, 'g'), `fill:${secondary}`);
      svgText = svgText.replace(new RegExp(`stroke:${color}`, 'g'), `stroke:${secondary}`);
    });
    
    // Replace accent colors
    accentVariations.forEach(color => {
      svgText = svgText.replace(new RegExp(color, 'g'), accent);
      svgText = svgText.replace(new RegExp(`fill="${color}"`, 'g'), `fill="${accent}"`);
      svgText = svgText.replace(new RegExp(`stroke="${color}"`, 'g'), `stroke="${accent}"`);
      svgText = svgText.replace(new RegExp(`fill:${color}`, 'g'), `fill:${accent}`);
      svgText = svgText.replace(new RegExp(`stroke:${color}`, 'g'), `stroke:${accent}`);
    });
    
    // Handle common patterns in undraw-style illustrations
    // Replace any remaining blue-ish colors with primary
    svgText = svgText.replace(/#0066cc/gi, primary);
    svgText = svgText.replace(/#0066ff/gi, primary);
    svgText = svgText.replace(/#0099ff/gi, primary);
    svgText = svgText.replace(/#00aaff/gi, primary);
    
    // Replace gray colors with secondary
    svgText = svgText.replace(/#666666/gi, secondary);
    svgText = svgText.replace(/#777777/gi, secondary);
    svgText = svgText.replace(/#888888/gi, secondary);
    svgText = svgText.replace(/#999999/gi, secondary);
    
    // Replace purple/violet colors with accent
    svgText = svgText.replace(/#6633cc/gi, accent);
    svgText = svgText.replace(/#6633ff/gi, accent);
    svgText = svgText.replace(/#9966ff/gi, accent);
    
    return svgText;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
      </div>
    );
  }

  if (error) {
    console.warn('SVG Error:', error, 'Using fallback illustration');
  }

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ 
        width: '100%',
        height: '100%',
        minHeight: '250px',
        maxHeight: '350px'
      }}
    >
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          maxWidth: '300px',
          maxHeight: '300px'
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

export default SVGIllustration;