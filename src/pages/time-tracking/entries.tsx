import React, { useState } from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea, Select, SelectItem, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import HeroSection from '../../components/common/HeroSection';

interface TimeEntry {
  id: number;
  employee_name: string;
  date: string;
  hours: number;
  description: string;
  project: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const TimeEntries: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: 1,
      employee_name: "John Smith",
      date: "2024-03-15",
      hours: 8.5,
      description: "Working on project documentation",
      project: "HRMS Development",
      status: "approved",
      created_at: "2024-03-15"
    },
    {
      id: 2,
      employee_name: "Jane Doe",
      date: "2024-03-15",
      hours: 7.5,
      description: "Client meeting and requirements analysis",
      project: "Client Portal",
      status: "pending",
      created_at: "2024-03-15"
    }
  ]);

  const [formData, setFormData] = useState({
    employee_name: '',
    date: '',
    hours: '',
    description: '',
    project: '',
    status: 'pending'
  });

  const projects = [
    "HRMS Development",
    "Client Portal",
    "Mobile App",
    "API Integration",
    "Database Optimization",
    "UI/UX Design",
    "Testing & QA",
    "Documentation"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TimeEntry = {
      id: timeEntries.length + 1,
      ...formData,
      hours: parseFloat(formData.hours),
      status: formData.status as 'pending' | 'approved' | 'rejected',
      created_at: new Date().toISOString().split('T')[0]
    };
    setTimeEntries([...timeEntries, newEntry]);
    setFormData({
      employee_name: '',
      date: '',
      hours: '',
      description: '',
      project: '',
      status: 'pending'
    });
    onOpenChange();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Time Entries"
          subtitle="Project Time Tracking"
          description="Track and manage employee time entries for different projects and tasks with approval workflow."
          icon="lucide:clock"
          illustration="time-tracking"
          actions={[
            {
              label: "Add Entry",
              icon: "lucide:plus",
              onPress: onOpen,
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

        {/* Time Entries List */}
        <div className="space-y-4">
          {timeEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon icon="lucide:clock" className="text-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{entry.employee_name}</h3>
                      <p className="text-sm text-default-500">{entry.project}</p>
                    </div>
                  </div>
                  <Chip 
                    color={getStatusColor(entry.status)}
                    size="sm"
                    variant="flat"
                  >
                    {entry.status}
                  </Chip>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:calendar" className="text-default-400" />
                    <span className="text-sm">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:clock-4" className="text-default-400" />
                    <span className="text-sm font-medium">{entry.hours} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:folder" className="text-default-400" />
                    <span className="text-sm">{entry.project}</span>
                  </div>
                </div>
                
                <p className="text-default-600 mb-4">{entry.description}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" color="success">
                    <Icon icon="lucide:check" className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="flat" color="danger">
                    <Icon icon="lucide:x" className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button size="sm" variant="flat" color="primary">
                    <Icon icon="lucide:edit" className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Add Time Entry Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Add Time Entry</ModalHeader>
                <form onSubmit={handleSubmit}>
                  <ModalBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Employee Name"
                        placeholder="Enter employee name"
                        value={formData.employee_name}
                        onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Hours"
                        type="number"
                        step="0.5"
                        placeholder="8.5"
                        value={formData.hours}
                        onChange={(e) => setFormData({...formData, hours: e.target.value})}
                        isRequired
                      />
                      <Select
                        label="Project"
                        placeholder="Select project"
                        selectedKeys={[formData.project]}
                        onSelectionChange={(keys) => setFormData({...formData, project: Array.from(keys)[0] as string})}
                        isRequired
                      >
                        {projects.map((project) => (
                          <SelectItem key={project}>{project}</SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="Status"
                        placeholder="Select status"
                        selectedKeys={[formData.status]}
                        onSelectionChange={(keys) => setFormData({...formData, status: Array.from(keys)[0] as string})}
                        className="md:col-span-2"
                      >
                        <SelectItem key="pending">Pending</SelectItem>
                        <SelectItem key="approved">Approved</SelectItem>
                        <SelectItem key="rejected">Rejected</SelectItem>
                      </Select>
                    </div>
                    <Textarea
                      label="Description"
                      placeholder="Enter work description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-4"
                      isRequired
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Add Entry
                    </Button>
                  </ModalFooter>
                </form>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default TimeEntries;
