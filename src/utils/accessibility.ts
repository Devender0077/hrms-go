/**
 * Accessibility utility functions to ensure proper ARIA labels and accessibility attributes
 */

/**
 * Get appropriate aria-label for icon-only buttons based on context
 */
export const getIconButtonAriaLabel = (icon: string, context?: string): string => {
  const iconLabels: Record<string, string> = {
    'lucide:more-horizontal': 'More actions',
    'lucide:more-vertical': 'More actions',
    'lucide:eye': 'View details',
    'lucide:edit': 'Edit',
    'lucide:trash': 'Delete',
    'lucide:plus': 'Add new',
    'lucide:search': 'Search',
    'lucide:filter': 'Filter',
    'lucide:download': 'Download',
    'lucide:upload': 'Upload',
    'lucide:settings': 'Settings',
    'lucide:bell': 'Notifications',
    'lucide:user': 'User profile',
    'lucide:logout': 'Logout',
    'lucide:menu': 'Menu',
    'lucide:close': 'Close',
    'lucide:check': 'Confirm',
    'lucide:x': 'Cancel',
    'lucide:info': 'Information',
    'lucide:help': 'Help',
    'lucide:refresh': 'Refresh',
    'lucide:save': 'Save',
    'lucide:copy': 'Copy',
    'lucide:share': 'Share',
    'lucide:print': 'Print',
    'lucide:email': 'Send email',
    'lucide:phone': 'Call',
    'lucide:calendar': 'Calendar',
    'lucide:clock': 'Time',
    'lucide:location': 'Location',
    'lucide:map': 'Map',
    'lucide:home': 'Home',
    'lucide:arrow-left': 'Go back',
    'lucide:arrow-right': 'Go forward',
    'lucide:arrow-up': 'Go up',
    'lucide:arrow-down': 'Go down',
    'lucide:chevron-left': 'Previous',
    'lucide:chevron-right': 'Next',
    'lucide:chevron-up': 'Expand',
    'lucide:chevron-down': 'Collapse',
  };

  const baseLabel = iconLabels[icon] || 'Action';
  
  if (context) {
    return `${baseLabel} ${context}`;
  }
  
  return baseLabel;
};

/**
 * Get appropriate aria-label for table action buttons
 */
export const getTableActionAriaLabel = (action: string, itemType: string): string => {
  const actionLabels: Record<string, string> = {
    'view': 'View',
    'edit': 'Edit',
    'delete': 'Delete',
    'duplicate': 'Duplicate',
    'archive': 'Archive',
    'restore': 'Restore',
    'approve': 'Approve',
    'reject': 'Reject',
    'export': 'Export',
    'import': 'Import',
  };

  const actionLabel = actionLabels[action] || action;
  return `${actionLabel} ${itemType}`;
};

/**
 * Get appropriate aria-label for form inputs
 */
export const getInputAriaLabel = (fieldName: string, required: boolean = false): string => {
  const requiredText = required ? ' (required)' : '';
  return `${fieldName}${requiredText}`;
};

/**
 * Get appropriate aria-label for navigation items
 */
export const getNavAriaLabel = (itemName: string, isActive: boolean = false): string => {
  const activeText = isActive ? ' (current page)' : '';
  return `Navigate to ${itemName}${activeText}`;
};

/**
 * Common accessibility props for icon-only buttons
 */
export const getIconButtonProps = (icon: string, context?: string) => ({
  'aria-label': getIconButtonAriaLabel(icon, context),
  'role': 'button',
  'tabIndex': 0,
});

/**
 * Common accessibility props for table action buttons
 */
export const getTableActionProps = (action: string, itemType: string) => ({
  'aria-label': getTableActionAriaLabel(action, itemType),
  'role': 'button',
  'tabIndex': 0,
});

/**
 * Common accessibility props for form inputs
 */
export const getInputProps = (fieldName: string, required: boolean = false) => ({
  'aria-label': getInputAriaLabel(fieldName, required),
  'aria-required': required,
});

/**
 * Common accessibility props for navigation items
 */
export const getNavProps = (itemName: string, isActive: boolean = false) => ({
  'aria-label': getNavAriaLabel(itemName, isActive),
  'aria-current': isActive ? 'page' : undefined,
  'role': 'link',
  'tabIndex': 0,
});
