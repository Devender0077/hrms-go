import React, { useState } from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea, Select, SelectItem, Chip, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import HeroSection from '../../components/common/HeroSection';

interface Promotion {
  id: number;
  employee_name: string;
  current_position: string;
  new_position: string;
  current_salary: number;
  new_salary: number;
  effective_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string;
  created_at: string;
}

const Promotions: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: 1,
      employee_name: "John Smith",
      current_position: "Senior Developer",
      new_position: "Lead Developer",
      current_salary: 80000,
      new_salary: 95000,
      effective_date: "2024-04-01",
      reason: "Outstanding performance and leadership qualities demonstrated over the past year",
      status: "approved",
      approved_by: "HR Manager",
      created_at: "2024-03-15"
    },
    {
      id: 2,
      employee_name: "Jane Doe",
      current_position: "Marketing Specialist",
      new_position: "Marketing Manager",
      current_salary: 60000,
      new_salary: 75000,
      effective_date: "2024-05-01",
      reason: "Exceptional campaign results and team management skills",
      status: "pending",
      approved_by: "",
      created_at: "2024-03-20"
    }
  ]);

  const [formData, setFormData] = useState({
    employee_name: '',
    current_position: '',
    new_position: '',
    current_salary: '',
    new_salary: '',
    effective_date: '',
    reason: '',
    status: 'pending'
  });

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

  const calculateSalaryIncrease = (current: number, new_salary: number) => {
    const increase = new_salary - current;
    const percentage = ((increase / current) * 100).toFixed(1);
    return { increase, percentage };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromotion: Promotion = {
      id: promotions.length + 1,
      ...formData,
      current_salary: parseFloat(formData.current_salary),
      new_salary: parseFloat(formData.new_salary),
      status: formData.status as 'pending' | 'approved' | 'rejected',
      approved_by: formData.status === 'approved' ? 'HR Manager' : '',
      created_at: new Date().toISOString().split('T')[0]
    };
    setPromotions([...promotions, newPromotion]);
    setFormData({
      employee_name: '',
      current_position: '',
      new_position: '',
      current_salary: '',
      new_salary: '',
      effective_date: '',
      reason: '',
      status: 'pending'
    });
    onOpenChange();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Employee Promotions"
          subtitle="Career Advancement"
          description="Manage employee promotions, salary increases, and career advancement opportunities with approval workflow."
          icon="lucide:trending-up"
          illustration="promotions"
          actions={[
            {
              label: "Add Promotion",
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

        {/* Promotions List */}
        <div className="space-y-6">
          {promotions.map((promotion) => {
            const salaryIncrease = calculateSalaryIncrease(promotion.current_salary, promotion.new_salary);
            
            return (
              <Card key={promotion.id} className="hover:shadow-lg transition-shadow">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-success-100 rounded-lg">
                        <Icon icon="lucide:trending-up" className="text-success text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{promotion.employee_name}</h3>
                        <p className="text-default-500">Promotion Request</p>
                      </div>
                    </div>
                    <Chip 
                      color={getStatusColor(promotion.status)}
                      size="md"
                      variant="flat"
                    >
                      {promotion.status}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Position Change */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-default-700">Position Change</h4>
                      <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
                        <div>
                          <p className="text-sm text-default-500">Current Position</p>
                          <p className="font-medium">{promotion.current_position}</p>
                        </div>
                        <Icon icon="lucide:arrow-right" className="text-default-400 mx-4" />
                        <div>
                          <p className="text-sm text-default-500">New Position</p>
                          <p className="font-medium text-success">{promotion.new_position}</p>
                        </div>
                      </div>
                    </div>

                    {/* Salary Change */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-default-700">Salary Adjustment</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                          <span className="text-sm text-default-500">Current Salary</span>
                          <span className="font-medium">${promotion.current_salary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                          <span className="text-sm text-success-600">New Salary</span>
                          <span className="font-medium text-success">${promotion.new_salary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                          <span className="text-sm text-primary-600">Increase</span>
                          <span className="font-medium text-primary">
                            +${salaryIncrease.increase.toLocaleString()} ({salaryIncrease.percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-6" />

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Effective Date</p>
                        <p className="font-medium">{new Date(promotion.effective_date).toLocaleDateString()}</p>
                      </div>
                      {promotion.approved_by && (
                        <div>
                          <p className="text-sm text-default-500">Approved By</p>
                          <p className="font-medium">{promotion.approved_by}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-default-500 mb-2">Reason for Promotion</p>
                      <p className="text-default-700 bg-default-50 p-3 rounded-lg">{promotion.reason}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button color="success" variant="flat">
                      <Icon icon="lucide:check" className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button color="danger" variant="flat">
                      <Icon icon="lucide:x" className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button color="primary" variant="flat">
                      <Icon icon="lucide:edit" className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Add Promotion Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Add Employee Promotion</ModalHeader>
                <form onSubmit={handleSubmit}>
                  <ModalBody>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Employee Name"
                          placeholder="Enter employee name"
                          value={formData.employee_name}
                          onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                          isRequired
                        />
                        <Input
                          label="Effective Date"
                          type="date"
                          value={formData.effective_date}
                          onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                          isRequired
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Current Position"
                          placeholder="Enter current position"
                          value={formData.current_position}
                          onChange={(e) => setFormData({...formData, current_position: e.target.value})}
                          isRequired
                        />
                        <Input
                          label="New Position"
                          placeholder="Enter new position"
                          value={formData.new_position}
                          onChange={(e) => setFormData({...formData, new_position: e.target.value})}
                          isRequired
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Current Salary"
                          type="number"
                          placeholder="80000"
                          value={formData.current_salary}
                          onChange={(e) => setFormData({...formData, current_salary: e.target.value})}
                          isRequired
                        />
                        <Input
                          label="New Salary"
                          type="number"
                          placeholder="95000"
                          value={formData.new_salary}
                          onChange={(e) => setFormData({...formData, new_salary: e.target.value})}
                          isRequired
                        />
                      </div>

                      <Select
                        label="Status"
                        placeholder="Select status"
                        selectedKeys={[formData.status]}
                        onSelectionChange={(keys) => setFormData({...formData, status: Array.from(keys)[0] as string})}
                      >
                        <SelectItem key="pending">Pending</SelectItem>
                        <SelectItem key="approved">Approved</SelectItem>
                        <SelectItem key="rejected">Rejected</SelectItem>
                      </Select>

                      <Textarea
                        label="Reason for Promotion"
                        placeholder="Enter detailed reason for promotion"
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        isRequired
                      />
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Add Promotion
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

export default Promotions;
