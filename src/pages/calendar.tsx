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
  DatePicker,
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/auth-context";
import { useCalendar } from "../hooks/useCalendar";
import { addToast } from "@heroui/react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // This will be mapped to start_date for display
  time: string; // This will be derived from start_date for display
  start_date: string; // ISO string or YYYY-MM-DD HH:MM:SS
  end_date: string; // ISO string or YYYY-MM-DD HH:MM:SS
  event_type: string; // Maps to 'type' in frontend
  color: string;
  description?: string;
  location?: string;
  attendees?: string[]; // Stored as JSON string in DB
  visibility: 'all' | 'departments' | 'specific';
  visible_to?: string[]; // Stored as JSON string in DB
  departments?: string[]; // Stored as JSON string in DB
  created_by: string; // User ID
  created_by_name: string; // Joined from users table
  created_by_role: string; // Joined from users table
  // New fields
  is_recurring?: boolean;
  recurrence_pattern?: string;
  reminder_minutes?: number;
  event_id?: string;
  is_all_day?: boolean;
  company_id?: number;
}

export default function CalendarPage() {
  const { user, loading: authLoading, isAuthenticated: authIsAuthenticated } = useAuth();
  const { 
    events, 
    loading, 
    error, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    loadEvents,
    isAuthenticated, 
    isLoading: calendarLoading 
  } = useCalendar();

  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEventPopupOpen, onOpen: onEventPopupOpen, onOpenChange: onEventPopupOpenChange } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "other",
    color: "#3b82f6",
    description: "",
    location: "",
    visibility: "all",
    visible_to: [],
    departments: [],
    is_recurring: false,
    recurrence_pattern: null,
    reminder_minutes: null,
    is_all_day: false
  });

  const eventTypes = [
    { key: "meeting", label: "Meeting", icon: "lucide:users" },
    { key: "holiday", label: "Holiday", icon: "lucide:calendar" },
    { key: "training", label: "Training", icon: "lucide:book-open" },
    { key: "interview", label: "Interview", icon: "lucide:user-check" },
    { key: "other", label: "Other", icon: "lucide:more-horizontal" }
  ];

  const colorOptions = [
    { key: "#3b82f6", label: "Blue", color: "blue" },
    { key: "#10b981", label: "Green", color: "green" },
    { key: "#f59e0b", label: "Yellow", color: "yellow" },
    { key: "#ef4444", label: "Red", color: "red" },
    { key: "#6b7280", label: "Gray", color: "gray" },
    { key: "#8b5cf6", label: "Purple", color: "purple" },
    { key: "#06b6d4", label: "Cyan", color: "cyan" },
    { key: "#f97316", label: "Orange", color: "orange" },
    { key: "#84cc16", label: "Lime", color: "lime" },
    { key: "#ec4899", label: "Pink", color: "pink" }
  ];

  // Events are now loaded automatically by the useCalendar hook

  // Filter events for current user based on visibility
  const filterEventsForUser = (events: CalendarEvent[]) => {
    if (!user) return [];
    
    return events.filter(event => {
      // If visibility is null or 'all', show the event
      if (!event.visibility || event.visibility === 'all') return true;
      if (event.visibility === 'departments' && event.departments) {
        // Check if user's department is in the visible departments
        return event.departments.includes(user.department || '');
      }
      if (event.visibility === 'specific' && event.visible_to) {
        return event.visible_to.includes(user.email);
      }
      return false;
    });
  };

  const visibleEvents = filterEventsForUser(events);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return visibleEvents.filter(event => event.date === dateStr);
  };

  // Get upcoming events
  const upcomingEvents = visibleEvents
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Debug logging
  console.log('Calendar Debug:', {
    totalEvents: events.length,
    visibleEvents: visibleEvents.length,
    upcomingEvents: upcomingEvents.length,
    user: user?.email,
    loading,
    error
  });

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }

    try {
      const eventData = {
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        type: newEvent.type || 'other',
        color: newEvent.color || '#3b82f6',
        description: newEvent.description,
        location: newEvent.location,
        visibility: newEvent.visibility || 'all',
        visible_to: newEvent.visible_to || [],
        departments: newEvent.departments || []
      };

      await createEvent(eventData);
      onOpenChange();
            setNewEvent({
              title: "",
              date: "",
              time: "",
              type: "other",
              color: "#3b82f6",
              description: "",
              location: "",
              visibility: "all",
              visible_to: [],
              departments: [],
              is_recurring: false,
              recurrence_pattern: null,
              reminder_minutes: null,
              is_all_day: false
            });
    } catch (err) {
      console.error('Error creating event:', err);
      // Error handling is done in the hook
    }
  };

  const handleDateClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    setSelectedDayEvents(dayEvents);
    onEventPopupOpen();
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.event_type,
      color: event.color,
      description: event.description || "",
      location: event.location || "",
      visibility: event.visibility || "all",
      visible_to: event.visible_to || [],
      departments: event.departments || [],
      is_recurring: event.is_recurring || false,
      recurrence_pattern: event.recurrence_pattern || null,
      reminder_minutes: event.reminder_minutes || null,
      is_all_day: event.is_all_day || false
    });
    onOpen();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        // Refresh the selected day events
        const dayEvents = getEventsForDate(selectedDate);
        setSelectedDayEvents(dayEvents);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !newEvent.title || !newEvent.date || !newEvent.time) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }

    try {
      await updateEvent(editingEvent.id, newEvent);
      setEditingEvent(null);
      setNewEvent({
        title: "",
        date: "",
        time: "",
        type: "other",
        color: "#3b82f6",
        description: "",
        location: "",
        visibility: "all",
        visible_to: [],
        departments: [],
        is_recurring: false,
        recurrence_pattern: null,
        reminder_minutes: null,
        is_all_day: false
      });
      onOpenChange();
      // Refresh the selected day events
      const dayEvents = getEventsForDate(selectedDate);
      setSelectedDayEvents(dayEvents);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-default-600 mt-4">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:lock" className="w-16 h-16 text-default-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-default-600">Please log in to view the calendar.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:alert-circle" className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Calendar</h2>
          <p className="text-default-600 mb-4">{error}</p>
          <Button color="primary" onPress={loadEvents}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Icon icon="lucide:calendar" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
              <p className="text-default-600 mt-1">Manage events and schedule meetings</p>
            </div>
          </div>
          <Button 
            color="primary" 
            variant="flat"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onOpen}
          >
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:calendar" className="text-secondary-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Calendar</h3>
                      <p className="text-default-500 text-sm">Click on a date to view events</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    >
                      <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                      {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button
                      size="sm"
                      variant="bordered"
                      onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    >
                      <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      onPress={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Calendar Header */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-sm font-semibold text-default-600 bg-content1 rounded">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {(() => {
                    const year = selectedDate.getFullYear();
                    const month = selectedDate.getMonth();
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    
                    return Array.from({ length: 42 }, (_, i) => {
                      const date = new Date(startDate);
                      date.setDate(startDate.getDate() + i);
                      const isCurrentMonth = date.getMonth() === month;
                      const isToday = date.toDateString() === new Date().toDateString();
                      const dayEvents = getEventsForDate(date);
                    
                    return (
                      <div
                        key={i}
                        className={`
                          p-2 min-h-[60px] border border-default-300 rounded cursor-pointer hover:bg-content1
                          ${isCurrentMonth ? 'bg-content1' : 'bg-content1 text-default-400'}
                          ${isToday ? 'bg-primary-100 border-primary-300' : ''}
                        `}
                        onClick={() => handleDateClick(date)}
                      >
                        <div className="text-sm font-medium mb-1">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded truncate"
                              style={{ 
                                backgroundColor: event.color + '20', 
                                color: event.color,
                                borderLeft: `3px solid ${event.color}`
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div 
                              className="text-xs text-default-500 cursor-pointer hover:text-default-700 hover:bg-content2 rounded px-1"
                              onClick={() => handleDateClick(date)}
                            >
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                    });
                  })()}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:clock" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>
                    <p className="text-default-500 text-sm">Next 5 events</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-4">
                      <Icon icon="lucide:calendar-x" className="w-8 h-8 text-default-400 mx-auto mb-2" />
                      <p className="text-default-500 text-sm">No upcoming events</p>
                      <p className="text-default-400 text-xs mt-1">Click "Add Event" to create your first event</p>
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 bg-content1 rounded-lg border border-default-200">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{event.title}</p>
                            <p className="text-xs text-default-500">{event.date} at {event.time}</p>
                            {event.location && (
                              <p className="text-xs text-default-400 flex items-center gap-1 mt-1">
                                <Icon icon="lucide:map-pin" className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </p>
                            )}
                            {event.description && (
                              <p className="text-xs text-default-400 mt-1 line-clamp-2">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                    <Icon icon={editingEvent ? "lucide:edit" : "lucide:plus"} className="text-primary-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                      <p className="text-sm text-default-500">{editingEvent ? 'Update calendar event details' : 'Create a new calendar event'}</p>
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
                        type="date"
                        label="Date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        isRequired
                      />
                      <Input
                        type="time"
                        label="Time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        isRequired
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem key={type.key} value={type.key} textValue={type.label}>
                            <div className="flex items-center gap-2">
                              <Icon icon={type.icon} className="w-4 h-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        label="Color"
                        placeholder="Select color"
                        selectedKeys={newEvent.color ? [newEvent.color] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;
                          setNewEvent({...newEvent, color: selectedKey});
                        }}
                      >
                        {colorOptions.map((color) => (
                          <SelectItem key={color.key} value={color.key} textValue={color.label}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full bg-${color.color}-500`} />
                              <span>{color.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <Input
                      label="Location"
                      placeholder="Enter event location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    />

                    <Textarea
                      label="Description"
                      placeholder="Enter event description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_recurring"
                          checked={newEvent.is_recurring}
                          onChange={(e) => setNewEvent({...newEvent, is_recurring: e.target.checked})}
                          className="rounded"
                        />
                        <label htmlFor="is_recurring" className="text-sm font-medium">
                          Recurring Event
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_all_day"
                          checked={newEvent.is_all_day}
                          onChange={(e) => setNewEvent({...newEvent, is_all_day: e.target.checked})}
                          className="rounded"
                        />
                        <label htmlFor="is_all_day" className="text-sm font-medium">
                          All Day Event
                        </label>
                      </div>
                      
                      <Select
                        label="Reminder"
                        placeholder="Select reminder time"
                        selectedKeys={newEvent.reminder_minutes ? [newEvent.reminder_minutes.toString()] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;
                          setNewEvent({...newEvent, reminder_minutes: selectedKey ? parseInt(selectedKey) : null});
                        }}
                      >
                        <SelectItem key="5" value="5" textValue="5 minutes before">5 minutes before</SelectItem>
                        <SelectItem key="15" value="15" textValue="15 minutes before">15 minutes before</SelectItem>
                        <SelectItem key="30" value="30" textValue="30 minutes before">30 minutes before</SelectItem>
                        <SelectItem key="60" value="60" textValue="1 hour before">1 hour before</SelectItem>
                        <SelectItem key="1440" value="1440" textValue="1 day before">1 day before</SelectItem>
                        <SelectItem key="10080" value="10080" textValue="1 week before">1 week before</SelectItem>
                      </Select>
                    </div>

                    {newEvent.is_recurring && (
                      <Select
                        label="Recurrence Pattern"
                        placeholder="Select recurrence pattern"
                        selectedKeys={newEvent.recurrence_pattern ? [newEvent.recurrence_pattern] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;
                          setNewEvent({...newEvent, recurrence_pattern: selectedKey});
                        }}
                      >
                        <SelectItem key="daily" value="daily" textValue="Daily">Daily</SelectItem>
                        <SelectItem key="weekly" value="weekly" textValue="Weekly">Weekly</SelectItem>
                        <SelectItem key="monthly" value="monthly" textValue="Monthly">Monthly</SelectItem>
                        <SelectItem key="yearly" value="yearly" textValue="Yearly">Yearly</SelectItem>
                      </Select>
                    )}

                    <Select
                      label="Event Visibility"
                      placeholder="Select who can see this event"
                      selectedKeys={newEvent.visibility ? [newEvent.visibility] : []}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;
                        setNewEvent({...newEvent, visibility: selectedKey as 'all' | 'departments' | 'specific'});
                      }}
                    >
                      <SelectItem key="all" value="all" textValue="Everyone">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:globe" className="w-4 h-4" />
                          <span>Everyone</span>
                        </div>
                      </SelectItem>
                      <SelectItem key="departments" value="departments" textValue="Specific Departments">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:building" className="w-4 h-4" />
                          <span>Specific Departments</span>
                        </div>
                      </SelectItem>
                      <SelectItem key="specific" value="specific" textValue="Specific People">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:users" className="w-4 h-4" />
                          <span>Specific People</span>
                        </div>
                      </SelectItem>
                    </Select>

                    {newEvent.visibility === 'departments' && (
                      <Input
                        label="Departments (comma-separated)"
                        placeholder="e.g., Engineering, HR, Marketing"
                        value={Array.isArray(newEvent.departments) ? newEvent.departments.join(', ') : ''}
                        onChange={(e) => setNewEvent({...newEvent, departments: e.target.value.split(',').map(dept => dept.trim()).filter(dept => dept)})}
                      />
                    )}

                    {newEvent.visibility === 'specific' && (
                      <Input
                        label="Email Addresses (comma-separated)"
                        placeholder="e.g., user1@company.com, user2@company.com"
                        value={Array.isArray(newEvent.visible_to) ? newEvent.visible_to.join(', ') : ''}
                        onChange={(e) => setNewEvent({...newEvent, visible_to: e.target.value.split(',').map(email => email.trim()).filter(email => email)})}
                      />
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={editingEvent ? handleUpdateEvent : handleAddEvent}
                  >
                    {editingEvent ? 'Update Event' : 'Add Event'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Event Popup Modal */}
        <Modal isOpen={isEventPopupOpen} onOpenChange={onEventPopupOpenChange} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:calendar" className="text-secondary-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Events for {selectedDate.toLocaleDateString()}</h3>
                      <p className="text-sm text-default-500">{selectedDayEvents.length} event(s)</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {selectedDayEvents.length === 0 ? (
                      <p className="text-default-500 text-center py-4">No events for this date</p>
                    ) : (
                      selectedDayEvents.map((event) => (
                        <div key={event.id} className="p-4 bg-content1 rounded-lg border border-default-300">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-4 h-4 rounded-full mt-1 flex-shrink-0" 
                              style={{ backgroundColor: event.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                                  <p className="text-sm text-default-600 mt-1">{event.time}</p>
                                  {event.location && (
                                    <p className="text-sm text-default-500 flex items-center gap-1 mt-1">
                                      <Icon icon="lucide:map-pin" className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{event.location}</span>
                                    </p>
                                  )}
                                  {event.description && (
                                    <p className="text-sm text-default-600 mt-2 line-clamp-2">{event.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Chip size="sm" variant="flat" className="text-xs">
                                      {event.event_type}
                                    </Chip>
                                    {event.is_recurring && (
                                      <Chip size="sm" color="primary" variant="flat" className="text-xs">
                                        Recurring
                                      </Chip>
                                    )}
                                    {event.reminder_minutes && (
                                      <Chip size="sm" color="secondary" variant="flat" className="text-xs">
                                        Reminder: {event.reminder_minutes}min
                                      </Chip>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    onPress={() => handleEditEvent(event)}
                                    className="min-w-8 w-8 h-8"
                                  >
                                    <Icon icon="lucide:edit" className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    onPress={() => handleDeleteEvent(event.id)}
                                    className="min-w-8 w-8 h-8"
                                  >
                                    <Icon icon="lucide:trash-2" className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="flat" onPress={onEventPopupOpenChange}>
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