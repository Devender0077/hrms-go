import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { EmployeeStats as Stats } from "../../types/employee";

interface EmployeeStatsProps {
  stats: Stats;
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Employees",
      value: stats.total,
      icon: "lucide:users",
      color: "blue",
      bgColor: "bg-primary-100 dark:bg-primary-900/30",
      textColor: "text-primary-600 dark:text-primary-400"
    },
    {
      title: "Active",
      value: stats.active,
      icon: "lucide:user-check",
      color: "green",
      bgColor: "bg-success-100 dark:bg-success-900/30",
      textColor: "text-success-600 dark:text-success-400"
    },
    {
      title: "On Leave",
      value: stats.onLeave,
      icon: "lucide:user-x",
      color: "yellow",
      bgColor: "bg-warning-100 dark:bg-warning-900/30",
      textColor: "text-warning-600 dark:text-warning-400"
    },
    {
      title: "Departments",
      value: stats.departments,
      icon: "lucide:building",
      color: "purple",
      bgColor: "bg-secondary-100 dark:bg-secondary-900/30",
      textColor: "text-secondary-600 dark:text-secondary-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardBody className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-default-500 dark:text-default-400 truncate">{stat.title}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${stat.textColor} mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 ${stat.bgColor} rounded-full flex-shrink-0`}>
                  <Icon icon={stat.icon} className={`${stat.textColor} text-lg sm:text-xl`} />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default EmployeeStats;
