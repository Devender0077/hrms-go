import React from "react";
    import { motion } from "framer-motion";
    
    interface GlassyCardProps {
      children: React.ReactNode;
      className?: string;
      hoverEffect?: boolean;
      glowColor?: string;
      onClick?: () => void;
    }
    
    export default function GlassyCard({
      children,
      className = "",
      hoverEffect = true,
      glowColor = "rgba(99, 102, 241, 0.4)", // Default primary color glow
      onClick
    }: GlassyCardProps) {
      return (
        <motion.div
          className={`relative overflow-hidden rounded-xl border border-background/20 bg-card/10 p-6 backdrop-blur-md ${className}`}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          whileHover={hoverEffect ? { scale: 1.02, y: -5 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          onClick={onClick}
          style={{
            boxShadow: `0 4px 20px ${glowColor}`,
          }}
        >
          {/* Glow effect */}
          <div
            className="absolute -inset-0.5 rounded-xl opacity-30"
            style={{
              background: `radial-gradient(circle at top left, ${glowColor}, transparent 50%)`,
              zIndex: -1,
            }}
          />
          
          {/* Content */}
          {children}
        </motion.div>
      );
    }