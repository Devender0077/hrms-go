import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  addToast,
  Spinner,
  Tabs,
  Tab
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { apiRequest } from "../services/api-service";
import HeroSection from "../components/common/HeroSection";

interface Trip {
  id: number;
  employee_id: number;
  employee_name: string;
  purpose: string;
  destination: string;
  start_date: string;
  end_date: string;
  description?: string;
  expected_outcomes?: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  advance_amount?: number;
  advance_status?: 'requested' | 'approved' | 'paid' | 'reconciled';
  total_expenses?: number;
  reimbursement_status?: 'pending' | 'approved' | 'paid';
  created_at: string;
}

interface Expense {
  id: number;
  trip_id: number;
  expense_type: string;
  expense_date: string;
  amount: number;
  description: string;
  receipt_url?: string;
  reimbursable: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export default function TripsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    purpose: "",
    destination: "",
    start_date: "",
    end_date: "",
    description: "",
    expected_outcomes: "",
    advance_amount: "",
    status: "planned" as const
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/trips");
      if (response.success) {
        setTrips(response.data || []);
      }
    } catch (error) {
      console.error("Error loading trips:", error);
      addToast({
        title: "Error",
        description: "Failed to load trips",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/trips/${selectedTrip?.id}` : "/trips";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Trip ${isEditing ? "updated" : "created"} successfully`,
          color: "success"
        });
        loadTrips();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      addToast({
        title: "Error",
        description: "Failed to save trip",
        color: "danger"
      });
    }
  };

  const handleEdit = (trip: Trip) => {
    setSelectedTrip(trip);
    setFormData({
      employee_id: trip.employee_id.toString(),
      purpose: trip.purpose,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      description: trip.description || "",
      expected_outcomes: trip.expected_outcomes || "",
      advance_amount: trip.advance_amount?.toString() || "",
      status: trip.status
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      try {
        const response = await apiRequest(`/trips/${id}`, {
          method: "DELETE"
        });

        if (response.success) {
          addToast({
            title: "Success",
            description: "Trip deleted successfully",
            color: "success"
          });
          loadTrips();
        }
      } catch (error) {
        console.error("Error deleting trip:", error);
        addToast({
          title: "Error",
          description: "Failed to delete trip",
          color: "danger"
        });
      }
    }
  };

  const handleCloseModal = () => {
    setFormData({
      employee_id: "",
      purpose: "",
      destination: "",
      start_date: "",
      end_date: "",
      description: "",
      expected_outcomes: "",
      advance_amount: "",
      status: "planned"
    });
    setSelectedTrip(null);
    setIsEditing(false);
    onOpenChange();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'warning';
      case 'ongoing': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 mt-4">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <HeroSection
          title="Business Trips Management"
          subtitle="Trip Management System"
          description="Manage employee business trips, expenses, and reimbursements with complete tracking and approval workflows."
          icon="lucide:plane"
          illustration="trips"
          actions={[
            {
              label: "Add New Trip",
              icon: "lucide:plus",
              onPress: onOpen,
              color: "primary" as const
            }
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Business Trips</h3>
                <p className="text-sm text-default-500">Manage employee business trips and expenses</p>
              </div>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:plus" />}
                onPress={onOpen}
              >
                Add Trip
              </Button>
            </CardHeader>
            <CardBody>
              <Table aria-label="Trips table">
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>PURPOSE</TableColumn>
                  <TableColumn>DESTINATION</TableColumn>
                  <TableColumn>DATES</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>EXPENSES</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No trips found">
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{trip.employee_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{trip.purpose}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{trip.destination}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(trip.start_date).toLocaleDateString()}</p>
                          <p className="text-default-500">to {new Date(trip.end_date).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(trip.status)}
                          variant="flat"
                          size="sm"
                        >
                          {trip.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {trip.total_expenses ? (
                            <p>${trip.total_expenses.toFixed(2)}</p>
                          ) : (
                            <p className="text-default-500">No expenses</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:more-vertical" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Trip actions">
                            <DropdownItem
                              key="edit"
                              startContent={<Icon icon="lucide:edit" />}
                              onPress={() => handleEdit(trip)}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="view"
                              startContent={<Icon icon="lucide:eye" />}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash" />}
                              onPress={() => handleDelete(trip.id)}
                            >
                              Delete
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
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? "Edit Trip" : "Add New Trip"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Employee ID"
                      placeholder="Enter employee ID"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      isRequired
                    />
                    <Select
                      label="Status"
                      placeholder="Select status"
                      selectedKeys={[formData.status]}
                      onSelectionChange={(keys) => setFormData({ ...formData, status: Array.from(keys)[0] as any })}
                    >
                      <SelectItem key="planned" value="planned">Planned</SelectItem>
                      <SelectItem key="ongoing" value="ongoing">Ongoing</SelectItem>
                      <SelectItem key="completed" value="completed">Completed</SelectItem>
                      <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Purpose"
                      placeholder="Enter trip purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Destination"
                      placeholder="Enter destination"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      isRequired
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      isRequired
                    />
                  </div>

                  <Textarea
                    label="Description"
                    placeholder="Enter trip description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />

                  <Textarea
                    label="Expected Outcomes"
                    placeholder="Enter expected outcomes"
                    value={formData.expected_outcomes}
                    onChange={(e) => setFormData({ ...formData, expected_outcomes: e.target.value })}
                  />

                  <Input
                    label="Advance Amount"
                    type="number"
                    placeholder="Enter advance amount"
                    value={formData.advance_amount}
                    onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleCloseModal}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {isEditing ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
