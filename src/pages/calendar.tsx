import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Badge,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider,
  Tabs,
  Tab,
  Calendar,
  DatePicker
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/auth-context";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  color: string;
  description?: string;
  location?: string;
  attendees?: string[];
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "meeting",
    description: "",
    location: "",
    attendees: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sample local events
  const localEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Team Meeting",
      date: "2025-01-15",
      time: "10:00 AM",
      type: "meeting",
      color: "primary",
      description: "Weekly team standup meeting",
      location: "Conference Room A"
    },
    {
      id: "2",
      title: "Project Deadline",
      date: "2025-01-20",
      time: "5:00 PM",
      type: "deadline",
      color: "danger",
      description: "Q1 project deliverables due"
    },
    {
      id: "3",
      title: "Performance Review",
      date: "2025-01-25",
      time: "2:00 PM",
      type: "review",
      color: "warning",
      description: "Annual performance review",
      location: "HR Office"
    },
    {
      id: "4",
      title: "Company Picnic",
      date: "2025-01-30",
      time: "12:00 PM",
      type: "event",
      color: "success",
      description: "Annual company picnic",
      location: "Central Park"
    }
  ];

  const eventTypes = [
    { key: "meeting", label: "Meeting", color: "primary", icon: "lucide:users" },
    { key: "deadline", label: "Deadline", color: "danger", icon: "lucide:clock" },
    { key: "review", label: "Review", color: "warning", icon: "lucide:star" },
    { key: "event", label: "Event", color: "success", icon: "lucide:calendar" },
    { key: "holiday", label: "Holiday", color: "secondary", icon: "lucide:gift" },
    { key: "interview", label: "Interview", color: "default", icon: "lucide:user-check" }
  ];

  useEffect(() => {
    // Load local events
    setEvents(localEvents);
  }, []);

  const getEventsForDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return [];
    }
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const event: CalendarEvent = {
        id: `local-${Date.now()}`,
        ...newEvent,
        color: eventTypes.find(t => t.key === newEvent.type)?.color || "primary",
        attendees: newEvent.attendees ? newEvent.attendees.split(',').map(email => email.trim()) : []
      };
      setEvents([...events, event]);
      setNewEvent({
        title: "",
        date: "",
        time: "",
        type: "meeting",
        description: "",
        location: "",
        attendees: ""
      });
      onOpenChange();
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate && !isNaN(eventDate.getTime()) && eventDate >= new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const getEventIcon = (type: string) => {
    return eventTypes.find(t => t.key === type)?.icon || "lucide:calendar";
  };

  const getEventColor = (type: string) => {
    return eventTypes.find(t => t.key === type)?.color || "primary";
  };

  const renderCalendarView = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = getEventsForDate(currentDate);
      const isCurrentMonth = currentDate.getMonth() === currentMonth;
      const isToday = currentDate.toDateString() === today.toDateString();
      
      days.push(
        <div
          key={i}
          className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
          } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
          onClick={() => {
            setNewEvent(prev => ({ ...prev, date: currentDate.toISOString().split('T')[0] }));
            onOpen();
          }}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${isToday ? 'text-blue-600' : ''}`}>
            {currentDate.getDate()}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded cursor-pointer ${
                  event.color === 'primary' ? 'bg-blue-100 text-blue-800' :
                  event.color === 'danger' ? 'bg-red-100 text-red-800' :
                  event.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  event.color === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}
                title={event.title}
              >
                <div className="flex items-center gap-1">
                  <Icon icon={getEventIcon(event.type)} className="w-3 h-3" />
                  <span className="truncate">{event.title}</span>
                </div>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Icon icon="lucide:calendar" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600 mt-1">Manage your schedule and events</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onOpen}
              className="font-medium"
            >
              Add Event
            </Button>
          </div>
        </div>

        {/* Google Calendar Integration Notice */}
        <Card className="border-0 shadow-sm bg-blue-50/50">
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:info" className="text-blue-600 text-xl" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Google Calendar Integration</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Google Calendar integration is available in Settings. Configure it there to sync external events with your calendar.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:calendar-days" className="text-green-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
                      <p className="text-gray-500 text-sm">
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • Click on any date to add an event
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      startContent={<Icon icon="lucide:chevron-left" />}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setSelectedDate(newDate);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      onPress={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      endContent={<Icon icon="lucide:chevron-right" />}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setSelectedDate(newDate);
                      }}
                    />
                    <Divider orientation="vertical" className="h-6" />
                    <Button
                      size="sm"
                      variant={view === 'month' ? 'solid' : 'flat'}
                      color="primary"
                      onPress={() => setView('month')}
                    >
                      Month
                    </Button>
                    <Button
                      size="sm"
                      variant={view === 'week' ? 'solid' : 'flat'}
                      color="primary"
                      onPress={() => setView('week')}
                    >
                      Week
                    </Button>
                    <Button
                      size="sm"
                      variant={view === 'day' ? 'solid' : 'flat'}
                      color="primary"
                      onPress={() => setView('day')}
                    >
                      Day
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                {view === 'month' && (
                  <div>
                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-0">
                      {renderCalendarView()}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:clock" className="text-orange-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                    <p className="text-gray-500 text-sm">Next 5 events</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} at {event.time}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Icon icon="lucide:map-pin" className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Chip 
                            size="sm" 
                            color={getEventColor(event.type) as any}
                            variant="flat"
                          >
                            {event.type}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Event Types Legend */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:palette" className="text-purple-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Event Types</h3>
                    <p className="text-gray-500 text-sm">Color coding guide</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-2">
                  {eventTypes.map((type) => (
                    <div key={type.key} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        type.color === 'primary' ? 'bg-blue-500' :
                        type.color === 'danger' ? 'bg-red-500' :
                        type.color === 'warning' ? 'bg-yellow-500' :
                        type.color === 'success' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Add Event Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:plus" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Add New Event</h3>
                      <p className="text-sm text-gray-500">Create a new calendar event</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Event Title"
                      placeholder="Enter event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      isRequired
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        isRequired
                      />
                    </div>
                    
                    <Select
                      label="Event Type"
                      placeholder="Select event type"
                      selectedKeys={[newEvent.type]}
                      onSelectionChange={(keys) => setNewEvent({...newEvent, type: Array.from(keys)[0] as string})}
                    >
                      {eventTypes.map((type) => (
                        <SelectItem key={type.key} value={type.key}>
                          <div className="flex items-center gap-2">
                            <Icon icon={type.icon} className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    
                    <Input
                      label="Location"
                      placeholder="Enter event location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    />
                    
                    <Input
                      label="Attendees"
                      placeholder="Enter email addresses (comma separated)"
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                    />
                    
                    <Textarea
                      label="Description"
                      placeholder="Enter event description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      minRows={3}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleAddEvent}>
                    Add Event
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}