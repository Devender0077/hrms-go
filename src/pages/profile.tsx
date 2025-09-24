import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Chip,
  Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/auth-context';
import { employeeAPI } from '../services/api-service';
import { useDropzone } from 'react-dropzone';
import { API_BASE_URL } from '../config/api-config';

interface EmployeeProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  joining_date: string;
  profile_photo: string;
  department_name: string;
  designation_name: string;
  branch_name: string;
}

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // File upload handling
  const handleFileChange = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Only JPG, PNG, and GIF images are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size cannot exceed 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      onOpen();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: handleFileChange, 
    multiple: false,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    }
  });

  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: ''
  });

  // Load user profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get employee profile by user ID (convert string to number)
      const userId = user?.id ? parseInt(user.id) : 1;
      
      const response = await employeeAPI.getById(userId);
      
      if (response) {
        setProfile(response);
        setFormData({
          first_name: response.first_name || '',
          last_name: response.last_name || '',
          phone: response.phone || '',
          date_of_birth: response.date_of_birth || '',
          address: response.address || '',
          city: response.city || '',
          state: response.state || '',
          country: response.country || '',
          zip_code: response.zip_code || ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    if (user && isAuthenticated()) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);


  // Handle profile photo upload
  const handlePhotoUpload = async () => {
    if (!selectedFile || !profile) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('employee_id', profile.id.toString());
      
      // Upload photo
      const response = await fetch(`${API_BASE_URL}/employees/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, profile_photo: result.filename } : null);
        setSelectedFile(null);
        setPreviewUrl(null);
        onOpenChange();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await employeeAPI.update(profile.id, formData);
      
      // Reload profile
      await loadProfile();
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Get default avatar based on gender
  const getDefaultAvatar = (gender: string, id: number) => {
    const seed = `employee-${id}`;
    
    if (gender === 'female') {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,pastelPink,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc&gender=female`;
    } else if (gender === 'male') {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc&gender=male`;
    } else {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,pastelPink,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc`;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Loading authentication...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button color="primary" onPress={loadProfile}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:user-x" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">No profile information available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Icon icon="lucide:user" className="text-primary-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your personal information and profile settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!editMode ? (
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => setEditMode(true)}
                  startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                  className="font-medium shadow-lg"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    color="default"
                    variant="flat"
                    onPress={() => {
                      setEditMode(false);
                      setError(null);
                      // Reset form data
                      setFormData({
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        phone: profile.phone || '',
                        date_of_birth: profile.date_of_birth || '',
                        address: profile.address || '',
                        city: profile.city || '',
                        state: profile.state || '',
                        country: profile.country || '',
                        zip_code: profile.zip_code || ''
                      });
                    }}
                    startContent={<Icon icon="lucide:x" className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleProfileUpdate}
                    isLoading={saving}
                    startContent={!saving && <Icon icon="lucide:save" className="w-4 h-4" />}
                    className="shadow-lg"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <Card className="bg-red-50/80 backdrop-blur-sm border-red-200 mb-6 shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-500" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Profile Photo & Quick Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardBody className="p-6">
                {/* Profile Photo Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar
                      src={profile.profile_photo ? `http://localhost:8000/uploads/profiles/${profile.profile_photo}` : getDefaultAvatar(profile.gender, profile.id)}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      className="w-32 h-32 text-large shadow-2xl ring-4 ring-white"
                    />
                    <div className="absolute -bottom-2 -right-2">
                      <Button
                        isIconOnly
                        size="sm"
                        color="primary"
                        variant="solid"
                        className="rounded-full shadow-lg"
                        onPress={onOpen}
                      >
                        <Icon icon="lucide:camera" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mt-4">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  
                  {/* Upload Area */}
                  <div 
                    {...getRootProps()} 
                    className={`mt-4 p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isDragActive 
                        ? 'border-primary-500 bg-primary-50 scale-105' 
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Icon icon="lucide:upload-cloud" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      {isDragActive ? "Drop your photo here" : "Upload new photo"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:badge" className="text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Employee ID</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{profile.employee_id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:calendar" className="text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Joined</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:building" className="text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Department</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{profile.department_name || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:briefcase" className="text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Designation</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{profile.designation_name || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:user-check" className="text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Status</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.status}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:edit-3" className="text-primary-500 text-xl" />
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                </div>
              </CardHeader>
              
              <CardBody className="p-6">
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Icon icon="lucide:user" className="text-primary-500" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={editMode ? formData.first_name : (profile.first_name || '')}
                        onChange={(e) => editMode && setFormData({...formData, first_name: e.target.value})}
                        isReadOnly={!editMode}
                        variant={editMode ? "bordered" : "flat"}
                        classNames={{
                          input: "text-gray-900",
                          label: "text-gray-700 font-medium"
                        }}
                      />
                      <Input
                        label="Last Name"
                        value={editMode ? formData.last_name : (profile.last_name || '')}
                        onChange={(e) => editMode && setFormData({...formData, last_name: e.target.value})}
                        isReadOnly={!editMode}
                        variant={editMode ? "bordered" : "flat"}
                        classNames={{
                          input: "text-gray-900",
                          label: "text-gray-700 font-medium"
                        }}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={profile.email || ''}
                        isReadOnly
                        variant="flat"
                        className="col-span-1 md:col-span-2"
                        classNames={{
                          input: "text-gray-600",
                          label: "text-gray-700 font-medium"
                        }}
                        startContent={<Icon icon="lucide:mail" className="text-gray-400" />}
                        description="Email cannot be changed"
                      />
                      <Input
                        label="Phone Number"
                        value={editMode ? formData.phone : (profile.phone || '')}
                        onChange={(e) => editMode && setFormData({...formData, phone: e.target.value})}
                        isReadOnly={!editMode}
                        variant={editMode ? "bordered" : "flat"}
                        classNames={{
                          input: "text-gray-900",
                          label: "text-gray-700 font-medium"
                        }}
                        startContent={<Icon icon="lucide:phone" className="text-gray-400" />}
                      />
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={editMode ? formData.date_of_birth : (profile.date_of_birth || '')}
                        onChange={(e) => editMode && setFormData({...formData, date_of_birth: e.target.value})}
                        isReadOnly={!editMode}
                        variant={editMode ? "bordered" : "flat"}
                        classNames={{
                          input: "text-gray-900",
                          label: "text-gray-700 font-medium"
                        }}
                        startContent={<Icon icon="lucide:calendar" className="text-gray-400" />}
                      />
                      <Input
                        label="Gender"
                        value={profile.gender || 'Not specified'}
                        isReadOnly
                        variant="flat"
                        classNames={{
                          input: "text-gray-600",
                          label: "text-gray-700 font-medium"
                        }}
                        startContent={<Icon icon="lucide:users" className="text-gray-400" />}
                        description="Gender cannot be changed"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Icon icon="lucide:map-pin" className="text-primary-500" />
                      Address Information
                    </h4>
                    <div className="space-y-4">
                      <Textarea
                        label="Address"
                        value={editMode ? formData.address : (profile.address || '')}
                        onChange={(e) => editMode && setFormData({...formData, address: e.target.value})}
                        isReadOnly={!editMode}
                        variant={editMode ? "bordered" : "flat"}
                        rows={3}
                        classNames={{
                          input: "text-gray-900",
                          label: "text-gray-700 font-medium"
                        }}
                        startContent={<Icon icon="lucide:home" className="text-gray-400" />}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="City"
                          value={editMode ? formData.city : (profile.city || '')}
                          onChange={(e) => editMode && setFormData({...formData, city: e.target.value})}
                          isReadOnly={!editMode}
                          variant={editMode ? "bordered" : "flat"}
                          classNames={{
                            input: "text-gray-900",
                            label: "text-gray-700 font-medium"
                          }}
                          startContent={<Icon icon="lucide:building-2" className="text-gray-400" />}
                        />
                        <Input
                          label="State"
                          value={editMode ? formData.state : (profile.state || '')}
                          onChange={(e) => editMode && setFormData({...formData, state: e.target.value})}
                          isReadOnly={!editMode}
                          variant={editMode ? "bordered" : "flat"}
                          classNames={{
                            input: "text-gray-900",
                            label: "text-gray-700 font-medium"
                          }}
                          startContent={<Icon icon="lucide:map" className="text-gray-400" />}
                        />
                        <Input
                          label="Country"
                          value={editMode ? formData.country : (profile.country || '')}
                          onChange={(e) => editMode && setFormData({...formData, country: e.target.value})}
                          isReadOnly={!editMode}
                          variant={editMode ? "bordered" : "flat"}
                          classNames={{
                            input: "text-gray-900",
                            label: "text-gray-700 font-medium"
                          }}
                          startContent={<Icon icon="lucide:globe" className="text-gray-400" />}
                        />
                        <Input
                          label="ZIP Code"
                          value={editMode ? formData.zip_code : (profile.zip_code || '')}
                          onChange={(e) => editMode && setFormData({...formData, zip_code: e.target.value})}
                          isReadOnly={!editMode}
                          variant={editMode ? "bordered" : "flat"}
                          classNames={{
                            input: "text-gray-900",
                            label: "text-gray-700 font-medium"
                          }}
                          startContent={<Icon icon="lucide:hash" className="text-gray-400" />}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

      </div>

      {/* Photo Upload Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="md">
        <ModalContent className="bg-white/95 backdrop-blur-sm">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <Icon icon="lucide:camera" className="text-primary-600 text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Update Profile Photo</h3>
                <p className="text-gray-600 font-normal">Are you sure you want to upload this photo as your profile picture?</p>
              </ModalHeader>
              <ModalBody className="text-center">
                {previewUrl && (
                  <div className="flex justify-center mb-4">
                    <Avatar src={previewUrl} alt="New Profile Photo" className="w-32 h-32 text-large shadow-xl" />
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="flex gap-2 justify-center">
                <Button 
                  color="default" 
                  variant="flat" 
                  onPress={() => { onClose(); setSelectedFile(null); setPreviewUrl(profile.profile_photo || null); }}
                  startContent={<Icon icon="lucide:x" className="w-4 h-4" />}
                >
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handlePhotoUpload} 
                  isLoading={saving}
                  startContent={!saving && <Icon icon="lucide:upload" className="w-4 h-4" />}
                >
                  {saving ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}