// Create unauthorized page
    import React from "react";
    import { Link } from "react-router-dom";
    import { 
      Card, 
      CardBody, 
      CardFooter,
      Button
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    
    export default function Unauthorized() {
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
                <div className="p-4 rounded-full bg-danger/10">
                  <Icon icon="lucide:shield-alert" className="text-5xl text-danger" />
                </div>
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-center text-default-500">
                  You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
              </CardBody>
              <CardFooter className="flex justify-center">
                <Button 
                  color="primary" 
                  as={Link} 
                  to="/dashboard"
                  startContent={<Icon icon="lucide:home" />}
                >
                  Back to Dashboard
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    }