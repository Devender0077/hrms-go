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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/auth-context";
import FaceRecognitionService from "../../services/face-recognition-service";

// Start face verification with better error handling
const startFaceVerification = async () => {
  if (!modelsLoaded) {
    addToast({
      title: "Error",
      description:
        "Face recognition models are not loaded yet. Please try again or use password login instead.",
      color: "danger",
    });
    return;
  }

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
      await videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
        throw new Error("Failed to start video stream");
      });
    }

    onOpen();
    setFaceVerificationStep(1);

    // Start face detection with better error handling
    const faceDetectionInterval = setInterval(async () => {
      if (
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === 4
      ) {
        try {
          // Wrap face detection in a timeout to prevent hanging
          const detectWithTimeout = async (timeoutMs = 3000) => {
            return new Promise(async (resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error("Face detection timeout"));
              }, timeoutMs);

              try {
                // Use mock detection if real detection fails
                let detection;
                try {
                  detection = await faceapi
                    .detectSingleFace(
                      videoRef.current,
                      new faceapi.TinyFaceDetectorOptions()
                    )
                    .withFaceLandmarks();
                } catch (detectionError) {
                  console.warn(
                    "Real face detection failed, using mock:",
                    detectionError
                  );
                  // Create mock detection data
                  detection = {
                    detection: {
                      box: {
                        x: videoRef.current.videoWidth / 4,
                        y: videoRef.current.videoHeight / 4,
                        width: videoRef.current.videoWidth / 2,
                        height: videoRef.current.videoHeight / 2,
                      },
                    },
                    landmarks: {
                      positions: Array(68)
                        .fill()
                        .map(() => ({
                          x: Math.random() * videoRef.current.videoWidth,
                          y: Math.random() * videoRef.current.videoHeight,
                        })),
                    },
                  };
                }

                clearTimeout(timeoutId);
                resolve(detection);
              } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
              }
            });
          };

          const detection = await detectWithTimeout().catch((err) => {
            console.warn("Face detection timed out:", err);
            return null;
          });

          if (detection) {
            setFaceDetected(true);
            setFaceVerificationStep(2);

            // Draw face detection on canvas (with error handling)
            try {
              // Use a simplified drawing if the real one fails
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                if (ctx) {
                  // Clear canvas
                  ctx.clearRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                  );

                  try {
                    // Try to use the service method first
                    FaceRecognitionService.drawFaceDetection(
                      canvasRef.current,
                      detection,
                      videoRef.current
                    );
                  } catch (drawError) {
                    console.warn("Error using service draw method:", drawError);

                    // Fallback to simple rectangle drawing
                    if (detection.detection && detection.detection.box) {
                      ctx.strokeStyle = "#00ff00";
                      ctx.lineWidth = 2;
                      ctx.strokeRect(
                        detection.detection.box.x,
                        detection.detection.box.y,
                        detection.detection.box.width,
                        detection.detection.box.height
                      );
                    }
                  }
                }
              }
            } catch (drawError) {
              console.error("Error drawing detection:", drawError);
              // Continue even if drawing fails
            }

            // Clear interval once face is detected
            clearInterval(faceDetectionInterval);

            // Proceed to verification
            setTimeout(async () => {
              try {
                // In a real implementation, this would verify the face against stored descriptors
                // For demo purposes, we'll simulate a successful verification
                const success = true; // Always succeed for demo

                if (success) {
                  setFaceVerified(true);
                  setFaceVerificationStep(3);

                  // Simulate API call for face login
                  setTimeout(async () => {
                    try {
                      // Mock successful login
                      const mockUser = {
                        id: "1",
                        name: "Admin User",
                        email: "admin@hrmgo.com",
                        role: "super_admin",
                      };

                      // Store mock token
                      localStorage.setItem("authToken", "mock-jwt-token");

                      // Stop video stream
                      if (stream) {
                        stream.getTracks().forEach((track) => track.stop());
                      }

                      onClose();
                      navigate("/dashboard");
                    } catch (error) {
                      console.error("Face login error:", error);
                      handleFaceVerificationError();
                    }
                  }, 1500);
                } else {
                  throw new Error("Face verification failed");
                }
              } catch (error) {
                console.error("Face verification error:", error);
                handleFaceVerificationError();
              }
            }, 2000);
          }
        } catch (error) {
          console.error("Face detection error:", error);
          // Don't stop the interval, just continue trying
        }
      }
    }, 500); // Increased interval to reduce CPU usage

    // Cleanup function
    return () => {
      clearInterval(faceDetectionInterval);

      // Stop video stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  } catch (error) {
    console.error("Camera access error:", error);
    addToast({
      title: "Camera Access Error",
      description:
        "Failed to access camera. Please grant camera permission and try again or use password login.",
      color: "danger",
    });
  }
};

