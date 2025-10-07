import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Input,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Avatar
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import HeroSection from '../../components/common/HeroSection';
import DynamicPageTitle from '../../components/common/DynamicPageTitle';

interface EmployeeTraining {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  trainingTitle: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startDate: string;
  endDate: string;
  score?: number;
  certificateIssued: boolean;
}

const EmployeeTrainingPage: React.FC = () => {
  const [trainings, setTrainings] = useState<EmployeeTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTraining, setSelectedTraining] = useState<EmployeeTraining | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockTrainings: EmployeeTraining[] = [
        {
          id: 1,
          employeeId: 1,
          employeeName: 'John Doe',
          employeeEmail: 'john.doe@company.com',
          trainingTitle: 'Leadership Development',
          status: 'in_progress',
          progress: 65,
          startDate: '2024-08-01',
          endDate: '2024-08-31',
          score: undefined,
          certificateIssued: false
        },
        {
          id: 2,
          employeeId: 2,
          employeeName: 'Jane Smith',
          employeeEmail: 'jane.smith@company.com',
          trainingTitle: 'Communication Skills',
          status: 'completed',
          progress: 100,
          startDate: '2024-07-15',
          endDate: '2024-08-15',
          score: 85,
          certificateIssued: true
        },
        {
          id: 3,
          employeeId: 3,
          employeeName: 'Mike Johnson',
          employeeEmail: 'mike.johnson@company.com',
          trainingTitle: 'Project Management',
          status: 'not_started',
          progress: 0,
          startDate: '2024-09-01',
          endDate: '2024-09-30',
          score: undefined,
          certificateIssued: false
        }
      ];
      setTrainings(mockTrainings);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         training.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || training.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'default';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'danger';
    if (progress < 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 dark:text-default-400 mt-4 text-sm sm:text-base">Loading employee trainings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        <DynamicPageTitle pageName="Employee Training" />
        
        {/* Hero Section */}
        <HeroSection
          title="Employee Training"
          subtitle="Learning Progress"
          description="Track employee training progress, monitor completion rates, and manage learning outcomes across your organization."
          icon="lucide:user-graduate"
          illustration="employee"
          actions={[
            {
              label: "Assign Training",
              icon: "lucide:user-plus",
              onPress: onAssignOpen,
              variant: "solid"
            },
            {
              label: "Export Report",
              icon: "lucide:download",
              onPress: () => {},
              variant: "bordered"
            }
          ]}
        />

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Assignments",
                value: trainings.length,
                icon: "lucide:users",
                color: "blue",
                bgColor: "bg-primary-100 dark:bg-primary-900/30",
                textColor: "text-primary-600 dark:text-primary-400"
              },
              {
                title: "In Progress",
                value: trainings.filter(t => t.status === 'in_progress').length,
                icon: "lucide:play-circle",
                color: "yellow",
                bgColor: "bg-warning-100 dark:bg-warning-900/30",
                textColor: "text-warning-600 dark:text-warning-400"
              },
              {
                title: "Completed",
                value: trainings.filter(t => t.status === 'completed').length,
                icon: "lucide:check-circle",
                color: "green",
                bgColor: "bg-success-100 dark:bg-success-900/30",
                textColor: "text-success-600 dark:text-success-400"
              },
              {
                title: "Certificates Issued",
                value: trainings.filter(t => t.certificateIssued).length,
                icon: "lucide:award",
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

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Search employees or trainings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Icon icon="lucide:search" className="text-default-400" />}
                  aria-label="Search trainings"
                />
                <select
                  className="px-3 py-2 border border-default-200 rounded-lg bg-background text-foreground"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Trainings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:table" className="text-success-600 text-xl" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Employee Training Records</h3>
                  <p className="text-default-500 text-sm">
                    {filteredTrainings.length} training{filteredTrainings.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <Table aria-label="Employee trainings table">
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>TRAINING</TableColumn>
                  <TableColumn>PROGRESS</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>SCORE</TableColumn>
                  <TableColumn>DATES</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                        <Icon icon="lucide:user-graduate" className="w-16 h-16 text-primary-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No training records found</h3>
                    <p className="text-default-500 text-center max-w-sm mb-4">
                      Get started by assigning training to employees.
                    </p>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      startContent={<Icon icon="lucide:user-plus" className="w-4 h-4" />}
                      onPress={onAssignOpen}
                    >
                      Assign Training
                    </Button>
                  </div>
                }>
                  {filteredTrainings.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={training.employeeName}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-foreground">{training.employeeName}</p>
                            <p className="text-sm text-default-500">{training.employeeEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{training.trainingTitle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{training.progress}%</span>
                          </div>
                          <Progress
                            value={training.progress}
                            color={getProgressColor(training.progress) as any}
                            size="sm"
                            className="w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(training.status) as any}
                          variant="flat"
                          size="sm"
                        >
                          {training.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {training.score ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{training.score}%</span>
                            {training.score >= 80 && (
                              <Icon icon="lucide:star" className="w-3 h-3 text-warning-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-default-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Icon icon="lucide:calendar" className="w-3 h-3 text-default-400" />
                            <span>{new Date(training.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Icon icon="lucide:calendar-check" className="w-3 h-3 text-default-400" />
                            <span>{new Date(training.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dropdown closeOnSelect>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light" aria-label={`Actions for ${training.employeeName}`}>
                              <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label={`Training actions for ${training.employeeName}`}>
                            <DropdownItem
                              key="view"
                              startContent={<Icon icon="lucide:eye" />}
                              onPress={() => {
                                setSelectedTraining(training);
                                onViewOpen();
                              }}
                              textValue="View training details"
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="certificate"
                              startContent={<Icon icon="lucide:award" />}
                              onPress={() => {}}
                              textValue="View certificate"
                              isDisabled={!training.certificateIssued}
                            >
                              View Certificate
                            </DropdownItem>
                            <DropdownItem
                              key="progress"
                              startContent={<Icon icon="lucide:trending-up" />}
                              onPress={() => {}}
                              textValue="View progress details"
                            >
                              Progress Details
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </motion.div>

        {/* View Training Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:eye" className="w-5 h-5 text-primary" />
                <span>Training Details</span>
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedTraining && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={selectedTraining.employeeName}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{selectedTraining.employeeName}</h3>
                      <p className="text-default-600">{selectedTraining.employeeEmail}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-semibold text-foreground mb-2">{selectedTraining.trainingTitle}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-default-500">Progress</span>
                        <span className="text-sm font-medium">{selectedTraining.progress}%</span>
                      </div>
                      <Progress
                        value={selectedTraining.progress}
                        color={getProgressColor(selectedTraining.progress) as any}
                        size="md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Status</p>
                      <Chip
                        color={getStatusColor(selectedTraining.status) as any}
                        variant="flat"
                        size="sm"
                        className="mt-1"
                      >
                        {selectedTraining.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Score</p>
                      <p className="font-medium mt-1">
                        {selectedTraining.score ? `${selectedTraining.score}%` : 'Not available'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Start Date</p>
                      <p className="font-medium mt-1">{new Date(selectedTraining.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">End Date</p>
                      <p className="font-medium mt-1">{new Date(selectedTraining.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedTraining.certificateIssued && (
                    <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:award" className="w-5 h-5 text-success-600" />
                        <span className="text-sm font-medium text-success-600">Certificate Issued</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onViewClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Assign Training Modal */}
        <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="md">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:user-plus" className="w-5 h-5 text-primary" />
                <span>Assign Training</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-default-600">
                  Training assignment functionality will be implemented here.
                </p>
                <div className="p-4 bg-default-50 dark:bg-default-100 rounded-lg">
                  <p className="text-sm text-default-500">
                    This feature will allow you to assign specific training programs to employees,
                    set deadlines, and track their progress.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onAssignClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default EmployeeTrainingPage;
