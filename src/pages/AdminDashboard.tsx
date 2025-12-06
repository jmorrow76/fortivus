import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Users, Crown, TrendingUp, Calendar, Trash2, Plus, Loader2, Bot, Play, UserPlus, FileText, Mail, Send, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionGrant {
  id: string;
  user_email: string;
  granted_at: string;
  expires_at: string | null;
  granted_by: string | null;
  notes: string | null;
}

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  membership_type: 'free' | 'elite_monthly' | 'elite_yearly' | 'lifetime' | 'manual_grant';
  membership_expires: string | null;
  is_simulated: boolean;
  total_xp: number;
  current_streak: number;
  total_checkins: number;
  roles: ('admin' | 'moderator' | 'user')[];
}

interface Analytics {
  totalUsers: number;
  totalCheckins: number;
  totalWorkouts: number;
  activeGrants: number;
  totalXpEarned: number;
  totalBadgesEarned: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  const [grants, setGrants] = useState<SubscriptionGrant[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingGrants, setLoadingGrants] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  
  // New grant form
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [addingGrant, setAddingGrant] = useState(false);

  // Simulated users
  const [simulatedCount, setSimulatedCount] = useState(0);
  const [seedingUsers, setSeedingUsers] = useState(false);
  const [generatingActivity, setGeneratingActivity] = useState(false);

