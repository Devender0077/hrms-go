import React from "react";
    import { Card, CardBody } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    
    interface DashboardCardProps {
      title: string;
      value: number | string;
      icon: string;
      color: "primary" | "secondary" | "success" | "warning" | "danger" | "default";
      change?: number;
      changeText?: string;
      delay?: number;
    }
    
    const DashboardCard: React.FC<DashboardCardProps> = ({
      title,
      value,
      icon,
      color,
      change = 0,
      changeText = "",
      delay = 0
    }) => {
      const MotionCard = motion(Card);
      
      return (
        <MotionCard 
          className="shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay }}
        >
          <CardBody className="flex justify-between items-center">
            <div>
              <p className="text-default-500 text-sm">{title}</p>
              <h3 className="text-3xl font-semibold mt-1">{value}</h3>
              {change !== 0 && (
                <div className="flex items-center mt-2 text-xs">
                  <div className={`flex items-center ${change > 0 ? 'text-success' : 'text-danger'}`}>
                    <Icon 
                      icon={change > 0 ? "lucide:trending-up" : "lucide:trending-down"} 
                      className="mr-1" 
                    />
                    <span>{Math.abs(change)}%</span>
                  </div>
                  {changeText && <span className="text-default-400 ml-1">{changeText}</span>}
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-full bg-${color}/10 flex items-center justify-center`}>
              <Icon icon={icon} className={`text-2xl text-${color}`} />
            </div>
          </CardBody>
        </MotionCard>
      );
    };
    
    export default DashboardCard;
