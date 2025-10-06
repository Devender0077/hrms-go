import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spinner, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../services/api-service';
import HeroSection from '../../components/common/HeroSection';

interface TrainingProgram {
  id: number;
  name: string;
  description: string;
  duration: string;
  cost: number;
  trainer: string;
  status: 'active' | 'inactive';
  created_at: string;
}

const TrainingPrograms: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    cost: '',
    trainer: '',
    status: 'active'
  });

  // Fetch training programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/training/programs');
      if (response.success) {
        setPrograms(response.data);
      }
    } catch (error) {
      console.error('Error fetching training programs:', error);
      addToast({
        title: "Error",
        description: "Failed to fetch training programs",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        cost: parseFloat(formData.cost) || 0
      };

      if (editingProgram) {
        await apiRequest(`/training/programs/${editingProgram.id}`, { method: 'PUT', body: data });
        addToast({
          title: "Success",
          description: "Training program updated successfully",
          color: "success"
        });
      } else {
        await apiRequest('/training/programs', { method: 'POST', body: data });
        addToast({
          title: "Success",
          description: "Training program created successfully",
          color: "success"
        });
      }

      fetchPrograms();
      onOpenChange();
      resetForm();
    } catch (error) {
      console.error('Error saving training program:', error);
      addToast({
        title: "Error",
        description: "Failed to save training program",
        color: "danger"
      });
    }
  };

  // Handle edit
  const handleEdit = (program: TrainingProgram) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description,
      duration: program.duration,
      cost: program.cost.toString(),
      trainer: program.trainer,
      status: program.status
    });
    onOpen();
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/training/programs/${id}`, { method: 'DELETE' });
      addToast({
        title: "Success",
        description: "Training program deleted successfully",
        color: "success"
      });
      fetchPrograms();
    } catch (error) {
      console.error('Error deleting training program:', error);
      addToast({
        title: "Error",
        description: "Failed to delete training program",
        color: "danger"
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: '',
      cost: '',
      trainer: '',
      status: 'active'
    });
    setEditingProgram(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 mt-4">Loading training programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Training Programs"
          subtitle="Employee Development"
          description="Manage training programs and employee development initiatives to enhance skills and performance."
          icon="lucide:graduation-cap"
          illustration="training"
          actions={[
            {
              label: "Add Program",
              icon: "lucide:plus",
              onPress: onOpen,
              variant: "solid"
            },
            {
              label: "Export Programs",
              icon: "lucide:download",
              onPress: () => {},
              variant: "bordered"
            }
          ]}
        />

        {/* Training Programs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg">
            <CardBody>
              <Table aria-label="Training programs table">
                <TableHeader>
                  <TableColumn>PROGRAM NAME</TableColumn>
                  <TableColumn>TRAINER</TableColumn>
                  <TableColumn>DURATION</TableColumn>
                  <TableColumn>COST</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No training programs found">
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{program.name}</div>
                          <div className="text-sm text-default-500 line-clamp-2">
                            {program.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{program.trainer}</TableCell>
                      <TableCell>{program.duration}</TableCell>
                      <TableCell>${program.cost.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={program.status === 'active' ? 'success' : 'default'}
                          variant="flat"
                        >
                          {program.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => handleEdit(program)}
                          >
                            <Icon icon="lucide:edit" className="w-4 h-4" />
                          </Button>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <Icon icon="lucide:more-vertical" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Program actions">
                              <DropdownItem
                                key="view"
                                startContent={<Icon icon="lucide:eye" />}
                              >
                                View Details
                              </DropdownItem>
                              <DropdownItem
                                key="edit"
                                startContent={<Icon icon="lucide:edit" />}
                                onPress={() => handleEdit(program)}
                              >
                                Edit Program
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                startContent={<Icon icon="lucide:trash" />}
                                className="text-danger"
                                color="danger"
                                onPress={() => handleDelete(program.id)}
                              >
                                Delete Program
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </motion.div>

        {/* Add Program Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {editingProgram ? 'Edit Training Program' : 'Add Training Program'}
                </ModalHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <ModalBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Program Name"
                        placeholder="Enter program name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Duration"
                        placeholder="e.g., 3 months"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Cost"
                        type="number"
                        placeholder="0.00"
                        value={formData.cost}
                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Trainer"
                        placeholder="Enter trainer name"
                        value={formData.trainer}
                        onChange={(e) => setFormData({...formData, trainer: e.target.value})}
                        isRequired
                      />
                      <Select
                        label="Status"
                        placeholder="Select status"
                        selectedKeys={[formData.status]}
                        onSelectionChange={(keys) => setFormData({...formData, status: Array.from(keys)[0] as string})}
                        className="md:col-span-2"
                      >
                        <SelectItem key="active">Active</SelectItem>
                        <SelectItem key="inactive">Inactive</SelectItem>
                      </Select>
                    </div>
                    <Textarea
                      label="Description"
                      placeholder="Enter program description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-4"
                      isRequired
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={() => { onClose(); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      {editingProgram ? 'Update Program' : 'Add Program'}
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

export default TrainingPrograms;
