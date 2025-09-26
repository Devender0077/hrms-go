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
    
    interface FormData {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      employee_id: string;
      department_id?: number;
      designation_id?: number;
      branch_id?: number;
      shift_id?: number;
      employment_type: string;
      attendance_policy_id?: number;
      bank_name: string;
      bank_account_number: string;
      bank_routing_number: string;
      bank_swift_code: string;
      bank_address: string;
      joining_date: string;
      date_of_birth: string;
      gender: string;
      address: string;
      city: string;
      state: string;
      country: string;
      zip_code: string;
      status: string;
      create_login: boolean;
      temp_password: string;
    }

    interface EmployeeFormProps {
      employee?: any;
      departments: Array<{ id: number; name: string }>;
      designations: Array<{ id: number; name: string }>;
      branches: Array<{ id: number; name: string }>;
      shifts: Array<{ id: number; name: string; start_time: string; end_time: string; is_active: boolean }>;
      attendancePolicies: Array<{ id: number; name: string; policy_type: string }>;
      onSubmit: (data: any) => void;
      onCancel: () => void;
    }
    
    const EmployeeForm: React.FC<EmployeeFormProps> = ({
      employee,
      departments,
      designations,
      branches,
      shifts,
      attendancePolicies,
      onSubmit,
      onCancel
    }) => {
      const [isLoading, setIsLoading] = React.useState(false);
      const [formData, setFormData] = React.useState<FormData>({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        email: employee?.email || '',
        phone: employee?.phone || '',
        employee_id: employee?.employee_id || '',
        department_id: employee?.department_id || undefined,
        designation_id: employee?.designation_id || undefined,
        branch_id: employee?.branch_id || undefined,
        shift_id: employee?.shift_id || undefined,
        employment_type: employee?.employment_type || 'full_time',
        attendance_policy_id: employee?.attendance_policy_id || undefined,
        bank_name: employee?.bank_name || '',
        bank_account_number: employee?.bank_account_number || '',
        bank_routing_number: employee?.bank_routing_number || '',
        bank_swift_code: employee?.bank_swift_code || '',
        bank_address: employee?.bank_address || '',
        joining_date: employee?.joining_date || '',
        date_of_birth: employee?.date_of_birth || '',
        gender: employee?.gender || '',
        address: employee?.address || '',
        city: employee?.city || '',
        state: employee?.state || '',
        country: employee?.country || '',
        zip_code: employee?.zip_code || '',
        status: employee?.status || 'active',
        create_login: !employee,
        temp_password: ''
      });
      
      const [errors, setErrors] = React.useState<any>({});
      
      // Update form data when employee prop changes (for editing)
      React.useEffect(() => {
        if (employee) {
          console.log('Employee data for editing:', employee);
          // Format dates for input fields (YYYY-MM-DD format)
          const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            // If it's already in YYYY-MM-DD format, return as is
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
            // If it's a full date string, extract the date part
            if (dateString.includes('T')) return dateString.split('T')[0];
            return dateString;
          };
          
          setFormData({
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            email: employee.email || '',
            phone: employee.phone || '',
            employee_id: employee.employee_id || '',
            department_id: employee.department_id || undefined,
            designation_id: employee.designation_id || undefined,
            branch_id: employee.branch_id || undefined,
            shift_id: employee.shift_id || undefined,
            employment_type: employee.employment_type || 'full_time',
            attendance_policy_id: employee.attendance_policy_id || undefined,
            bank_name: employee.bank_name || '',
            bank_account_number: employee.bank_account_number || '',
            bank_routing_number: employee.bank_routing_number || '',
            bank_swift_code: employee.bank_swift_code || '',
            bank_address: employee.bank_address || '',
            joining_date: formatDateForInput(employee.joining_date),
            date_of_birth: formatDateForInput(employee.date_of_birth),
            gender: employee.gender || '',
            address: employee.address || '',
            city: employee.city || '',
            state: employee.state || '',
            country: employee.country || '',
            zip_code: employee.zip_code || '',
            status: employee.status || 'active',
            create_login: false,
            temp_password: ''
          });
        }
      }, [employee]);
      
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
        const newErrors: any = {};
        
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        if (!formData.employee_id) newErrors.employee_id = 'Employee ID is required';
        if (!formData.branch_id) newErrors.branch_id = 'Branch is required';
        if (!formData.department_id) newErrors.department_id = 'Department is required';
        if (!formData.designation_id) newErrors.designation_id = 'Designation is required';
        if (!formData.shift_id) newErrors.shift_id = 'Shift is required';
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
          
          // Clean up form data - convert empty strings to null for optional fields
          const cleanedFormData = {
            ...formData,
            date_of_birth: formData.date_of_birth || null,
            joining_date: formData.joining_date || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            country: formData.country || null,
            zip_code: formData.zip_code || null,
            phone: formData.phone || null
          };
          
          onSubmit(cleanedFormData);
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
                <SelectItem key="male">Male</SelectItem>
                <SelectItem key="female">Female</SelectItem>
                <SelectItem key="other">Other</SelectItem>
              </Select>
              
              <Select
                label="Status"
                placeholder="Select status"
                selectedKeys={formData.status ? [formData.status] : []}
                onChange={(e) => handleChange('status', e.target.value)}
                className="rounded-lg"
              >
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
                <SelectItem key="on_leave">On Leave</SelectItem>
                <SelectItem key="terminated">Terminated</SelectItem>
              </Select>
            </div>
            
            <Divider />
            
            <div>
              <h3 className="text-lg font-medium">Employment Details</h3>
              <p className="text-default-500 text-sm">Enter the employment details of the employee</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Branch"
                placeholder="Select branch"
                selectedKeys={formData.branch_id ? [formData.branch_id.toString()] : []}
                onSelectionChange={(keys) => {
                  const branchId = Array.from(keys)[0] as string;
                  setFormData({ 
                    ...formData, 
                    branch_id: branchId ? parseInt(branchId) : undefined 
                  });
                }}
                isInvalid={!!errors.branch_id}
                errorMessage={errors.branch_id}
                isRequired
                className="rounded-lg"
                aria-label="Branch"
              >
                {branches.length === 0 ? (
                  <SelectItem key="loading" textValue="Loading...">
                    Loading branches...
                  </SelectItem>
                ) : (
                  branches.map((branch) => (
                    <SelectItem key={branch.id.toString()} textValue={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))
                )}
              </Select>

              <Select
                label="Department"
                placeholder="Select department"
                selectedKeys={formData.department_id ? [formData.department_id.toString()] : []}
                onSelectionChange={(keys) => {
                  const departmentId = Array.from(keys)[0] as string;
                  setFormData({ 
                    ...formData, 
                    department_id: departmentId ? parseInt(departmentId) : undefined 
                  });
                }}
                isInvalid={!!errors.department_id}
                errorMessage={errors.department_id}
                isRequired
                className="rounded-lg"
                aria-label="Department"
              >
                {departments.length === 0 ? (
                  <SelectItem key="loading" textValue="Loading...">
                    Loading departments...
                  </SelectItem>
                ) : (
                  departments.map((dept) => (
                    <SelectItem key={dept.id.toString()} textValue={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))
                )}
              </Select>
              
              <Select
                label="Designation"
                placeholder="Select designation"
                selectedKeys={formData.designation_id ? [formData.designation_id.toString()] : []}
                onSelectionChange={(keys) => {
                  const designationId = Array.from(keys)[0] as string;
                  setFormData({ 
                    ...formData, 
                    designation_id: designationId ? parseInt(designationId) : undefined 
                  });
                }}
                isInvalid={!!errors.designation_id}
                errorMessage={errors.designation_id}
                isRequired
                className="rounded-lg"
                aria-label="Designation"
              >
                {designations.length === 0 ? (
                  <SelectItem key="loading" textValue="Loading...">
                    Loading designations...
                  </SelectItem>
                ) : (
                  designations.map((desig) => (
                    <SelectItem key={desig.id.toString()} textValue={desig.name}>
                      {desig.name}
                    </SelectItem>
                  ))
                )}
              </Select>
              
              <Select
                label="Shift"
                placeholder="Select shift"
                selectedKeys={formData.shift_id ? [formData.shift_id.toString()] : []}
                onSelectionChange={(keys) => {
                  const shiftId = Array.from(keys)[0] as string;
                  setFormData({ 
                    ...formData, 
                    shift_id: shiftId ? parseInt(shiftId) : undefined 
                  });
                }}
                isInvalid={!!errors.shift_id}
                errorMessage={errors.shift_id}
                isRequired
                className="rounded-lg"
                aria-label="Shift"
              >
                {shifts.length === 0 ? (
                  <SelectItem key="loading" textValue="Loading...">
                    Loading shifts...
                  </SelectItem>
                ) : (
                  shifts.filter(shift => shift.is_active).map((shift) => (
                    <SelectItem key={shift.id.toString()} textValue={shift.name}>
                      {shift.name} ({new Date(`2000-01-01T${shift.start_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date(`2000-01-01T${shift.end_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })})
                    </SelectItem>
                  ))
                )}
              </Select>
              
              <Select
                label="Employment Type"
                placeholder="Select employment type"
                selectedKeys={formData.employment_type ? [formData.employment_type] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({...formData, employment_type: selected});
                }}
                isRequired
                className="rounded-lg"
                aria-label="Employment Type"
              >
                <SelectItem key="full_time" value="full_time">Full Time</SelectItem>
                <SelectItem key="part_time" value="part_time">Part Time</SelectItem>
                <SelectItem key="contract" value="contract">Contract</SelectItem>
                <SelectItem key="intern" value="intern">Intern</SelectItem>
                <SelectItem key="consultant" value="consultant">Consultant</SelectItem>
              </Select>
              
              <Select
                label="Attendance Policy"
                placeholder="Select attendance policy"
                selectedKeys={formData.attendance_policy_id ? [formData.attendance_policy_id.toString()] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({...formData, attendance_policy_id: selected ? parseInt(selected) : undefined});
                }}
                className="rounded-lg"
                aria-label="Attendance Policy"
              >
                {attendancePolicies.length === 0 ? (
                  <SelectItem key="loading" textValue="Loading...">
                    Loading policies...
                  </SelectItem>
                ) : (
                  attendancePolicies.map((policy) => (
                    <SelectItem key={policy.id.toString()} textValue={policy.name}>
                      {policy.name} ({policy.policy_type})
                    </SelectItem>
                  ))
                )}
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
            
            <Divider />
            
            <div>
              <h3 className="text-lg font-medium">Bank Information</h3>
              <p className="text-default-500 text-sm">Enter the bank details of the employee</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                placeholder="Enter bank name"
                value={formData.bank_name}
                onValueChange={(value) => handleChange('bank_name', value)}
                className="rounded-lg"
              />
              
              <Input
                label="Account Number"
                placeholder="Enter account number"
                value={formData.bank_account_number}
                onValueChange={(value) => handleChange('bank_account_number', value)}
                className="rounded-lg"
              />
              
              <Input
                label="Routing Number"
                placeholder="Enter routing number"
                value={formData.bank_routing_number}
                onValueChange={(value) => handleChange('bank_routing_number', value)}
                className="rounded-lg"
              />
              
              <Input
                label="SWIFT Code"
                placeholder="Enter SWIFT code"
                value={formData.bank_swift_code}
                onValueChange={(value) => handleChange('bank_swift_code', value)}
                className="rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Textarea
                label="Bank Address"
                placeholder="Enter bank address"
                value={formData.bank_address}
                onValueChange={(value) => handleChange('bank_address', value)}
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
                  <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                    <p className="text-sm text-default-500">
                      A login account will be created with the email address. You can either generate a random password or set a temporary password.
                    </p>
                    
                    <Input
                      label="Temporary Password (Optional)"
                      placeholder="Leave empty for random password"
                      type="password"
                      value={formData.temp_password}
                      onValueChange={(value) => handleChange('temp_password', value)}
                      className="rounded-lg"
                      description="If left empty, a random password will be generated and sent to the employee's email"
                    />
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
