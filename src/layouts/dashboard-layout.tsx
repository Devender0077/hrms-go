import React, { useState, useEffect } from "react";
    import { 
      Navbar, 
      NavbarBrand, 
      NavbarContent, 
      NavbarItem, 
      Button, 
      Badge, 
      Dropdown, 
      DropdownTrigger, 
      DropdownMenu, 
      DropdownItem, 
      Avatar,
      useDisclosure
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    import { useNavigate } from "react-router-dom";
    import { useAuth } from "../contexts/auth-context";
    import { employeeAPI } from "../services/api-service";
    import { getDefaultAvatar } from "../utils/avatarUtils";
    import Sidebar from "../components/sidebar";
    import MobileSidebar from "../components/mobile-sidebar";
    
    interface DashboardLayoutProps {
      children: React.ReactNode;
    }
    
    export default function DashboardLayout({ children }: DashboardLayoutProps) {
      const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
      const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
      const [userGender, setUserGender] = useState<string>('male');
      const { isOpen, onOpen, onClose } = useDisclosure();
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      
      const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };
      
      
      const handleLogout = () => {
        logout();
        navigate("/login");
      };

      // Fetch user profile photo
      useEffect(() => {
        const fetchUserProfile = async () => {
          if (user?.id) {
            try {
              const userId = parseInt(user.id);
              const profile = await employeeAPI.getById(userId);
              if (profile) {
                setProfilePhoto(profile.profile_photo);
                setUserGender(profile.gender || 'male');
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }
        };

        fetchUserProfile();
      }, [user?.id]);
      
      return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Desktop Sidebar */}
          <div className={`hidden md:block transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <Sidebar isOpen={isSidebarOpen} />
          </div>
          
          {/* Mobile Sidebar */}
          <MobileSidebar isOpen={isOpen} onClose={onClose} />
          
          {/* Main Content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Navbar */}
            <Navbar maxWidth="full" className="shadow-sm border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <NavbarContent className="sm:flex gap-4" justify="start">
                <Button 
                  isIconOnly 
                  variant="light" 
                  onPress={toggleSidebar}
                  aria-label="Toggle sidebar"
                  className="rounded-lg hidden md:flex"
                >
                  <Icon icon="lucide:menu" className="text-xl" />
                </Button>
                <Button 
                  isIconOnly 
                  variant="light" 
                  onPress={onOpen}
                  aria-label="Open mobile menu"
                  className="rounded-lg md:hidden"
                >
                  <Icon icon="lucide:menu" className="text-xl" />
                </Button>
              </NavbarContent>
              
              <NavbarContent justify="end">
                
                <NavbarItem>
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Badge content="5" color="danger">
                        <Button isIconOnly variant="light" aria-label="Notifications" className="rounded-lg">
                          <Icon icon="lucide:bell" className="text-xl" />
                        </Button>
                      </Badge>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Notifications" variant="flat">
                      <DropdownItem key="header" className="h-14 gap-2">
                        <p className="font-semibold">Notifications</p>
                        <p className="text-sm text-default-500">5 unread messages</p>
                      </DropdownItem>
                      <DropdownItem key="notif1" startContent={<Icon icon="lucide:user-plus" />}>
                        New employee John Smith joined
                      </DropdownItem>
                      <DropdownItem key="notif2" startContent={<Icon icon="lucide:calendar" />}>
                        Team meeting in 30 minutes
                      </DropdownItem>
                      <DropdownItem key="notif3" startContent={<Icon icon="lucide:file-text" />}>
                        Leave request from Sarah Johnson
                      </DropdownItem>
                      <DropdownItem key="notif4" startContent={<Icon icon="lucide:alert-circle" />}>
                        System maintenance scheduled
                      </DropdownItem>
                      <DropdownItem key="notif5" startContent={<Icon icon="lucide:check-circle" />}>
                        Payroll processed successfully
                      </DropdownItem>
                      <DropdownItem key="view-all" className="text-center">
                        View All Notifications
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </NavbarItem>
                
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-transform"
                      color="primary"
                      name={user?.name || "User"}
                      size="sm"
                      src={profilePhoto ? `http://localhost:8000/uploads/profiles/${profilePhoto}` : getDefaultAvatar(userGender, parseInt(user?.id || '1'))}
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <p className="font-semibold">Signed in as</p>
                      <p className="font-semibold">{user?.email || "user@example.com"}</p>
                      <p className="text-xs text-default-500 capitalize">{user?.role?.replace("_", " ") || "User"}</p>
                    </DropdownItem>
                    <DropdownItem 
                      key="my-profile" 
                      startContent={<Icon icon="lucide:user" />}
                      onPress={() => navigate("/dashboard/profile")}
                    >
                      My Profile
                    </DropdownItem>
                    <DropdownItem 
                      key="settings" 
                      startContent={<Icon icon="lucide:settings" />}
                      onPress={() => navigate("/dashboard/settings")}
                    >
                      Settings
                    </DropdownItem>
                    <DropdownItem 
                      key="help_and_feedback" 
                      startContent={<Icon icon="lucide:help-circle" />}
                      onPress={() => {
                        // Add help & feedback functionality
                        console.log("Help & Feedback clicked");
                      }}
                    >
                      Help & Feedback
                    </DropdownItem>
                    <DropdownItem 
                      key="logout" 
                      color="danger" 
                      startContent={<Icon icon="lucide:log-out" />}
                      onPress={handleLogout}
                    >
                      Log Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarContent>
            </Navbar>
            
            {/* Page Content */}
            <motion.main 
              className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.main>
            
            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-4 mb-2 md:mb-0">
                  <span>© 2024 HRMS GO. All rights reserved.</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Developed with ❤️ by</span>
                  <span className="font-semibold text-blue-600">HRMS Development Team</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      );
    }