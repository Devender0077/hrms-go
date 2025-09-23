import React from "react";
    import { motion, useMotionValue, useTransform, animate } from "framer-motion";
    
    interface AnimatedCounterProps {
      from: number;
      to: number;
      duration?: number;
      formatValue?: (value: number) => string;
      className?: string;
    }
    
    export default function AnimatedCounter({
      from,
      to,
      duration = 1,
      formatValue = (value) => Math.round(value).toString(),
      className = ""
    }: AnimatedCounterProps) {
      const count = useMotionValue(from);
      const rounded = useTransform(count, (latest) => formatValue(latest));
      
      React.useEffect(() => {
        const animation = animate(count, to, { duration });
        
        return animation.stop;
      }, [count, to, duration]);
      
      return <motion.span className={className}>{rounded}</motion.span>;
    }