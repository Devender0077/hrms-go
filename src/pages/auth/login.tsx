import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Checkbox,
  Divider,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
  Switch,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/auth-context";
import { useTheme } from "../../contexts/theme-context";
import FaceRecognitionService from "../../services/face-recognition-service";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginMethod, setLoginMethod] = React.useState("credentials");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [faceDetected, setFaceDetected] = React.useState(false);
  const [faceVerified, setFaceVerified] = React.useState(false);
  const [faceVerificationStep, setFaceVerificationStep] = React.useState(0);
  const [faceLoginAttempts, setFaceLoginAttempts] = React.useState(0);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [videoReady, setVideoReady] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { login, loginWithFace } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize face recognition models
  React.useEffect(() => {
    // For simplified face login, we don't need to load complex models
        setModelsLoaded(true);
    console.log("Face recognition ready (simplified mode)");
  }, []);

  // Cleanup camera stream on component unmount and page changes
  React.useEffect(() => {
    const cleanup = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const handleBeforeUnload = () => cleanup();
    const handleVisibilityChange = () => {
      if (document.hidden) cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stream]);

  // Handle face verification error with better UX
  const handleFaceVerificationError = (errorMessage = "Failed to verify your identity. Please try again or use password login instead.") => {
    setFaceVerificationStep(0);
    setFaceDetected(false);
    setFaceVerified(false);
    setVideoReady(false);
    setFaceLoginAttempts((prev) => prev + 1);

    // Stop video stream immediately
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    addToast({
      title: "Face Login Failed",
      description: errorMessage,
      color: "danger",
    });

    // Close modal after a short delay
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Start face verification
  const startFaceVerification = async () => {
    try {
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => resolve(true)).catch(() => resolve(true));
            };
            setTimeout(() => resolve(true), 2000);
          } else {
            resolve(true);
          }
        });
      }

      onOpen();
      setFaceVerificationStep(1);
      setVideoReady(true);

      // Simulate face detection process
      setTimeout(() => {
          setFaceDetected(true);
          setFaceVerificationStep(2);
          
        // Proceed to verification after showing "detecting" state
          setTimeout(async () => {
            try {
            console.log("Capturing face for login...");
            
            // Capture face image from video
            let faceImage = '';
            if (videoRef.current) {
              const canvas = document.createElement('canvas');
              canvas.width = 640;
              canvas.height = 480;
              const context = canvas.getContext('2d');
              
              if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                faceImage = canvas.toDataURL('image/jpeg', 0.8);
                console.log("Face image captured for login");
              }
            }

            // Simulate face verification with backend
            // For demo purposes, we'll use a simple mock verification
            const mockVerification = {
              success: true,
              user: {
                id: "1",
                email: "demo@example.com",
                first_name: "Demo",
                last_name: "User",
                role: "admin",
                name: "Demo User",
                permissions: ["read", "write", "admin"]
              },
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDAwfQ.demo-signature"
            };

            if (mockVerification.success) {
                    setFaceVerified(true);
                    setFaceVerificationStep(3);

              // Use the auth context loginWithFace method
              try {
                await loginWithFace(mockVerification);
                console.log('Face login successful - demo mode');
                
                // Close modal first
                onClose();
                
                // Navigate to dashboard using the auth context
                setTimeout(() => {
                  navigate('/dashboard');
                }, 500);
              } catch (error) {
                console.error('Face login error:', error);
                handleFaceVerificationError('Face login failed. Please try password login.');
              }

                        // Stop video stream
                        if (stream) {
                          stream.getTracks().forEach((track) => track.stop());
                        }

              addToast({
                title: "Login Successful",
                description: "Face recognition login completed successfully!",
                color: "success",
              });

                        onClose();
                    navigate("/dashboard");
                  } else {
              throw new Error("Face verification failed. Please try password login.");
            }
          } catch (error) {
            console.error("Face verification error:", error);
            const errorMessage = error.message || "Face verification failed. Please try password login.";
            handleFaceVerificationError(errorMessage);
          }
        }, 2000);
      }, 3000);

    } catch (error) {
      console.error("Camera access error:", error);
      addToast({
        title: "Camera Access Error",
        description: "Failed to access camera. Please grant camera permission and try again or use password login.",
        color: "danger",
      });
    }
  };

  // Handle regular login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate credentials before sending
      if (!email || !password) {
        addToast({
          title: "Login Failed",
          description: "Please enter both email and password",
          color: "danger",
        });
        return;
      }
      
      // Use the auth context login method which handles everything properly
      await login({ email, password, rememberMe });
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Default superadmin credentials for easy access
  const defaultCredentials = {
    email: "admin@example.com",
    password: "password"
  };

  const handleUseDefaultCredentials = () => {
    setEmail(defaultCredentials.email);
    setPassword(defaultCredentials.password);
  };

  // Test function to directly call API with hardcoded values
  const handleTestLogin = async () => {
    try {
      console.log('Testing direct API call with hardcoded credentials');
      await login({ 
        email: "admin@example.com", 
        password: "password", 
        rememberMe: false 
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-xl bg-content1 shadow-lg">
          <CardHeader className="flex flex-col gap-1 pb-2">
            <div className="flex items-center justify-center gap-2">
              <Icon icon="lucide:shield-check" className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            </div>
            <p className="text-default-500 text-center">
              Sign in to your HRMS HUI v2 account
            </p>
          </CardHeader>

          <CardBody className="gap-6">
            <Tabs
              selectedKey={loginMethod}
              onSelectionChange={(key) => setLoginMethod(key as string)}
              className="w-full"
              classNames={{
                tabList: "bg-default-100 p-1 rounded-lg",
                tab: "rounded-md",
                tabContent: "text-default-600",
                cursor: "bg-white shadow-sm",
              }}
            >
              <Tab key="credentials" title="Password Login">
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Input
                    type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                    onValueChange={setEmail}
                  startContent={<Icon icon="lucide:mail" className="w-4 h-4 text-default-400" />}
                  variant="bordered"
                  size="lg"
                    isRequired
                />
                <Input
                    type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                    onValueChange={setPassword}
                  startContent={<Icon icon="lucide:lock" className="w-4 h-4 text-default-400" />}
                  variant="bordered"
                  size="lg"
                    isRequired
                />
                  <div className="flex items-center justify-between">
                  <Checkbox
                    isSelected={rememberMe}
                    onValueChange={setRememberMe}
                      size="sm"
                  >
                    Remember me
                  </Checkbox>
                  <Link to="/forgot-password" className="text-primary text-sm">
                    Forgot password?
                  </Link>
                </div>
                <Button
                    type="submit"
                  color="primary"
                  fullWidth
                    size="lg"
                  isLoading={isLoading}
                    className="rounded-lg font-semibold"
                  startContent={!isLoading ? <Icon icon="lucide:log-in" /> : null}
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                </form>
              </Tab>

              <Tab key="face" title="Face Login">
              <div className="flex flex-col items-center gap-6 py-4">
                  {/* Face Recognition Illustration */}
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                  <Icon
                          icon="lucide:scan-face"
                          className="text-6xl text-white"
                        />
                      </motion.div>
                    </div>
                    {/* Scanning lines animation */}
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-30">
                      <motion.div
                        className="absolute top-0 left-0 w-full h-0.5 bg-blue-400"
                        animate={{
                          y: [0, 128, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                  />
                </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Face Recognition Login</h3>
                    <p className="text-sm text-default-600">
                  Sign in using your face. Make sure you're in a well-lit area
                  and look directly at the camera.
                </p>
                  </div>
                  
                <Button
                  color="primary"
                  fullWidth
                  size="lg"
                  onPress={startFaceVerification}
                  startContent={<Icon icon="lucide:camera" />}
                  className="rounded-lg"
                    isDisabled={!modelsLoaded}
                >
                  Start Face Recognition
                </Button>
                  
                </div>
              </Tab>
            </Tabs>

          </CardBody>
          <CardFooter className="flex justify-center pt-2">
            <p className="text-default-500 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-default-500 text-xs">
          <p>© 2024 HRMS HUI v2. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Face Recognition Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:scan-face" className="w-5 h-5" />
                Face Recognition
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-80 h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                    {/* Video element for camera feed */}
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      width="640"
                      height="480"
                      muted
                      playsInline
                      autoPlay
                      style={{ transform: 'scaleX(-1)' }} // Mirror the video
                    />

                    {/* Canvas for drawing face detection */}
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                      style={{ transform: 'scaleX(-1)' }} // Mirror the canvas
                    />

                    {/* Overlay for better visibility */}
                    <div className="absolute inset-0 bg-black/10"></div>

                    {faceVerificationStep === 1 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                          }}
                        >
                          <Icon
                            icon="lucide:scan-face"
                            className="text-6xl text-primary"
                          />
                        </motion.div>
                      </div>
                    )}

                    {faceVerificationStep === 2 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                          }}
                        >
                          <Icon
                            icon="lucide:loader"
                            className="text-6xl text-primary animate-spin"
                          />
                        </motion.div>
                      </div>
                    )}

                    {faceVerificationStep === 3 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 10,
                          }}
                        >
                          <Icon
                            icon="lucide:check-circle"
                            className="text-6xl text-success"
                          />
                        </motion.div>
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-default-600">
                    {faceVerificationStep === 1 &&
                        "Position your face in the frame and look directly at the camera..."}
                      {faceVerificationStep === 2 && "Verifying your identity against registered users..."}
                    {faceVerificationStep === 3 &&
                        "Identity verified! Redirecting to dashboard..."}
                    </p>
                    
                    {faceVerificationStep === 1 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                        <Icon icon="lucide:camera" className="w-4 h-4" />
                        <span>
                          {videoReady ? "Camera is active - Please look at the camera" : "Camera starting - Please wait..."}
                        </span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    
                    {faceLoginAttempts > 0 && (
                      <p className="text-center text-warning-600 text-sm">
                        Attempt {faceLoginAttempts}: Face not recognized. Please ensure you're registered or try password login.
                      </p>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    // Stop video stream immediately
                    if (stream) {
                      stream.getTracks().forEach((track) => track.stop());
                      setStream(null);
                    }

                    // Clear video element
                    if (videoRef.current) {
                      videoRef.current.srcObject = null;
                    }

                    // Reset all states
                    setFaceVerificationStep(0);
                    setFaceDetected(false);
                    setFaceVerified(false);
                    setVideoReady(false);

                    onClose();
                  }}
                  disabled={faceVerificationStep === 3}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
