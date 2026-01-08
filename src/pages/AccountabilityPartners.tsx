import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccountabilityPartner } from "@/hooks/useAccountabilityPartner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PrayerJournal } from "@/components/accountability/PrayerJournal";
import { 
  Users, 
  Heart, 
  HandHeart, 
  MessageCircle, 
  UserPlus, 
  Check, 
  X, 
  Loader2,
  ArrowLeft,
  ClipboardCheck,
  Calendar,
  BookOpen
} from "lucide-react";

const PRAYER_FOCUS_OPTIONS = [
  "Spiritual Growth",
  "Family & Marriage",
  "Career & Purpose",
  "Health & Fitness",
  "Overcoming Temptation",
  "Financial Stewardship",
  "Ministry & Service"
];

const FITNESS_GOALS_OPTIONS = [
  "Weight Loss",
  "Muscle Building",
  "Endurance",
  "Flexibility",
  "General Health",
  "Injury Recovery",
  "Athletic Performance"
];

const AccountabilityPartners = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    myRequest, 
    availablePartners, 
    partnerships,
    checkins,
    loading,
    createRequest,
    updateRequest,
    sendPartnerRequest,
    respondToRequest,
    endPartnership,
    fetchCheckins,
    submitCheckin
  } = useAccountabilityPartner();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCheckinDialog, setShowCheckinDialog] = useState<string | null>(null);
  const [checkinData, setCheckinData] = useState({
    prayed_for_partner: false,
    personal_update: '',
    prayer_request: ''
  });
  const [formData, setFormData] = useState({
    prayer_focus: [] as string[],
    fitness_goals: [] as string[],
    preferred_contact_frequency: 'weekly',
    bio: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (myRequest) {
      setFormData({
        prayer_focus: myRequest.prayer_focus || [],
        fitness_goals: myRequest.fitness_goals || [],
        preferred_contact_frequency: myRequest.preferred_contact_frequency || 'weekly',
        bio: myRequest.bio || ''
      });
    }
  }, [myRequest]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activePartnerships = partnerships.filter(p => p.status === 'active');
  const pendingReceived = partnerships.filter(p => p.status === 'pending' && p.initiated_by !== user?.id);
  const pendingSent = partnerships.filter(p => p.status === 'pending' && p.initiated_by === user?.id);

  const handleSubmit = async () => {
    if (myRequest) {
      await updateRequest(formData);
    } else {
      await createRequest(formData);
    }
    setShowCreateForm(false);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-44 md:pt-28 pb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <HandHeart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2">Accountability Partners</h1>
            <p className="text-muted-foreground">
              Connect with Christian brothers for mutual encouragement, prayer support, and fitness accountability
            </p>
          </div>

          {/* Pending Requests Received */}
          {pendingReceived.length > 0 && (
            <Card className="mb-6 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Partnership Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingReceived.map((partnership) => (
                  <div key={partnership.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={partnership.partner?.avatar_url || ''} />
                        <AvatarFallback>
                          {partnership.partner?.display_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{partnership.partner?.display_name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">Wants to be your accountability partner</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => respondToRequest(partnership.id, true)}>
                        <Check className="h-4 w-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => respondToRequest(partnership.id, false)}>
                        <X className="h-4 w-4 mr-1" /> Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="partners" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="partners">My Partners</TabsTrigger>
              <TabsTrigger value="journal">Prayer Journal</TabsTrigger>
              <TabsTrigger value="find">Find Partners</TabsTrigger>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
            </TabsList>

            {/* My Partners Tab */}
            <TabsContent value="partners">
              {activePartnerships.length === 0 && pendingSent.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading text-lg font-semibold mb-2">No Partners Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Find a brother to walk alongside you in faith and fitness
                    </p>
                    <Button onClick={() => document.querySelector('[value="find"]')?.dispatchEvent(new Event('click', { bubbles: true }))}>
                      Find a Partner
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activePartnerships.map((partnership) => {
                    const partnerCheckins = checkins[partnership.id] || [];
                    const myRecentCheckin = partnerCheckins.find(c => c.user_id === user?.id);
                    const partnerRecentCheckin = partnerCheckins.find(c => c.user_id !== user?.id);
                    
                    return (
                      <Card key={partnership.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-14 w-14">
                                <AvatarImage src={partnership.partner?.avatar_url || ''} />
                                <AvatarFallback className="text-lg">
                                  {partnership.partner?.display_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-heading font-semibold text-lg">
                                  {partnership.partner?.display_name || 'Anonymous'}
                                </h3>
                                <Badge variant="secondary" className="mt-1">
                                  <Heart className="h-3 w-3 mr-1" /> Active Partner
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                onClick={() => {
                                  fetchCheckins(partnership.id);
                                  setShowCheckinDialog(partnership.id);
                                }}
                              >
                                <ClipboardCheck className="h-4 w-4 mr-1" /> Check In
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/messages`)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" /> Message
                              </Button>
                            </div>
                          </div>

                          {/* Recent Check-ins Preview */}
                          {(myRecentCheckin || partnerRecentCheckin) && (
                            <div className="border-t pt-4 mt-4 space-y-3">
                              <h4 className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Recent Check-ins
                              </h4>
                              
                              {partnerRecentCheckin && (
                                <div className="p-3 bg-primary/5 rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    {partnership.partner?.display_name}'s update:
                                  </p>
                                  {partnerRecentCheckin.personal_update && (
                                    <p className="text-sm">{partnerRecentCheckin.personal_update}</p>
                                  )}
                                  {partnerRecentCheckin.prayer_request && (
                                    <p className="text-sm mt-2">
                                      <span className="font-medium">🙏 Prayer request:</span> {partnerRecentCheckin.prayer_request}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {myRecentCheckin && (
                                <p className="text-xs text-muted-foreground">
                                  Your last check-in: {new Date(myRecentCheckin.created_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex justify-end mt-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive">
                                  End Partnership
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>End Partnership?</DialogTitle>
                                </DialogHeader>
                                <p className="text-muted-foreground">
                                  Are you sure you want to end this accountability partnership?
                                </p>
                                <div className="flex gap-2 justify-end mt-4">
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => endPartnership(partnership.id)}
                                  >
                                    End Partnership
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {pendingSent.length > 0 && (
                    <>
                      <h3 className="font-heading font-semibold mt-6 mb-3">Pending Requests</h3>
                      {pendingSent.map((partnership) => (
                        <Card key={partnership.id} className="border-dashed">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={partnership.partner?.avatar_url || ''} />
                                  <AvatarFallback>
                                    {partnership.partner?.display_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{partnership.partner?.display_name || 'Anonymous'}</p>
                                  <p className="text-sm text-muted-foreground">Request pending...</p>
                                </div>
                              </div>
                              <Badge variant="outline">Awaiting Response</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Prayer Journal Tab */}
            <TabsContent value="journal">
              {activePartnerships.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading text-lg font-semibold mb-2">No Prayer Journal Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect with an accountability partner to start a shared prayer journal
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {activePartnerships.map((partnership) => (
                    <Card key={partnership.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={partnership.partner?.avatar_url || ''} />
                            <AvatarFallback>
                              {partnership.partner?.display_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">
                              Partnership with {partnership.partner?.display_name || 'Anonymous'}
                            </CardTitle>
                            <CardDescription>
                              Praying together since {new Date(partnership.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <PrayerJournal 
                          partnershipId={partnership.id} 
                          partnerName={partnership.partner?.display_name || 'your partner'}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Find Partners Tab */}
            <TabsContent value="find">
              {!myRequest && (
                <Card className="mb-6 bg-primary/5 border-primary/20">
                  <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                      <HandHeart className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-heading font-semibold mb-1">Create Your Profile First</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Before browsing partners, share a bit about yourself so others can find you too
                        </p>
                        <Button size="sm" onClick={() => setShowCreateForm(true)}>
                          Create Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {availablePartners.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading text-lg font-semibold mb-2">No Partners Available</h3>
                    <p className="text-muted-foreground">
                      Be the first to create a profile and others will find you!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {availablePartners.map((partner) => {
                    const hasPending = partnerships.some(
                      p => (p.user1_id === partner.user_id || p.user2_id === partner.user_id) && p.status === 'pending'
                    );
                    const isPartner = partnerships.some(
                      p => (p.user1_id === partner.user_id || p.user2_id === partner.user_id) && p.status === 'active'
                    );

                    return (
                      <Card key={partner.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={partner.profile?.avatar_url || ''} />
                              <AvatarFallback>
                                {partner.profile?.display_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-heading font-semibold">
                                {partner.profile?.display_name || 'Anonymous Brother'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Prefers {partner.preferred_contact_frequency} check-ins
                              </p>
                            </div>
                          </div>

                          {partner.bio && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {partner.bio}
                            </p>
                          )}

                          <div className="space-y-3 mb-4">
                            {partner.prayer_focus.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Prayer Focus</p>
                                <div className="flex flex-wrap gap-1">
                                  {partner.prayer_focus.slice(0, 3).map((focus) => (
                                    <Badge key={focus} variant="secondary" className="text-xs">
                                      {focus}
                                    </Badge>
                                  ))}
                                  {partner.prayer_focus.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{partner.prayer_focus.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {partner.fitness_goals.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Fitness Goals</p>
                                <div className="flex flex-wrap gap-1">
                                  {partner.fitness_goals.slice(0, 3).map((goal) => (
                                    <Badge key={goal} variant="outline" className="text-xs">
                                      {goal}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {isPartner ? (
                            <Button size="sm" variant="secondary" disabled className="w-full">
                              <Check className="h-4 w-4 mr-1" /> Already Partners
                            </Button>
                          ) : hasPending ? (
                            <Button size="sm" variant="outline" disabled className="w-full">
                              Request Pending
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => sendPartnerRequest(partner.user_id)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" /> Request Partnership
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* My Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Your Accountability Profile</CardTitle>
                  <CardDescription>
                    Share what you're looking for in an accountability partner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Prayer Focus Areas</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {PRAYER_FOCUS_OPTIONS.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`prayer-${option}`}
                            checked={formData.prayer_focus.includes(option)}
                            onCheckedChange={() => setFormData(prev => ({
                              ...prev,
                              prayer_focus: toggleArrayItem(prev.prayer_focus, option)
                            }))}
                          />
                          <label htmlFor={`prayer-${option}`} className="text-sm cursor-pointer">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Fitness Goals</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {FITNESS_GOALS_OPTIONS.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`fitness-${option}`}
                            checked={formData.fitness_goals.includes(option)}
                            onCheckedChange={() => setFormData(prev => ({
                              ...prev,
                              fitness_goals: toggleArrayItem(prev.fitness_goals, option)
                            }))}
                          />
                          <label htmlFor={`fitness-${option}`} className="text-sm cursor-pointer">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Preferred Check-in Frequency</Label>
                    <Select 
                      value={formData.preferred_contact_frequency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_contact_frequency: value }))}
                    >
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">About You</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Share a bit about yourself, your faith journey, and what you're looking for in an accountability partner..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSubmit}>
                      {myRequest ? 'Update Profile' : 'Create Profile'}
                    </Button>
                    {myRequest && (
                      <Button 
                        variant="outline"
                        onClick={() => updateRequest({ is_active: !myRequest.is_active })}
                      >
                        {myRequest.is_active ? 'Pause Visibility' : 'Make Visible'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Profile Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Your Accountability Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Prayer Focus (select all that apply)</Label>
              <div className="space-y-2">
                {PRAYER_FOCUS_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dialog-prayer-${option}`}
                      checked={formData.prayer_focus.includes(option)}
                      onCheckedChange={() => setFormData(prev => ({
                        ...prev,
                        prayer_focus: toggleArrayItem(prev.prayer_focus, option)
                      }))}
                    />
                    <label htmlFor={`dialog-prayer-${option}`} className="text-sm cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Fitness Goals</Label>
              <div className="space-y-2">
                {FITNESS_GOALS_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dialog-fitness-${option}`}
                      checked={formData.fitness_goals.includes(option)}
                      onCheckedChange={() => setFormData(prev => ({
                        ...prev,
                        fitness_goals: toggleArrayItem(prev.fitness_goals, option)
                      }))}
                    />
                    <label htmlFor={`dialog-fitness-${option}`} className="text-sm cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Preferred Check-in Frequency</Label>
              <Select 
                value={formData.preferred_contact_frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_contact_frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">About You</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Share a bit about yourself..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Profile</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weekly Check-in Dialog */}
      <Dialog open={!!showCheckinDialog} onOpenChange={() => {
        setShowCheckinDialog(null);
        setCheckinData({ prayed_for_partner: false, personal_update: '', prayer_request: '' });
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-primary" />
              Weekly Check-in
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg">
              <Checkbox
                id="prayed"
                checked={checkinData.prayed_for_partner}
                onCheckedChange={(checked) => setCheckinData(prev => ({ 
                  ...prev, 
                  prayed_for_partner: !!checked 
                }))}
              />
              <div>
                <label htmlFor="prayed" className="font-medium cursor-pointer">
                  I prayed for my partner this week 🙏
                </label>
                <p className="text-sm text-muted-foreground">
                  Lifting each other up in prayer is the foundation of accountability
                </p>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">How's your week going? (Fitness & Faith)</Label>
              <Textarea
                value={checkinData.personal_update}
                onChange={(e) => setCheckinData(prev => ({ ...prev, personal_update: e.target.value }))}
                placeholder="Share your wins, struggles, or what God's teaching you..."
                rows={3}
              />
            </div>

            <div>
              <Label className="mb-2 block">Prayer Request (Optional)</Label>
              <Textarea
                value={checkinData.prayer_request}
                onChange={(e) => setCheckinData(prev => ({ ...prev, prayer_request: e.target.value }))}
                placeholder="How can your partner pray for you this week?"
                rows={2}
              />
            </div>

            {/* Show partner's recent check-ins */}
            {showCheckinDialog && checkins[showCheckinDialog]?.filter(c => c.user_id !== user?.id).length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Partner's Recent Updates</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {checkins[showCheckinDialog]
                    ?.filter(c => c.user_id !== user?.id)
                    .slice(0, 3)
                    .map((checkin) => (
                      <div key={checkin.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(checkin.created_at).toLocaleDateString()}
                        </p>
                        {checkin.personal_update && <p>{checkin.personal_update}</p>}
                        {checkin.prayer_request && (
                          <p className="mt-1 text-primary">
                            🙏 {checkin.prayer_request}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCheckinDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (showCheckinDialog) {
                  await submitCheckin(showCheckinDialog, checkinData);
                  setShowCheckinDialog(null);
                  setCheckinData({ prayed_for_partner: false, personal_update: '', prayer_request: '' });
                }
              }}
            >
              <Check className="h-4 w-4 mr-1" /> Submit Check-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountabilityPartners;
