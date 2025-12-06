import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Plus, 
  Check, 
  Loader2,
  PartyPopper,
  HandHeart,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PrayerEntry {
  id: string;
  partnership_id: string;
  user_id: string;
  request_text: string;
  is_answered: boolean;
  answered_at: string | null;
  answered_notes: string | null;
  created_at: string;
  author_name?: string;
}

interface PrayerJournalProps {
  partnershipId: string;
  partnerName: string;
}

export function PrayerJournal({ partnershipId, partnerName }: PrayerJournalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState('');
  const [showAnswered, setShowAnswered] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // For marking as answered
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answeredNotes, setAnsweredNotes] = useState('');

  const fetchEntries = useCallback(async () => {
    if (!partnershipId) return;
    
    try {
      const { data, error } = await supabase
        .from('prayer_journal_entries')
        .select('*')
        .eq('partnership_id', partnershipId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch author names
      const entriesWithAuthors = await Promise.all(
        (data || []).map(async (entry) => {
          const { data: profile } = await supabase.rpc('get_public_profile', {
            target_user_id: entry.user_id
          });
          return {
            ...entry,
            author_name: profile?.[0]?.display_name || 'Anonymous'
          };
        })
      );

      setEntries(entriesWithAuthors);
    } catch (error) {
      console.error('Error fetching prayer journal:', error);
    } finally {
      setLoading(false);
    }
  }, [partnershipId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAddEntry = async () => {
    if (!user || !newRequest.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('prayer_journal_entries')
        .insert({
          partnership_id: partnershipId,
          user_id: user.id,
          request_text: newRequest.trim()
        });

      if (error) throw error;

      toast({
        title: 'Prayer request added',
        description: 'Your prayer request has been shared with your partner.'
      });

      setNewRequest('');
      setDialogOpen(false);
      fetchEntries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add prayer request',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAnswered = async (entryId: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('prayer_journal_entries')
        .update({
          is_answered: true,
          answered_at: new Date().toISOString(),
          answered_notes: answeredNotes.trim() || null
        })
        .eq('id', entryId);

      if (error) throw error;

      // Trigger celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);

      toast({
        title: 'Praise God! 🙌',
        description: 'Prayer marked as answered. What a testimony!'
      });

      setAnsweringId(null);
      setAnsweredNotes('');
      fetchEntries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update prayer',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('prayer_journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Entry removed',
        description: 'Prayer request has been removed from the journal.'
      });

      fetchEntries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete entry',
        variant: 'destructive'
      });
    }
  };

  const activeRequests = entries.filter(e => !e.is_answered);
  const answeredPrayers = entries.filter(e => e.is_answered);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Celebration Animation Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {/* Confetti particles */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#f97316'][Math.floor(Math.random() * 5)],
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
          {/* Central celebration badge */}
          <div className="animate-scale-in bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <PartyPopper className="h-8 w-8" />
            <div>
              <p className="font-heading font-bold text-xl">Prayer Answered!</p>
              <p className="text-sm opacity-90">God is faithful 🙌</p>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0);
            opacity: 0;
          }
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Prayer Journal
          </h3>
          <p className="text-sm text-muted-foreground">
            Shared with {partnerName}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Prayer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-primary" />
                Add Prayer Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                value={newRequest}
                onChange={(e) => setNewRequest(e.target.value)}
                placeholder="Share what you'd like your partner to pray for..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                This will be visible to both you and {partnerName}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry} disabled={submitting || !newRequest.trim()}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Add to Journal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Prayer Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HandHeart className="h-4 w-4" />
            Active Requests ({activeRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active prayer requests. Add one to start praying together!
            </p>
          ) : (
            <div className="space-y-3">
              {activeRequests.map((entry) => (
                <div 
                  key={entry.id} 
                  className="p-4 bg-muted/50 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm">{entry.request_text}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {entry.author_name} • {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {answeringId === entry.id ? (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setAnsweringId(null)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setAnsweringId(entry.id)}
                          title="Mark as answered"
                        >
                          <PartyPopper className="h-4 w-4" />
                        </Button>
                      )}
                      {entry.user_id === user?.id && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(entry.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {answeringId === entry.id && (
                    <div className="pt-2 border-t space-y-2">
                      <Input
                        value={answeredNotes}
                        onChange={(e) => setAnsweredNotes(e.target.value)}
                        placeholder="How did God answer? (optional)"
                        className="text-sm"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAnswered(entry.id)}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Mark as Answered 🙌
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answered Prayers */}
      {answeredPrayers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <PartyPopper className="h-4 w-4 text-green-500" />
                Answered Prayers ({answeredPrayers.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="show-answered"
                  checked={showAnswered}
                  onCheckedChange={(checked) => setShowAnswered(!!checked)}
                />
                <label htmlFor="show-answered" className="text-xs text-muted-foreground cursor-pointer">
                  Show
                </label>
              </div>
            </div>
            <CardDescription>
              Celebrate God's faithfulness together
            </CardDescription>
          </CardHeader>
          {showAnswered && (
            <CardContent>
              <div className="space-y-3">
                {answeredPrayers.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{entry.request_text}</p>
                        {entry.answered_notes && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2 italic">
                            "{entry.answered_notes}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {entry.author_name} • Answered {entry.answered_at && formatDistanceToNow(new Date(entry.answered_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
