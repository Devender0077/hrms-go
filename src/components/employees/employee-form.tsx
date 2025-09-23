import React from "react";
    import { 
      Button, 
      Input, 
      Select, 
      SelectItem, 
      Textarea, 
      Checkbox,
      Divider,
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    
    interface EmployeeFormProps {
      employee?: any;
      departments: any[];
      designations: any[];
      onSubmit: () => void;
      onCancel: () => void;
    }
    
    const EmployeeForm: React.FC<EmployeeFormProps> = ({
      employee,
      departments,
      designations,
      onSubmit,
      onCancel
    }) => {
      const [isLoading, setIsLoading] = React.useState(false);
      const [formData, setFormData] = React.useState({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        email: employee?.email || '',
        phone: employee?.phone || '',
        employee_id: employee?.employee_id || '',
        department: employee?.department || '',
        designation: employee?.designation || '',
        joining_date: employee?.joining_date || '',
        date_of_birth: employee?.date_of_birth || '',
        gender: employee?.gender || '',
        address: employee?.address || '',
        city: employee?.city || '',
        state: employee?.state || '',
        country: employee?.country || '',
        zip_code: employee?.zip_code || '',
        status: employee?.status || 'active',
        create_login: !employee
      });
      
      const [errors, setErrors] = React.useState({});
      
      const filteredDesignations = React.useMemo(() => {
        if (!formData.department) return designations;
        return designations.filter(d => d.department_id === formData.department);
      }, [formData.department, designations]);
      
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
        const newErrors = {};
        
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        if (!formData.employee_id) newErrors.employee_id = 'Employee ID is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.designation) newErrors.designation = 'Designation is required';
        if (!formData.joining_date) newErrors.joining_date = 'Joining date is required';
        
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
            description: employee ? 'Employee updated successfully' : 'Employee created successfully',
            color: 'success'
          });
          
          onSubmit();
        } catch (error) {
          console.error('Error submitting employee form:', error);
          addToast({
            title: 'Error',
            description: 'Failed to save employee',
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Basic Information</h3>
              <p className="text-default-500 text-sm">Enter the basic information of the employee</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.first_name}
                onValueChange={(value) => handleChange('first_name', value)}
                isInvalid={!!errors.first_name}
                errorMessage={errors.first_name}
                isRequired
                className="rounded-lg"
              />
              
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.last_name}
                onValueChange={(value) => handleChange('last_name', value)}
                isInvalid={!!errors.last_name}
                errorMessage={errors.last_name}
                isRequired
                className="rounded-lg"
              />
              
              <Input
                label="Email"
                placeholder="Enter email address"
                type="email"
                value={formData.email}
                onValueChange={(value) => handleChange('email', value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                isRequired
                className="rounded-lg"
              />
              
              <Input
                label="Phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onValueChange={(value) => handleChange('phone', value)}
                className="rounded-lg"
              />
              
              <Input
                label="Employee ID"
                placeholder="Enter employee ID"
                value={formData.employee_id}
                onValueChange={(value) => handleChange('employee_id', value)}
                isInvalid={!!errors.employee_id}
                errorMessage={errors.employee_id}
                isRequired
                className="rounded-lg"
              />
              
              <Input
                label="Date of Birth"
                placeholder="Select date of birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                className="rounded-lg"
              />
              
              <Select
                label="Gender"
                placeholder="Select gender"
                selectedKeys={formData.gender ? [formData.gender] : []}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="rounded-lg"
              >
                <SelectItem key="male" value="male">Male</SelectItem>
                <SelectItem key="female" value="female">Female</SelectItem>
                <SelectItem key="other" value="other">Other</SelectItem>
              </Select>
              
              <Select
                label="Status"
                placeholder="Select status"
                selectedKeys={formData.status ? [formData.status] : []}
                onChange={(e) => handleChange('status', e.target.value)}
                className="rounded-lg"
              >
                <SelectItem key="active" value="active">Active</SelectItem>
                <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                <SelectItem key="on_leave" value="on_leave">On Leave</SelectItem>
                <SelectItem key="terminated" value="terminated">Terminated</SelectItem>
              </Select>
            </div>
            
            <Divider />
            
            <div>
              <h3 className="text-lg font-medium">Employment Details</h3>
              <p className="text-default-500 text-sm">Enter the employment details of the employee</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Department"
                placeholder="Select department"
                selectedKeys={formData.department ? [formData.department] : []}
                onChange={(e) => handleChange('department', e.target.value)}
                isInvalid={!!errors.department}
                errorMessage={errors.department}
                isRequired
                className="rounded-lg"
              >
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </Select>
              
              <Select
                label="Designation"
                placeholder="Select designation"
                selectedKeys={formData.designation ? [formData.designation] : []}
                onChange={(e) => handleChange('designation', e.target.value)}
                isInvalid={!!errors.designation}
                errorMessage={errors.designation}
                isRequired
                className="rounded-lg"
              >
                {filteredDesignations.map((desig) => (
                  <SelectItem key={desig.id} value={desig.id}>{desig.name}</SelectItem>
                ))}
              </Select>
              
              <Input
                label="Joining Date"
                placeholder="Select joining date"
                type="date"
                value={formData.joining_date}
                onChange={(e) => handleChange('joining_date', e.target.value)}
                isInvalid={!!errors.joining_date}
                errorMessage={errors.joining_date}
                isRequired
                className="rounded-lg"
              />
            </div>
            
            <Divider />
            
            <div>
              <h3 className="text-lg font-medium">Address Information</h3>
              <p className="text-default-500 text-sm">Enter the address information of the employee</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Textarea
                label="Address"
                placeholder="Enter address"
                value={formData.address}
                onValueChange={(value) => handleChange('address', value)}
                className="rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="Enter city"
                value={formData.city}
                onValueChange={(value) => handleChange('city', value)}
                className="rounded-lg"
              />
              
              <Input
                label="State/Province"
                placeholder="Enter state/province"
                value={formData.state}
                onValueChange={(value) => handleChange('state', value)}
                className="rounded-lg"
              />
              
              <Input
                label="Country"
                placeholder="Enter country"
                value={formData.country}
                onValueChange={(value) => handleChange('country', value)}
                className="rounded-lg"
              />
              
              <Input
                label="ZIP/Postal Code"
                placeholder="Enter ZIP/postal code"
                value={formData.zip_code}
                onValueChange={(value) => handleChange('zip_code', value)}
                className="rounded-lg"
              />
            </div>
            
            {!employee && (
              <>
                <Divider />
                
                <div>
                  <h3 className="text-lg font-medium">Login Information</h3>
                  <p className="text-default-500 text-sm">Create login credentials for the employee</p>
                </div>
                
                <div className="flex items-center">
                  <Checkbox
                    isSelected={formData.create_login}
                    onValueChange={(value) => handleChange('create_login', value)}
                  >
                    Create login account for this employee
                  </Checkbox>
                </div>
                
                {formData.create_login && (
                  <div className="pl-4 border-l-2 border-primary/20">
                    <p className="text-sm text-default-500 mb-2">
                      A login account will be created with the email address. A random password will be generated and sent to the employee's email.
                    </p>
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="flat"
                onPress={onCancel}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isLoading}
                className="rounded-lg"
              >
                {employee ? 'Update Employee' : 'Create Employee'}
              </Button>
            </div>
          </div>
        </motion.form>
      );
    };
    
    export default EmployeeForm;
