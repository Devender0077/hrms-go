import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Chip, Button, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import DynamicPageTitle from '../components/common/DynamicPageTitle';
import HeroSection from '../components/common/HeroSection';
import { useVersion } from '../contexts/version-context';

interface Version {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  features: string[];
  fixes: string[];
  improvements: string[];
  breaking?: string[];
}


const getVersionTypeColor = (type: string) => {
  switch (type) {
    case 'major': return 'danger';
    case 'minor': return 'warning';
    case 'patch': return 'success';
    default: return 'default';
  }
};

const getVersionTypeIcon = (type: string) => {
  switch (type) {
    case 'major': return 'lucide:zap';
    case 'minor': return 'lucide:plus';
    case 'patch': return 'lucide:bug';
    default: return 'lucide:tag';
  }
};

export default function VersionHistory() {
  const [versionHistory, setVersionHistory] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentVersion, getVersionHistory } = useVersion();

  useEffect(() => {
    // Simulate loading version history
    const loadVersionHistory = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVersionHistory(getVersionHistory());
      setLoading(false);
    };

    loadVersionHistory();
  }, [getVersionHistory]);

  const getTotalChanges = (version: Version) => {
    return version.features.length + version.fixes.length + version.improvements.length;
  };

  const getDaysSinceRelease = (dateString: string) => {
    const releaseDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - releaseDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 dark:text-default-400 mt-4 text-sm sm:text-base">Loading version history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        <DynamicPageTitle pageName="Version History" />
        
        {/* Hero Section */}
        <HeroSection
          title="Version History"
          subtitle="Release Notes & Updates"
          description="Track the evolution of the HRMS system with detailed release notes, feature updates, and bug fixes."
          icon="lucide:git-branch"
          illustration="task"
          actions={[
            {
              label: "Current Version",
              icon: "lucide:tag",
              onPress: () => {},
              variant: "bordered",
              isDisabled: true
            },
            {
              label: "Refresh",
              icon: "lucide:refresh-cw",
              onPress: () => window.location.reload(),
              variant: "bordered"
            }
          ]}
        />

        {/* Current Version Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <Icon icon="lucide:rocket" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Current Version: v{currentVersion}</h3>
                    <p className="text-default-600">Latest release with all the newest features and improvements</p>
                  </div>
                </div>
                <div className="text-right">
                  <Chip color="success" variant="flat" size="lg">
                    <Icon icon="lucide:check-circle" className="w-4 h-4 mr-1" />
                    Active
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Releases",
                value: versionHistory.length,
                icon: "lucide:git-branch",
                color: "blue",
                bgColor: "bg-primary-100 dark:bg-primary-900/30",
                textColor: "text-primary-600 dark:text-primary-400"
              },
              {
                title: "New Features",
                value: versionHistory.reduce((sum, v) => sum + v.features.length, 0),
                icon: "lucide:star",
                color: "green",
                bgColor: "bg-success-100 dark:bg-success-900/30",
                textColor: "text-success-600 dark:text-success-400"
              },
              {
                title: "Bug Fixes",
                value: versionHistory.reduce((sum, v) => sum + v.fixes.length, 0),
                icon: "lucide:bug",
                color: "red",
                bgColor: "bg-danger-100 dark:bg-danger-900/30",
                textColor: "text-danger-600 dark:text-danger-400"
              },
              {
                title: "Improvements",
                value: versionHistory.reduce((sum, v) => sum + v.improvements.length, 0),
                icon: "lucide:trending-up",
                color: "purple",
                bgColor: "bg-secondary-100 dark:bg-secondary-900/30",
                textColor: "text-secondary-600 dark:text-secondary-400"
              }
            ].map((stat, index) => (
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
        </motion.div>

        {/* Version List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {versionHistory.map((version, index) => (
            <motion.div
              key={version.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="shadow-sm border border-default-200 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Chip
                        color={getVersionTypeColor(version.type) as any}
                        variant="flat"
                        startContent={<Icon icon={getVersionTypeIcon(version.type)} className="w-3 h-3" />}
                        size="sm"
                      >
                        {version.type.toUpperCase()}
                      </Chip>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">v{version.version}</h3>
                        <p className="text-sm text-default-500">
                          {version.date} • {getDaysSinceRelease(version.date)} days ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{getTotalChanges(version)} changes</p>
                        <p className="text-xs text-default-500">
                          {version.features.length} features, {version.fixes.length} fixes, {version.improvements.length} improvements
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-default-100 dark:bg-default-800">
                        <Icon icon="lucide:calendar" className="w-4 h-4 text-default-500" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="space-y-4">
                    {/* Features */}
                    {version.features.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon icon="lucide:star" className="w-4 h-4 text-success-500" />
                          <h4 className="font-semibold text-foreground">New Features</h4>
                          <Chip size="sm" color="success" variant="flat">{version.features.length}</Chip>
                        </div>
                        <ul className="space-y-2 ml-6">
                          {version.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-default-600 flex items-start gap-2">
                              <Icon icon="lucide:check" className="w-3 h-3 text-success-500 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bug Fixes */}
                    {version.fixes.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon icon="lucide:bug" className="w-4 h-4 text-danger-500" />
                          <h4 className="font-semibold text-foreground">Bug Fixes</h4>
                          <Chip size="sm" color="danger" variant="flat">{version.fixes.length}</Chip>
                        </div>
                        <ul className="space-y-2 ml-6">
                          {version.fixes.map((fix, idx) => (
                            <li key={idx} className="text-sm text-default-600 flex items-start gap-2">
                              <Icon icon="lucide:check" className="w-3 h-3 text-danger-500 mt-0.5 flex-shrink-0" />
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {version.improvements.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon icon="lucide:trending-up" className="w-4 h-4 text-primary-500" />
                          <h4 className="font-semibold text-foreground">Improvements</h4>
                          <Chip size="sm" color="primary" variant="flat">{version.improvements.length}</Chip>
                        </div>
                        <ul className="space-y-2 ml-6">
                          {version.improvements.map((improvement, idx) => (
                            <li key={idx} className="text-sm text-default-600 flex items-start gap-2">
                              <Icon icon="lucide:check" className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-sm border border-default-200">
            <CardBody className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icon icon="lucide:heart" className="w-5 h-5 text-danger-500" />
                <span className="text-sm font-medium text-default-600">Built with love using modern web technologies</span>
              </div>
              <p className="text-xs text-default-400 mb-4">
                HRMS HUI v{currentVersion} - Empowering organizations with modern HR management solutions
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-default-500">
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:code" className="w-3 h-3" />
                  React + TypeScript
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:palette" className="w-3 h-3" />
                  HeroUI + Tailwind
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:database" className="w-3 h-3" />
                  MySQL + Node.js
                </span>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