  // Content management
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);

  // Users management
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'real' | 'simulated' | 'elite'>('real');
  const [userSearch, setUserSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchGrants();
      fetchAnalytics();
      fetchSimulatedCount();
      fetchContentStats();
      fetchAllUsers();
    }
  }, [isAdmin]);

  const { session } = useAuth();

  const fetchAllUsers = async () => {
    if (!session) return;
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (error) throw error;
      setAllUsers(data?.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const getFilteredUsers = () => {
    let filtered = allUsers;
    
    // Apply type filter
    switch (userFilter) {
      case 'real':
        filtered = filtered.filter(u => !u.is_simulated);
        break;
      case 'simulated':
        filtered = filtered.filter(u => u.is_simulated);
        break;
      case 'elite':
        filtered = filtered.filter(u => u.membership_type !== 'free');
        break;
    }
    
    // Apply search filter
    if (userSearch.trim()) {
      const search = userSearch.toLowerCase().trim();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(search) ||
        (u.display_name && u.display_name.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  };

  const getMembershipBadge = (type: UserData['membership_type']) => {
    switch (type) {
      case 'manual_grant':
        return <Badge className="bg-amber-500">Elite (Grant)</Badge>;
      case 'elite_monthly':
        return <Badge className="bg-primary">Elite Monthly</Badge>;
      case 'elite_yearly':
        return <Badge className="bg-primary">Elite Yearly</Badge>;
      case 'lifetime':
        return <Badge className="bg-purple-600">Lifetime</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const handleRoleChange = async (userId: string, role: 'admin' | 'moderator', action: 'add' | 'remove') => {
    if (!session) return;
    setUpdatingRole(`${userId}-${role}`);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-role', {
        body: { targetUserId: userId, role, action },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (error) throw error;
      toast.success(data?.message || `Role ${action === 'add' ? 'added' : 'removed'} successfully`);
      fetchAllUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleBadges = (roles: ('admin' | 'moderator' | 'user')[]) => {
    return (
      <div className="flex gap-1 flex-wrap">
        {roles.includes('admin') && (
          <Badge className="bg-red-600 text-white">Admin</Badge>
        )}
        {roles.includes('moderator') && (
          <Badge className="bg-blue-600 text-white">Moderator</Badge>
        )}
        {roles.length === 0 && (
          <Badge variant="outline" className="text-muted-foreground">User</Badge>
        )}
      </div>
    );
  };

  const fetchContentStats = async () => {
    const [{ count: subs }, { count: articles }] = await Promise.all([
      supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true)
    ]);
    setSubscriberCount(subs || 0);
    setArticleCount(articles || 0);
  };

  const handleGenerateArticle = async () => {
    setGeneratingArticle(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-article');
      if (error) throw error;
      toast.success(`Article published: ${data?.article?.title || 'New article'}`);
      fetchContentStats();
    } catch (error: any) {
      console.error('Error generating article:', error);
      toast.error(error.message || 'Failed to generate article');
    } finally {
      setGeneratingArticle(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (subscriberCount === 0) {
      toast.error('No subscribers to send to');
      return;
    }
    setSendingNewsletter(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-weekly-newsletter');
      if (error) throw error;
      toast.success(`Newsletter sent to ${data?.sent_count || 0} subscribers`);
    } catch (error: any) {
      console.error('Error sending newsletter:', error);
      toast.error(error.message || 'Failed to send newsletter');
    } finally {
      setSendingNewsletter(false);
    }
  };

  const fetchSimulatedCount = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_simulated', true);
    setSimulatedCount(count || 0);
  };

  const handleSeedUsers = async () => {
    setSeedingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-simulated-users');
      if (error) throw error;
      toast.success(`Created ${data?.users?.length || 50} simulated users`);
      fetchSimulatedCount();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Error seeding users:', error);
      toast.error(error.message || 'Failed to seed users');
    } finally {
      setSeedingUsers(false);
    }
  };

  const handleGenerateActivity = async () => {
    setGeneratingActivity(true);
    try {
      const { data, error } = await supabase.functions.invoke('simulate-community-activity');
      if (error) throw error;
      toast.success(`Generated ${data?.activitiesGenerated || 0} activities`);
      fetchAnalytics();
    } catch (error: any) {
      console.error('Error generating activity:', error);
      toast.error(error.message || 'Failed to generate activity');
    } finally {
      setGeneratingActivity(false);
    }
  };

  const fetchGrants = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_grants')
        .select('*')
        .order('granted_at', { ascending: false });

      if (error) throw error;
      setGrants(data || []);
    } catch (error) {
      console.error('Error fetching grants:', error);
      toast.error('Failed to load subscription grants');
    } finally {
      setLoadingGrants(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch various counts for analytics
      const [
        { count: usersCount },
        { count: checkinsCount },
        { count: workoutsCount },
        { count: grantsCount },
        { data: xpData },
        { count: badgesCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('mood_checkins').select('*', { count: 'exact', head: true }),
        supabase.from('workout_logs').select('*', { count: 'exact', head: true }),
        supabase.from('subscription_grants').select('*', { count: 'exact', head: true }),
        supabase.from('user_streaks').select('total_xp'),
        supabase.from('user_badges').select('*', { count: 'exact', head: true })
      ]);

      const totalXp = xpData?.reduce((sum, row) => sum + (row.total_xp || 0), 0) || 0;

      setAnalytics({
        totalUsers: usersCount || 0,
        totalCheckins: checkinsCount || 0,
        totalWorkouts: workoutsCount || 0,
        activeGrants: grantsCount || 0,
        totalXpEarned: totalXp,
        totalBadgesEarned: badgesCount || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleAddGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setAddingGrant(true);
    try {
      const { error } = await supabase
        .from('subscription_grants')
        .insert({
          user_email: newEmail.toLowerCase().trim(),
          notes: newNotes.trim() || null,
          expires_at: newExpiresAt || null,
          granted_by: user?.email || 'admin'
        });

      if (error) throw error;

      toast.success(`Elite access granted to ${newEmail}`);
      setNewEmail('');
      setNewNotes('');
      setNewExpiresAt('');
      fetchGrants();
    } catch (error: any) {
      console.error('Error adding grant:', error);
      toast.error(error.message || 'Failed to add grant');
    } finally {
      setAddingGrant(false);
    }
  };

  const handleDeleteGrant = async (id: string, email: string) => {
    if (!confirm(`Remove elite access from ${email}?`)) return;

    try {
      const { error } = await supabase
        .from('subscription_grants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(`Elite access removed from ${email}`);
      fetchGrants();
    } catch (error) {
      console.error('Error deleting grant:', error);
      toast.error('Failed to remove grant');
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage subscriptions and view platform analytics</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="grants" className="gap-2">
              <Crown className="h-4 w-4" />
              Subscription Grants
            </TabsTrigger>
            <TabsTrigger value="simulated" className="gap-2">
              <Bot className="h-4 w-4" />
              Simulated Users
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      All Users ({getFilteredUsers().length})
                    </CardTitle>
                    <CardDescription>
                      View and manage all registered users
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={userFilter === 'real' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUserFilter('real')}
                    >
                      Real Users
                    </Button>
                    <Button
                      variant={userFilter === 'elite' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUserFilter('elite')}
                    >
                      Elite Only
                    </Button>
                    <Button
                      variant={userFilter === 'simulated' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUserFilter('simulated')}
                    >
                      Simulated
                    </Button>
                    <Button
                      variant={userFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUserFilter('all')}
                    >
                      All
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : getFilteredUsers().length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No users found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Membership</TableHead>
                          <TableHead>XP</TableHead>
                          <TableHead>Streak</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredUsers().map((userData) => (
                          <TableRow key={userData.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {userData.avatar_url ? (
                                  <img 
                                    src={userData.avatar_url} 
                                    alt="" 
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                    {(userData.display_name || userData.email)?.[0]?.toUpperCase() || '?'}
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{userData.display_name || 'No name'}</p>
                                  {userData.is_simulated && (
                                    <Badge variant="outline" className="text-xs">Simulated</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{userData.email}</TableCell>
                            <TableCell>{getRoleBadges(userData.roles || [])}</TableCell>
                            <TableCell>{getMembershipBadge(userData.membership_type)}</TableCell>
                            <TableCell className="font-medium">{userData.total_xp.toLocaleString()}</TableCell>
                            <TableCell>{userData.current_streak} days</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(userData.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {!userData.roles?.includes('admin') ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7"
                                    disabled={updatingRole === `${userData.id}-admin`}
                                    onClick={() => handleRoleChange(userData.id, 'admin', 'add')}
                                  >
                                    {updatingRole === `${userData.id}-admin` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Shield className="h-3 w-3 mr-1" />
                                        Make Admin
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs h-7"
                                    disabled={updatingRole === `${userData.id}-admin` || userData.id === user?.id}
                                    onClick={() => handleRoleChange(userData.id, 'admin', 'remove')}
                                  >
                                    {updatingRole === `${userData.id}-admin` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      'Remove Admin'
                                    )}
                                  </Button>
                                )}
                                {!userData.roles?.includes('moderator') ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7"
                                    disabled={updatingRole === `${userData.id}-moderator`}
                                    onClick={() => handleRoleChange(userData.id, 'moderator', 'add')}
                                  >
                                    {updatingRole === `${userData.id}-moderator` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      'Make Mod'
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs h-7"
                                    disabled={updatingRole === `${userData.id}-moderator`}
                                    onClick={() => handleRoleChange(userData.id, 'moderator', 'remove')}
                                  >
                                    {updatingRole === `${userData.id}-moderator` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      'Remove Mod'
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {loadingAnalytics ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Users</CardDescription>
                    <CardTitle className="text-3xl">{analytics.totalUsers}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Check-ins</CardDescription>
                    <CardTitle className="text-3xl">{analytics.totalCheckins}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Workouts</CardDescription>
                    <CardTitle className="text-3xl">{analytics.totalWorkouts}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Elite Grants</CardDescription>
                    <CardTitle className="text-3xl">{analytics.activeGrants}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total XP</CardDescription>
                    <CardTitle className="text-3xl">{analytics.totalXpEarned.toLocaleString()}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Badges Earned</CardDescription>
                    <CardTitle className="text-3xl">{analytics.totalBadgesEarned}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* Subscription Grants Tab */}
          <TabsContent value="grants" className="space-y-6">
            {/* Add New Grant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Grant Elite Access
                </CardTitle>
                <CardDescription>
                  Manually grant elite subscription access to a user by email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGrant} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="email">User Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="expires">Expires At (optional)</Label>
                    <Input
                      id="expires"
                      type="datetime-local"
                      value={newExpiresAt}
                      onChange={(e) => setNewExpiresAt(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Reason for grant..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={addingGrant}>
                      {addingGrant ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Grant Access'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Grants List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Grants ({grants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGrants ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : grants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No subscription grants found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Granted At</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Granted By</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grants.map((grant) => (
                        <TableRow key={grant.id}>
                          <TableCell className="font-medium">{grant.user_email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(grant.granted_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {grant.expires_at ? (
                              <Badge variant={new Date(grant.expires_at) < new Date() ? 'destructive' : 'secondary'}>
                                {format(new Date(grant.expires_at), 'MMM d, yyyy')}
                              </Badge>
                            ) : (
                              <Badge variant="default">Never</Badge>
                            )}
                          </TableCell>
                          <TableCell>{grant.granted_by || '-'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {grant.notes || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGrant(grant.id, grant.user_email)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulated Users Tab */}
          <TabsContent value="simulated" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Community Simulation
                </CardTitle>
                <CardDescription>
                  Manage AI-powered simulated users that create authentic community engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Simulated Users</p>
                    <p className="text-sm text-muted-foreground">
                      {simulatedCount} users currently active
                    </p>
                  </div>
                  <Badge variant={simulatedCount > 0 ? "default" : "secondary"}>
                    {simulatedCount > 0 ? "Active" : "Not Seeded"}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Seed Users
                      </CardTitle>
                      <CardDescription>
                        Create 50 simulated male users over 40 with unique personalities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleSeedUsers} 
                        disabled={seedingUsers || simulatedCount > 0}
                        className="w-full"
                      >
                        {seedingUsers ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Users...
                          </>
                        ) : simulatedCount > 0 ? (
                          "Users Already Seeded"
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create 50 Users
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Generate Activity
                      </CardTitle>
                      <CardDescription>
                        Create forum posts, replies, check-ins, and badge progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleGenerateActivity} 
                        disabled={generatingActivity || simulatedCount === 0}
                        className="w-full"
                        variant={simulatedCount > 0 ? "default" : "secondary"}
                      >
                        {generatingActivity ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Generate Activity Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">What gets generated:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 3-5 new AI-written forum posts on fitness topics</li>
                    <li>• 5-8 replies to existing posts (including real users)</li>
                    <li>• 10-15 daily check-ins with mood/energy data</li>
                    <li>• Challenge progress updates</li>
                    <li>• 1-2 badge awards</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Tip: Run this daily to maintain community activity. Uses Lovable AI credits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content & Newsletter Management
                </CardTitle>
                <CardDescription>
                  Generate expert fitness articles and send weekly newsletters to subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Published Articles</p>
                    <p className="text-3xl font-bold">{articleCount}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Active Subscribers</p>
                    <p className="text-3xl font-bold">{subscriberCount}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Generate Article
                      </CardTitle>
                      <CardDescription>
                        AI generates expert fitness content for men over 40
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleGenerateArticle} 
                        disabled={generatingArticle}
                        className="w-full"
                      >
                        {generatingArticle ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate & Publish Article
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Send Newsletter
                      </CardTitle>
                      <CardDescription>
                        Send weekly newsletter to {subscriberCount} subscribers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleSendNewsletter} 
                        disabled={sendingNewsletter || subscriberCount === 0}
                        className="w-full"
                        variant={subscriberCount > 0 ? "default" : "secondary"}
                      >
                        {sendingNewsletter ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Newsletter Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Content System:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Articles: Expert fitness content for training, nutrition, recovery, mindset, and health</li>
                    <li>• Newsletter: Weekly tips, recent articles, and motivational content</li>
                    <li>• Both use AI to generate high-quality, research-backed content</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Tip: Set up external scheduling (e.g., cron-job.org) to automate weekly content generation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
