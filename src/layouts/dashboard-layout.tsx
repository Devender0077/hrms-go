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
    import { useTheme } from "../contexts/theme-context";
    import { useTranslation } from "../contexts/translation-context";
    import { employeeAPI } from "../services/api-service";
    import { getDefaultAvatar } from "../utils/avatarUtils";
    import Sidebar from "../components/sidebar";
    import MobileSidebar from "../components/mobile-sidebar";
    import SearchBar from "../components/common/SearchBar";
    import NotificationDropdown from "../components/common/NotificationDropdown";
    
    interface DashboardLayoutProps {
      children: React.ReactNode;
    }
    
    export default function DashboardLayout({ children }: DashboardLayoutProps) {
      const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
      const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
      const [userGender, setUserGender] = useState<string>('male');
      const { isOpen, onOpen, onClose } = useDisclosure();
      const { user, logout } = useAuth();
      const { theme, toggleTheme } = useTheme();
      const { language, setLanguage, t } = useTranslation();
      const navigate = useNavigate();
      
      // Debug: Log current language
      useEffect(() => {
        console.log('Current language:', language);
      }, [language]);
      
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
              console.log('🔄 DashboardLayout v2.9.9 - Role-based profile fetch');
              const userId = parseInt(user.id);
              
              // ✅ Check if user is management (admin, super_admin, company_admin, hr_manager, manager)
              const isManagement = user.role === 'admin' ||
                                  user.role === 'super_admin' || 
                                  user.role === 'company_admin' || 
                                  user.role === 'hr_manager' || 
                                  user.role === 'manager';
              
              console.log('👤 User role check:', { userId, role: user.role, isManagement });
              
              if (isManagement) {
                // ✅ Management users - load from users table
                const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                }).then(res => res.json());
                
                if (response.success && response.data) {
                  setProfilePhoto(response.data.profile_photo || user.profile_photo);
                  setUserGender(response.data.gender || 'male');
                }
              } else {
                // ✅ Regular employees - load from employees table
                const response = await employeeAPI.getByUserId(userId);
                if (response && response.data) {
                  setProfilePhoto(response.data.profile_photo);
                  setUserGender(response.data.gender || 'male');
                }
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              // Fallback to user context data
              if (user.profile_photo) {
                setProfilePhoto(user.profile_photo);
              }
            }
          }
        };

        fetchUserProfile();
      }, [user?.id, user?.role]);
      
      return (
        <div className="flex h-screen bg-background">
          {/* Desktop Sidebar */}
          <div className={`hidden md:block transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <Sidebar isOpen={isSidebarOpen} />
          </div>
          
          {/* Mobile Sidebar */}
          <MobileSidebar isOpen={isOpen} onClose={onClose} />
          
          {/* Main Content */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Enhanced Top Navbar */}
            <Navbar maxWidth="full" className="bg-content1/80 backdrop-blur-xl px-4 lg:px-6">
              <NavbarContent className="gap-4" justify="start">
                {/* Sidebar Toggle */}
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

                {/* Search Bar */}
                <div className="hidden md:block flex-1 max-w-md">
                  <SearchBar 
                    placeholder="Search employees, tasks, settings..."
                    className="w-full"
                  />
                </div>
              </NavbarContent>
              
              <NavbarContent justify="end" className="gap-4">
                {/* Mobile Search Button */}
                <NavbarItem className="md:hidden">
                  <Button 
                    isIconOnly 
                    variant="light" 
                    aria-label="Search"
                    className="rounded-lg p-2"
                  >
                    <Icon icon="lucide:search" className="text-xl" />
                  </Button>
                </NavbarItem>

                {/* Language Selector */}
                <NavbarItem>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button 
                        isIconOnly 
                        variant="light"
                        aria-label="Select Language"
                        className="rounded-lg"
                      >
                        <Icon icon="lucide:languages" className="text-xl" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                      aria-label="Language Selection"
                      selectedKeys={[language]}
                      onAction={(key) => {
                        console.log('Language selected:', key);
                        setLanguage(key as string);
                      }}
                    >
                      <DropdownItem key="en" startContent="🇺🇸">English</DropdownItem>
                      <DropdownItem key="hi" startContent="🇮🇳">Hindi</DropdownItem>
                      <DropdownItem key="es" startContent="🇪🇸">Spanish</DropdownItem>
                      <DropdownItem key="fr" startContent="🇫🇷">French</DropdownItem>
                      <DropdownItem key="de" startContent="🇩🇪">German</DropdownItem>
                      <DropdownItem key="zh" startContent="🇨🇳">Chinese</DropdownItem>
                      <DropdownItem key="ar" startContent="🇸🇦">Arabic</DropdownItem>
                      <DropdownItem key="pt" startContent="🇵🇹">Portuguese</DropdownItem>
                      <DropdownItem key="ru" startContent="🇷🇺">Russian</DropdownItem>
                      <DropdownItem key="ja" startContent="🇯🇵">Japanese</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </NavbarItem>

                {/* Theme Toggle */}
                <NavbarItem>
                  <Button 
                    isIconOnly 
                    variant="light" 
                    onPress={toggleTheme}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    className="rounded-lg p-2"
                  >
                    <Icon 
                      icon={theme === 'light' ? 'lucide:moon' : 'lucide:sun'} 
                      className="text-xl" 
                    />
                  </Button>
                </NavbarItem>
                
                {/* Enhanced Notifications */}
                <NavbarItem>
                  <NotificationDropdown />
                </NavbarItem>
                
                {/* User Profile Dropdown */}
                <NavbarItem>
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Avatar
                        isBordered
                        as="button"
                        className="transition-transform ml-2"
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
                </NavbarItem>
              </NavbarContent>
            </Navbar>
            
            {/* Page Content */}
            <motion.main 
              className="flex-1 bg-background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.main>
            
            {/* Footer */}
            <footer className="bg-content1 py-4 px-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-default-600">
                <div className="flex items-center space-x-4 mb-2 md:mb-0">
                  <span>© {new Date().getFullYear()} {user?.company_name || 'HRMS GO'}. All rights reserved.</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Developed with ❤️ by</span>
                  <span className="font-semibold text-primary">Devender</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      );
    }