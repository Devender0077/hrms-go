import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Avatar,
  Input,
  Textarea,
  Divider,
  Chip,
  addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/auth-context";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@company.com",
    role: user?.role || "employee",
    department: "Engineering",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Experienced software engineer with 5+ years of experience in full-stack development.",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS"],
    joinDate: "2022-01-15"
  });

  const handleSave = () => {
    setIsEditing(false);
    addToast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
      color: "success",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    setProfileData({
      name: user?.name || "John Doe",
      email: user?.email || "john.doe@company.com",
      role: user?.role || "employee",
      department: "Engineering",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      bio: "Experienced software engineer with 5+ years of experience in full-stack development.",
      skills: ["React", "Node.js", "TypeScript", "Python", "AWS"],
      joinDate: "2022-01-15"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-default-500 mt-2">Manage your personal information and preferences</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button 
                color="primary" 
                onPress={handleSave}
                startContent={<Icon icon="lucide:save" />}
              >
                Save Changes
              </Button>
              <Button 
                variant="bordered" 
                onPress={handleCancel}
                startContent={<Icon icon="lucide:x" />}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              color="primary" 
              onPress={() => setIsEditing(true)}
              startContent={<Icon icon="lucide:edit" />}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center gap-4">
                <Avatar
                  src="https://img.heroui.chat/image/avatar?w=150&h=150&u=1"
                  className="w-20 h-20"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{profileData.name}</h3>
                  <p className="text-gray-600">{profileData.email}</p>
                  <Chip 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                    className="mt-2"
                  >
                    {profileData.role.replace("_", " ")}
                  </Chip>
                </div>
              </div>
            </CardHeader>
            <CardBody className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{profileData.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{profileData.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-medium">{new Date(profileData.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-4 pt-6 px-6">
              <h4 className="text-xl font-bold text-gray-800">Personal Information</h4>
            </CardHeader>
            <CardBody className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, name: value }))}
                    isDisabled={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                  />
                  <Input
                    label="Email"
                    value={profileData.email}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, email: value }))}
                    isDisabled={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                  />
                  <Input
                    label="Phone"
                    value={profileData.phone}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, phone: value }))}
                    isDisabled={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                  />
                  <Input
                    label="Location"
                    value={profileData.location}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, location: value }))}
                    isDisabled={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                  />
                </div>

                <div>
                  <Textarea
                    label="Bio"
                    value={profileData.bio}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, bio: value }))}
                    isDisabled={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                    minRows={3}
                  />
                </div>

                <Divider />

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        size="sm"
                        color="primary"
                        variant="flat"
                      >
                        {skill}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
