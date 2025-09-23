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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "@heroui/use-theme";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = () => {
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      navigate.push("/dashboard");
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

        <Card className="shadow-md">
          <CardHeader className="flex flex-col gap-1 items-center">
            <h2 className="text-xl font-bold">Welcome Back</h2>
            <p className="text-default-500 text-sm">Sign in to your account</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onValueChange={setEmail}
              startContent={
                <Icon icon="lucide:mail" className="text-default-400" />
              }
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
            />

            <div className="flex justify-between items-center">
              <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
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
            >
              Sign In
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
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="flat"
                startContent={<Icon icon="logos:microsoft-icon" />}
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
    </div>
  );
}
