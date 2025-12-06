import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, X, MessageCircle, Award, Flame, Target, Zap, Users, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationsCenter } from '@/hooks/useNotificationsCenter';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationsCenter();
  const [open, setOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement_comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'badge_earned':
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 'streak_milestone':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'challenge_completed':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'accountability_checkin':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'prayer_request':
        return <HandHeart className="h-4 w-4 text-rose-500" />;
      default:
        return <Zap className="h-4 w-4 text-primary" />;
    }
  };

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 hover:bg-secondary/50 cursor-pointer transition-colors group",
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      !notification.is_read && "font-medium"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
