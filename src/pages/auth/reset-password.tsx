import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "@heroui/use-theme";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Get token from URL query params
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const handleSubmit = () => {
    setIsLoading(true);

    // Basic validation
    if (!password || !confirmPassword) {
      addToast({
        title: "Error",
        description: "Please fill in all fields",
        color: "danger",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      addToast({
        title: "Error",
        description: "Passwords do not match",
        color: "danger",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      addToast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        color: "danger",
      });
      setIsLoading(false);
      return;
    }

    // Simulate password reset process
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      addToast({
        title: "Success",
        description: "Your password has been reset successfully",
        color: "success",
      });
    }, 1500);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Redirect to login if no token is provided
  React.useEffect(() => {
    if (!token) {
      navigate.push("/login");
    }
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <Button
          isIconOnly
          variant="light"
          onPress={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg"
        >
          <Icon
            icon={theme === "light" ? "lucide:moon" : "lucide:sun"}
            className="text-xl"
          />
        </Button>
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
          <CardHeader className="flex flex-col gap-1 items-center">
            <h2 className="text-xl font-bold">Reset Password</h2>
            <p className="text-default-500 text-sm">
              Create a new password for your account
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            {!isSubmitted ? (
              <>
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  type="password"
                  value={password}
                  onValueChange={setPassword}
                  startContent={
                    <Icon icon="lucide:lock" className="text-default-400" />
                  }
                  className="rounded-lg"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                  startContent={
                    <Icon icon="lucide:lock" className="text-default-400" />
                  }
                  className="rounded-lg"
                />

                <div className="text-xs text-default-500 space-y-1">
                  <p>Password must:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Be at least 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>

                <Button
                  color="primary"
                  fullWidth
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  className="rounded-lg"
                >
                  Reset Password
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <Icon icon="lucide:check" className="text-3xl text-success" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Password Reset Successful
                  </h3>
                  <p className="text-default-600 mb-4">
                    Your password has been reset successfully. You can now log
                    in with your new password.
                  </p>
                  <Button
                    color="primary"
                    onPress={() => navigate.push("/login")}
                    className="rounded-lg"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
          {!isSubmitted && (
            <CardFooter className="flex justify-center">
              <p className="text-default-500 text-sm">
                Remember your password?{" "}
                <Link to="/login" className="text-primary">
                  Back to login
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>

        <div className="mt-8 text-center text-default-500 text-xs">
          <p>© 2023 HRMGO. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}
