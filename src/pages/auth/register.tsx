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
import { useTheme } from "@heroui/use-theme";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [userType, setUserType] = React.useState("employee");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = () => {
    setIsLoading(true);

    // Basic validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
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

    if (!agreeTerms) {
      addToast({
        title: "Error",
        description: "You must agree to the terms and conditions",
        color: "danger",
      });
      setIsLoading(false);
      return;
    }

    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      addToast({
        title: "Success",
        description:
          "Registration successful! Please check your email for verification.",
        color: "success",
      });
      navigate.push("/login");
    }, 1500);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

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
        className="w-full max-w-lg"
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
            <h2 className="text-xl font-bold">Create an Account</h2>
            <p className="text-default-500 text-sm">
              Join our HR management platform
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Enter your first name"
                value={firstName}
                onValueChange={setFirstName}
                startContent={
                  <Icon icon="lucide:user" className="text-default-400" />
                }
                className="rounded-lg"
              />

              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={lastName}
                onValueChange={setLastName}
                startContent={
                  <Icon icon="lucide:user" className="text-default-400" />
                }
                className="rounded-lg"
              />
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                placeholder="Create a password"
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
                placeholder="Confirm your password"
                type="password"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                startContent={
                  <Icon icon="lucide:lock" className="text-default-400" />
                }
                className="rounded-lg"
              />
            </div>

            <Select
              label="User Type"
              placeholder="Select your role"
              selectedKeys={[userType]}
              onChange={(e) => setUserType(e.target.value)}
              className="rounded-lg"
            >
              <SelectItem key="employee" value="employee">
                Employee
              </SelectItem>
              <SelectItem key="company_admin" value="company_admin">
                Company Admin
              </SelectItem>
            </Select>

            {userType === "company_admin" && (
              <Input
                label="Company Name"
                placeholder="Enter your company name"
                value={companyName}
                onValueChange={setCompanyName}
                startContent={
                  <Icon icon="lucide:briefcase" className="text-default-400" />
                }
                className="rounded-lg"
              />
            )}

            <Checkbox isSelected={agreeTerms} onValueChange={setAgreeTerms}>
              I agree to the{" "}
              <Link to="/terms" className="text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary">
                Privacy Policy
              </Link>
            </Checkbox>

            <Button
              color="primary"
              fullWidth
              onPress={handleRegister}
              isLoading={isLoading}
              className="rounded-lg"
            >
              Create Account
            </Button>

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
              Already have an account?{" "}
              <Link to="/login" className="text-primary">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-default-500 text-xs">
          <p>© 2023 HRMGO. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}
