import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface ReportHeaderProps {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  onExport?: () => void;
  onRefresh?: () => void;
  isExporting?: boolean;
  isRefreshing?: boolean;
}

export default function ReportHeader({
  title,
  description,
  icon,
  iconColor,
  onExport,
  onRefresh,
  isExporting = false,
  isRefreshing = false
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-gradient-to-br ${iconColor} rounded-xl`}>
          <Icon icon={icon} className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex gap-3">
        {onRefresh && (
          <Button 
            color="primary" 
            variant="flat"
            startContent={<Icon icon="lucide:refresh-cw" />} 
            onPress={onRefresh}
            isLoading={isRefreshing}
            className="font-medium"
          >
            Refresh
          </Button>
        )}
        {onExport && (
          <Button 
            variant="flat" 
            startContent={<Icon icon="lucide:download" />}
            onPress={onExport}
            isLoading={isExporting}
            className="font-medium"
          >
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
