const fs = require('fs');

// Comprehensive list of missing translation keys
const additionalKeys = {
  profile: {
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    personalInformation: "Personal Information",
    contactInformation: "Contact Information",
    employeeInformation: "Employee Information",
    bankDetails: "Bank Details",
    emergencyContact: "Emergency Contact",
    faceRecognition: "Face Recognition",
    changePassword: "Change Password",
    uploadPhoto: "Upload Photo",
    captureF ace: "Capture Face",
    firstName: "First Name",
    lastName: "Last Name",
    employeeId: "Employee ID",
    bloodGroup: "Blood Group",
    maritalStatus: "Marital Status",
    nationality: "Nationality",
    joiningDate: "Joining Date",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    emergencyContactName: "Emergency Contact Name",
    emergencyPhone: "Emergency Phone",
    emergencyEmail: "Emergency Email (Optional)",
    emergencyAddress: "Emergency Address (Optional)",
    emergencyRelationship: "Emergency Relationship",
    configured: "Configured",
    notSet: "Not Set",
    notProvided: "Not provided",
    setup: "Setup",
    updateFace: "Update",
    testFace: "Test",
    faceRecognitionSetup: "Face Recognition Setup",
    reviewCapturedPhoto: "Review your captured photo and confirm to save",
    updateFaceData: "Update your face recognition data",
    setupFaceLogin: "Set up face recognition for secure login",
    confirmAndSave: "Confirm & Save",
    retake: "Retake",
    faceDetectionQuality: "Face detection quality",
    goodLighting: "Ensure good lighting and face the camera directly",
    faceTestResult: "Face Test Result",
    tryAgain: "Try Again",
    profileUpdatedSuccessfully: "Profile updated successfully",
    passwordChangedSuccessfully: "Password changed successfully"
  },
  roles: {
    rolesAndPermissions: "Roles & Permissions",
    manageRoles: "Manage Roles",
    roleManagement: "Role Management",
    createRole: "Create Role",
    editRole: "Edit Role",
    deleteRole: "Delete Role",
    managePermissions: "Manage Permissions",
    roleName: "Role Name",
    roleDescription: "Role Description",
    permissionsCount: "Permissions",
    selectPermissions: "Select Permissions",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    permissionsModule: "Module",
    assignedPermissions: "Assigned Permissions",
    availablePermissions: "Available Permissions"
  },
  settings: {
    systemSettings: "System Settings",
    generalSettings: "General Settings",
    emailSettings: "Email Settings",
    notificationSettings: "Notification Settings",
    securitySettings: "Security Settings",
    localizationSettings: "Localization Settings",
    companySettings: "Company Settings",
    defaultLanguage: "Default Language",
    defaultTimezone: "Default Timezone",
    defaultCurrency: "Default Currency",
    dateFormat: "Date Format",
    timeFormat: "Time Format",
    fiscalYear: "Fiscal Year Start",
    companyName: "Company Name",
    companyEmail: "Company Email",
    companyPhone: "Company Phone",
    companyAddress: "Company Address",
    companyLogo: "Company Logo",
    websiteUrl: "Website URL"
  },
  dashboard: {
    welcome: "Welcome",
    totalCompanies: "Total Companies",
    totalUsers: "Total Users",
    totalEmployees: "Total Employees",
    activeEmployees: "Active Employees",
    monthlyRevenue: "Monthly Revenue",
    totalRevenue: "Total Revenue",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    systemOverview: "System Overview",
    companyOverview: "Company Overview",
    employeeOverview: "Employee Overview",
    attendanceOverview: "Attendance Overview",
    leaveOverview: "Leave Overview",
    payrollOverview: "Payroll Overview",
    superAdminDashboard: "Super Admin Dashboard",
    companyAdminDashboard: "Company Admin Dashboard",
    employeeDashboard: "Employee Dashboard",
    systemConfiguration: "System Configuration",
    companyManagement: "Company Management",
    myWorkspace: "My Workspace"
  },
  emergency: {
    name: "Name",
    relationship: "Relationship",
    phone: "Phone",
    email: "Email",
    address: "Address"
  },
  face: {
    faceRecognition: "Face Recognition",
    captureFace: "Capture Face",
    setupFace: "Setup Face Recognition",
    updateFace: "Update Face Recognition",
    testFace: "Test Face Recognition",
    faceConfigured: "Face Configured",
    faceNotSet: "Face Not Set",
    cameraAccess: "Camera Access Required",
    faceDetected: "Face Detected",
    faceNotDetected: "Face Not Detected",
    savingFaceData: "Saving face data...",
    faceDataSaved: "Face data saved successfully",
    faceTestSuccessful: "Face test successful",
    faceTestFailed: "Face test failed"
  }
};

// Read en.json
const enPath = './en.json';
let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Merge new keys
enData = { ...enData, ...additionalKeys };

// Write updated en.json
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n');

console.log('✅ Updated en.json with', Object.keys(additionalKeys).length, 'new key groups');
console.log('📝 Total keys in en.json:', Object.keys(enData).length);

