import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [matchRequestCount, setMatchRequestCount] = useState(0);

  useEffect(() => {
    if (!address) return;

    // Fetch initial notifications
    fetchNotifications();

    // Set up realtime subscription
    const normalizedAddress = address.toLowerCase();
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_wallet=eq.${normalizedAddress}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          if (!newNotification.read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [address]);

  const fetchNotifications = async () => {
    if (!address) return;

    const normalizedAddress = address.toLowerCase();
    console.log('🔔 Fetching notifications for wallet:', normalizedAddress);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_wallet', normalizedAddress)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    console.log('🔔 Fetched notifications:', data);
    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.read).length || 0);
    setMatchRequestCount(data?.filter(n => n.type === 'match_request' && !n.read).length || 0);
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    const notification = notifications.find(n => n.id === notificationId);
    setUnreadCount(prev => Math.max(0, prev - 1));
    if (notification?.type === 'match_request') {
      setMatchRequestCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>
        {matchRequestCount > 0 && (
          <div className="p-4 border-b bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {matchRequestCount} pending match {matchRequestCount === 1 ? 'request' : 'requests'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Review and respond to study partner requests
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/match-requests')}
              >
                View All
              </Button>
            </div>
          </div>
        )}
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.filter(n => n.type !== 'match_request').map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}