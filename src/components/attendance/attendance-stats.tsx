import React from "react";
    import { Card, CardBody } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    
    interface AttendanceStatsProps {
      stats: {
        totalEmployees: number;
        presentToday: number;
        absentToday: number;
        lateToday: number;
        onLeaveToday: number;
        averageWorkHours: number;
        attendanceRate: number;
      };
    }
    
    const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
      const statItems = [
        {
          title: "Present Today",
          value: stats.presentToday,
          icon: "lucide:check-circle",
          color: "success",
          delay: 0.1
        },
        {
          title: "Absent Today",
          value: stats.absentToday,
          icon: "lucide:x-circle",
          color: "danger",
          delay: 0.2
        },
        {
          title: "Late Today",
          value: stats.lateToday,
          icon: "lucide:clock",
          color: "warning",
          delay: 0.3
        },
        {
          title: "On Leave",
          value: stats.onLeaveToday,
          icon: "lucide:calendar-off",
          color: "secondary",
          delay: 0.4
        },
        {
          title: "Avg. Work Hours",
          value: `${stats.averageWorkHours}h`,
          icon: "lucide:hourglass",
          color: "primary",
          delay: 0.5
        },
        {
          title: "Attendance Rate",
          value: `${stats.attendanceRate}%`,
          icon: "lucide:percent",
          color: "default",
          delay: 0.6
        }
      ];
      
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: item.delay }}
            >
              <Card className="shadow-sm">
                <CardBody className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-${item.color}/10 flex items-center justify-center`}>
                    <Icon icon={item.icon} className={`text-2xl text-${item.color}`} />
                  </div>
                  <div>
                    <p className="text-default-500 text-sm">{item.title}</p>
                    <p className="text-2xl font-semibold">{item.value}</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      );
    };
    
    export default AttendanceStats;
