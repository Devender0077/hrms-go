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
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/auth-context";
import { useTheme } from "../../contexts/theme-context";
import HeroSection from "../../components/common/HeroSection";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { register } = useAuth();
  const { theme } = useTheme();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      }
      
      if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      }
      
      if (!formData.password) {
      newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
      }
      
      setIsLoading(true);
      
      try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result.success) {
          addToast({
          title: "Account Created",
          description: "Your account has been created successfully. You can now log in.",
            color: "success",
          });
        navigate("/auth/login");
      } else {
        addToast({
          title: "Registration Failed",
          description: result.message || "Failed to create account. Please try again.",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      addToast({
        title: "Registration Error",
        description: "An error occurred during registration. Please try again.",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const roleOptions = [
    { key: "employee", label: "Employee" },
    { key: "manager", label: "Manager" },
    { key: "hr", label: "HR Manager" },
    { key: "company_admin", label: "Company Admin" },
  ];

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
              <Icon icon="lucide:user-plus" className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            </div>
            <p className="text-default-500 text-center">
              Join HRMS HUI v2 and start managing your HR operations
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardBody className="flex flex-col gap-4">
                    <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onValueChange={(value) => handleInputChange("name", value)}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                startContent={<Icon icon="lucide:user" className="w-4 h-4 text-default-400" />}
                variant="bordered"
                size="lg"
                  />

                  <Input
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                onValueChange={(value) => handleInputChange("email", value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                startContent={<Icon icon="lucide:mail" className="w-4 h-4 text-default-400" />}
                variant="bordered"
                size="lg"
              />

              <Select
                label="Role"
                placeholder="Select your role"
                selectedKeys={[formData.role]}
                onSelectionChange={(keys) => handleInputChange("role", Array.from(keys)[0] as string)}
                startContent={<Icon icon="lucide:shield" className="w-4 h-4 text-default-400" />}
                variant="bordered"
                size="lg"
              >
                {roleOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

                  <Input
                    label="Password"
                    placeholder="Create a password"
                type="password"
                value={formData.password}
                onValueChange={(value) => handleInputChange("password", value)}
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                startContent={<Icon icon="lucide:lock" className="w-4 h-4 text-default-400" />}
                variant="bordered"
                size="lg"
                  />

                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                type="password"
                value={formData.confirmPassword}
                onValueChange={(value) => handleInputChange("confirmPassword", value)}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
                startContent={<Icon icon="lucide:lock" className="w-4 h-4 text-default-400" />}
                variant="bordered"
                size="lg"
              />

                    <Checkbox
                      isSelected={formData.agreeToTerms}
                onValueChange={(checked) => handleInputChange("agreeToTerms", checked)}
                isInvalid={!!errors.agreeToTerms}
                      size="sm"
                classNames={{
                  label: "text-sm text-default-600",
                  wrapper: "after:bg-foreground after:text-background text-primary",
                }}
              >
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
              </Checkbox>
              {errors.agreeToTerms && (
                <p className="text-danger text-sm">{errors.agreeToTerms}</p>
                  )}

                  <Button
                    type="submit"
                    color="primary"
                fullWidth
                    size="lg"
                    isLoading={isLoading}
                className="rounded-lg font-semibold"
                startContent={!isLoading ? <Icon icon="lucide:user-plus" /> : null}
                  >
                {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
            </CardBody>
                </form>

          <CardFooter className="flex justify-center pt-2">
            <p className="text-default-500 text-sm">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-default-500 text-xs">
          <p>© 2024 HRMS HUI v2. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}