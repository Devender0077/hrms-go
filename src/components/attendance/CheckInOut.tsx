import React from 'react';
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useLocation } from '../../hooks/useLocation';

interface CheckInOutProps {
  onCheckIn: (location: {lat: number, lng: number}) => Promise<void>;
  onCheckOut: (location: {lat: number, lng: number}) => Promise<void>;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

const CheckInOut: React.FC<CheckInOutProps> = ({
  onCheckIn,
  onCheckOut,
  isCheckingIn,
  isCheckingOut,
  canCheckIn,
  canCheckOut
}) => {
  const { getCurrentLocation, isGettingLocation, locationError } = useLocation();

  const handleCheckIn = async () => {
    try {
      const location = await getCurrentLocation();
      await onCheckIn(location);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      const location = await getCurrentLocation();
      await onCheckOut(location);
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:clock-in" className="text-2xl text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Time Tracking</h3>
                <p className="text-sm text-gray-600">Check in and out for attendance</p>
                {!canCheckIn && !canCheckOut && (
                  <p className="text-xs text-amber-600 mt-1">
                    ✓ You have completed today's attendance
                  </p>
                )}
                {canCheckIn && (
                  <p className="text-xs text-blue-600 mt-1">
                    Ready to check in
                  </p>
                )}
                {canCheckOut && (
                  <p className="text-xs text-orange-600 mt-1">
                    Ready to check out
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              color="success"
              variant="flat"
              startContent={
                isCheckingIn || isGettingLocation ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <Icon icon="lucide:log-in" />
                )
              }
              onPress={handleCheckIn}
              isDisabled={!canCheckIn || isCheckingIn || isGettingLocation}
              isLoading={isCheckingIn || isGettingLocation}
              aria-label={!canCheckIn ? "Check-in disabled - already checked in today" : "Check in for attendance"}
            >
              {isCheckingIn || isGettingLocation ? 'Checking In...' : 'Check In'}
            </Button>
            
            <Button
              color="warning"
              variant="flat"
              startContent={
                isCheckingOut || isGettingLocation ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <Icon icon="lucide:log-out" />
                )
              }
              onPress={handleCheckOut}
              isDisabled={!canCheckOut || isCheckingOut || isGettingLocation}
              isLoading={isCheckingOut || isGettingLocation}
              aria-label={!canCheckOut ? "Check-out disabled - not checked in or already checked out today" : "Check out for attendance"}
            >
              {isCheckingOut || isGettingLocation ? 'Checking Out...' : 'Check Out'}
            </Button>
          </div>
        </div>
        
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:alert-circle" className="text-red-500 text-sm" />
              <p className="text-sm text-red-700">{locationError}</p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default CheckInOut;
