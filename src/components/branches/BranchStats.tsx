import React from 'react';
import { Card, CardBody, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface BranchStatsProps {
  stats: {
    total: number;
    totalEmployees: number;
    totalDepartments: number;
    totalCountries: number;
  };
  loading: boolean;
}

const BranchStats: React.FC<BranchStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <Spinner size="sm" />
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Branches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon icon="lucide:building" className="text-blue-600 text-xl" />
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
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalEmployees}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Icon icon="lucide:users" className="text-green-600 text-xl" />
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
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalDepartments}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Icon icon="lucide:building-2" className="text-purple-600 text-xl" />
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
                <p className="text-sm text-gray-600">Countries</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalCountries}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Icon icon="lucide:globe" className="text-orange-600 text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default BranchStats;
