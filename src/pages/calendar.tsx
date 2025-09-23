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
  visibility: 'all' | 'departments' | 'specific';
  visibleTo?: string[];
  departments?: string[];
  createdBy: string;
  createdByRole: string;
}

export default function CalendarPage() {
  console.log('CalendarPage: Component rendering');
  const { user, loading: authLoading } = useAuth();
  console.log('CalendarPage: Auth state', { user, authLoading });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEventPopupOpen, onOpen: onEventPopupOpen, onOpenChange: onEventPopupOpenChange } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "meeting",
    description: "",
    location: "",
    attendees: "",
    visibility: "all" as 'all' | 'departments' | 'specific',
    visibleTo: [] as string[],
    departments: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Show message if no user (shouldn't happen with protected routes, but just in case)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:calendar-x" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view the calendar.</p>
        </div>
      </div>
    );
  }

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
      location: "Conference Room A",
      visibility: "all",
      createdBy: "John Doe",
      createdByRole: "super_admin"
    },
    {
      id: "2",
      title: "Project Deadline",
      date: "2025-01-20",
      time: "5:00 PM",
      type: "deadline",
      color: "danger",
      description: "Q1 project deliverables due",
      visibility: "departments",
      departments: ["Engineering", "Product"],
      createdBy: "Jane Smith",
      createdByRole: "company_admin"
    },
    {
      id: "3",
      title: "Performance Review",
      date: "2025-01-25",
      time: "2:00 PM",
      type: "review",
      color: "warning",
      description: "Annual performance review",
      location: "HR Office",
      visibility: "specific",
      visibleTo: ["hr@company.com", "manager@company.com"],
      createdBy: "HR Manager",
      createdByRole: "hr_manager"
    },
    {
      id: "4",
      title: "Company Picnic",
      date: "2025-01-30",
      time: "12:00 PM",
      type: "event",
      color: "success",
      description: "Annual company picnic",
      location: "Central Park",
      visibility: "all",
      createdBy: "Admin",
      createdByRole: "super_admin"
    },
    {
      id: "5",
      title: "Department Meeting",
      date: "2025-01-15",
      time: "3:00 PM",
      type: "meeting",
      color: "primary",
      description: "Monthly department review",
      location: "Meeting Room B",
      visibility: "departments",
      departments: ["Engineering"],
      createdBy: "Tech Lead",
      createdByRole: "company_admin"
    },
    {
      id: "6",
      title: "Training Session",
      date: "2025-01-15",
      time: "4:00 PM",
      type: "event",
      color: "success",
      description: "New employee training",
      location: "Training Room",
      visibility: "specific",
      visibleTo: ["newemployee@company.com"],
      createdBy: "HR Team",
      createdByRole: "hr_manager"
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
    console.log('CalendarPage: useEffect running');
    try {
      // Load local events
      console.log('CalendarPage: Setting events', localEvents);
      setEvents(localEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setEvents([]);
    }
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
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        type: newEvent.type,
        color: eventTypes.find(t => t.key === newEvent.type)?.color || "primary",
        description: newEvent.description,
        location: newEvent.location,
        attendees: newEvent.attendees ? newEvent.attendees.split(',').map(email => email.trim()) : [],
        visibility: newEvent.visibility,
        visibleTo: newEvent.visibleTo,
        departments: newEvent.departments,
        createdBy: user?.name || user?.email || "Unknown",
        createdByRole: user?.role || "employee"
      };
      setEvents([...events, event]);
      setNewEvent({
        title: "",
        date: "",
        time: "",
        type: "meeting",
        description: "",
        location: "",
        attendees: "",
        visibility: "all",
        visibleTo: [],
        departments: []
      });
      onOpenChange();
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const upcomingEvents = filterEventsForUser(events)
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

  const filterEventsForUser = (events: CalendarEvent[]) => {
    if (!user) return events; // Show all events if no user context
    
    // Super admin can see all events
    if (user.role === 'super_admin') {
      return events;
    }
    
    return events.filter(event => {
      switch (event.visibility) {
        case 'all':
          return true;
        case 'departments':
          // Check if user's department is in the event's departments
          return event.departments?.includes(user.department || '') || false;
        case 'specific':
          // Check if user's email is in the visibleTo list
          return event.visibleTo?.includes(user.email || '') || false;
        default:
          return false;
      }
    });
  };

  const handleShowMoreEvents = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const filteredEvents = filterEventsForUser(dayEvents);
    setSelectedDayEvents(filteredEvents);
    onEventPopupOpen();
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
      const allDayEvents = getEventsForDate(currentDate);
      const dayEvents = filterEventsForUser(allDayEvents);
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
            {dayEvents.slice(0, 2).map((event) => (
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
            {dayEvents.length > 2 && (
              <div 
                className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowMoreEvents(currentDate);
                }}
              >
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const renderWeekView = () => {
    const today = new Date();
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const days = [];
    const currentDate = new Date(startOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const allDayEvents = getEventsForDate(currentDate);
      const dayEvents = filterEventsForUser(allDayEvents);
      const isToday = currentDate.toDateString() === today.toDateString();
      
      days.push(
        <div
          key={i}
          className={`min-h-[200px] p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
          onClick={() => {
            setNewEvent(prev => ({ ...prev, date: currentDate.toISOString().split('T')[0] }));
            onOpen();
          }}
        >
          <div className={`text-sm font-medium mb-2 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {currentDate.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
          <div className={`text-lg font-semibold mb-3 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {currentDate.getDate()}
          </div>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`text-xs p-2 rounded cursor-pointer ${
                  event.color === 'primary' ? 'bg-blue-100 text-blue-800' :
                  event.color === 'danger' ? 'bg-red-100 text-red-800' :
                  event.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  event.color === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}
                title={`${event.title} - ${event.time}`}
              >
                <div className="flex items-center gap-1">
                  <Icon icon={getEventIcon(event.type)} className="w-3 h-3" />
                  <span className="truncate">{event.title}</span>
                </div>
                <div className="text-xs opacity-75 mt-1">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const renderDayView = () => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    const allDayEvents = getEventsForDate(selectedDate);
    const dayEvents = filterEventsForUser(allDayEvents);
    
    // Sort events by time
    const sortedEvents = dayEvents.sort((a, b) => {
      const timeA = a.time.toLowerCase().includes('am') ? 
        parseInt(a.time.split(':')[0]) + (a.time.includes('12') ? 0 : 0) :
        parseInt(a.time.split(':')[0]) + 12;
      const timeB = b.time.toLowerCase().includes('am') ? 
        parseInt(b.time.split(':')[0]) + (b.time.includes('12') ? 0 : 0) :
        parseInt(b.time.split(':')[0]) + 12;
      return timeA - timeB;
    });

    return (
      <div className="p-4">
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          {isToday && (
            <p className="text-blue-600 text-sm mt-1">Today</p>
          )}
        </div>
        
        <div className="space-y-4">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border-l-4 ${
                  event.color === 'primary' ? 'border-blue-500 bg-blue-50' :
                  event.color === 'danger' ? 'border-red-500 bg-red-50' :
                  event.color === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  event.color === 'success' ? 'border-green-500 bg-green-50' :
                  'border-gray-500 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon={getEventIcon(event.type)} className="w-4 h-4" />
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <Chip 
                        size="sm" 
                        color={getEventColor(event.type) as any}
                        variant="flat"
                      >
                        {event.type}
                      </Chip>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.time}</p>
                    {event.description && (
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    )}
                    {event.location && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Icon icon="lucide:map-pin" className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                        <Icon icon="lucide:users" className="w-3 h-3" />
                        {event.attendees.join(', ')}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<Icon icon="lucide:trash-2" />}
                    onPress={() => handleDeleteEvent(event.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Icon icon="lucide:calendar-x" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
              <p className="text-gray-500 mb-4">This day is free of events</p>
              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="lucide:plus" />}
                onPress={() => {
                  setNewEvent(prev => ({ ...prev, date: selectedDate.toISOString().split('T')[0] }));
                  onOpen();
                }}
              >
                Add Event
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  console.log('CalendarPage: About to render main content');
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
                        {view === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        {view === 'week' && (() => {
                          const startOfWeek = new Date(selectedDate);
                          startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                          const endOfWeek = new Date(startOfWeek);
                          endOfWeek.setDate(startOfWeek.getDate() + 6);
                          return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                        })()}
                        {view === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        {' • Click on any date to add an event'}
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
                        if (view === 'month') {
                          newDate.setMonth(newDate.getMonth() - 1);
                        } else if (view === 'week') {
                          newDate.setDate(newDate.getDate() - 7);
                        } else if (view === 'day') {
                          newDate.setDate(newDate.getDate() - 1);
                        }
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
                        if (view === 'month') {
                          newDate.setMonth(newDate.getMonth() + 1);
                        } else if (view === 'week') {
                          newDate.setDate(newDate.getDate() + 7);
                        } else if (view === 'day') {
                          newDate.setDate(newDate.getDate() + 1);
                        }
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
                
                {view === 'week' && (
                  <div>
                    {/* Week Header */}
                    <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Week Grid */}
                    <div className="grid grid-cols-7 gap-0">
                      {renderWeekView()}
                    </div>
                  </div>
                )}
                
                {view === 'day' && (
                  <div>
                    {renderDayView()}
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
                      selectedKeys={newEvent.type ? [newEvent.type] : []}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;
                        setNewEvent({...newEvent, type: selectedKey});
                      }}
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
                    
                    <Select
                      label="Event Visibility"
                      placeholder="Select who can see this event"
                      selectedKeys={newEvent.visibility ? [newEvent.visibility] : []}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;
                        setNewEvent({...newEvent, visibility: selectedKey as 'all' | 'departments' | 'specific'});
                      }}
                    >
                      <SelectItem key="all" value="all">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:globe" className="w-4 h-4" />
                          <span>Everyone</span>
                        </div>
                      </SelectItem>
                      <SelectItem key="departments" value="departments">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:building" className="w-4 h-4" />
                          <span>Specific Departments</span>
                        </div>
                      </SelectItem>
                      <SelectItem key="specific" value="specific">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:users" className="w-4 h-4" />
                          <span>Specific People</span>
                        </div>
                      </SelectItem>
                    </Select>
                    
                    {newEvent.visibility === 'departments' && (
                      <Input
                        label="Departments"
                        placeholder="Enter department names (comma separated)"
                        value={newEvent.departments.join(', ')}
                        onChange={(e) => setNewEvent({...newEvent, departments: e.target.value.split(',').map(dept => dept.trim()).filter(dept => dept)})}
                      />
                    )}
                    
                    {newEvent.visibility === 'specific' && (
                      <Input
                        label="Visible To"
                        placeholder="Enter email addresses (comma separated)"
                        value={newEvent.visibleTo.join(', ')}
                        onChange={(e) => setNewEvent({...newEvent, visibleTo: e.target.value.split(',').map(email => email.trim()).filter(email => email)})}
                      />
                    )}
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

        {/* Event Popup Modal */}
        <Modal isOpen={isEventPopupOpen} onOpenChange={onEventPopupOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:calendar-days" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Events for {selectedDayEvents.length > 0 ? new Date(selectedDayEvents[0].date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : 'Selected Date'}</h3>
                      <p className="text-sm text-gray-500">{selectedDayEvents.length} event(s) scheduled</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    {selectedDayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          event.color === 'primary' ? 'border-blue-500 bg-blue-50' :
                          event.color === 'danger' ? 'border-red-500 bg-red-50' :
                          event.color === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                          event.color === 'success' ? 'border-green-500 bg-green-50' :
                          'border-gray-500 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon icon={getEventIcon(event.type)} className="w-4 h-4" />
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                              <Chip 
                                size="sm" 
                                color={getEventColor(event.type) as any}
                                variant="flat"
                              >
                                {event.type}
                              </Chip>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{event.time}</p>
                            {event.description && (
                              <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                            )}
                            {event.location && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Icon icon="lucide:map-pin" className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                                <Icon icon="lucide:users" className="w-3 h-3" />
                                {event.attendees.join(', ')}
                              </p>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                              Created by: {event.createdBy} ({event.createdByRole})
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            startContent={<Icon icon="lucide:trash-2" />}
                            onPress={() => {
                              handleDeleteEvent(event.id);
                              onClose();
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="flat" onPress={onClose}>
                    Close
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