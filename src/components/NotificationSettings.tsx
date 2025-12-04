import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Flame, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function NotificationSettings() {
  const { preferences, permission, loading, requestPermission, savePreferences } = useNotifications();
  
  const [checkinReminder, setCheckinReminder] = useState(true);
  const [streakAlert, setStreakAlert] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');

  useEffect(() => {
    if (preferences) {
      setCheckinReminder(preferences.checkin_reminder);
      setStreakAlert(preferences.streak_alert);
      setReminderTime(preferences.reminder_time.slice(0, 5));
    }
  }, [preferences]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await savePreferences({
        checkin_reminder: checkinReminder,
        streak_alert: streakAlert,
        reminder_time: reminderTime + ':00'
      });
    }
  };

  const handleToggleCheckinReminder = async (checked: boolean) => {
    setCheckinReminder(checked);
    await savePreferences({ checkin_reminder: checked });
  };

  const handleToggleStreakAlert = async (checked: boolean) => {
    setStreakAlert(checked);
    await savePreferences({ streak_alert: checked });
  };

  const handleTimeChange = async (time: string) => {
    setReminderTime(time);
    await savePreferences({ reminder_time: time + ':00' });
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}` };
  });

  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Get reminded to check in and protect your streak
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission !== 'granted' ? (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <BellOff className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Enable Notifications</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Allow notifications to receive daily check-in reminders and streak alerts.
                </p>
                <Button onClick={handleEnableNotifications} size="sm">
                  Enable Notifications
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">Notifications enabled</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="checkin-reminder">Daily Check-in Reminder</Label>
                    <p className="text-xs text-muted-foreground">Get reminded to complete your daily check-in</p>
                  </div>
                </div>
                <Switch
                  id="checkin-reminder"
                  checked={checkinReminder}
                  onCheckedChange={handleToggleCheckinReminder}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="streak-alert">Streak Protection Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get alerted when your streak is at risk</p>
                  </div>
                </div>
                <Switch
                  id="streak-alert"
                  checked={streakAlert}
                  onCheckedChange={handleToggleStreakAlert}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>Reminder Time</Label>
                    <p className="text-xs text-muted-foreground">When to receive daily reminders</p>
                  </div>
                </div>
                <Select value={reminderTime} onValueChange={handleTimeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
