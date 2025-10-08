import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from './auth-context';
import { useSettings } from './settings-context';

interface PusherContextType {
  pusher: Pusher | null;
  isConnected: boolean;
  subscribe: (channel: string, event: string, callback: (data: any) => void) => void;
  unsubscribe: (channel: string) => void;
}

const PusherContext = createContext<PusherContextType | undefined>(undefined);

export function PusherProvider({ children }: { children: ReactNode }) {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    // Check if Pusher is enabled and configured
    const pusherSettings = settings?.integration?.pusher;
    
    if (!pusherSettings || !pusherSettings.enabled) {
      console.log('Pusher is not enabled');
      return;
    }

    if (!pusherSettings.appKey || !pusherSettings.cluster) {
      console.log('Pusher configuration incomplete');
      return;
    }

    try {
      // Initialize Pusher
      const pusherInstance = new Pusher(pusherSettings.appKey, {
        cluster: pusherSettings.cluster,
        encrypted: true,
        enabledTransports: ['ws', 'wss'],
        forceTLS: true
      });

      pusherInstance.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully');
        setIsConnected(true);
      });

      pusherInstance.connection.bind('disconnected', () => {
        console.log('⚠️  Pusher disconnected');
        setIsConnected(false);
      });

      pusherInstance.connection.bind('unavailable', () => {
        console.warn('⚠️  Pusher connection unavailable - check your credentials');
        setIsConnected(false);
      });

      pusherInstance.connection.bind('failed', () => {
        console.error('❌ Pusher connection failed - invalid credentials or network issue');
        setIsConnected(false);
      });

      pusherInstance.connection.bind('error', (err: any) => {
        console.error('❌ Pusher error:', err);
        if (err.error && err.error.data) {
          console.error('Error details:', err.error.data);
        }
      });

      setPusher(pusherInstance);

      // Subscribe to user-specific channel if logged in
      if (user?.id) {
        const userChannel = pusherInstance.subscribe(`user-${user.id}`);
        console.log(`📡 Subscribed to user-${user.id}`);

        // Listen for notifications
        userChannel.bind('notification', (data: any) => {
          console.log('📬 Received notification:', data);
          // You can show a toast notification here
        });
      }

      // Subscribe to broadcast channel
      const broadcastChannel = pusherInstance.subscribe('broadcast');
      console.log('📡 Subscribed to broadcast');

      return () => {
        if (user?.id) {
          pusherInstance.unsubscribe(`user-${user.id}`);
        }
        pusherInstance.unsubscribe('broadcast');
        pusherInstance.disconnect();
      };
    } catch (error) {
      console.error('Error initializing Pusher:', error);
    }
  }, [settings, user]);

  const subscribe = (channel: string, event: string, callback: (data: any) => void) => {
    if (!pusher) {
      console.warn('Pusher not initialized');
      return;
    }

    const channelInstance = pusher.subscribe(channel);
    channelInstance.bind(event, callback);
  };

  const unsubscribe = (channel: string) => {
    if (!pusher) return;
    pusher.unsubscribe(channel);
  };

  return (
    <PusherContext.Provider value={{ pusher, isConnected, subscribe, unsubscribe }}>
      {children}
    </PusherContext.Provider>
  );
}

export function usePusher() {
  const context = useContext(PusherContext);
  if (context === undefined) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  return context;
}
