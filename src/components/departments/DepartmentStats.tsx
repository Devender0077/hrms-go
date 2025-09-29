import React from 'react';
import { Card, CardBody, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface DepartmentStatsProps {
  stats: {
    total: number;
    totalEmployees: number;
    totalBranches: number;
  };
  loading: boolean;
}

const DepartmentStats: React.FC<DepartmentStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <Spinner size="sm" />
              <div className="h-10 w-24 bg-content3 rounded animate-pulse"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Total Departments</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Icon icon="lucide:building" className="text-primary-600 text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Total Employees</p>
                <p className="text-2xl font-bold text-success-600">
                  {stats.totalEmployees}
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Icon icon="lucide:users" className="text-success-600 text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Branches</p>
                <p className="text-2xl font-bold text-secondary-600">
                  {stats.totalBranches}
                </p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Icon icon="lucide:map-pin" className="text-secondary-600 text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default DepartmentStats;
