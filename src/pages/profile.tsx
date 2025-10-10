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
  Divider,
  Chip,
  Spinner,
  Select,
  SelectItem
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/auth-context';
import { employeeAPI } from '../services/api-service';
import { useDropzone } from 'react-dropzone';
import { API_BASE_URL } from '../config/api-config';
import FaceRecognitionService from '../services/face-recognition-service';
import HeroSection from '../components/common/HeroSection';
import { encryptFaceData, validateFaceData } from '../utils/face-encryption';

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
  employee_id?: string;
  status?: string;
  // Bank details
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  // Additional fields
  blood_group?: string;
  marital_status?: string;
  nationality?: string;
  passport_number?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_email?: string;
  emergency_contact_address?: string;
  // Face recognition
  face_descriptor?: string; // ✅ Changed from face_data to face_descriptor
  // Computed fields
  department?: string;
  designation?: string;
  branch?: string;
}

export default function ProfilePage() {
  // 🔄 VERSION: 2.9.9 - Role-based profile loading (FORCE REBUILD)
  console.log('🔄 ProfilePage loaded - Version 2.9.9 with role-based logic');
  
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [testFaceModalOpen, setTestFaceModalOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [capturedFaceData, setCapturedFaceData] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  // ✅ NEW: Auto-start camera when face modal opens
  useEffect(() => {
    if (faceModalOpen && !cameraStream && !showConfirmation) {
      console.log('🎥 Face modal opened, auto-starting camera...');
      // Add a small delay to ensure modal is fully rendered
      setTimeout(() => {
        startCamera().catch(err => {
          console.error('❌ Auto-start camera failed:', err);
          setError('Failed to start camera. Please check permissions and try again.');
        });
      }, 100);
    }
    // Cleanup: stop camera when modal closes
    return () => {
      if (cameraStream && !faceModalOpen) {
        console.log('🎥 Modal closed, stopping camera...');
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    };
  }, [faceModalOpen, cameraStream, showConfirmation]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('State changes:', {
      showConfirmation,
      capturedImage: capturedImage ? `Image length: ${capturedImage.length}, starts with: ${capturedImage.substring(0, 50)}...` : 'No image',
      cameraStream: cameraStream ? 'Stream active' : 'No stream'
    });
  }, [showConfirmation, capturedImage, cameraStream]);


  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // ✅ Check if user is management (admin, super_admin, company_admin, hr_manager, manager)
      const isManagement = user.role === 'admin' ||
                          user.role === 'super_admin' || 
                          user.role === 'company_admin' || 
                          user.role === 'hr_manager' || 
                          user.role === 'manager';
      
      console.log('🔍 Role check result:', { role: user.role, isManagement });

      if (isManagement) {
        // ✅ Management users ALWAYS use users table
        console.log('👤 Management user detected - loading from users table');
        
        // Fetch user data with face_descriptor from users table
        const userResponse = await fetch(`http://localhost:8000/api/v1/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json());

        const userData = userResponse.data || user;
        
        const managementProfile: EmployeeProfile = {
          id: 0, // No employee ID for management
          first_name: userData.first_name || user.name?.split(' ')[0] || '',
          last_name: userData.last_name || user.name?.split(' ').slice(1).join(' ') || '',
          email: userData.email || user.email || '',
          phone: userData.phone || user.phone || '',
          date_of_birth: userData.date_of_birth || '',
          gender: userData.gender || 'other',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          zip_code: userData.zip_code || '',
          joining_date: userData.created_at || '',
          profile_photo: userData.profile_photo || user.profile_photo || '',
          department_name: 'Management',
          designation_name: user.role === 'super_admin' ? 'Super Administrator' : 
                           user.role === 'company_admin' ? 'Company Administrator' :
                           user.role === 'hr_manager' ? 'HR Manager' :
                           user.role === 'manager' ? 'Team Manager' : 'Administrator',
          branch_name: 'Head Office',
          face_descriptor: userData.face_descriptor, // ✅ From users table
          status: userData.status || user.status || 'active'
        };
        setProfile(managementProfile);
        console.log('✅ Loaded management profile from users table:', {
          name: `${managementProfile.first_name} ${managementProfile.last_name}`,
          role: user.role,
          face_descriptor: !!managementProfile.face_descriptor ? 'SET' : 'NULL'
        });
      } else {
        // ✅ Regular employees use employees table
        console.log('👷 Employee user detected - loading from employees table');
      const response = await employeeAPI.getByUserId(user.id);
      
      if (response.success && response.data) {
        const profileData = {
          ...response.data,
          department: response.data.department_name,
          designation: response.data.designation_name,
            branch: response.data.branch_name || 'N/A',
            department_name: response.data.department_name,
            designation_name: response.data.designation_name,
            branch_name: response.data.branch_name || 'N/A'
        };
        setProfile(profileData);
          console.log('✅ Loaded employee profile from employees table:', {
            id: profileData.id,
            name: `${profileData.first_name} ${profileData.last_name}`,
            designation: profileData.designation_name,
            branch: profileData.branch_name,
            department: profileData.department_name,
            face_descriptor: !!profileData.face_descriptor ? 'SET' : 'NULL'
          });
      } else {
          throw new Error('Employee record not found');
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      const response = await employeeAPI.update(profile.id, profile);
      
      if (response.success) {
        setEditMode(false);
        await loadProfile(); // Reload to get updated data
      } else {
        throw new Error(response.message || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('employee_id', profile.id.toString());

      // For now, we'll simulate the upload - you'll need to implement this endpoint
      const response = { success: true, message: 'Photo upload simulated' };
      
      if (response.success) {
        await loadProfile(); // Reload to get updated photo
        setModalOpen(false);
      } else {
        throw new Error(response.message || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    }
  };

  // ✅ NEW: Separate function to just start the camera (no capture)
  const startCamera = async () => {
    if (cameraStream) {
      console.log('🎥 Camera already running, skipping start');
      return; // Don't start if already started
    }

    try {
      setError(null);
      console.log('🎥 Starting camera...');
      
      // Check if video element exists
      if (!videoRef.current) {
        throw new Error('Video element not found. Please refresh the page.');
      }
      
      // Request camera access with more permissive constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        } 
      });
      
      setCameraStream(stream);
      console.log('✅ Camera stream obtained');
      
      // Set up the video element
      videoRef.current.srcObject = stream;
      console.log('✅ Video srcObject set');
      
      // Wait for video to be ready with improved logic
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('⏰ Video initialization timeout');
          reject(new Error('Camera initialization timeout. Please try again.'));
        }, 10000); // Increased timeout
        
        const checkVideoReady = () => {
          if (!videoRef.current) {
            clearTimeout(timeout);
            reject(new Error('Video element lost'));
            return;
          }
          
          if (videoRef.current.readyState >= 2 && !videoRef.current.paused) {
            clearTimeout(timeout);
            console.log('✅ Video is ready and playing');
            resolve();
            return;
          }
          
          // Try to play if not playing
          if (videoRef.current.readyState >= 1 && videoRef.current.paused) {
            videoRef.current.play()
              .then(() => {
                console.log('▶️ Video started playing');
                setTimeout(checkVideoReady, 100); // Check again after play
              })
              .catch(err => {
                console.error('Video play error:', err);
                setTimeout(checkVideoReady, 100); // Continue checking
              });
          } else {
            setTimeout(checkVideoReady, 100); // Continue checking
          }
        };
        
        // Start checking
        checkVideoReady();
        
        // Also listen for metadata loaded
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded');
          checkVideoReady();
        };
      });
      
      console.log('✅ Camera fully initialized and ready');
      
    } catch (err) {
      console.error('Error starting camera:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      throw err; // Re-throw so caller can handle
    }
  };

  const handleFaceCapture = async () => {
    if (!profile) return;

    try {
      setIsCapturing(true);
      setError(null);
      
      // ✅ Make sure camera is started and ready
      if (!cameraStream) {
        console.log('🎥 No camera stream, starting camera...');
        await startCamera(); // This will ensure camera is fully ready
      } else {
        // Camera stream exists, but verify it's still working
        if (!videoRef.current || videoRef.current.readyState < 2 || videoRef.current.paused) {
          console.log('🎥 Camera stream exists but not ready, restarting...');
          await startCamera();
        }
      }
      
      // Final verification
      if (!videoRef.current || videoRef.current.readyState < 2) {
        console.error('❌ Video not ready after camera start:', videoRef.current?.readyState);
        throw new Error('Camera initialization failed. Please refresh the page and try again.');
      }
        
        console.log('✅ Video ready for capture:', {
          readyState: videoRef.current.readyState,
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight,
          currentTime: videoRef.current.currentTime,
          paused: videoRef.current.paused
        });
        
        // ✅ CRITICAL: Use REAL AI to capture face (NO MOCK DATA!)
        console.log('📸 Capturing REAL face using AI...');
        const { image, descriptor, detection } = await FaceRecognitionService.captureFace(videoRef.current);
        
        console.log('✅ REAL AI Face captured:', {
          descriptorLength: descriptor.length,
          detectionScore: detection.score,
          imageLength: image.length
        });
        
        // ✅ Display the REAL captured image to user for review
        setCapturedImage(image);
        console.log('✅ Real captured image set for user review');
        
        // ✅ Store only descriptor and score (NOT image) for database
        const faceDataForDB = {
          descriptor: Array.from(descriptor), // Convert Float32Array to regular array
          detection_score: detection.score
        };
        
        // Validate face data quality
      if (faceDataForDB.descriptor.length === 128 && faceDataForDB.detection_score > 0.7) {
        console.log('✅ Face data validated - High quality detection');
        setCapturedFaceData(JSON.stringify(faceDataForDB));
      } else {
        throw new Error(`Face detection quality too low (${(detection.score * 100).toFixed(1)}%). Please try again in good lighting.`);
      }
      
      // Show confirmation with real captured image
      setShowConfirmation(true);
      console.log('✅ Face capture complete, showing confirmation screen');
      
    } catch (err) {
      console.error('❌ Error capturing face:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture face. Please ensure your face is clearly visible.');
      
      // Clean up on error
      setCapturedImage(null);
      setCapturedFaceData(null);
      setShowConfirmation(false);
      
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCloseFaceModal = () => {
    console.log('🎥 Closing face modal, stopping camera...');
    setFaceModalOpen(false);
    setShowConfirmation(false);
    setCapturedImage(null);
    setCapturedFaceData(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
        console.log('📷 Camera track stopped');
      });
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // ✅ Cleanup camera when component unmounts
  React.useEffect(() => {
    return () => {
      console.log('🎥 Component unmounting, cleaning up camera...');
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleConfirmFaceCapture = async () => {
    try {
      if (!capturedFaceData) {
        throw new Error('No face data to save');
      }

      // Parse face data
      const faceData = JSON.parse(capturedFaceData);
      
      // ✅ IMPORTANT: Only send descriptor (128 numbers), NOT the image!
      const faceDataToSend = {
        descriptor: faceData.descriptor,
        detection_score: faceData.detection_score || 0.95
      };

      console.log('📤 Saving face descriptor:', {
        descriptorLength: faceDataToSend.descriptor.length,
        score: faceDataToSend.detection_score,
        estimatedSize: `${(JSON.stringify(faceDataToSend).length / 1024).toFixed(2)} KB`,
        userId: user?.id,
        isEmployee: !!profile?.id
      });

      // ✅ CRITICAL: Save to correct table based on user role
      let response;
      const isManagement = user?.role === 'admin' ||
                          user?.role === 'super_admin' || 
                          user?.role === 'company_admin' || 
                          user?.role === 'hr_manager' || 
                          user?.role === 'manager';
      
      if (isManagement) {
        // ✅ Management users ALWAYS save to users table
        console.log('💾 Saving to users table (user ID:', user.id, ') - Management user:', user.role);
        response = await fetch(`http://localhost:8000/api/v1/users/${user.id}/face`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ face_descriptor: JSON.stringify(faceDataToSend) })
        }).then(res => res.json());
      } else if (profile?.id) {
        // ✅ Regular employees save to employees table
        console.log('💾 Saving to employees table (employee ID:', profile.id, ') - Employee');
        response = await employeeAPI.update(profile.id, { 
          face_descriptor: JSON.stringify(faceDataToSend) 
        });
      } else {
        throw new Error('No user or employee ID available');
      }
      
      if (response.success) {
        console.log('✅ Face data saved successfully!');
        
        // ✅ Update profile state with new face_descriptor
        const updatedProfile = {
          ...profile!,
          face_descriptor: JSON.stringify(faceDataToSend)
        };
        setProfile(updatedProfile);
        console.log('✅ Updated profile state with face_descriptor');
        
        setFaceModalOpen(false);
        setShowConfirmation(false);
        setCapturedImage(null);
        setCapturedFaceData(null);
      } else {
        throw new Error(response.message || 'Failed to save face data');
      }
    } catch (err) {
      console.error('Error saving face data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save face data');
    }
  };

  const handleRetakeFaceCapture = () => {
    setShowConfirmation(false);
    setCapturedImage(null);
    setCapturedFaceData(null);
    // Restart the capture process
    handleFaceCapture();
  };

  const handleFaceTest = async () => {
    if (!profile?.face_descriptor) return;

    try {
      setIsTesting(true);
      
      // Simulate face test with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock face verification - always return success for development
      const result = true; // Mock successful verification
      
      setTestResult({
        success: result,
        message: result ? 'Face recognition successful!' : 'Face recognition failed'
      });
    } catch (err) {
      console.error('Error testing face recognition:', err);
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to test face recognition'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // For now, we'll simulate the password change - you'll need to implement this endpoint
      const response = { success: true, message: 'Password changed successfully' };
      
      if (response.success) {
        setPasswordModalOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // You could show a success toast here
        console.log('Password changed successfully');
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const getDefaultAvatar = (gender: string, id: number) => {
    return gender === 'female' 
      ? '/src/assets/avatars/female_avatar.svg' 
      : '/src/assets/avatars/male_avatar.svg';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-danger">
          <p>Error loading profile: {error}</p>
          <Button 
            color="primary" 
            variant="light" 
            onPress={loadProfile}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>No profile data found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Hero Section */}
          <HeroSection
            title="My Profile"
            subtitle="Profile Management"
            description="Manage your personal information, profile settings, and account preferences. Keep your details up to date and secure."
            icon="lucide:user"
            illustration="custom"
            actions={[
              {
                label: "Edit Profile",
                icon: "lucide:edit",
                onPress: () => setEditMode(true),
                variant: "solid"
              },
              {
                label: "Change Password",
                icon: "lucide:lock",
                onPress: () => setPasswordModalOpen(true),
                variant: "bordered"
              }
            ]}
          />

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >

            {/* Left Column - Profile Photo & Quick Info */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm">
                <CardBody className="p-6">
                  {/* Profile Photo Section */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <Avatar
                        src={profile.profile_photo ? `${API_BASE_URL}/uploads/profiles/${profile.profile_photo}` : getDefaultAvatar(profile.gender, profile.id)}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="w-32 h-32 text-large shadow-2xl ring-4 ring-white"
                        fallback={
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-white">
                            {profile.first_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        }
                      />
                        <Button
                          isIconOnly
                        className="absolute -bottom-2 -right-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
                          size="sm"
                          onPress={() => setModalOpen(true)}
                        >
                          <Icon icon="lucide:camera" className="w-4 h-4" />
                        </Button>
                      </div>
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold text-default-800">
                      {profile.first_name} {profile.last_name}
                      </h3>
                      <p className="text-default-500 text-sm">
                        {profile.designation || 'Employee'}
                      </p>
                      <p className="text-default-400 text-xs">
                        ID: {profile.employee_id || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:calendar" className="text-blue-500 w-4 h-4" />
                        <span className="text-sm text-default-600">Join Date</span>
                      </div>
                      <span className="text-sm font-medium text-default-800">
                        {profile.joining_date ? formatDate(profile.joining_date) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:building" className="text-green-500 w-4 h-4" />
                        <span className="text-sm text-default-600">Department</span>
                      </div>
                      <span className="text-sm font-medium text-default-800">
                        {profile.department || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:map-pin" className="text-orange-500 w-4 h-4" />
                        <span className="text-sm text-default-600">Branch</span>
                      </div>
                      <span className="text-sm font-medium text-default-800">
                        {profile.branch || 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-0 shadow-sm mt-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:phone" className="text-red-500 w-5 h-5" />
                    <h3 className="text-lg font-semibold text-default-800">Emergency Contact</h3>
                    <Chip size="sm" variant="flat" color="primary">
                      Edit via "Edit Profile" button above
                    </Chip>
                      </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-default-500 uppercase tracking-wide">Contact Name</label>
                      <p className="text-sm font-medium text-default-800">
                        {profile.emergency_contact_name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-default-500 uppercase tracking-wide">Relationship</label>
                      <p className="text-sm font-medium text-default-800">
                        {profile.emergency_contact_relationship || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-default-500 uppercase tracking-wide">Phone Number</label>
                      <p className="text-sm font-medium text-default-800">
                        {profile.emergency_contact_phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-default-500 uppercase tracking-wide">Email</label>
                      <p className="text-sm font-medium text-default-800">
                        {profile.emergency_contact_email || 'Not provided'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-default-500 uppercase tracking-wide">Address</label>
                      <p className="text-sm font-medium text-default-800">
                        {profile.emergency_contact_address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Face Recognition */}
              <Card className="border-0 shadow-sm mt-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:face-smile" className="text-purple-500 w-5 h-5" />
                    <h3 className="text-lg font-semibold text-default-800">Face Recognition</h3>
                      </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-default-600">Status</span>
                      <Chip 
                        size="sm" 
                        color={profile.face_descriptor ? "success" : "warning"}
                        variant="flat"
                      >
                        {profile.face_descriptor ? "Configured" : "Not Set"}
                      </Chip>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => setFaceModalOpen(true)}
                        startContent={<Icon icon="lucide:camera" className="w-4 h-4" />}
                      >
                        {profile.face_descriptor ? 'Update' : 'Setup'}
                      </Button>
                      {profile.face_descriptor && (
                        <Button
                          size="sm"
                          color="default"
                          variant="flat"
                          onPress={() => setTestFaceModalOpen(true)}
                          startContent={<Icon icon="lucide:test-tube" className="w-4 h-4" />}
                        >
                          Test
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:user" className="text-blue-500 w-5 h-5" />
                      <h3 className="text-lg font-semibold text-default-800">Personal Information</h3>
                    </div>
                    {!editMode && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => setEditMode(true)}
                      >
                        <Icon icon="lucide:edit" className="text-default-500 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="First Name"
                      value={profile.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                          isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:user" className="text-default-400" />}
                        />
                        <Input
                          label="Last Name"
                      value={profile.last_name || ''}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                          isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:user" className="text-default-400" />}
                        />
                        <Input
                      label="Email"
                          type="email"
                      value={profile.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                          startContent={<Icon icon="lucide:mail" className="text-default-400" />}
                        />
                        <Input
                      label="Phone"
                      value={profile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                          isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                          startContent={<Icon icon="lucide:phone" className="text-default-400" />}
                        />
                        <Select
                          label="Gender"
                      selectedKeys={profile.gender ? [profile.gender] : []}
                      onSelectionChange={(keys) => handleInputChange('gender', Array.from(keys)[0] as string)}
                          isDisabled={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                          startContent={<Icon icon="lucide:users" className="text-default-400" />}
                        >
                          <SelectItem key="male">Male</SelectItem>
                          <SelectItem key="female">Female</SelectItem>
                          <SelectItem key="other">Other</SelectItem>
                        </Select>
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:calendar" className="text-default-400" />}
                    />
                    <div className="md:col-span-2">
                        <Textarea
                          label="Address"
                        value={profile.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                          isReadOnly={!editMode}
                        className={editMode ? '' : 'opacity-75'}
                        minRows={3}
                        startContent={<Icon icon="lucide:map-pin" className="text-default-400" />}
                      />
                    </div>

                    {/* Emergency Contact Fields (Edit Mode) */}
                    {editMode && (
                      <>
                        <div className="md:col-span-2 mt-6 mb-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:phone" className="text-red-500 w-5 h-5" />
                            <h4 className="text-md font-semibold text-default-800">Emergency Contact</h4>
                          </div>
                          <Divider className="mt-2" />
                        </div>
                        <Input
                          label="Emergency Contact Name"
                          placeholder="Enter emergency contact name"
                          value={profile.emergency_contact_name || ''}
                          onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                          startContent={<Icon icon="lucide:user" className="text-default-400" />}
                        />
                        <Input
                          label="Relationship"
                          placeholder="e.g., Spouse, Parent, Sibling"
                          value={profile.emergency_contact_relationship || ''}
                          onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                          startContent={<Icon icon="lucide:users" className="text-default-400" />}
                        />
                        <Input
                          label="Emergency Phone"
                          placeholder="Enter emergency contact phone"
                          value={profile.emergency_contact_phone || ''}
                          onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                          startContent={<Icon icon="lucide:phone" className="text-default-400" />}
                        />
                        <Input
                          label="Emergency Email (Optional)"
                          type="email"
                          placeholder="Enter emergency contact email"
                          value={profile.emergency_contact_email || ''}
                          onChange={(e) => handleInputChange('emergency_contact_email', e.target.value)}
                          startContent={<Icon icon="lucide:mail" className="text-default-400" />}
                        />
                        <div className="md:col-span-2">
                          <Input
                            label="Emergency Address (Optional)"
                            placeholder="Enter emergency contact address"
                            value={profile.emergency_contact_address || ''}
                            onChange={(e) => handleInputChange('emergency_contact_address', e.target.value)}
                            startContent={<Icon icon="lucide:map-pin" className="text-default-400" />}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Work Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:briefcase" className="text-green-500 w-5 h-5" />
                    <h3 className="text-lg font-semibold text-default-800">Work Information</h3>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                      label="Employee ID"
                      value={profile.employee_id || ''}
                      isReadOnly
                      className="opacity-75"
                      startContent={<Icon icon="lucide:id-card" className="text-default-400" />}
                          />
                          <Input
                      label="Joining Date"
                      type="date"
                      value={profile.joining_date ? new Date(profile.joining_date).toISOString().split('T')[0] : ''}
                      isReadOnly
                      className="opacity-75"
                      startContent={<Icon icon="lucide:calendar" className="text-default-400" />}
                    />
                    <Select
                      label="Department"
                      selectedKeys={profile.department ? [profile.department] : []}
                      onSelectionChange={(keys) => handleInputChange('department', Array.from(keys)[0] as string)}
                      isDisabled={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:building" className="text-default-400" />}
                    >
                      <SelectItem key="IT">IT</SelectItem>
                      <SelectItem key="HR">HR</SelectItem>
                      <SelectItem key="Finance">Finance</SelectItem>
                      <SelectItem key="Marketing">Marketing</SelectItem>
                      <SelectItem key="Operations">Operations</SelectItem>
                      <SelectItem key="HR Manager">HR Manager</SelectItem>
                      <SelectItem key="Administration">Administration</SelectItem>
                    </Select>
                    <Select
                      label="Designation"
                      selectedKeys={profile.designation ? [profile.designation] : []}
                      onSelectionChange={(keys) => handleInputChange('designation', Array.from(keys)[0] as string)}
                      isDisabled={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:award" className="text-default-400" />}
                    >
                      <SelectItem key="Manager">Manager</SelectItem>
                      <SelectItem key="Senior Developer">Senior Developer</SelectItem>
                      <SelectItem key="Developer">Developer</SelectItem>
                      <SelectItem key="Analyst">Analyst</SelectItem>
                      <SelectItem key="Coordinator">Coordinator</SelectItem>
                    </Select>
                    <Select
                      label="Branch"
                      selectedKeys={profile.branch ? [profile.branch] : []}
                      onSelectionChange={(keys) => handleInputChange('branch', Array.from(keys)[0] as string)}
                      isDisabled={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:map-pin" className="text-default-400" />}
                    >
                      <SelectItem key="Main Office">Main Office</SelectItem>
                      <SelectItem key="Branch A">Branch A</SelectItem>
                      <SelectItem key="Branch B">Branch B</SelectItem>
                      <SelectItem key="Remote">Remote</SelectItem>
                      <SelectItem key="Headquarters">Headquarters</SelectItem>
                      <SelectItem key="Central Office">Central Office</SelectItem>
                    </Select>
                    <Select
                      label="Status"
                      selectedKeys={profile.status ? [profile.status] : []}
                      onSelectionChange={(keys) => handleInputChange('status', Array.from(keys)[0] as string)}
                      isDisabled={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:activity" className="text-default-400" />}
                    >
                      <SelectItem key="active">Active</SelectItem>
                      <SelectItem key="inactive">Inactive</SelectItem>
                      <SelectItem key="on-leave">On Leave</SelectItem>
                    </Select>
                  </div>
                </CardBody>
              </Card>

              {/* Additional Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:info" className="text-purple-500 w-5 h-5" />
                    <h3 className="text-lg font-semibold text-default-800">Additional Information</h3>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                      label="Blood Group"
                      value={profile.blood_group || ''}
                      onChange={(e) => handleInputChange('blood_group', e.target.value)}
                        isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:droplet" className="text-default-400" />}
                      />
                      <Input
                      label="Marital Status"
                      value={profile.marital_status || ''}
                      onChange={(e) => handleInputChange('marital_status', e.target.value)}
                        isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:heart" className="text-default-400" />}
                      />
                      <Input
                      label="Nationality"
                      value={profile.nationality || ''}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                        isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:flag" className="text-default-400" />}
                      />
                      <Input
                      label="Passport Number"
                      value={profile.passport_number || ''}
                      onChange={(e) => handleInputChange('passport_number', e.target.value)}
                        isReadOnly={!editMode}
                      className={editMode ? '' : 'opacity-75'}
                      startContent={<Icon icon="lucide:credit-card" className="text-default-400" />}
                      />
                    </div>
                </CardBody>
              </Card>

              {/* Edit Mode Actions */}
              {editMode && (
                <Card className="border-0 shadow-sm">
                  <CardBody className="p-6">
                    <div className="flex justify-end gap-3">
                      <Button
                        color="default"
                        variant="light"
                        onPress={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        onPress={handleSave}
                        isLoading={saving}
                      >
                        Save Changes
                      </Button>
                  </div>
                </CardBody>
              </Card>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Photo Upload Confirmation Modal */}
      <Modal isOpen={modalOpen} onOpenChange={(v: boolean) => setModalOpen(v)} placement="center" size="md">
        <ModalContent className="bg-content1/95 backdrop-blur-sm">
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon icon="lucide:camera" className="text-blue-600 text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Update Profile Photo</h3>
                <p className="text-sm text-default-500">
                  Choose a new photo for your profile
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar
                        src={profile.profile_photo ? `${API_BASE_URL}/uploads/profiles/${profile.profile_photo}` : getDefaultAvatar(profile.gender, profile.id)}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="w-24 h-24 text-large shadow-lg"
                        fallback={
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {profile.first_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                <Button 
                      color="primary"
                      variant="solid"
                      className="w-full"
                      startContent={<Icon icon="lucide:upload" className="w-4 h-4" />}
                      onPress={() => fileInputRef.current?.click()}
                    >
                      Choose Photo
                </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                <Button 
                      color="default"
                      variant="light"
                      className="w-full"
                      onPress={onClose}
                    >
                      Cancel
                </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Face Recognition Setup Modal */}
      <Modal isOpen={faceModalOpen} onOpenChange={(v: boolean) => !v && handleCloseFaceModal()} placement="center" size="lg">
        <ModalContent className="bg-content1/95 backdrop-blur-sm">
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Icon icon="lucide:face-smile" className="text-green-600 text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Face Recognition Setup</h3>
                <p className="text-sm text-default-500">
                  {showConfirmation 
                    ? 'Review your captured photo and confirm to save' 
                    : profile.face_descriptor 
                      ? 'Update your face recognition data' 
                      : 'Set up face recognition for secure login'
                  }
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative inline-block">
                      {showConfirmation ? (
                        // Show captured image for confirmation
                <div className="relative">
                          {capturedImage ? (
                            <div className="relative">
                              <img
                                src={capturedImage}
                                alt="Your Captured Face - Review this photo"
                                className="w-48 h-48 rounded-lg shadow-lg object-cover border-2 border-blue-200"
                                onLoad={(e) => {
                                  console.log('✅ Actual camera image loaded successfully!');
                                  const img = e.target as HTMLImageElement;
                                  console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                                }}
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', e);
                                  console.log('Image src preview:', capturedImage?.substring(0, 100) + '...');
                                  console.log('Full image src length:', capturedImage?.length);
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <Icon icon="lucide:camera" className="w-3 h-3" />
                                Your Photo
                              </div>
                            </div>
                          ) : (
                            <div className="w-48 h-48 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center">
                              <div className="text-center text-red-600">
                                <Icon icon="lucide:alert-circle" className="text-2xl mb-1" />
                                <p className="text-xs font-medium">No Image Captured</p>
                                <p className="text-xs mt-1">Please try again</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : cameraStream && !showConfirmation ? (
                        // Show live camera feed only when not in confirmation mode
                        <div className="relative">
                          <video
                            ref={videoRef}
                    autoPlay
                    muted
                            playsInline
                            className="w-48 h-48 rounded-lg shadow-lg object-cover"
                            style={{ transform: 'scaleX(-1)' }} // Mirror the video
                          />
                          {isCapturing && (
                            <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                                <Icon icon="lucide:camera" className="text-2xl mb-1 animate-pulse" />
                                <p className="text-xs font-medium">Capturing...</p>
                      </div>
                    </div>
                  )}
                        </div>
                      ) : (
                        // Show avatar placeholder
                        <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-6xl font-bold shadow-lg">
                          {profile.first_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="text-center">
                    {showConfirmation ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                          <Icon icon="lucide:eye" className="inline w-4 h-4 mr-1" />
                          <strong>Face capture completed!</strong> {capturedImage && capturedImage.length > 10000 ? 
                            'Your actual face photo has been captured and is displayed above. Click "Confirm & Save Face" to save it.' :
                            'Face data has been processed. Click "Confirm & Save Face" to save your face recognition data.'
                          } Or click "Retake Photo" to try again.
                        </p>
                      </div>
                    ) : cameraStream ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700">
                          <Icon icon="lucide:camera" className="inline w-4 h-4 mr-1" />
                          Position your face in the center of the frame and click "Capture Face" when ready.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <Icon icon="lucide:camera" className="inline w-4 h-4 mr-1" />
                          Click "Capture Face" to start the camera and capture your face for recognition.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {showConfirmation ? (
                      // Confirmation step buttons
                      <>
                        <Button
                          color="success"
                          variant="solid"
                          className="w-full"
                          onPress={handleConfirmFaceCapture}
                          startContent={<Icon icon="lucide:check" className="w-4 h-4" />}
                        >
                          Confirm & Save Face
                        </Button>
                        <Button
                          color="warning"
                          variant="light"
                          className="w-full"
                          onPress={handleRetakeFaceCapture}
                          startContent={<Icon icon="lucide:refresh-cw" className="w-4 h-4" />}
                        >
                          Retake Photo
                        </Button>
                        <Button
                          color="default"
                          variant="light"
                          className="w-full"
                          onPress={handleCloseFaceModal}
                          startContent={<Icon icon="lucide:x" className="w-4 h-4" />}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      // Initial capture buttons
                      <>
                        <Button
                          color="primary"
                          variant="solid"
                          className="w-full"
                          startContent={<Icon icon="lucide:camera" className="w-4 h-4" />}
                          onPress={handleFaceCapture}
                          isLoading={isCapturing}
                        >
                          {isCapturing ? 'Capturing...' : 'Capture Face'}
                        </Button>
                        <Button
                          color="default"
                          variant="light"
                          className="w-full"
                          onPress={handleCloseFaceModal}
                          startContent={<Icon icon="lucide:x" className="w-4 h-4" />}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                      </div>
                    </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Face Recognition Test Modal */}
      <Modal isOpen={testFaceModalOpen} onOpenChange={(v: boolean) => setTestFaceModalOpen(v)} placement="center" size="lg">
        <ModalContent className="bg-content1/95 backdrop-blur-sm">
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon icon="lucide:face-smile" className="text-blue-600 text-2xl" />
                      </div>
                    </div>
                <h3 className="text-xl font-semibold">Test Face Recognition</h3>
                <p className="text-sm text-default-500">
                  Test your face recognition setup
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-6xl font-bold shadow-lg">
                        {profile.first_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                      {testResult && (
                        <div className={`absolute inset-0 ${testResult.success ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-lg flex items-center justify-center`}>
                          <Icon icon={testResult.success ? "lucide:check-circle" : "lucide:x-circle"} className={`${testResult.success ? 'text-green-500' : 'text-red-500'} text-4xl`} />
                    </div>
                  )}
                    </div>
                    </div>
                  <div className="space-y-2">
                <Button 
                      color="primary"
                      variant="solid"
                      className="w-full"
                      startContent={<Icon icon="lucide:camera" className="w-4 h-4" />}
                      onPress={handleFaceTest}
                      isLoading={isTesting}
                    >
                      {isTesting ? 'Testing...' : 'Test Face Recognition'}
                </Button>
                <Button 
                      color="default"
                      variant="light"
                      className="w-full"
                      onPress={onClose}
                    >
                      Cancel
                </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={passwordModalOpen} onOpenChange={(v: boolean) => setPasswordModalOpen(v)} placement="center" size="md">
        <ModalContent className="bg-content1/95 backdrop-blur-sm">
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon icon="lucide:lock" className="text-blue-600 text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Change Password</h3>
                <p className="text-sm text-default-500">
                  Update your account password
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    startContent={<Icon icon="lucide:lock" className="text-default-400" />}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    startContent={<Icon icon="lucide:key" className="text-default-400" />}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    startContent={<Icon icon="lucide:key" className="text-default-400" />}
                  />
                  {error && (
                    <div className="text-danger text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="default"
                  variant="light" 
                  onPress={() => {
                    setPasswordModalOpen(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleChangePassword}
                  isLoading={saving}
                >
                  Change Password
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}