import React, { useEffect, useRef } from 'react';
import Lottie from 'react-lottie';
import { motion } from 'framer-motion';

interface LottieIllustrationProps {
  animationData: any;
  className?: string;
  height?: number;
  width?: number;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  direction?: 1 | -1;
}

export const LottieIllustration: React.FC<LottieIllustrationProps> = ({
  animationData,
  className = '',
  height = 300,
  width = 400,
  loop = true,
  autoplay = true,
  speed = 1,
  direction = 1,
}) => {
  const lottieRef = useRef<any>(null);

  const defaultOptions = {
    loop,
    autoplay,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  useEffect(() => {
    if (lottieRef.current && direction !== 1) {
      lottieRef.current.setDirection(direction);
    }
  }, [direction]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={`w-full h-full ${className}`}
    >
      <Lottie
        ref={lottieRef}
        options={defaultOptions}
        height={height}
        width={width}
        isStopped={false}
        isPaused={false}
      />
    </motion.div>
  );
};

// Pre-configured Lottie illustrations for common HRMS modules
export const LoginLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.8}
  />
);

export const DashboardLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={1.2}
  />
);

export const EmployeeLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={1}
  />
);

export const RecruitmentLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.9}
  />
);

export const PayrollLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={1.1}
  />
);

export const AttendanceLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.7}
  />
);

export const LeaveLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.8}
  />
);

export const SettingsLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.6}
  />
);

export const TaskLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={1.3}
  />
);

export const AssetLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.9}
  />
);

export const ReportLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={1}
  />
);

export const GoalLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={1.1}
  />
);

export const ExpenseLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.8}
  />
);

export const InterviewLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.9}
  />
);

export const PerformanceLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={1.0}
  />
);

export const UsersLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.9}
  />
);

export const AuditLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.8}
  />
);

export const RolesLottieIllustration: React.FC<{ animationData: any; className?: string }> = ({ 
  animationData, 
  className = '' 
}) => (
  <LottieIllustration
    animationData={animationData}
    className={`w-full h-64 md:h-80 ${className}`}
    height={320}
    width={400}
    speed={0.9}
  />
);

// Default export
export default LottieIllustration;
