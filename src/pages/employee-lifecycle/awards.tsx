import React, { useState } from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea, Select, SelectItem, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import HeroSection from '../../components/common/HeroSection';

interface Award {
  id: number;
  employee_name: string;
  award_type: string;
  title: string;
  description: string;
  date_awarded: string;
  value: number;
  status: 'active' | 'archived';
  created_at: string;
}

const Awards: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [awards, setAwards] = useState<Award[]>([
    {
      id: 1,
      employee_name: "John Smith",
      award_type: "Employee of the Month",
      title: "Outstanding Performance",
      description: "Exceptional performance in Q1 2024",
      date_awarded: "2024-03-15",
      value: 500,
      status: "active",
      created_at: "2024-03-15"
    },
    {
      id: 2,
      employee_name: "Jane Doe",
      award_type: "Innovation Award",
      title: "Process Improvement",
      description: "Implemented new workflow that saved 20% time",
      date_awarded: "2024-02-28",
      value: 1000,
      status: "active",
      created_at: "2024-02-28"
    }
  ]);

  const [formData, setFormData] = useState({
    employee_name: '',
    award_type: '',
    title: '',
    description: '',
    date_awarded: '',
    value: '',
    status: 'active'
  });

  const awardTypes = [
    "Employee of the Month",
    "Innovation Award",
    "Team Player",
    "Customer Service Excellence",
    "Safety Award",
    "Long Service Award",
    "Performance Excellence",
    "Leadership Award"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAward: Award = {
      id: awards.length + 1,
      ...formData,
      value: parseFloat(formData.value),
      status: formData.status as 'active' | 'archived',
      created_at: new Date().toISOString().split('T')[0]
    };
    setAwards([...awards, newAward]);
    setFormData({
      employee_name: '',
      award_type: '',
      title: '',
      description: '',
      date_awarded: '',
      value: '',
      status: 'active'
    });
    onOpenChange();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Employee Awards"
          subtitle="Recognition & Rewards"
          description="Manage employee awards and recognition programs to motivate and appreciate outstanding performance."
          icon="lucide:award"
          illustration="awards"
          actions={[
            {
              label: "Add Award",
              icon: "lucide:plus",
              onPress: onOpen,
              variant: "solid"
            },
            {
              label: "Export Awards",
              icon: "lucide:download",
              onPress: () => {},
              variant: "bordered"
            }
          ]}
        />

        {/* Awards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award) => (
            <Card key={award.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning-100 rounded-lg">
                      <Icon icon="lucide:award" className="text-warning text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{award.title}</h3>
                      <p className="text-sm text-default-500">{award.employee_name}</p>
                    </div>
                  </div>
                  <Chip 
                    color={award.status === 'active' ? 'success' : 'default'}
                    size="sm"
                    variant="flat"
                  >
                    {award.status}
                  </Chip>
                </div>
                
                <div className="mb-4">
                  <Chip color="primary" variant="flat" size="sm" className="mb-2">
                    {award.award_type}
                  </Chip>
                  <p className="text-default-600 text-sm line-clamp-2">{award.description}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon="lucide:calendar" className="text-default-400" />
                    <span>Awarded: {new Date(award.date_awarded).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon="lucide:dollar-sign" className="text-default-400" />
                    <span>Value: ${award.value.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" color="primary">
                    <Icon icon="lucide:edit" className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="flat" color="default">
                    <Icon icon="lucide:eye" className="w-4 h-4" />
                    View
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Add Award Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Add Employee Award</ModalHeader>
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
                      <Select
                        label="Award Type"
                        placeholder="Select award type"
                        selectedKeys={[formData.award_type]}
                        onSelectionChange={(keys) => setFormData({...formData, award_type: Array.from(keys)[0] as string})}
                        isRequired
                      >
                        {awardTypes.map((type) => (
                          <SelectItem key={type}>{type}</SelectItem>
                        ))}
                      </Select>
                      <Input
                        label="Award Title"
                        placeholder="Enter award title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Award Value"
                        type="number"
                        placeholder="0.00"
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Date Awarded"
                        type="date"
                        value={formData.date_awarded}
                        onChange={(e) => setFormData({...formData, date_awarded: e.target.value})}
                        isRequired
                      />
                      <Select
                        label="Status"
                        placeholder="Select status"
                        selectedKeys={[formData.status]}
                        onSelectionChange={(keys) => setFormData({...formData, status: Array.from(keys)[0] as string})}
                      >
                        <SelectItem key="active">Active</SelectItem>
                        <SelectItem key="archived">Archived</SelectItem>
                      </Select>
                    </div>
                    <Textarea
                      label="Description"
                      placeholder="Enter award description"
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
                      Add Award
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

export default Awards;
