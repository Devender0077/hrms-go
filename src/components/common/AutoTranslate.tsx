/**
 * AutoTranslate Component
 * Automatically translates common UI elements without manual intervention
 * Wraps children and auto-translates known patterns
 */

import React, { Children, cloneElement, isValidElement } from 'react';
import { useTranslation } from '../../contexts/translation-context';

interface AutoTranslateProps {
  children: React.ReactNode;
}

// Common translatable terms that appear across the app
const AUTO_TRANSLATE_MAP: Record<string, string> = {
  // Actions
  'Save': 'Save',
  'Cancel': 'Cancel',
  'Edit': 'Edit',
  'Delete': 'Delete',
  'Create': 'Create',
  'Update': 'Update',
  'View': 'View',
  'Add': 'Add',
  'Remove': 'Remove',
  'Submit': 'Submit',
  'Close': 'Close',
  'Apply': 'Apply',
  'Reset': 'Reset',
  'Clear': 'Clear',
  'Search': 'Search',
  'Filter': 'Filter',
  'Export': 'Export',
  'Import': 'Import',
  'Download': 'Download',
  'Upload': 'Upload',
  'Print': 'Print',
  'Refresh': 'Refresh',
  'Back': 'Back',
  'Next': 'Next',
  'Previous': 'Previous',
  
  // Fields
  'Name': 'Name',
  'Email': 'Email',
  'Phone': 'Phone',
  'Address': 'Address',
  'Status': 'Status',
  'Date': 'Date',
  'Time': 'Time',
  'Actions': 'Actions',
  'Description': 'Description',
  'Department': 'Department',
  'Designation': 'Designation',
  'Role': 'Role',
  'Permissions': 'Permissions',
  'Type': 'Type',
  'Category': 'Category',
  'Priority': 'Priority',
  
  // Status
  'Active': 'Active',
  'Inactive': 'Inactive',
  'Pending': 'Pending',
  'Approved': 'Approved',
  'Rejected': 'Rejected',
  'Completed': 'Completed',
  'Enabled': 'Enabled',
  'Disabled': 'Disabled',
  'Online': 'Online',
  'Offline': 'Offline',
  'Present': 'Present',
  'Absent': 'Absent',
  
  // Common
  'Loading': 'Loading',
  'Success': 'Success',
  'Error': 'Error',
  'Warning': 'Warning',
  'Total': 'Total',
  'New': 'New',
  'All': 'All',
  'Yes': 'Yes',
  'No': 'No',
};

/**
 * Recursively processes children and translates text content
 */
const translateChildren = (children: React.ReactNode, t: (key: string) => string): React.ReactNode => {
  return Children.map(children, (child) => {
    // If it's a string, check if it matches a translatable term
    if (typeof child === 'string') {
      const trimmed = child.trim();
      if (AUTO_TRANSLATE_MAP[trimmed]) {
        return t(trimmed);
      }
      return child;
    }
    
    // If it's a valid React element, recursively process its children
    if (isValidElement(child)) {
      // Skip translation for Input components to avoid conflicts with controlled values
      const type = (child.type as any)?.displayName || (child.type as any)?.name || '';
      if (type.includes('Input') || type.includes('Textarea') || type.includes('Select')) {
        return child;
      }
      
      // Clone element with translated children
      return cloneElement(child as React.ReactElement<any>, {
        ...child.props,
        children: child.props.children ? translateChildren(child.props.children, t) : child.props.children,
      });
    }
    
    return child;
  });
};

/**
 * AutoTranslate wrapper component
 * Usage: <AutoTranslate><YourComponent /></AutoTranslate>
 */
export const AutoTranslate: React.FC<AutoTranslateProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return <>{translateChildren(children, t)}</>;
};

export default AutoTranslate;

