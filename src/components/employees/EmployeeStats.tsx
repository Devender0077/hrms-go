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
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Active",
      value: stats.active,
      icon: "lucide:user-check",
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: "On Leave",
      value: stats.onLeave,
      icon: "lucide:user-x",
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600"
    },
    {
      title: "Departments",
      value: stats.departments,
      icon: "lucide:building",
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-full`}>
                  <Icon icon={stat.icon} className={`${stat.textColor} text-xl`} />
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
