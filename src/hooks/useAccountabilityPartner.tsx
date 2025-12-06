import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface AccountabilityRequest {
  id: string;
  user_id: string;
  prayer_focus: string[];
  fitness_goals: string[];
  preferred_contact_frequency: string;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface Partnership {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  initiated_by: string;
  created_at: string;
  partner?: {
    display_name: string | null;
    avatar_url: string | null;
    user_id: string;
  };
}

interface Checkin {
  id: string;
  partnership_id: string;
  user_id: string;
  prayed_for_partner: boolean;
  partner_progress_note: string | null;
  personal_update: string | null;
  prayer_request: string | null;
  created_at: string;
}

export const useAccountabilityPartner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myRequest, setMyRequest] = useState<AccountabilityRequest | null>(null);
  const [availablePartners, setAvailablePartners] = useState<AccountabilityRequest[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [checkins, setCheckins] = useState<Record<string, Checkin[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch my request
      const { data: myReq } = await supabase
        .from('accountability_requests')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setMyRequest(myReq);

      // Fetch available partners (excluding myself and those I'm already partnered with)
      const { data: requests } = await supabase
        .from('accountability_requests')
        .select('*')
        .eq('is_active', true)
        .neq('user_id', user.id);

      if (requests && requests.length > 0) {
        const userIds = requests.map(r => r.user_id);
        const { data: profiles } = await supabase.rpc('get_public_profiles', { user_ids: userIds });
        
        const enriched = requests.map(r => ({
          ...r,
          profile: profiles?.find((p: { user_id: string }) => p.user_id === r.user_id)
        }));
        setAvailablePartners(enriched);
      } else {
        setAvailablePartners([]);
      }

      // Fetch my partnerships
      const { data: parts } = await supabase
        .from('accountability_partnerships')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (parts && parts.length > 0) {
        const partnerIds = parts.map(p => p.user1_id === user.id ? p.user2_id : p.user1_id);
        const { data: profiles } = await supabase.rpc('get_public_profiles', { user_ids: partnerIds });
        
        const enriched = parts.map(p => {
          const partnerId = p.user1_id === user.id ? p.user2_id : p.user1_id;
          return {
            ...p,
            partner: profiles?.find((pr: { user_id: string }) => pr.user_id === partnerId)
          };
        });
        setPartnerships(enriched);
      } else {
        setPartnerships([]);
      }
    } catch (error) {
      console.error('Error fetching accountability data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createRequest = async (data: {
    prayer_focus: string[];
    fitness_goals: string[];
    preferred_contact_frequency: string;
    bio: string;
  }) => {
    if (!user) return;

    const { error } = await supabase
      .from('accountability_requests')
      .insert({
        user_id: user.id,
        ...data
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create request', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Your accountability partner request is now active!' });
      fetchData();
    }
  };

  const updateRequest = async (data: Partial<AccountabilityRequest>) => {
    if (!user || !myRequest) return;

    const { error } = await supabase
      .from('accountability_requests')
      .update(data)
      .eq('id', myRequest.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update request', variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: 'Your request has been updated' });
      fetchData();
    }
  };

  const sendPartnerRequest = async (targetUserId: string) => {
    if (!user) return;

    // Order user IDs consistently
    const [user1, user2] = [user.id, targetUserId].sort();

    const { error } = await supabase
      .from('accountability_partnerships')
      .insert({
        user1_id: user1,
        user2_id: user2,
        initiated_by: user.id,
        status: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already Connected', description: 'You already have a partnership with this person', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to send request', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Request Sent', description: 'Your partnership request has been sent!' });
      fetchData();
    }
  };

  const respondToRequest = async (partnershipId: string, accept: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('accountability_partnerships')
      .update({ status: accept ? 'active' : 'ended', ended_at: accept ? null : new Date().toISOString() })
      .eq('id', partnershipId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to respond to request', variant: 'destructive' });
    } else {
      toast({ 
        title: accept ? 'Partner Accepted!' : 'Request Declined', 
        description: accept ? 'You now have an accountability partner!' : 'The request has been declined' 
      });
      fetchData();
    }
  };

  const endPartnership = async (partnershipId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('accountability_partnerships')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', partnershipId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to end partnership', variant: 'destructive' });
    } else {
      toast({ title: 'Partnership Ended', description: 'The partnership has been ended' });
      fetchData();
    }
  };

  const fetchCheckins = async (partnershipId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('accountability_checkins')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setCheckins(prev => ({ ...prev, [partnershipId]: data }));
    }
  };

  const submitCheckin = async (partnershipId: string, data: {
    prayed_for_partner: boolean;
    personal_update: string;
    prayer_request: string;
  }) => {
    if (!user) return;

    const { error } = await supabase
      .from('accountability_checkins')
      .insert({
        partnership_id: partnershipId,
        user_id: user.id,
        ...data
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit check-in', variant: 'destructive' });
    } else {
      toast({ title: 'Check-in Submitted! 🙏', description: 'Your partner will see your update.' });
      fetchCheckins(partnershipId);
    }
  };

  return {
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
    submitCheckin,
    refetch: fetchData
  };
};
