import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { calendarAPI } from '../services/api-service';
import { addToast } from '@heroui/react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  start_date: string;
  end_date: string;
  event_type: string;
  color: string;
  description?: string;
  location?: string;
  attendees?: string[];
  visibility: 'all' | 'departments' | 'specific';
  visible_to?: string[];
  departments?: string[];
  created_by: string;
  created_by_name: string;
  created_by_role: string;
  // New fields
  is_recurring?: boolean;
  recurrence_pattern?: string;
  reminder_minutes?: number;
  event_id?: string;
  is_all_day?: boolean;
  company_id?: number;
}

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { makeAuthenticatedRequest, isAuthenticated, isLoading: authLoading } = useAuthenticatedAPI();

  const loadEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await makeAuthenticatedRequest(
        async () => {
          const response = await calendarAPI.getEvents();
          // Map backend response to frontend interface
          const fetchedEvents: CalendarEvent[] = response.data.map((event: any) => ({
            ...event,
            id: event.id.toString(),
            date: event.start_date.split('T')[0],
            time: event.start_date.split('T')[1]?.substring(0, 5) || '00:00',
            type: event.event_type,
            visible_to: event.visible_to ? JSON.parse(event.visible_to) : [],
            departments: event.departments ? JSON.parse(event.departments) : [],
            // Handle new fields
            is_recurring: Boolean(event.is_recurring),
            recurrence_pattern: event.recurrence_pattern ? JSON.parse(event.recurrence_pattern) : null,
            reminder_minutes: event.reminder_minutes,
            event_id: event.event_id,
            is_all_day: Boolean(event.is_all_day),
            company_id: event.company_id,
          }));
          setEvents(fetchedEvents);
        },
        {
          onError: (error) => {
            console.error('Error loading calendar events:', error);
            setError('Failed to load calendar events');
            addToast({
              title: "Error",
              description: "Failed to load calendar events",
              color: "danger"
            });
          }
        }
      );
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, makeAuthenticatedRequest]);

  const createEvent = useCallback(async (eventData: any) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await makeAuthenticatedRequest(
        async () => {
          await calendarAPI.createEvent(eventData);
          addToast({
            title: "Success",
            description: "Event created successfully",
            color: "success"
          });
          await loadEvents(); // Reload events
        },
        {
          onError: (error) => {
            console.error('Error creating event:', error);
            addToast({
              title: "Error",
              description: "Failed to create event",
              color: "danger"
            });
          }
        }
      );
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }, [isAuthenticated, makeAuthenticatedRequest, loadEvents]);

  const updateEvent = useCallback(async (id: string, eventData: any) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await makeAuthenticatedRequest(
        async () => {
          await calendarAPI.updateEvent(id, eventData);
          addToast({
            title: "Success",
            description: "Event updated successfully",
            color: "success"
          });
          await loadEvents(); // Reload events
        },
        {
          onError: (error) => {
            console.error('Error updating event:', error);
            addToast({
              title: "Error",
              description: "Failed to update event",
              color: "danger"
            });
          }
        }
      );
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }, [isAuthenticated, makeAuthenticatedRequest, loadEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await makeAuthenticatedRequest(
        async () => {
          await calendarAPI.deleteEvent(id);
          addToast({
            title: "Success",
            description: "Event deleted successfully",
            color: "success"
          });
          await loadEvents(); // Reload events
        },
        {
          onError: (error) => {
            console.error('Error deleting event:', error);
            addToast({
              title: "Error",
              description: "Failed to delete event",
              color: "danger"
            });
          }
        }
      );
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }, [isAuthenticated, makeAuthenticatedRequest, loadEvents]);

  // Load events when authentication state changes
  useEffect(() => {
    if (!authLoading) {
      loadEvents();
    }
  }, [authLoading, loadEvents]);

  return {
    events,
    loading,
    error,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    isAuthenticated,
    isLoading: authLoading
  };
};
