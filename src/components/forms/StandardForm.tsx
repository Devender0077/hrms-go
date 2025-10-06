import React, { useState, useEffect } from 'react';
import { parseDate } from '@internationalized/date';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  DatePicker,
  Switch,
  RadioGroup,
  Radio,
  Checkbox,
  CheckboxGroup,
  Divider,
  Spacer
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { validateAndSanitizeFormData, validators, commonFieldDefinitions } from '../../utils/validation';

// Field types
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'date' 
  | 'switch' 
  | 'radio' 
  | 'checkbox' 
  | 'file'
  | 'hidden';

// Field definition interface
export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: Array<{ label: string; value: any }>;
  validators?: any[];
  defaultValue?: any;
  helpText?: string;
  className?: string;
  gridCols?: number;
  dependencies?: string[]; // Fields this field depends on
  conditional?: (values: any) => boolean; // Show/hide based on other field values
}

// Form props interface
export interface StandardFormProps {
  title?: string;
  subtitle?: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
  showActions?: boolean;
  gridCols?: number;
}

export const StandardForm: React.FC<StandardFormProps> = ({
  title,
  subtitle,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  className = '',
  showActions = true,
  gridCols = 2
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update form data when initial data changes
  useEffect(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  // Handle field changes
  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle field blur
  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const field = fields.find(f => f.name === name);
    if (field) {
      const fieldValidators = field.validators || [];
      if (field.required) {
        fieldValidators.unshift(validators.required(`${field.label} is required`));
      }
      
      const error = fieldValidators.find(validator => {
        const result = validator(formData[name]);
        return result;
      });
      
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const fieldDefinitions: Record<string, any> = {};
    
    fields.forEach(field => {
      fieldDefinitions[field.name] = {
        required: field.required,
        validators: field.validators,
        label: field.label
      };
    });

    const { validation } = validateAndSanitizeFormData(formData, fieldDefinitions);
    
    setErrors(validation.errors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return validation.isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle submission error
    }
  };

  // Render field based on type
  const renderField = (field: FormField) => {
    const value = formData[field.name] || field.defaultValue || '';
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;

    // Check if field should be shown based on dependencies
    if (field.conditional && !field.conditional(formData)) {
      return null;
    }

    const commonProps = {
      name: field.name,
      label: field.label,
      placeholder: field.placeholder,
      value: value,
      onChange: (val: any) => handleFieldChange(field.name, val),
      onBlur: () => handleFieldBlur(field.name),
      isDisabled: field.disabled || loading,
      isReadOnly: field.readonly,
      isInvalid: !!showError,
      errorMessage: showError ? error : undefined,
      description: field.helpText,
      className: field.className
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <Input
            {...commonProps}
            type={field.type}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            minRows={3}
            maxRows={6}
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            selectedKeys={value ? [value] : []}
            onSelectionChange={(keys) => handleFieldChange(field.name, Array.from(keys)[0])}
          >
            {field.options?.map((option) => (
              <SelectItem key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        );

      case 'date':
        return (
          <DatePicker
            {...commonProps}
            value={value ? parseDate(value) : null}
            onChange={(date) => handleFieldChange(field.name, date?.toString())}
          />
        );

      case 'switch':
        return (
          <div className="flex items-center gap-2">
            <Switch
              isSelected={value}
              onValueChange={(val) => handleFieldChange(field.name, val)}
              isDisabled={field.disabled || loading}
            />
            <span className="text-sm text-default-600">{field.label}</span>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            label={field.label}
            value={value}
            onValueChange={(val) => handleFieldChange(field.name, val)}
            isDisabled={field.disabled || loading}
            isInvalid={!!showError}
            errorMessage={showError ? error : undefined}
            description={field.helpText}
          >
            {field.options?.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <CheckboxGroup
            label={field.label}
            value={value || []}
            onValueChange={(val) => handleFieldChange(field.name, val)}
            isDisabled={field.disabled || loading}
            isInvalid={!!showError}
            errorMessage={showError ? error : undefined}
            description={field.helpText}
          >
            {field.options?.map((option) => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        );

      case 'file':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {field.label}
              {field.required && <span className="text-danger ml-1">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => handleFieldChange(field.name, e.target.files?.[0])}
              disabled={field.disabled || loading}
              className="block w-full text-sm text-default-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary-600"
            />
            {field.helpText && (
              <p className="text-xs text-default-500 mt-1">{field.helpText}</p>
            )}
            {showError && (
              <p className="text-xs text-danger mt-1">{error}</p>
            )}
          </div>
        );

      case 'hidden':
        return (
          <input
            type="hidden"
            name={field.name}
            value={value}
          />
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card>
        {(title || subtitle) && (
          <CardHeader className="pb-4">
            <div>
              {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
              {subtitle && <p className="text-default-600 mt-1">{subtitle}</p>}
            </div>
          </CardHeader>
        )}
        
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`grid grid-cols-1 ${gridCols === 2 ? 'md:grid-cols-2' : `md:grid-cols-${gridCols}`} gap-6`}>
              {fields.map((field) => {
                if (field.type === 'hidden') {
                  return renderField(field);
                }
                
                return (
                  <div
                    key={field.name}
                    className={field.gridCols ? `col-span-${field.gridCols}` : ''}
                  >
                    {renderField(field)}
                  </div>
                );
              })}
            </div>

            {showActions && (
              <>
                <Divider />
                <div className="flex justify-end gap-3">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="light"
                      onPress={onCancel}
                      isDisabled={loading}
                    >
                      {cancelLabel}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    color="primary"
                    isLoading={loading}
                    startContent={!loading && <Icon icon="lucide:save" />}
                  >
                    {submitLabel}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Common form field definitions for HRMS
export const commonFormFields = {
  name: {
    name: 'name',
    label: 'Name',
    type: 'text' as FieldType,
    required: true,
    validators: [validators.minLength(2), validators.maxLength(100)],
    ...commonFieldDefinitions.name
  },
  email: {
    name: 'email',
    label: 'Email',
    type: 'email' as FieldType,
    required: true,
    validators: [validators.email()],
    ...commonFieldDefinitions.email
  },
  phone: {
    name: 'phone',
    label: 'Phone Number',
    type: 'text' as FieldType,
    required: false,
    validators: [validators.phone()],
    ...commonFieldDefinitions.phone
  },
  date: {
    name: 'date',
    label: 'Date',
    type: 'date' as FieldType,
    required: true,
    validators: [validators.date()],
    ...commonFieldDefinitions.date
  },
  amount: {
    name: 'amount',
    label: 'Amount',
    type: 'number' as FieldType,
    required: true,
    validators: [validators.numeric(), validators.positive()],
    ...commonFieldDefinitions.amount
  }
};

export default StandardForm;
