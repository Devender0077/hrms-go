import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
}

interface ReportStatsProps {
  stats: StatItem[];
}

export default function ReportStats({ stats }: ReportStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div 
          key={index}
          whileHover={{ y: -5 }} 
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-sm">
            <CardBody className="flex flex-row items-center gap-4">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon icon={stat.icon} className={`text-2xl ${stat.color}`} />
              </div>
              <div>
                <p className="text-default-500">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
