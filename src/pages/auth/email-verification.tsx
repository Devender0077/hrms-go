// Create email verification page
import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, CardFooter, Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/auth-context";

export default function EmailVerification() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [verifying, setVerifying] = React.useState(true);
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setVerified(true);
      } catch (error) {
        console.error("Email verification error:", error);
        setError(
          "Failed to verify email. The verification link may have expired or is invalid."
        );
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token, verifyEmail]);

  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg rounded-xl">
            <CardBody className="flex flex-col items-center py-8 gap-4">
              <Spinner size="lg" color="primary" />
              <h2 className="text-xl font-bold">Verifying Email</h2>
              <p className="text-center text-default-500">
                Please wait while we verify your email address...
              </p>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg rounded-xl">
          <CardBody className="flex flex-col items-center py-8 gap-4">
            {verified ? (
              <>
                <div className="p-4 rounded-full bg-success/10">
                  <Icon
                    icon="lucide:check-circle"
                    className="text-5xl text-success"
                  />
                </div>
                <h2 className="text-2xl font-bold">Email Verified</h2>
                <p className="text-center text-default-500">
                  Your email has been verified successfully. You can now login
                  to your account.
                </p>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-danger/10">
                  <Icon
                    icon="lucide:x-circle"
                    className="text-5xl text-danger"
                  />
                </div>
                <h2 className="text-2xl font-bold">Verification Failed</h2>
                <p className="text-center text-default-500">{error}</p>
              </>
            )}
          </CardBody>
          <CardFooter className="flex justify-center">
            <Button color="primary" as={Link} to="/login">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