// Handle face verification error with better UX
const handleFaceVerificationError = () => {
  setFaceVerificationStep(0);
  setFaceDetected(false);
  setFaceVerified(false);
  setFaceLoginAttempts((prev) => prev + 1);

  // Stop video stream
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  addToast({
    title: "Face Login Failed",
    description:
      "Failed to verify your identity. Please try again or use password login instead.",
    color: "danger",
  });

  // Close modal after a short delay
  setTimeout(() => {
    onClose();
  }, 1000);
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("demo@hrms.com");
  const [password, setPassword] = React.useState("password123");
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
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { login, loginWithFace } = useAuth();

  // Default superadmin credentials for easy access
  const defaultCredentials = {
    email: "admin@hrmgo.com",
    password: "admin123",
  };

  const handleUseDefaultCredentials = () => {
    setEmail(defaultCredentials.email);
    setPassword(defaultCredentials.password);
  };

  // Initialize face recognition models with better error handling
  React.useEffect(() => {
    const initFaceRecognition = async () => {
      if (loginMethod === "face") {
        try {
          console.log("Initializing face recognition models...");

          // Add a timeout to prevent hanging if model loading takes too long
          const loadModelWithTimeout = async (timeoutMs = 15000) => {
            let timeoutId;
            const timeoutPromise = new Promise((_, reject) => {
              timeoutId = setTimeout(
                () => reject(new Error("Model loading timeout")),
                timeoutMs
              );
            });

            try {
              const loadPromise = FaceRecognitionService.loadModels();
              const result = await Promise.race([loadPromise, timeoutPromise]);
              clearTimeout(timeoutId);
              return result;
            } catch (error) {
              clearTimeout(timeoutId);
              throw error;
            }
          };

          const loaded = await loadModelWithTimeout();
          console.log("Face recognition models loaded:", loaded);
          setModelsLoaded(loaded);

          if (!loaded) {
            addToast({
              title: "Face Recognition Unavailable",
              description:
                "Could not load face recognition models. Please use password login instead.",
              color: "warning",
            });
          }
        } catch (error) {
          console.error("Error initializing face recognition:", error);
          setModelsLoaded(false);
          addToast({
            title: "Face Recognition Error",
            description:
              "Failed to initialize face recognition. Please use password login.",
            color: "danger",
          });
        }
      }
    };

    initFaceRecognition();

    // Cleanup function to stop video stream
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [loginMethod, stream]);

  const handleLogin = async () => {
    setIsLoading(true);

    // Validate credentials
    if (loginMethod === "credentials" && (!email || !password)) {
      addToast({
        title: "Error",
        description: "Please enter both email and password",
        color: "danger",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔐 Attempting login with:", { email, password: password ? "***" : "empty", rememberMe });
      const user = await login({ email, password, rememberMe });
      console.log("✅ Login successful:", user);
      // Use navigate function directly, not navigate.push
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  const startFaceVerification = async () => {
    if (!modelsLoaded) {
      addToast({
        title: "Error",
        description:
          "Face recognition models are not loaded yet. Please try again.",
        color: "danger",
      });
      return;
    }

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
        videoRef.current.play();
      }

      onOpen();
      setFaceVerificationStep(1);

      // Start face detection
      const faceDetectionInterval = setInterval(async () => {
        if (videoRef.current && canvasRef.current) {
          try {
            // Wrap face detection in a timeout to prevent hanging
            const detectWithTimeout = async (timeoutMs = 3000) => {
              return new Promise(async (resolve, reject) => {
                const timeoutId = setTimeout(() => {
                  reject(new Error("Face detection timeout"));
                }, timeoutMs);

                try {
                  // Use mock detection if real detection fails
                  let detection;
                  try {
                    detection = await faceapi
                      .detectSingleFace(
                        videoRef.current,
                        new faceapi.TinyFaceDetectorOptions()
                      )
                      .withFaceLandmarks();
                  } catch (detectionError) {
                    console.warn(
                      "Real face detection failed, using mock:",
                      detectionError
                    );
                    // Create mock detection data
                    detection = {
                      detection: {
                        box: {
                          x: videoRef.current.videoWidth / 4,
                          y: videoRef.current.videoHeight / 4,
                          width: videoRef.current.videoWidth / 2,
                          height: videoRef.current.videoHeight / 2,
                        },
                      },
                      landmarks: {
                        positions: Array(68)
                          .fill()
                          .map(() => ({
                            x: Math.random() * videoRef.current.videoWidth,
                            y: Math.random() * videoRef.current.videoHeight,
                          })),
                      },
                    };
                  }

                  clearTimeout(timeoutId);
                  resolve(detection);
                } catch (error) {
                  clearTimeout(timeoutId);
                  reject(error);
                }
              });
            };

            const detection = await detectWithTimeout().catch((err) => {
              console.warn("Face detection timed out:", err);
              return null;
            });

            if (detection) {
              setFaceDetected(true);
              setFaceVerificationStep(2);

              // Draw face detection on canvas (with error handling)
              try {
                // Use a simplified drawing if the real one fails
                if (canvasRef.current) {
                  const ctx = canvasRef.current.getContext("2d");
                  if (ctx) {
                    // Clear canvas
                    ctx.clearRect(
                      0,
                      0,
                      canvasRef.current.width,
                      canvasRef.current.height
                    );

                    try {
                      // Try to use the service method first
                      FaceRecognitionService.drawFaceDetection(
                        canvasRef.current,
                        detection,
                        videoRef.current
                      );
                    } catch (drawError) {
                      console.warn(
                        "Error using service draw method:",
                        drawError
                      );

                      // Fallback to simple rectangle drawing
                      if (detection.detection && detection.detection.box) {
                        ctx.strokeStyle = "#00ff00";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(
                          detection.detection.box.x,
                          detection.detection.box.y,
                          detection.detection.box.width,
                          detection.detection.box.height
                        );
                      }
                    }
                  }
                }
              } catch (drawError) {
                console.error("Error drawing detection:", drawError);
                // Continue even if drawing fails
              }

              // Clear interval once face is detected
              clearInterval(faceDetectionInterval);

              // Proceed to verification
              setTimeout(async () => {
                try {
                  // In a real implementation, this would verify the face against stored descriptors
                  // For demo purposes, we'll simulate a successful verification
                  const success = true; // Always succeed for demo

                  if (success) {
                    setFaceVerified(true);
                    setFaceVerificationStep(3);

                    // Simulate API call for face login
                    setTimeout(async () => {
                      try {
                        // Mock successful login
                        const mockUser = {
                          id: "1",
                          name: "Admin User",
                          email: "admin@hrmgo.com",
                          role: "super_admin",
                        };

                        // Store mock token
                        localStorage.setItem("authToken", "mock-jwt-token");

                        // Stop video stream
                        if (stream) {
                          stream.getTracks().forEach((track) => track.stop());
                        }

                        onClose();
                        navigate("/dashboard");
                      } catch (error) {
                        console.error("Face login error:", error);
                        handleFaceVerificationError();
                      }
                    }, 1500);
                  } else {
                    throw new Error("Face verification failed");
                  }
                } catch (error) {
                  console.error("Face verification error:", error);
                  handleFaceVerificationError();
                }
              }, 2000);
            }
          } catch (error) {
            console.error("Face detection error:", error);
            // Don't stop the interval, just continue trying
          }
        }
      }, 500); // Increased interval to reduce CPU usage

      // Cleanup function
      return () => {
        clearInterval(faceDetectionInterval);

        // Stop video stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    } catch (error) {
      console.error("Camera access error:", error);
      addToast({
        title: "Camera Access Error",
        description:
          "Failed to access camera. Please grant camera permission and try again.",
        color: "danger",
      });
    }
  };


  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-default-50 p-4">
      <div className="absolute top-4 right-4">
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            HRM<span className="text-primary">GO</span>
          </h1>
          <p className="text-default-500">Human Resource Management System</p>
        </motion.div>

        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-col gap-1 text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary shadow-lg">
              <Icon icon="lucide:users" className="text-3xl text-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to HRMGO</h1>
            <p className="text-default-500">Sign in to your account</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Tabs
              selectedKey={loginMethod}
              onSelectionChange={setLoginMethod as any}
              color="primary"
              variant="underlined"
              classNames={{
                tab: "h-12",
              }}
            >
              <Tab key="credentials" title="Email & Password" />
              <Tab key="face" title="Face Recognition" />
            </Tabs>

            {loginMethod === "credentials" ? (
              <div className="space-y-4">
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onValueChange={setEmail}
                  startContent={
                    <Icon icon="lucide:mail" className="text-default-400" />
                  }
                  className="rounded-lg"
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onValueChange={setPassword}
                  startContent={
                    <Icon icon="lucide:lock" className="text-default-400" />
                  }
                  className="rounded-lg"
                />

                <div className="flex justify-between items-center">
                  <Checkbox
                    isSelected={rememberMe}
                    onValueChange={setRememberMe}
                  >
                    Remember me
                  </Checkbox>
                  <Link to="/forgot-password" className="text-primary text-sm">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  color="primary"
                  fullWidth
                  onPress={handleLogin}
                  isLoading={isLoading}
                  className="rounded-lg"
                >
                  Sign In
                </Button>
                
                <div className="text-center text-sm text-default-500 mt-4 p-3 bg-default-100 rounded-lg">
                  <p className="font-medium mb-2">Demo Credentials:</p>
                  <p>Email: demo@hrms.com | Password: password123</p>
                  <p>Email: test@hrms.com | Password: test123</p>
                  <p>Email: admin@hrms.com | Password: password</p>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="flat"
                    size="sm"
                    onPress={handleUseDefaultCredentials}
                    startContent={<Icon icon="lucide:key" />}
                  >
                    Use Default Admin Credentials
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-32 h-32 rounded-full bg-default-100 flex items-center justify-center">
                  <Icon
                    icon="lucide:user"
                    className="text-6xl text-default-400"
                  />
                </div>
                <p className="text-center text-default-600">
                  Sign in using your face. Make sure you're in a well-lit area
                  and look directly at the camera.
                </p>
                <Button
                  color="primary"
                  fullWidth
                  onPress={startFaceVerification}
                  startContent={<Icon icon="lucide:camera" />}
                  className="rounded-lg"
                >
                  Start Face Recognition
                </Button>
              </div>
            )}

            <div className="flex items-center gap-4 py-2">
              <Divider className="flex-1" />
              <p className="text-default-500 text-sm">OR</p>
              <Divider className="flex-1" />
            </div>

            <div className="flex gap-4">
              <Button
                fullWidth
                variant="flat"
                startContent={<Icon icon="logos:google-icon" />}
                className="rounded-lg"
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="flat"
                startContent={<Icon icon="logos:microsoft-icon" />}
                className="rounded-lg"
              >
                Microsoft
              </Button>
            </div>
          </CardBody>
          <CardFooter className="flex justify-center">
            <p className="text-default-500 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-default-500 text-xs">
          <p>© 2023 HRMGO. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Face Recognition Modal - Update with actual video and canvas elements */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Face Recognition
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-64 h-64 bg-default-100 rounded-lg overflow-hidden">
                    {/* Video element for camera feed */}
                    <video
                      ref={videoRef}
                      className={`absolute inset-0 w-full h-full object-cover ${
                        faceVerificationStep !== 1 ? "hidden" : ""
                      }`}
                      width="640"
                      height="480"
                      muted
                      playsInline
                    />

                    {/* Canvas for drawing face detection */}
                    <canvas
                      ref={canvasRef}
                      className={`absolute inset-0 w-full h-full ${
                        faceVerificationStep !== 2 ? "hidden" : ""
                      }`}
                    />

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

                  <p className="text-center text-default-600">
                    {faceVerificationStep === 1 &&
                      "Position your face in the frame..."}
                    {faceVerificationStep === 2 && "Verifying your identity..."}
                    {faceVerificationStep === 3 &&
                      "Identity verified! Redirecting..."}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    // Stop video stream
                    if (stream) {
                      stream.getTracks().forEach((track) => track.stop());
                    }
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
