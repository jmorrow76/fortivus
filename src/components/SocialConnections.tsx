import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Twitter, Instagram, Linkedin, Link2, Unlink, Trophy, Camera, Dumbbell } from 'lucide-react';

interface SocialConnection {
  id: string;
  platform: string;
  platform_username: string | null;
  auto_post_badges: boolean;
  auto_post_progress: boolean;
  auto_post_workouts: boolean;
  connected_at: string;
}

const platforms = [
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    icon: Twitter, 
    color: 'text-foreground',
    description: 'Share achievements on X'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    color: 'text-pink-500',
    description: 'Post to your Instagram stories'
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: Linkedin, 
    color: 'text-blue-600',
    description: 'Share professional milestones'
  },
];

export function SocialConnections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setConnections(data);
    }
    setLoading(false);
  };

  const connectPlatform = async (platform: string) => {
    if (!user || !username.trim()) {
      toast({
        title: 'Username required',
        description: 'Please enter your username for this platform',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase.from('social_connections').insert({
      user_id: user.id,
      platform,
      platform_username: username.trim(),
      auto_post_badges: true,
      auto_post_progress: false,
      auto_post_workouts: false
    });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Already connected',
          description: 'This platform is already linked to your account',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to connect platform',
          variant: 'destructive'
        });
      }
      return;
    }

    toast({
      title: 'Connected!',
      description: `Your ${platform} account has been linked`
    });
    setConnectingPlatform(null);
    setUsername('');
    fetchConnections();
  };

  const disconnectPlatform = async (connectionId: string, platform: string) => {
    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect platform',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Disconnected',
      description: `Your ${platform} account has been unlinked`
    });
    fetchConnections();
  };

  const updateAutoPost = async (connectionId: string, field: string, value: boolean) => {
    const { error } = await supabase
      .from('social_connections')
      .update({ [field]: value })
      .eq('id', connectionId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive'
      });
      return;
    }

    fetchConnections();
  };

  const getConnection = (platform: string) => {
    return connections.find(c => c.platform === platform);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading social connections...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Social Media
        </CardTitle>
        <CardDescription>
          Connect accounts to automatically share your achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {platforms.map((platform) => {
          const connection = getConnection(platform.id);
          const Icon = platform.icon;
          
          return (
            <div key={platform.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${platform.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{platform.name}</p>
                    {connection ? (
                      <p className="text-xs text-muted-foreground">
                        @{connection.platform_username}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {platform.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {connection ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => disconnectPlatform(connection.id, platform.name)}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                ) : connectingPlatform === platform.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-8 w-32"
                    />
                    <Button size="sm" onClick={() => connectPlatform(platform.id)}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setConnectingPlatform(null);
                        setUsername('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setConnectingPlatform(platform.id)}
                  >
                    <Link2 className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                )}
              </div>

              {/* Auto-post settings when connected */}
              {connection && (
                <div className="ml-12 pl-3 border-l-2 border-muted space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`badges-${platform.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Auto-post badge achievements
                    </Label>
                    <Switch
                      id={`badges-${platform.id}`}
                      checked={connection.auto_post_badges}
                      onCheckedChange={(checked) => updateAutoPost(connection.id, 'auto_post_badges', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`progress-${platform.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Camera className="h-4 w-4 text-blue-500" />
                      Auto-post progress photos
                    </Label>
                    <Switch
                      id={`progress-${platform.id}`}
                      checked={connection.auto_post_progress}
                      onCheckedChange={(checked) => updateAutoPost(connection.id, 'auto_post_progress', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`workouts-${platform.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Dumbbell className="h-4 w-4 text-green-500" />
                      Auto-post workout milestones
                    </Label>
                    <Switch
                      id={`workouts-${platform.id}`}
                      checked={connection.auto_post_workouts}
                      onCheckedChange={(checked) => updateAutoPost(connection.id, 'auto_post_workouts', checked)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            When auto-post is enabled, we'll create shareable content for you to review before posting. 
            Full OAuth integration coming soon for one-click sharing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
