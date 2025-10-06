import React from "react";
    import { 
      Button, 
      Input, 
      Select, 
      SelectItem, 
      Textarea, 
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    import { format } from "date-fns";
    
    interface AttendanceFormData {
      employee_id: string;
      date: string;
      check_in: string;
      check_out: string;
      status: string;
      note: string;
    }

    interface AttendanceFormProps {
      employees: any[];
      onSubmit: () => void;
      onCancel: () => void;
    }
    
    const AttendanceForm: React.FC<AttendanceFormProps> = ({
      employees,
      onSubmit,
      onCancel
    }) => {
      const [isLoading, setIsLoading] = React.useState(false);
      const [formData, setFormData] = React.useState<AttendanceFormData>({
        employee_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        check_in: '',
        check_out: '',
        status: 'present',
        note: ''
      });
      
      const [errors, setErrors] = React.useState<Partial<AttendanceFormData>>({});
      
      const handleChange = (field, value) => {
        setFormData({
          ...formData,
          [field]: value
        });
        
        // Clear error for the field
        if (errors[field]) {
          setErrors({
            ...errors,
            [field]: null
          });
        }
      };
      
      const validate = () => {
        const newErrors: Partial<AttendanceFormData> = {};
        
        if (!formData.employee_id) newErrors.employee_id = 'Employee is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.status) newErrors.status = 'Status is required';
        
        if (formData.status === 'present' || formData.status === 'late') {
          if (!formData.check_in) newErrors.check_in = 'Check-in time is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setIsLoading(true);
        
        try {
          // In a real implementation, this would be an API call
          // For now, we'll just simulate it
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          addToast({
            title: 'Success',
            description: 'Attendance record added successfully',
            color: 'success'
          });
          
          onSubmit();
        } catch (error) {
          console.error('Error submitting attendance form:', error);
          addToast({
            title: 'Error',
            description: 'Failed to add attendance record',
            color: 'danger'
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      return (
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            <Select
              label="Employee"
              placeholder="Select employee"
              selectedKeys={formData.employee_id ? [formData.employee_id] : []}
              onChange={(e) => handleChange('employee_id', e.target.value)}
              isInvalid={!!errors.employee_id}
              errorMessage={errors.employee_id}
              isRequired
              className="rounded-lg"
            >
              {employees.map((emp) => (
                <SelectItem key={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id})
                </SelectItem>
              ))}
            </Select>
            
            <Input
              label="Date"
              type="date"
              
              onChange={(e) => handleChange('date', e.target.value)}
              isInvalid={!!errors.date}
              errorMessage={errors.date}
              isRequired
              className="rounded-lg"
            />
            
            <Select
              label="Status"
              placeholder="Select status"
              selectedKeys={formData.status ? [formData.status] : []}
              onChange={(e) => handleChange('status', e.target.value)}
              isInvalid={!!errors.status}
              errorMessage={errors.status}
              isRequired
              className="rounded-lg"
            >
              <SelectItem key="present">Present</SelectItem>
              <SelectItem key="absent">Absent</SelectItem>
              <SelectItem key="late">Late</SelectItem>
              <SelectItem key="leave">On Leave</SelectItem>
            </Select>
            
            {(formData.status === 'present' || formData.status === 'late') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Check-in Time"
                  type="time"
                  
                  onChange={(e) => handleChange('check_in', e.target.value)}
                  isInvalid={!!errors.check_in}
                  errorMessage={errors.check_in}
                  isRequired={formData.status === 'present' || formData.status === 'late'}
                  className="rounded-lg"
                />
                
                <Input
                  label="Check-out Time"
                  type="time"
                  
                  onChange={(e) => handleChange('check_out', e.target.value)}
                  className="rounded-lg"
                />
              </div>
            )}
            
            <Textarea
              label="Note"
              placeholder="Add a note (optional)"
              
              onValueChange={(value) => handleChange('note', value)}
              className="rounded-lg"
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="solid"
                onPress={onCancel}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                color="primary" variant="solid"
                type="submit"
                isLoading={isLoading}
                className="rounded-lg"
              >
                Add Attendance
              </Button>
            </div>
          </div>
        </motion.form>
      );
    };
    
    export default AttendanceForm;
