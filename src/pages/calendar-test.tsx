import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function CalendarTest() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Icon icon="lucide:calendar" className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendar Test</h1>
                <p className="text-gray-600 mt-1">This is a test page to check if the calendar loads</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <p>If you can see this, the calendar component is working!</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
