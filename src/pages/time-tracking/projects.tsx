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

interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  totalHours: number;
  loggedHours: number;
  teamMembers: number;
  progress: number;
  budget: number;
  spent: number;
}

const ProjectTimeTrackingPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockProjects: Project[] = [
        {
          id: 1,
          name: 'Website Redesign',
          description: 'Complete redesign of company website with modern UI/UX',
          client: 'ABC Corporation',
          status: 'active',
          startDate: '2024-07-01',
          endDate: '2024-09-30',
          totalHours: 400,
          loggedHours: 180,
          teamMembers: 5,
          progress: 45,
          budget: 50000,
          spent: 22500
        },
        {
          id: 2,
          name: 'Mobile App Development',
          description: 'iOS and Android app for customer management',
          client: 'XYZ Ltd',
          status: 'planning',
          startDate: '2024-08-15',
          endDate: '2024-12-15',
          totalHours: 600,
          loggedHours: 0,
          teamMembers: 8,
          progress: 0,
          budget: 75000,
          spent: 0
        },
        {
          id: 3,
          name: 'Database Migration',
          description: 'Migrate legacy database to cloud infrastructure',
          client: 'Tech Solutions Inc',
          status: 'completed',
          startDate: '2024-06-01',
          endDate: '2024-07-31',
          totalHours: 200,
          loggedHours: 200,
          teamMembers: 3,
          progress: 100,
          budget: 25000,
          spent: 25000
        }
      ];
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'default';
      case 'active': return 'success';
      case 'on_hold': return 'warning';
      case 'completed': return 'primary';
      case 'cancelled': return 'danger';
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
          <p className="text-default-500 dark:text-default-400 mt-4 text-sm sm:text-base">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        <DynamicPageTitle pageName="Project Time Tracking" />
        
        {/* Hero Section */}
        <HeroSection
          title="Project Time Tracking"
          subtitle="Project Management"
          description="Track time spent on projects, monitor progress, and manage team productivity across all active projects."
          icon="lucide:folder-clock"
          illustration="task"
          actions={[
            {
              label: "Create Project",
              icon: "lucide:plus",
              onPress: onCreateOpen,
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
                title: "Active Projects",
                value: projects.filter(p => p.status === 'active').length,
                icon: "lucide:play-circle",
                color: "green",
                bgColor: "bg-success-100 dark:bg-success-900/30",
                textColor: "text-success-600 dark:text-success-400"
              },
              {
                title: "Total Hours Logged",
                value: projects.reduce((sum, p) => sum + p.loggedHours, 0),
                icon: "lucide:clock",
                color: "blue",
                bgColor: "bg-primary-100 dark:bg-primary-900/30",
                textColor: "text-primary-600 dark:text-primary-400"
              },
              {
                title: "Team Members",
                value: projects.reduce((sum, p) => sum + p.teamMembers, 0),
                icon: "lucide:users",
                color: "yellow",
                bgColor: "bg-warning-100 dark:bg-warning-900/30",
                textColor: "text-warning-600 dark:text-warning-400"
              },
              {
                title: "Completed Projects",
                value: projects.filter(p => p.status === 'completed').length,
                icon: "lucide:check-circle",
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
                  placeholder="Search projects or clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Icon icon="lucide:search" className="text-default-400" />}
                  aria-label="Search projects"
                />
                <select
                  className="px-3 py-2 border border-default-200 rounded-lg bg-background text-foreground"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Projects Table */}
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
                  <h3 className="text-lg font-semibold text-foreground">Project Time Tracking</h3>
                  <p className="text-default-500 text-sm">
                    {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <Table aria-label="Projects table">
                <TableHeader>
                  <TableColumn>PROJECT</TableColumn>
                  <TableColumn>CLIENT</TableColumn>
                  <TableColumn>PROGRESS</TableColumn>
                  <TableColumn>TIME LOGGED</TableColumn>
                  <TableColumn>TEAM</TableColumn>
                  <TableColumn>BUDGET</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                        <Icon icon="lucide:folder-clock" className="w-16 h-16 text-primary-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
                    <p className="text-default-500 text-center max-w-sm mb-4">
                      Get started by creating your first project for time tracking.
                    </p>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
                      onPress={onCreateOpen}
                    >
                      Create Project
                    </Button>
                  </div>
                }>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{project.name}</p>
                          <p className="text-sm text-default-500">{project.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:building" className="text-default-400 text-sm" />
                          <span className="text-sm">{project.client}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                          <Progress
                            value={project.progress}
                            color={getProgressColor(project.progress) as any}
                            size="sm"
                            className="w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Icon icon="lucide:clock" className="w-3 h-3 text-default-400" />
                            <span className="font-medium">{project.loggedHours}</span>
                            <span className="text-default-500">/{project.totalHours}h</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:users" className="text-default-400 text-sm" />
                          <span className="text-sm">{project.teamMembers} members</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Icon icon="lucide:dollar-sign" className="w-3 h-3 text-default-400" />
                            <span className="font-medium">${project.spent.toLocaleString()}</span>
                            <span className="text-default-500">/${project.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(project.status) as any}
                          variant="flat"
                          size="sm"
                        >
                          {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Dropdown closeOnSelect>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light" aria-label={`Actions for ${project.name}`}>
                              <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label={`Project actions for ${project.name}`}>
                            <DropdownItem
                              key="view"
                              startContent={<Icon icon="lucide:eye" />}
                              onPress={() => {
                                setSelectedProject(project);
                                onViewOpen();
                              }}
                              textValue="View project details"
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="time"
                              startContent={<Icon icon="lucide:clock" />}
                              onPress={() => {}}
                              textValue="Log time for project"
                            >
                              Log Time
                            </DropdownItem>
                            <DropdownItem
                              key="team"
                              startContent={<Icon icon="lucide:users" />}
                              onPress={() => {}}
                              textValue="Manage team members"
                            >
                              Manage Team
                            </DropdownItem>
                            <DropdownItem
                              key="reports"
                              startContent={<Icon icon="lucide:bar-chart" />}
                              onPress={() => {}}
                              textValue="View project reports"
                            >
                              Reports
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

        {/* View Project Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:eye" className="w-5 h-5 text-primary" />
                <span>Project Details</span>
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedProject && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedProject.name}</h3>
                    <p className="text-default-600 mt-2">{selectedProject.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-default-500">Progress</span>
                      <span className="text-sm font-medium">{selectedProject.progress}%</span>
                    </div>
                    <Progress
                      value={selectedProject.progress}
                      color={getProgressColor(selectedProject.progress) as any}
                      size="md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Client</p>
                      <p className="font-medium">{selectedProject.client}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Status</p>
                      <Chip
                        color={getStatusColor(selectedProject.status) as any}
                        variant="flat"
                        size="sm"
                        className="mt-1"
                      >
                        {selectedProject.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Time Logged</p>
                      <p className="font-medium">{selectedProject.loggedHours}/{selectedProject.totalHours} hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Team Members</p>
                      <p className="font-medium">{selectedProject.teamMembers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Budget</p>
                      <p className="font-medium">${selectedProject.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Spent</p>
                      <p className="font-medium">${selectedProject.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Start Date</p>
                      <p className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">End Date</p>
                      <p className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
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

        {/* Create Project Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="md">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:plus" className="w-5 h-5 text-primary" />
                <span>Create Project</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-default-600">
                  Project creation functionality will be implemented here.
                </p>
                <div className="p-4 bg-default-50 dark:bg-default-100 rounded-lg">
                  <p className="text-sm text-default-500">
                    This feature will allow you to create new projects, assign team members,
                    set budgets, and configure time tracking parameters.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onCreateClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default ProjectTimeTrackingPage;
