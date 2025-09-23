import React from "react";
    
    interface LottieAnimationProps {
      animationData: any;
      width?: number | string;
      height?: number | string;
      loop?: boolean;
      autoplay?: boolean;
      className?: string;
    }
    
    export default function LottieAnimation({
      animationData,
      width = "100%",
      height = "100%",
      loop = true,
      autoplay = true,
      className = ""
    }: LottieAnimationProps) {
      const containerRef = React.useRef<HTMLDivElement>(null);
      const [lottie, setLottie] = React.useState<any>(null);
      
      React.useEffect(() => {
        // Dynamically import lottie-web to reduce initial bundle size
        import("lottie-web").then((Lottie) => {
          if (containerRef.current) {
            const animation = Lottie.default.loadAnimation({
              container: containerRef.current,
              renderer: "svg",
              loop,
              autoplay,
              animationData
            });
            
            setLottie(animation);
          }
        });
        
        return () => {
          // Clean up animation when component unmounts
          if (lottie) {
            lottie.destroy();
          }
        };
      }, [animationData, loop, autoplay]);
      
      return (
        <div 
          ref={containerRef} 
          style={{ width, height }} 
          className={className}
        />
      );
    }