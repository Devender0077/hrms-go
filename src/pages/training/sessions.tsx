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
  Textarea
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import HeroSection from '../../components/common/HeroSection';
import DynamicPageTitle from '../../components/common/DynamicPageTitle';

interface TrainingSession {
  id: number;
  title: string;
  description: string;
  instructor: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  participants: number;
  maxParticipants: number;
}

const TrainingSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    instructor: '',
    date: '',
    duration: 60,
    maxParticipants: 20
  });

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockSessions: TrainingSession[] = [
        {
          id: 1,
          title: 'Leadership Development',
          description: 'Advanced leadership skills for managers',
          instructor: 'John Smith',
          date: '2024-08-15',
          duration: 120,
          status: 'scheduled',
          participants: 15,
          maxParticipants: 20
        },
        {
          id: 2,
          title: 'Communication Skills',
          description: 'Effective communication in the workplace',
          instructor: 'Sarah Johnson',
          date: '2024-08-20',
          duration: 90,
          status: 'ongoing',
          participants: 18,
          maxParticipants: 25
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'ongoing': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const handleCreateSession = async () => {
    if (!newSession.title.trim()) return;

    try {
      const session: TrainingSession = {
        id: sessions.length + 1,
        ...newSession,
        status: 'scheduled',
        participants: 0
      };
      setSessions(prev => [...prev, session]);
      setNewSession({
        title: '',
        description: '',
        instructor: '',
        date: '',
        duration: 60,
        maxParticipants: 20
      });
      onCreateClose();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 dark:text-default-400 mt-4 text-sm sm:text-base">Loading training sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        <DynamicPageTitle pageName="Training Sessions" />
        
        {/* Hero Section */}
        <HeroSection
          title="Training Sessions"
          subtitle="Learning & Development"
          description="Manage training sessions, track attendance, and monitor learning progress across your organization."
          icon="lucide:graduation-cap"
          illustration="task"
          actions={[
            {
              label: "Create Session",
              icon: "lucide:plus",
              onPress: onCreateOpen,
              variant: "solid"
            },
            {
              label: "Export Data",
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
                title: "Total Sessions",
                value: sessions.length,
                icon: "lucide:calendar",
                color: "blue",
                bgColor: "bg-primary-100 dark:bg-primary-900/30",
                textColor: "text-primary-600 dark:text-primary-400"
              },
              {
                title: "Scheduled",
                value: sessions.filter(s => s.status === 'scheduled').length,
                icon: "lucide:clock",
                color: "yellow",
                bgColor: "bg-warning-100 dark:bg-warning-900/30",
                textColor: "text-warning-600 dark:text-warning-400"
              },
              {
                title: "Ongoing",
                value: sessions.filter(s => s.status === 'ongoing').length,
                icon: "lucide:play-circle",
                color: "green",
                bgColor: "bg-success-100 dark:bg-success-900/30",
                textColor: "text-success-600 dark:text-success-400"
              },
              {
                title: "Completed",
                value: sessions.filter(s => s.status === 'completed').length,
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
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Icon icon="lucide:search" className="text-default-400" />}
                  aria-label="Search sessions"
                  className="flex-1"
                />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Sessions Table */}
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
                  <h3 className="text-lg font-semibold text-foreground">Training Sessions</h3>
                  <p className="text-default-500 text-sm">
                    {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <Table aria-label="Training sessions table">
                <TableHeader>
                  <TableColumn>SESSION</TableColumn>
                  <TableColumn>INSTRUCTOR</TableColumn>
                  <TableColumn>DATE & TIME</TableColumn>
                  <TableColumn>DURATION</TableColumn>
                  <TableColumn>PARTICIPANTS</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                        <Icon icon="lucide:graduation-cap" className="w-16 h-16 text-primary-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No training sessions found</h3>
                    <p className="text-default-500 text-center max-w-sm mb-4">
                      Get started by creating your first training session.
                    </p>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
                      onPress={onCreateOpen}
                    >
                      Create Session
                    </Button>
                  </div>
                }>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{session.title}</p>
                          <p className="text-sm text-default-500">{session.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:user" className="text-default-400 text-sm" />
                          <span className="text-sm">{session.instructor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:calendar" className="text-default-400 text-sm" />
                          <span className="text-sm">{new Date(session.date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:clock" className="text-default-400 text-sm" />
                          <span className="text-sm">{session.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{session.participants}</span>
                          <span className="text-default-500">/{session.maxParticipants}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(session.status) as any}
                          variant="flat"
                          size="sm"
                        >
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Dropdown closeOnSelect>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light" aria-label={`Actions for ${session.title}`}>
                              <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label={`Session actions for ${session.title}`}>
                            <DropdownItem
                              key="view"
                              startContent={<Icon icon="lucide:eye" />}
                              onPress={() => {
                                setSelectedSession(session);
                                onViewOpen();
                              }}
                              textValue="View session details"
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<Icon icon="lucide:edit" />}
                              onPress={() => {}}
                              textValue="Edit session"
                            >
                              Edit Session
                            </DropdownItem>
                            <DropdownItem
                              key="participants"
                              startContent={<Icon icon="lucide:users" />}
                              onPress={() => {}}
                              textValue="Manage participants"
                            >
                              Manage Participants
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

        {/* Create Session Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="md">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:plus" className="w-5 h-5 text-primary" />
                <span>Create Training Session</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Session Title"
                  placeholder="Enter session title"
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  variant="bordered"
                  isRequired
                />
                <Textarea
                  label="Description"
                  placeholder="Enter session description"
                  value={newSession.description}
                  onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                  variant="bordered"
                  minRows={3}
                />
                <Input
                  label="Instructor"
                  placeholder="Enter instructor name"
                  value={newSession.instructor}
                  onChange={(e) => setNewSession(prev => ({ ...prev, instructor: e.target.value }))}
                  variant="bordered"
                  isRequired
                />
                <Input
                  label="Date"
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                  variant="bordered"
                  isRequired
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    value={newSession.duration.toString()}
                    onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    variant="bordered"
                  />
                  <Input
                    label="Max Participants"
                    type="number"
                    value={newSession.maxParticipants.toString()}
                    onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 20 }))}
                    variant="bordered"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onCreateClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleCreateSession}>
                Create Session
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Session Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:eye" className="w-5 h-5 text-primary" />
                <span>Session Details</span>
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedSession && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedSession.title}</h3>
                    <p className="text-default-600 mt-2">{selectedSession.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Instructor</p>
                      <p className="font-medium">{selectedSession.instructor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Date</p>
                      <p className="font-medium">{new Date(selectedSession.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Duration</p>
                      <p className="font-medium">{selectedSession.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Participants</p>
                      <p className="font-medium">{selectedSession.participants}/{selectedSession.maxParticipants}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Status</p>
                    <Chip
                      color={getStatusColor(selectedSession.status) as any}
                      variant="flat"
                      size="sm"
                    >
                      {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                    </Chip>
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
      </div>
    </div>
  );
};

export default TrainingSessionsPage;
