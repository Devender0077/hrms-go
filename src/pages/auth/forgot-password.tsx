import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = () => {
    setIsLoading(true);

    // Basic validation
    if (!email) {
      addToast({
        title: "Error",
        description: "Please enter your email address",
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
        description: "Password reset link has been sent to your email",
        color: "success",
      });
    }, 1500);
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
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
          <CardHeader className="flex flex-col gap-1 items-center">
            <h2 className="text-xl font-bold">Forgot Password</h2>
            <p className="text-default-500 text-sm">
              We'll send you a link to reset your password
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            {!isSubmitted ? (
              <>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  
                  onValueChange={setEmail}
                  startContent={
                    <Icon icon="lucide:mail" className="text-default-400" />
                  }
                  className="rounded-lg"
                />

                <Button
                  color="primary"
                  fullWidth
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  className="rounded-lg"
                >
                  Send Reset Link
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <Icon icon="lucide:check" className="text-3xl text-success" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-default-600 mb-4">
                    We've sent a password reset link to{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-default-500 text-sm">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button className="text-primary underline">
                      resend email
                    </button>
                  </p>
                </div>
              </div>
            )}
          </CardBody>
          <CardFooter className="flex justify-center">
            <p className="text-default-500 text-sm">
              Remember your password?{" "}
              <Link to="/login" className="text-primary">
                Back to login
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
